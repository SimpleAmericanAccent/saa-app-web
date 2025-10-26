// packages/core-frontend-web/src/pages/accent-target-page.jsx
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useIssuesStore } from "../stores/issues-store";

export default function AccentTargetPage() {
  const { targetSlug } = useParams();
  const { loading, error, fetchIssues, findTargetBySlug } = useIssuesStore();

  const currentTarget = findTargetBySlug(targetSlug);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!currentTarget) return <div>Target not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <a href="/accent-explorer" className="text-blue-600 hover:underline">
          Home
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{currentTarget.name}</span>
      </nav>

      {/* Target Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{currentTarget.name}</h1>
        <p className="text-gray-600">
          Practice issues related to {currentTarget.name}
        </p>
      </header>

      {/* Issues Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTarget.issues.map((issue) => (
            <a
              key={issue.id}
              href={`/${targetSlug}/${issue.shortName}`}
              className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium mb-2">{issue.name}</h3>
              <p className="text-sm text-gray-600">
                {issue.resources.length} practice resource
                {issue.resources.length !== 1 ? "s" : ""}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
