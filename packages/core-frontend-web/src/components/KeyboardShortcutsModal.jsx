import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "core-frontend-web/src/components/ui/dialog";

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-w-8xl">
      <DialogContent className="max-w-8xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts & Pronunciation Guide</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to control playback.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8 py-4">
          {/* Left Column - Keyboard Shortcuts */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Playback Controls</h3>
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
                  Show/Hide this menu
                </span>
              </div>
            </div>
          </div>

          {/* Right Column - Pronunciation Guide */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Pronunciation Guide</h3>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                ARPAbet symbols are converted to lexical sets:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li className="whitespace-nowrap">
                  IY → FLEECE (e.g., "beet")
                </li>
                <li>IH → KIT (e.g., "bit")</li>
                <li>AA/AO → LOT (e.g., "bought")</li>
                <li>ER → NURSE (e.g., "bird")</li>
                <li>etc.</li>
              </ul>
              <p className="my-2">... or more familiar consonants:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>DH → Voiced TH (e.g., "this")</li>
                <li>HH → H (e.g., "hi")</li>
                <li>JH → J (e.g., "jungle")</li>
              </ul>
              <p className="mt-2">
                Stress markers (0, 1, 2) indicate syllable stress:
              </p>
              <ul className="list-disc pl-4">
                <li>0: No stress</li>
                <li>1: Primary stress</li>
                <li>2: Secondary stress</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;
