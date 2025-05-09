import useAuthStore from "core-frontend-web/src/stores/authStore";
import { useEffect } from "react";

export default function UserDashboard() {
  const { user, fetchUserProfile } = useAuthStore();

  useEffect(() => {
    if (!user) fetchUserProfile();
  }, [user]);

  const firstName = user?.name?.split(" ")[0] || "friend";

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        Welcome back, {user?.name || "friend"} 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Your Next Steps</h2>
          <ul className="list-disc list-inside text-muted-foreground">
            <li>Start your next module</li>
            <li>Record 1 short paragraph with focus on vowels</li>
            <li>Try the Lexical Sets quiz</li>
          </ul>
        </div>

        <div className="p-4 border rounded-lg shadow-sm">
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
        </div>
      </div>
    </div>
  );
}
