import useAuthStore from "core-frontend-web/src/stores/authStore";
import { useEffect, useState } from "react";
import { fetchData } from "core-frontend-web/src/utils/api";
import { ScrollArea } from "core-frontend-web/src/components/ui/scroll-area";
import { Card } from "core-frontend-web/src/components/ui/card";
import useFetchResources from "core-frontend-web/src/hooks/useFetchResources";

export default function UserDashboard() {
  const { user, fetchUserProfile } = useAuthStore();
  const { people, audio } = useFetchResources();
  const [issuesData, setIssuesData] = useState([]);
  const [currentPersonId, setCurrentPersonId] = useState(null);

  useEffect(() => {
    if (!user) fetchUserProfile();

    // Fetch issues data
    const fetchIssues = async () => {
      try {
        const issues = await fetchData("/data/loadIssues");
        setIssuesData(issues);
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };
    fetchIssues();
  }, [user]);

  useEffect(() => {
    if (user && people.length) {
      const person = people.find(
        (p) => p.fields && p.fields["auth0 user_id"] === user.sub
      );
      if (person) setCurrentPersonId(person.id);
    }
  }, [user, people]);

  const firstName = user?.name?.split(" ")[0] || "friend";

  // Sort audio by date descending, then take the first 10
  const yourTranscripts = (audio || [])
    .filter((t) => t.SpeakerName === currentPersonId)
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    })
    .slice(0, 10);

  const otherTranscripts = (audio || [])
    .filter((t) => t.SpeakerName !== currentPersonId)
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    })
    .slice(0, 10);

  // Calculate most common accent issues
  const commonIssues = issuesData
    .reduce((acc, category) => {
      category.issues.forEach((issue) => {
        const count =
          audio?.reduce((total, transcript) => {
            return (
              total +
              (transcript.annotations?.filter((a) => a.id === issue.id)
                .length || 0)
            );
          }, 0) || 0;

        if (count > 0) {
          acc.push({
            id: issue.id,
            name: issue.name,
            category: category.name,
            count,
          });
        }
      });
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Add this helper function before the return statement
  const getSpeakerName = (speakerId) => {
    const speaker = people.find((p) => p.id === speakerId);
    return speaker ? speaker.Name : speakerId;
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        Welcome back, {user?.name || "friend"} 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Existing Next Steps Card */}
        {/* <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Your Next Steps</h2>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Start your next module</li>
            <li>Record 1 short paragraph with focus on vowels</li>
            <li>Try the Lexical Sets quiz</li>
          </ul>
        </div> */}

        {/* Existing Quick Links Card */}
        {/* <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
          <ul className="space-y-1">
            <li>
              <a href="/transcript" className="underline text-blue-600">
                Transcript Viewer
              </a>
            </li>
            <li>
              <a href="/vsounds" className="underline text-blue-600">
                Vowel Sound Explorer
              </a>
            </li>
            <li>
              <a
                href="/onboarding/lexical-sets"
                className="underline text-blue-600"
              >
                Lexical Sets
              </a>
            </li>
          </ul>
        </div> */}

        {/* Recent Transcripts Card */}
        {/* Your Recent Transcripts */}
        <div className="p-4 border rounded-lg shadow-sm mb-4">
          <h2 className="text-lg font-semibold mb-2">
            Your Recent Transcripts
          </h2>
          <ScrollArea className="h-[200px]">
            {yourTranscripts.length > 0 ? (
              <ul className="space-y-1">
                {yourTranscripts.map((transcript) => (
                  <li
                    key={transcript.id}
                    className="px-1 py-0.5 hover:bg-accent rounded"
                  >
                    <a
                      href={`/transcript/${transcript.id}`}
                      className="block font-medium"
                    >
                      {transcript.Name || transcript.id}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No transcripts yet</p>
            )}
          </ScrollArea>
        </div>

        {/* Other People's Transcripts */}
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">
            Other People's Transcripts
          </h2>
          <ScrollArea className="h-[200px]">
            {otherTranscripts.length > 0 ? (
              <ul className="space-y-1">
                {otherTranscripts.map((transcript) => (
                  <li
                    key={transcript.id}
                    className="px-1 py-0.5 hover:bg-accent rounded"
                  >
                    <a
                      href={`/transcript/${transcript.id}`}
                      className="block font-medium"
                    >
                      {getSpeakerName(transcript.SpeakerName)} →{" "}
                      {transcript.Name || transcript.id}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No transcripts yet</p>
            )}
          </ScrollArea>
        </div>

        {/* Common Accent Issues Card */}
        {/* <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Common Accent Issues</h2>
          <ScrollArea className="h-[200px]">
            {commonIssues.length > 0 ? (
              <ul className="space-y-2">
                {commonIssues.map((issue) => (
                  <li key={issue.id} className="p-2 hover:bg-accent rounded-md">
                    <div className="font-medium">{issue.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {issue.count} instances
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Category: {issue.category}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">
                No accent issues recorded yet
              </p>
            )}
          </ScrollArea>
        </div> */}
      </div>
    </div>
  );
}
