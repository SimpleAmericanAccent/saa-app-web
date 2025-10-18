import { useNavigate } from "react-router-dom";
import TableOfContents from "../components/TableOfContents";

export default function ModuleLayout({
  children,
  moduleTitle,
  prevLesson,
  nextLesson,
  currentPage,
  totalPages,
  soundData,
  type = "default",
}) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex gap-8 relative">
        {/* Sidebar */}
        <div className="w-64 relative">
          <div className="sticky top-8">
            <TableOfContents />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 max-w-4xl">
          <div className="prose dark:prose-invert max-w-none">{children}</div>
        </div>
      </div>
    </div>
  );
}
