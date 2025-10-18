import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "core-frontend-web/src/components/ui/dialog";

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} className="max-w-8xl z-9999">
      <DialogContent className="max-w-8xl z-9999">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts & Pronunciation Guide</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to control playback.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8 py-4">
          {/* Left Column - Keyboard Shortcuts */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              Keyboard Playback Controls
            </h3>
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

            <h3 className="text-sm font-semibold mt-6">Left/Right Click</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span title="Left Click">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <rect
                      x="7"
                      y="2"
                      width="10"
                      height="20"
                      rx="5"
                      fill="#fff"
                      stroke="#000"
                    />
                    <rect
                      x="7"
                      y="2"
                      width="5"
                      height="10"
                      rx="5"
                      fill="#4f46e5"
                    />{" "}
                    {/* Highlight left */}
                  </svg>
                </span>
                <span>Play transcript audio</span>
              </div>
              <div className="flex items-center justify-between">
                <span title="Right Click">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <rect
                      x="7"
                      y="2"
                      width="10"
                      height="20"
                      rx="5"
                      fill="#fff"
                      stroke="#000"
                    />
                    <rect
                      x="12"
                      y="2"
                      width="5"
                      height="10"
                      rx="5"
                      fill="#4f46e5"
                    />{" "}
                    {/* Highlight right */}
                  </svg>
                </span>
                <span>Play reference audio</span>
              </div>
            </div>
          </div>

          {/* Right Column - Pronunciation Guide */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Pronunciation Guide</h3>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                Feedback provided in format
                <br />
                TARGET x ACTUAL:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>KIT x FLEECE</li>
                <li>DH x D/flap</li>
              </ul>
              <p className="my-2">
                ARPAbet symbols are converted to lexical sets / more common
                consonant spellings:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li className="whitespace-nowrap">IY → FLEECE ("beet")</li>
                <li>IH → KIT ("bit")</li>
                <li>AA/AO → LOT ("bought")</li>
                <li>ER → NURSE ("bird")</li>
                <li>HH → H ("hi")</li>
                <li>JH → J ("jungle")</li>
              </ul>
              <p className="mt-2">
                Vowel stress markers (0, 1, 2) indicate syllable stress:
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
