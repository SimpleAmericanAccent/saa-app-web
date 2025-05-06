import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "frontend-web-core/src/components/ui/dialog";

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to control playback
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <kbd className="px-2 py-1.5 text-xs font-semibold bg-white text-black border rounded-md">
                Space
              </kbd>
              <span className="text-sm text-muted-foreground">
                Play/Pause audio
              </span>
            </div>
            <div className="flex items-center justify-between">
              <kbd className="px-2 py-1.5 text-xs font-semibold bg-white text-black border rounded-md">
                ←
              </kbd>
              <span className="text-sm text-muted-foreground">
                Rewind 1 second
              </span>
            </div>
            <div className="flex items-center justify-between">
              <kbd className="px-2 py-1.5 text-xs font-semibold bg-white text-black border rounded-md">
                →
              </kbd>
              <span className="text-sm text-muted-foreground">
                Forward 1 second
              </span>
            </div>
            <div className="flex items-center justify-between">
              <kbd className="px-2 py-1.5 text-xs font-semibold bg-white text-black border rounded-md">
                - or &lt;
              </kbd>
              <span className="text-sm text-muted-foreground">
                Decrease speed
              </span>
            </div>
            <div className="flex items-center justify-between">
              <kbd className="px-2 py-1.5 text-xs font-semibold bg-white text-black border rounded-md">
                + or &gt;
              </kbd>
              <span className="text-sm text-muted-foreground">
                Increase speed
              </span>
            </div>
            <div className="flex items-center justify-between">
              <kbd className="px-2 py-1.5 text-xs font-semibold bg-white text-black border rounded-md">
                ?
              </kbd>
              <span className="text-sm text-muted-foreground">
                Show/Hide this Keyboard Shortcuts menu
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;
