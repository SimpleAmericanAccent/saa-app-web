import { useState } from "react";
import { Button } from "shared/frontend-web-core/src/components/ui/button";
import { Card } from "shared/frontend-web-core/src/components/ui/card";
import { Input } from "shared/frontend-web-core/src/components/ui/input";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus } from "lucide-react";
import { PhonemeCard } from "./PhonemeCard";

// Helper function to parse cell IDs into their components
const parseId = (id) => {
  if (!id) return null;
  const [section, row, col] = id.split("-").map(Number);
  return {
    section,
    row,
    col,
  };
};

const EmptyCell = ({ id }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="h-[100px] border border-dashed border-border rounded-lg bg-muted/30 flex items-center justify-center"
    >
      <span className="text-muted-foreground text-sm">Empty</span>
    </div>
  );
};

const SortablePhoneme = ({ id, phoneme }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-move z-10"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <PhonemeCard {...phoneme} />
    </div>
  );
};

export const PhonemeGridManager = ({
  sections,
  onUpdateLayout,
  type = "vowel", // or "consonant"
  phonemes = [], // Add default empty array
}) => {
  const [activeId, setActiveId] = useState(null);
  const [newPhonemeName, setNewPhonemeName] = useState("");

  // Ensure phonemes is always an array
  const phonemeArray = Array.isArray(phonemes) ? phonemes : [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    console.log("Drag start:", event.active.id);
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!active || !over) return;

    const fromPosition = parseId(active.id);
    const toPosition = parseId(over.id);

    if (!fromPosition || !toPosition) return;

    const fromSection = sections[fromPosition.section];
    const toSection = sections[toPosition.section];

    if (!fromSection || !toSection) return;

    // Get the name of the phoneme being moved
    const movingPhoneme =
      fromSection.grid.items[fromPosition.row][fromPosition.col];

    if (!movingPhoneme) return;

    const newSections = [...sections];

    // Get the phoneme at the target position (if any)
    const targetPhoneme = toSection.grid.items[toPosition.row][toPosition.col];

    // Perform the swap
    newSections[fromPosition.section].grid.items[fromPosition.row][
      fromPosition.col
    ] = targetPhoneme;
    newSections[toPosition.section].grid.items[toPosition.row][toPosition.col] =
      movingPhoneme;

    // Create dragInfo objects for both phonemes if it's a swap
    const dragInfos = [];

    // Info for the moving phoneme
    dragInfos.push({
      name: movingPhoneme,
      fromPosition,
      toPosition,
      sectionTitle: toSection.title,
    });

    // If there was a phoneme in the target position, add its info
    if (targetPhoneme) {
      dragInfos.push({
        name: targetPhoneme,
        fromPosition: toPosition,
        toPosition: fromPosition,
        sectionTitle: fromSection.title,
      });
    }

    // Update both phonemes' positions
    onUpdateLayout(newSections, dragInfos);
    setActiveId(null);
  };

  const handleAddPhoneme = (sectionIndex) => {
    if (!newPhonemeName.trim()) return;

    const newSections = [...sections];
    const section = newSections[sectionIndex];

    // Find first empty slot in the grid
    for (let rowIndex = 0; rowIndex < section.grid.items.length; rowIndex++) {
      const row = section.grid.items[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        if (!row[colIndex]) {
          section.grid.items[rowIndex][colIndex] = newPhonemeName;
          onUpdateLayout(newSections);
          setNewPhonemeName("");
          return;
        }
      }
    }
  };

  // Get all possible cell IDs for the DndContext
  const getAllCellIds = () => {
    return sections.flatMap((_, sectionIndex) =>
      sections[sectionIndex].grid.items.flatMap((row, rowIndex) =>
        row.map((_, colIndex) => `${sectionIndex}-${rowIndex}-${colIndex}`)
      )
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-wrap gap-6">
        {sections.map((section, sectionIndex) => (
          <Card
            key={sectionIndex}
            className="p-4 bg-card border-border flex-none"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {section.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={newPhonemeName}
                  onChange={(e) => setNewPhonemeName(e.target.value)}
                  placeholder="New phoneme name"
                  className="w-40"
                />
                <Button
                  size="sm"
                  onClick={() => handleAddPhoneme(sectionIndex)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${section.grid.columns}, minmax(0, 1fr))`,
                width: section.grid.width,
              }}
            >
              {section.grid.items.map((row, rowIndex) =>
                row.map((item, colIndex) => {
                  const cellId = `${sectionIndex}-${rowIndex}-${colIndex}`;
                  return (
                    <div key={cellId}>
                      {item && phonemeArray.find((p) => p.name === item) ? (
                        <SortablePhoneme
                          id={cellId}
                          phoneme={phonemeArray.find((p) => p.name === item)}
                        />
                      ) : (
                        <EmptyCell id={cellId} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        ))}
      </div>

      <DragOverlay>
        {activeId &&
          (() => {
            const [sectionIndex, rowIndex, colIndex] = activeId.split("-");
            const phonemeName =
              sections[sectionIndex]?.grid?.items[rowIndex]?.[colIndex];
            const phoneme = phonemeArray.find((p) => p.name === phonemeName);
            return phoneme ? <PhonemeCard {...phoneme} /> : null;
          })()}
      </DragOverlay>
    </DndContext>
  );
};
