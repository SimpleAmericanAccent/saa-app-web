import { useState, useEffect } from "react";

export function TableOfContents() {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    // Get all h1, h2, h3 elements from the content
    const elements = Array.from(
      document.querySelectorAll(".prose h1, .prose h2, .prose h3")
    );

    // Create heading objects with id, text, and level
    const headingItems = elements.map((heading) => ({
      id: heading.id || createIdFromText(heading.textContent),
      text: heading.textContent,
      level: parseInt(heading.tagName.charAt(1)),
    }));

    // Ensure all headings have IDs for jumping
    elements.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = headingItems[index].id;
      }
    });

    setHeadings(headingItems);
  }, []);

  // Create URL-friendly IDs from heading text
  const createIdFromText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="toc-nav">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border">
        <h4 className="font-medium mb-2 text-sm">On this page</h4>
        <ul className="space-y-1">
          {headings.map((heading, index) => (
            <li
              key={index}
              style={{ paddingLeft: `${(heading.level - 1) * 1}rem` }}
              className="text-sm"
            >
              <button
                onClick={() => handleClick(heading.id)}
                className="hover:text-accent-foreground text-muted-foreground py-1 block w-full text-left"
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default TableOfContents;
