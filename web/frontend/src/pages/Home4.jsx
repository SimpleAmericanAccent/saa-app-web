import TranscriptViewer2 from "../components/experimental/TranscriptViewer2";
import { mockTranscript } from "../__mocks__/mockData";

export default function Home1() {
  return (
    <div>
      <TranscriptViewer2 transcriptData={mockTranscript} />
    </div>
  );
}
