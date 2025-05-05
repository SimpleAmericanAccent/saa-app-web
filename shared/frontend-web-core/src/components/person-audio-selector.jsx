import * as React from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  FileAudio,
} from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "shared/frontend-web-core/src/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "shared/frontend-web-core/src/components/ui/dialog";
import { Button } from "shared/frontend-web-core/src/components/ui/button";
import { cn } from "shared/frontend-web-core/src/lib/utils";

export function PersonAudioSelector({
  people,
  filteredAudio,
  selectedPerson,
  selectedAudio,
  onPersonSelect,
  onAudioSelect,
  size = "default",
}) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Get names for display
  const getPersonName = (id) =>
    people.find((p) => p.id === id)?.Name || "Select person";
  const getAudioName = (id) =>
    filteredAudio.find((a) => a.id === id)?.Name || "Select audio";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left cursor-pointer",
            !selectedAudio &&
              "animate-pulse shadow-md shadow-primary/25 border-primary/50", // Add pulse effect when no audio selected
            size === "large" && "text-2xl"
          )}
        >
          {selectedPerson ? (
            <>
              {getPersonName(selectedPerson)}
              {selectedAudio && ` → ${getAudioName(selectedAudio)}`}
            </>
          ) : (
            "Select person and audio..."
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Select Person and Audio</DialogTitle>
          <DialogDescription>
            Select a person first, then choose from their available audio files
          </DialogDescription>
        </DialogHeader>
        <Command onValueChange={setSearchValue}>
          <CommandInput
            placeholder="Search people and audio files..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {!selectedPerson ? (
              // Show all people when none selected
              <CommandGroup heading="Select Person">
                {[...people]
                  .sort((a, b) => a.Name.localeCompare(b.Name))
                  .map((person) => (
                    <CommandItem
                      key={person.id}
                      onSelect={() => {
                        onPersonSelect(person.id);
                        setSearchValue(""); // Clear search when person selected
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      {person.Name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ) : (
              // Show selected person and their audio files
              <>
                <CommandGroup heading="Selected Person">
                  <CommandItem
                    onSelect={() => {
                      onPersonSelect(null); // Clear selection
                      onAudioSelect(null);
                      setSearchValue("");
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {getPersonName(selectedPerson)}
                    <span className="ml-auto text-xs text-muted-foreground">
                      Click to change
                    </span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Available Audio Files">
                  {filteredAudio.map((audio) => (
                    <CommandItem
                      key={audio.id}
                      onSelect={() => {
                        onAudioSelect(audio.id);
                        setOpen(false);
                      }}
                    >
                      <FileAudio className="mr-2 h-4 w-4" />
                      {audio.Name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
