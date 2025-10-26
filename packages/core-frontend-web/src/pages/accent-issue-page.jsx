// packages/core-frontend-web/src/pages/accent-issue-page.jsx
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useIssuesStore } from "../stores/issues-store";

export default function AccentIssuePage() {
  const { targetSlug, issueSlug } = useParams();
  const {
    issuesData,
    loading,
    error,
    fetchIssues,
    findTargetBySlug,
    findIssueBySlug,
  } = useIssuesStore();

  const currentTarget = findTargetBySlug(targetSlug);
  const currentIssue = findIssueBySlug(targetSlug, issueSlug);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!currentIssue || !currentTarget) return <div>Issue not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <a href="/accent-explorer" className="text-blue-600 hover:underline">
          Home
        </a>
        <span className="mx-2">/</span>
        <a href={`/${targetSlug}`} className="text-blue-600 hover:underline">
          {currentTarget.name}
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{currentIssue.name}</span>
      </nav>

      {/* Issue Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {currentIssue.name} ({currentTarget.name})
        </h1>
      </header>

      {/* Reel Links Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Practice Resources</h2>
        {currentIssue.resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentIssue.resources.map((resource, index) => (
              <a
                key={index}
                href={resource}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Practice Reel {index + 1}</h3>
                    <p className="text-sm text-gray-600">Click to open</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No practice resources available for this issue.
          </p>
        )}
      </section>

      {/* Related Issues */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Other {currentTarget.name} Issues
        </h2>
        <div className="flex flex-wrap gap-2">
          {currentTarget.issues
            .filter((issue) => issue.id !== currentIssue.id)
            .map((issue) => (
              <a
                key={issue.id}
                href={`/${targetSlug}/${issue.shortName}`}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
              >
                {issue.name}
              </a>
            ))}
        </div>
      </section>
    </div>
  );
}
