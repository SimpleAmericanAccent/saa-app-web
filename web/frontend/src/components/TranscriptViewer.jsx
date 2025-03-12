/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback } from "react";

const TranscriptViewer = ({
  annotatedTranscript,
  activeWordIndex,
  handleWordClick,
  onAnnotationHover,
  onAnnotationUpdate,
  issuesData,
}) => {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    wordIndex: null,
  });

  const getAnnotations = (wordIndex) => {
    const word = annotatedTranscript
      .flatMap((paragraph) => paragraph.alignment)
      .find((word) => word.wordIndex === wordIndex);
    return word ? word["BR issues"] || [] : [];
    // return record ? record.fields["BR issues"] : [];
  };

  const handleContextMenu = (e, wordIndex) => {
    e.preventDefault();
    // Prevent menu repositioning if clicking inside existing menu
    if (e.target.closest(".menu-list")) {
      return;
    }
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      wordIndex,
    });
  };

  const handleClickOutside = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleIssueSelect = (wordIndex, issueId) => {
    const annotations = getAnnotations(wordIndex);
    const annotationsDesired = annotations.includes(issueId)
      ? annotations.filter((id) => id !== issueId)
      : [...annotations, issueId];

    if (onAnnotationUpdate) {
      onAnnotationUpdate(wordIndex, annotationsDesired);
    }

    // Here you would typically call a function to update the annotations in Airtable
    // For now, we'll just update the UI
    if (onAnnotationHover) {
      onAnnotationHover(annotationsDesired);
    }
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (contextMenu.visible) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu.visible, handleClickOutside]);

  const renderContextMenu = () => {
    if (!contextMenu.visible) return null;

    const adjustMenuPosition = (element) => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const menuRect = element.getBoundingClientRect();

      // Adjust vertical position if menu overflows bottom
      if (menuRect.bottom > windowHeight) {
        // const overflowAmount = menuRect.bottom - windowHeight;
        // element.style.top = `${Math.max(0, contextMenu.y - overflowAmount)}px`;
        element.style.top = `0px`;
      }

      // Adjust horizontal position if menu overflows right
      if (menuRect.right > windowWidth) {
        element.style.left = `${windowWidth - menuRect.width - 10}px`;
      }
    };

    const adjustSubmenuPosition = (element, parentRect) => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const submenuRect = element.getBoundingClientRect();

      // Try to position submenu to the right of parent menu
      let left = parentRect.right;
      let top = parentRect.top;

      // If submenu would overflow right, position to left of parent
      if (left + submenuRect.width > windowWidth) {
        left = parentRect.left - submenuRect.width;
      }

      // If submenu would overflow bottom, align bottom with window
      if (top + submenuRect.height > windowHeight) {
        top = windowHeight - submenuRect.height;
      }

      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
    };

    return (
      <>
        <ul
          className="menu-list"
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
          }}
          ref={(element) => {
            if (element) {
              adjustMenuPosition(element);
            }
          }}
        >
          {issuesData.map((target) => (
            <li
              key={target.id}
              className="menu-item"
              onMouseEnter={(e) => {
                const submenu = e.currentTarget.querySelector(".submenu");
                if (submenu) {
                  adjustSubmenuPosition(
                    submenu,
                    e.currentTarget.getBoundingClientRect()
                  );
                }
              }}
            >
              <span>{target.name}</span>
              <ul className="submenu">
                {target.issues.map((issue) => (
                  <li
                    key={issue.id}
                    className="submenu-item"
                    onClick={() =>
                      handleIssueSelect(contextMenu.wordIndex, issue.id)
                    }
                  >
                    {issue.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </>
    );
  };

  const handleAnnotationHover = (wordIndex) => {
    const annotations = getAnnotations(wordIndex);
    if (onAnnotationHover) {
      onAnnotationHover(annotations);
    }
  };

  return (
    <div className="transcript">
      {annotatedTranscript.map((paragraph, index) => (
        <p key={index}>
          {paragraph.alignment.map((wordObj) => {
            const annotations = getAnnotations(wordObj.wordIndex);
            const hasAnnotations = annotations.length > 0;
            return (
              <span
                key={wordObj.wordIndex}
                className={`${
                  activeWordIndex === wordObj.wordIndex ? "active" : ""
                } ${hasAnnotations ? "annotated" : ""}`}
                onClick={() => handleWordClick(wordObj.start_time)}
                onMouseOver={() => handleAnnotationHover(wordObj.wordIndex)}
                onContextMenu={(e) => handleContextMenu(e, wordObj.wordIndex)}
              >
                {wordObj.word}{" "}
              </span>
            );
          })}
        </p>
      ))}
      {renderContextMenu()}
    </div>
  );
};

export default TranscriptViewer;
