# Deploys the real faceless-video pipeline: needs ffmpeg + espeak-ng
# installed and a long-running server (requests take 2-4 minutes), so
# this needs a real container host (Railway, Render, Fly.io, a VPS) --
# not Vercel's default serverless functions, which have neither.

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# ffmpeg composites the final video; espeak-ng is the free voiceover
# engine; curl is what the pipeline shells out to for the free AI APIs
# (see lib/ai/free-pipeline.ts for why not fetch()).
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg espeak-ng curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
