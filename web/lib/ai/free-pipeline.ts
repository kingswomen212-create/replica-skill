// A genuinely free (no API key, no billing) generation pipeline:
// script from pollinations.ai's text API, images from its image API,
// voiceover from the offline espeak-ng engine, composited into a real
// MP4 with ffmpeg. This is the $0 path -- quality tradeoffs are real and
// documented inline. Swap in a paid provider (OpenAI, ElevenLabs, etc.)
// once there's budget: same generateScript/generateImage/generateVoice
// call sites, drop-in replacements for better quality and no rate limit.
//
// Server-only: never import this from a "use client" file. Shells out to
// espeak-ng and ffmpeg, so it only runs where those binaries exist.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const execFileAsync = promisify(execFile);

// HTTP calls here shell out to curl rather than using fetch. In this
// sandboxed environment, Next.js's server runtime patches/bundles fetch
// (and even an explicit `undici` import) in a way that broke requests
// unpredictably from inside a route handler -- identical code worked
// every time as a standalone Node script and failed inside `next start`.
// curl already handles the sandbox's HTTPS_PROXY correctly (same as
// every other curl call in this project) and sidesteps the issue
// entirely. Outside this sandbox (a real deployment, no proxy involved)
// curl behaves like any normal HTTP client.
interface CurlResult {
  status: number;
  bodyPath: string;
}

async function curlGet(url: string, outPath: string): Promise<CurlResult> {
  const { stdout } = await execFileAsync("curl", [
    "-sS", "-L", "--max-time", "45",
    "-o", outPath,
    "-w", "%{http_code}",
    url,
  ]);
  return { status: parseInt(stdout.trim(), 10), bodyPath: outPath };
}

export interface PipelineScene {
  scriptText: string;
  imagePrompt: string;
}

export interface PipelineResult {
  videoBuffer: Buffer;
  scenes: PipelineScene[];
  warnings: string[];
}

const TEXT_API = "https://text.pollinations.ai";
const IMAGE_API = "https://image.pollinations.ai/prompt";

async function curlWithRetry(url: string, outPath: string, tries = 3): Promise<CurlResult> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await curlGet(url, outPath);
      if (res.status === 503 && i < tries - 1) {
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
        continue;
      }
      if (res.status === 402 && i < tries - 1) {
        // Free tier rate limit ("1 image every 45s per IP"). The error
        // body names an exact retry-after; honor it rather than a fixed
        // backoff. The pipeline also paces image requests proactively
        // (see IMAGE_INTERVAL_MS below) so this is a fallback, not the
        // primary way the limit gets respected.
        const body = await readFile(outPath, "utf-8").catch(() => "");
        const m = body.match(/Retry after (\d+)s/i);
        const waitMs = m ? (parseInt(m[1], 10) + 2) * 1000 : 46_000;
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("curl failed after retries");
}

// Asking this small free model for strict JSON turned out to be
// unreliable (it would wrap the array in an object, nest it, or just
// truncate mid-response on longer structured prompts). Plain
// newline-delimited text, with no JSON involved at all, worked
// consistently in testing -- simpler prompt, simpler and much more
// robust parsing. Keeping it low-tech here is the actual fix.
export async function generateScript(idea: string, sceneCount = 4, workDir?: string): Promise<string[]> {
  const prompt = [
    `Write a ${sceneCount}-scene short video script about: "${idea}".`,
    `Format: exactly ${sceneCount} lines, one scene narration per line, each under 20 words,`,
    `no numbering, no labels, no markdown, just the lines separated by newlines.`,
    `Build hook, context, turn, and payoff across the lines.`,
  ].join(" ");
  const dir = workDir ?? tmpdir();

  // The free endpoint is occasionally flaky (truncated or empty
  // responses) -- retry the whole request a few times before giving up.
  let lastError: Error | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // seed must fit in a signed int32 (max 2147483647) -- Date.now()
      // alone overflows that and the API rejects it.
      const seed = Math.floor(Math.random() * 2_000_000_000) + attempt;
      const outPath = join(dir, `script-${attempt}.txt`);
      const res = await curlWithRetry(`${TEXT_API}/${encodeURIComponent(prompt)}?seed=${seed}`, outPath);
      const raw = await readFile(outPath, "utf-8");
      if (res.status !== 200) throw new Error(`script generation failed: ${res.status} ${raw.slice(0, 200)}`);

      const lines = raw
        .split("\n")
        .map((l) => l.trim().replace(/^[-*\d.)\s]+/, ""))
        .filter(Boolean);

      if (lines.length < sceneCount) {
        throw new Error(`expected ${sceneCount} scene lines, got ${lines.length}: ${raw.slice(0, 200)}`);
      }
      return lines.slice(0, sceneCount);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw new Error(`script generation failed after 3 attempts: ${lastError?.message}`);
}

