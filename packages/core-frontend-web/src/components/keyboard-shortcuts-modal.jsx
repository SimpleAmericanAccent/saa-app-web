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

        <div className="grid grid-cols-2 gap-6 py-2">
          {/* Left Column - Keyboard Shortcuts */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-2 mb-3">
              Keyboard Playback Controls
            </h3>
            <div className="grid gap-2">
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

            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide mt-4">
              Left/Right Click
            </h4>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
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
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground border-b border-border pb-2 mb-3">
              Pronunciation Guide
            </h3>

            {/* 1. Annotations/Feedback */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Annotations/Feedback
              </h4>
              <div className="text-xs text-muted-foreground">
                <p className="mb-1">
                  Format: <span className="font-mono">TARGET x ACTUAL</span>
                </p>
                <div>
                  <div className="font-mono bg-muted p-1 m-1 rounded ">
                    KIT x FLEECE
                  </div>
                  <div className="font-mono bg-muted p-1 m-1 rounded">
                    DH x D/flap
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Pronunciation Conversion */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Pronunciation Conversion
              </h4>
              <div className="text-sm text-muted-foreground">
                <p>
                  From{" "}
                  <a
                    href="https://en.wikipedia.org/wiki/CMU_Pronouncing_Dictionary"
                    target="_blank"
                    rel="noopener"
                    className="text-blue-600 hover:underline"
                  >
                    CMU Dictionary
                  </a>
                </p>
                <p className="ml-5">
                  →{" "}
                  <a
                    href="https://en.wikipedia.org/wiki/Lexical_set"
                    target="_blank"
                    rel="noopener"
                    className="text-blue-600 hover:underline"
                  >
                    Lexical Sets
                  </a>
                </p>
                <p className="ml-5">
                  →{" "}
                  <a
                    href="https://en.wikipedia.org/wiki/International_Phonetic_Alphabet"
                    target="_blank"
                    rel="noopener"
                    className="text-blue-600 hover:underline"
                  >
                    IPA
                  </a>
                </p>
              </div>
            </div>

            {/* 3. Stress Markers */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Stress Markers
              </h4>
              <div className="text-xs text-muted-foreground">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-1 text-center font-semibold">
                          Stress
                        </th>
                        <th className="border border-border p-1 text-center font-semibold">
                          CMU/lex
                        </th>
                        <th className="border border-border p-1 text-center font-semibold">
                          IPA
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-1 text-center">
                          None
                        </td>
                        <td className="border border-border p-1 font-mono text-center">
                          _0
                        </td>
                        <td className="border border-border p-1 font-mono text-center">
                          _
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-1 text-center">
                          Primary
                        </td>
                        <td className="border border-border p-1 font-mono text-center">
                          _1
                        </td>
                        <td className="border border-border p-1 font-mono text-center">
                          ˈ_
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-border p-1 text-center">
                          Secondary
                        </td>
                        <td className="border border-border p-1 font-mono text-center">
                          _2
                        </td>
                        <td className="border border-border p-1 font-mono text-center">
                          <span className="font-ipa text-sm relative top-[2px]">
                            ˌ
                          </span>
                          _
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsModal;
