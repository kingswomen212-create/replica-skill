import { VideoWorkspace } from "@/components/video-workspace";

export default function VideoPage({ params }: { params: { id: string } }) {
  return <VideoWorkspace videoId={params.id} />;
}
