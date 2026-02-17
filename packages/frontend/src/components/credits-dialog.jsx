import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "frontend/src/components/ui/dialog";
import { ExternalLink } from "lucide-react";

const CREDITS = [
  {
    name: "CMU Pronouncing Dictionary",
    description:
      "Word-to-pronunciation (ARPAbet) data. BSD 3-Clause; Carnegie Mellon University.",
    link: "https://github.com/cmusphinx/cmudict",
  },
  {
    name: "SUBTLEX-US",
    description:
      "Word frequency counts from American film and TV subtitles. Brysbaert & New (Ghent University). CC-BY-SA.",
    link: "https://openlexicon.fr/datasets-info/SUBTLEX-US/README-SUBTLEXus.html",
  },
  {
    name: "Wiktionary / Wikimedia Commons",
    description:
      "Pronunciation audio (streamed from Wikimedia; not re-hosted). Various free licenses; attribution in-app where used.",
    link: "https://en.wiktionary.org",
  },
];

function restoreBodyPointerEvents() {
  document.body.style.pointerEvents = "";
  document.body.style.overflow = "";
}

export function CreditsDialog({ open, onOpenChange }) {
  // When this component unmounts (parent sets creditsOpen false), Radix may have left
  // pointer-events/overflow on body. Restore after Radix's cleanup so the page is clickable.
  useEffect(() => {
    return () => {
      requestAnimationFrame(() => {
        restoreBodyPointerEvents();
      });
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Credits</DialogTitle>
          <DialogDescription>
            This app uses the following data sources:
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 text-sm">
          {CREDITS.map((item) => (
            <li key={item.name} className="space-y-1">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline inline-flex items-center gap-1"
              >
                {item.name}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
              <p className="text-muted-foreground text-xs">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export default CreditsDialog;