async function generateImage(prompt: string, outPath: string): Promise<void> {
  const url = `${IMAGE_API}/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
  const res = await curlWithRetry(url, outPath, 4);
  if (res.status !== 200) {
    const body = await readFile(outPath, "utf-8").catch(() => "");
    throw new Error(`image generation failed: ${res.status} ${body.slice(0, 200)}`);
  }
}

async function generateVoice(text: string, outPath: string): Promise<void> {
  // espeak-ng: free, offline, no network call -- the tradeoff is a
  // robotic voice. Rate 165 wpm reads naturally enough for short scenes.
  await execFileAsync("espeak-ng", ["-v", "en-us", "-s", "165", "-w", outPath, text]);
}

async function sceneDuration(wavPath: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    wavPath,
  ]);
  return parseFloat(stdout.trim());
}

// Word-wraps to a max line width instead of letting ffmpeg's drawtext
// (which never wraps on its own) run captions off both edges of the
// frame -- found by actually looking at a rendered frame, not assumed.
function wrapCaption(text: string, maxCharsPerLine = 28): string {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.join("\n");
}

async function composeScene(imagePath: string, audioPath: string, caption: string, outPath: string, workDir: string, index: number): Promise<void> {
  const duration = await sceneDuration(audioPath);
  const frames = Math.max(1, Math.round(duration * 25));

  // textfile= (a path, read raw) sidesteps drawtext's filter-string
  // escaping entirely -- far more reliable than trying to escape
  // apostrophes/colons/newlines into the text= value inline.
  const captionPath = join(workDir, `caption-${index}.txt`);
  await writeFile(captionPath, wrapCaption(caption));

  const filter =
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,` +
    `zoompan=z='min(zoom+0.0015,1.2)':d=${frames}:s=1080x1920:fps=25[zoomed];` +
    `[zoomed]drawtext=textfile='${captionPath}':fontcolor=white:fontsize=44:` +
    `box=1:boxcolor=black@0.5:boxborderw=20:x=(w-text_w)/2:y=h-350:line_spacing=10[v]`;

  await execFileAsync("ffmpeg", [
    "-y",
    "-loop", "1", "-i", imagePath,
    "-i", audioPath,
    "-filter_complex", filter,
    "-map", "[v]", "-map", "1:a",
    "-c:v", "libx264", "-t", duration.toFixed(2),
    "-c:a", "aac", "-shortest", "-pix_fmt", "yuv420p",
    outPath,
  ]);
}

async function concatScenes(scenePaths: string[], outPath: string, listPath: string): Promise<void> {
  const list = scenePaths.map((p) => `file '${p}'`).join("\n");
  await writeFile(listPath, list);
  await execFileAsync("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0", "-i", listPath,
    "-c", "copy", outPath,
  ]);
}

// The free image API allows 1 request every 45s per IP (its own error
// message, confirmed in testing). Pacing requests proactively at this
// interval avoids burning time on failed attempts and retry-after waits
// -- for a 4-scene video this means the pipeline honestly takes a few
// minutes end to end. That's the real tradeoff of the $0 path.
const IMAGE_INTERVAL_MS = 46_000;

export async function runFreePipeline(idea: string, style: string): Promise<PipelineResult> {
  const warnings: string[] = [
    "Free pipeline: images carry a small pollinations.ai watermark (often cropped out by the vertical 9:16 crop, not guaranteed), the voiceover is a synthesized (espeak) voice, not a natural one, and the free image API's 1-per-45s rate limit means this takes a few minutes.",
  ];
  const dir = await mkdtemp(join(tmpdir(), "reelclone-"));
  try {
    const lines = await generateScript(idea, 4, dir);
    const scenes: PipelineScene[] = lines.map((scriptText) => ({
      scriptText,
      imagePrompt: `${style}, ${scriptText}`,
    }));

    const sceneClipPaths: string[] = [];
    let lastImageRequestAt = 0;
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const imgPath = join(dir, `scene-${i}.jpg`);
      const wavPath = join(dir, `scene-${i}.wav`);
      const clipPath = join(dir, `clip-${i}.mp4`);

      const sinceLast = Date.now() - lastImageRequestAt;
      if (lastImageRequestAt > 0 && sinceLast < IMAGE_INTERVAL_MS) {
        await new Promise((r) => setTimeout(r, IMAGE_INTERVAL_MS - sinceLast));
      }
      lastImageRequestAt = Date.now();
      await generateImage(scene.imagePrompt, imgPath);
      await generateVoice(scene.scriptText, wavPath);
      await composeScene(imgPath, wavPath, scene.scriptText, clipPath, dir, i);
      sceneClipPaths.push(clipPath);
    }

    const finalPath = join(dir, "final.mp4");
    const listPath = join(dir, "list.txt");
    await concatScenes(sceneClipPaths, finalPath, listPath);

    const videoBuffer = await readFile(finalPath);
    return { videoBuffer, scenes, warnings };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
