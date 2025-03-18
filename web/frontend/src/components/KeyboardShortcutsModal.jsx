import { useEffect } from "react";
import propTypes from "prop-types";

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard Shortcuts</h2>
        <div className="shortcuts-grid">
          <div className="shortcut">
            <kbd>Space</kbd>
            <span>Play/Pause audio</span>
          </div>
          <div className="shortcut">
            <kbd>←</kbd>
            <span>Rewind 1 second</span>
          </div>
          <div className="shortcut">
            <kbd>→</kbd>
            <span>Forward 1 second</span>
          </div>
          <div className="shortcut">
            <kbd>, or &lt;</kbd>
            <span>Decrease speed</span>
          </div>
          <div className="shortcut">
            <kbd>. or &gt;</kbd>
            <span>Increase speed</span>
          </div>
          <div className="shortcut">
            <kbd>?</kbd>
            <span>Show/Hide shortcuts</span>
          </div>
        </div>
        <button className="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

KeyboardShortcutsModal.propTypes = {
  isOpen: propTypes.bool.isRequired,
  onClose: propTypes.func.isRequired,
};

export default KeyboardShortcutsModal;
