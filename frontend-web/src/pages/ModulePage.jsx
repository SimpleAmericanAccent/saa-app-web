import { useParams } from "react-router-dom";
import { ModuleLayout } from "@/components/ModuleLayout";
import { Suspense } from "react";
import React from "react";

// Import all module content
const modules = import.meta.glob("@/content/modules/**/*.mdx");

export function ModulePage() {
  const { moduleId, lessonId } = useParams();

  // Dynamically import the MDX content
  const Component = React.lazy(() =>
    modules[`/src/content/modules/${moduleId}/${lessonId || "index"}.mdx`]()
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ModuleLayout
        moduleTitle="Vowel Sounds"
        currentPage={1}
        totalPages={5}
        prevLesson="/learn/vowels/introduction"
        nextLesson="/learn/vowels/lesson-2"
      >
        <Component />
      </ModuleLayout>
    </Suspense>
  );
}
