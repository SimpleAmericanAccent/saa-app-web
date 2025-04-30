import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ModuleLayout({
  children,
  moduleTitle,
  prevLesson,
  nextLesson,
  currentPage,
  totalPages,
}) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{moduleTitle}</h1>
        {currentPage && totalPages && (
          <p className="text-muted-foreground">
            Lesson {currentPage} of {totalPages}
          </p>
        )}
      </div>

      <div className="prose dark:prose-invert max-w-none">{children}</div>

      <div className="flex justify-between mt-12 pt-6 border-t">
        {prevLesson ? (
          <Button variant="outline" onClick={() => navigate(prevLesson)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous Lesson
          </Button>
        ) : (
          <div />
        )}

        {nextLesson && (
          <Button onClick={() => navigate(nextLesson)}>
            Next Lesson
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
