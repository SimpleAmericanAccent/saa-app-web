import { useState, useEffect } from "react";
import { Button } from "core-frontend-web/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "core-frontend-web/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "core-frontend-web/src/components/ui/dialog";
import { Input } from "core-frontend-web/src/components/ui/input";
import { Label } from "core-frontend-web/src/components/ui/label";
import { Textarea } from "core-frontend-web/src/components/ui/textarea";
import { PhonemeGridManager } from "./PhonemeGridManager";
import {
  compactVowelLayout,
  listVowelLayout,
  compactConsonantLayout,
  listConsonantLayout,
} from "core-frontend-web/src/config/phonemeLayouts";
import { Edit, Trash, Plus } from "lucide-react";

const DetailedListView = ({ phonemes = [], onEdit, onDelete, onAdd }) => {
  // Ensure phonemes is an array and not empty
  if (!Array.isArray(phonemes) || phonemes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Phoneme List</h3>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Phoneme
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No phonemes found. Add one to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group phonemes by category
  const groupedPhonemes = phonemes.reduce((acc, phoneme) => {
    const category = phoneme.category || "uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(phoneme);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Phoneme List</h3>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Phoneme
        </Button>
      </div>
      <div className="grid gap-4">
        {Object.entries(groupedPhonemes).map(([category, items]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">{category}</CardTitle>
              <CardDescription>
                {category === "monophthongs" && "Single vowel sounds"}
                {category === "diphthongs" && "Combined vowel sounds"}
                {category === "rColored" && "Vowels followed by 'r'"}
                {category === "unstressed" && "Vowels in unstressed syllables"}
                {category === "stops" && "Plosive consonants"}
                {category === "fricatives" && "Fricative consonants"}
                {category === "affricates" && "Affricate consonants"}
                {category === "approximants" && "Approximant consonants"}
                {category === "nasals" && "Nasal consonants"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {items.map((phoneme) => (
                  <div
                    key={phoneme.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium">{phoneme.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {phoneme.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEdit(phoneme)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDelete(phoneme.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const PhonemeManager = ({ type = "vowel" }) => {
  const [viewMode, setViewMode] = useState("compact");
  const [currentLayout, setCurrentLayout] = useState(
    type === "vowel" ? compactVowelLayout : compactConsonantLayout
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPhoneme, setEditingPhoneme] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    order: 0,
  });
  const [phonemes, setPhonemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize layout based on phonemes from database
  const initializeLayout = (phonemesData, baseLayout) => {
    const newSections = baseLayout.sections.map((section) => ({
      ...section,
      grid: {
        ...section.grid,
        items: section.grid.items.map((row) => row.map(() => "")), // Clear all positions
      },
    }));

    // Sort phonemes by order
    const sortedPhonemes = [...phonemesData].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );

    // Extract coordinates from order number
    const getCoordinates = (order) => {
      if (!order) return null;
      const section = Math.floor(order / 10000) - 1;
      const row = Math.floor((order % 10000) / 100);
      const col = order % 100;
      return { section, row, col };
    };

    // Place phonemes in the grid based on their encoded coordinates
    sortedPhonemes.forEach((phoneme) => {
      const coords = getCoordinates(phoneme.order);

      if (
        coords &&
        coords.section >= 0 &&
        coords.section < newSections.length
      ) {
        const section = newSections[coords.section];
        if (section.grid.items[coords.row]?.[coords.col] === "") {
          section.grid.items[coords.row][coords.col] = phoneme.name;
          return;
        }
      }

      // Fallback: find first empty spot if coordinates are invalid
      let placed = false;
      for (
        let sectionIndex = 0;
        sectionIndex < newSections.length;
        sectionIndex++
      ) {
        const section = newSections[sectionIndex];
        for (let row = 0; row < section.grid.items.length; row++) {
          for (let col = 0; col < section.grid.items[row].length; col++) {
            if (!section.grid.items[row][col]) {
              section.grid.items[row][col] = phoneme.name;
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
        if (placed) break;
      }
    });

    return newSections;
  };

  useEffect(() => {
    fetchPhonemes();
  }, [type]);

  const fetchPhonemes = async () => {
    setIsLoading(true);
    try {
      const endpoint =
        type === "vowel"
          ? "/api/dictionary/lexical-sets"
          : "/api/dictionary/consonant-phonemes";
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${
            type === "vowel" ? "lexical sets" : "consonant phonemes"
          }`
        );
      }
      const data = await response.json();

      // Transform lexical sets data to match the expected phoneme structure
      const transformedData =
        type === "vowel"
          ? data.map((set) => ({
              id: set.id,
              name: set.name,
              description: set.description || `${set.name} lexical set`,
              category: set.category || "monophthongs",
              order: set.order || 0,
              lexicalSet: set,
            }))
          : data;

      setPhonemes(transformedData || []);

      // Initialize layout with the fetched data
      const baseLayout =
        type === "vowel"
          ? viewMode === "compact"
            ? compactVowelLayout
            : listVowelLayout
          : viewMode === "compact"
          ? compactConsonantLayout
          : listConsonantLayout;

      const newSections = initializeLayout(transformedData, baseLayout);
      setCurrentLayout((prev) => ({
        ...prev,
        sections: newSections,
      }));
    } catch (error) {
      console.error(
        `Error fetching ${
          type === "vowel" ? "lexical sets" : "consonant phonemes"
        }:`,
        error
      );
      setPhonemes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChange = (newView) => {
    setViewMode(newView);
    const baseLayout =
      type === "vowel"
        ? newView === "compact"
          ? compactVowelLayout
          : listVowelLayout
        : newView === "compact"
        ? compactConsonantLayout
        : listConsonantLayout;

    const newSections = initializeLayout(phonemes, baseLayout);
    setCurrentLayout({
      ...baseLayout,
      sections: newSections,
    });
  };

  const handleUpdateLayout = async (newSections, dragInfo) => {
    // If this was triggered by a drag operation, update the order and category in the database
    if (dragInfo) {
      try {
        // Handle single dragInfo or array of dragInfos
        const dragInfoArray = Array.isArray(dragInfo) ? dragInfo : [dragInfo];

        // Process all moves/swaps
        await Promise.all(
          dragInfoArray.map(async (info) => {
            // Determine the new category based on the section title
            const sectionTitle = info.sectionTitle.toLowerCase();
            let newCategory = "";

            // Map section titles to categories
            if (type === "vowel") {
              if (sectionTitle.includes("monophthong")) {
                newCategory = "monophthongs";
              } else if (sectionTitle.includes("diphthong")) {
                newCategory = "diphthongs";
              } else if (sectionTitle.includes("r-colored")) {
                newCategory = "r-colored";
              } else if (sectionTitle.includes("unstressed")) {
                newCategory = "unstressed";
              }
            } else {
              // Consonant categories
              if (sectionTitle.includes("stops")) {
                newCategory = "stops";
              } else if (sectionTitle.includes("fricatives")) {
                newCategory = "fricatives";
              } else if (sectionTitle.includes("affricates")) {
                newCategory = "affricates";
              } else if (sectionTitle.includes("approximants")) {
                newCategory = "approximants";
              } else if (sectionTitle.includes("nasals")) {
                newCategory = "nasals";
              }
            }

            // Calculate new orders for the moved item
            const sectionNum = (info.toPosition.section + 1) * 10000;
            const rowNum = info.toPosition.row * 100;
            const colNum = info.toPosition.col;
            const newOrder = sectionNum + rowNum + colNum;

            // Find the phoneme object that matches this name
            const phoneme = phonemes.find((p) => p.name === info.name);
            if (!phoneme) return;

            const itemEndpoint =
              type === "vowel"
                ? `/api/dictionary/lexical-sets/${phoneme.id}`
                : `/api/dictionary/consonant-phonemes/${phoneme.id}`;

            // Fetch current data for this specific item
            const currentResponse = await fetch(itemEndpoint);
            if (!currentResponse.ok) {
              throw new Error(`Failed to fetch current data for ${info.name}`);
            }
            const currentData = await currentResponse.json();

            // Update the item with new position and category
            const response = await fetch(itemEndpoint, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...currentData,
                order: newOrder,
                category: newCategory || currentData.category,
              }),
            });

            if (!response.ok) {
              throw new Error(`Failed to update ${info.name}`);
            }
          })
        );

        // Update the layout optimistically
        setCurrentLayout((prev) => ({
          ...prev,
          sections: newSections,
        }));

        // Update the local phonemes array
        setPhonemes((prevPhonemes) =>
          prevPhonemes.map((p) => {
            const update = dragInfoArray.find((info) => info.name === p.name);
            if (update) {
              const sectionNum = (update.toPosition.section + 1) * 10000;
              const rowNum = update.toPosition.row * 100;
              const colNum = update.toPosition.col;
              const newOrder = sectionNum + rowNum + colNum;

              // Determine category based on section title
              let newCategory = p.category;
              const sectionTitle = update.sectionTitle.toLowerCase();

              if (type === "vowel") {
                if (sectionTitle.includes("monophthong")) {
                  newCategory = "monophthongs";
                } else if (sectionTitle.includes("diphthong")) {
                  newCategory = "diphthongs";
                } else if (sectionTitle.includes("r-colored")) {
                  newCategory = "r-colored";
                } else if (sectionTitle.includes("unstressed")) {
                  newCategory = "unstressed";
                }
              } else {
                // Consonant categories
                if (sectionTitle.includes("stops")) {
                  newCategory = "stops";
                } else if (sectionTitle.includes("fricatives")) {
                  newCategory = "fricatives";
                } else if (sectionTitle.includes("affricates")) {
                  newCategory = "affricates";
                } else if (sectionTitle.includes("approximants")) {
                  newCategory = "approximants";
                } else if (sectionTitle.includes("nasals")) {
                  newCategory = "nasals";
                }
              }

              return {
                ...p,
                category: newCategory,
                order: newOrder,
                gridPosition: {
                  section: update.toPosition.section,
                  row: update.toPosition.row,
                  col: update.toPosition.col,
                },
              };
            }
            return p;
          })
        );
      } catch (error) {
        console.error(
          `Error updating ${type === "vowel" ? "lexical set" : "phoneme"}:`,
          error
        );
        // On error, refresh the entire layout to ensure consistency
        await fetchPhonemes();
      }
    } else {
      // For non-drag updates, just update the layout
      setCurrentLayout((prev) => ({
        ...prev,
        sections: newSections,
      }));
    }
  };

  const handleEdit = (phoneme) => {
    setEditingPhoneme(phoneme);
    setFormData({
      name: phoneme.name,
      description: phoneme.description,
      category: phoneme.category,
      order: phoneme.order,
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setEditingPhoneme(null);
    setFormData({
      name: "",
      description: "",
      category: "",
      order: phonemes.length + 1,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${
          type === "vowel" ? "lexical set" : "phoneme"
        }?`
      )
    ) {
      try {
        const endpoint =
          type === "vowel"
            ? `/api/dictionary/lexical-sets/${id}`
            : `/api/dictionary/consonant-phonemes/${id}`;

        const response = await fetch(endpoint, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to delete ${type === "vowel" ? "lexical set" : "phoneme"}`
          );
        }

        await fetchPhonemes();
      } catch (error) {
        console.error(
          `Error deleting ${type === "vowel" ? "lexical set" : "phoneme"}:`,
          error
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint =
        type === "vowel"
          ? `/api/dictionary/lexical-sets${
              editingPhoneme ? `/${editingPhoneme.id}` : ""
            }`
          : `/api/dictionary/consonant-phonemes${
              editingPhoneme ? `/${editingPhoneme.id}` : ""
            }`;

      const response = await fetch(endpoint, {
        method: editingPhoneme ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          type === "vowel"
            ? {
                name: formData.name,
                description: formData.description,
                category: formData.category,
                order: formData.order,
                // Add any additional lexical set specific fields here
              }
            : formData
        ),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${editingPhoneme ? "update" : "create"} ${
            type === "vowel" ? "lexical set" : "phoneme"
          }`
        );
      }

      await fetchPhonemes();
      setOpenDialog(false);
    } catch (error) {
      console.error(
        `Error saving ${type === "vowel" ? "lexical set" : "phoneme"}:`,
        error
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {type === "vowel" ? "Vowel" : "Consonant"} Phonemes
        </h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "compact" ? "default" : "outline"}
            onClick={() => handleViewChange("compact")}
          >
            Compact View
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => handleViewChange("list")}
          >
            List View
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Loading phonemes...
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "compact" ? (
        <PhonemeGridManager
          sections={currentLayout.sections}
          onUpdateLayout={handleUpdateLayout}
          type={type}
          phonemes={phonemes}
        />
      ) : (
        <DetailedListView
          phonemes={phonemes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPhoneme ? "Edit Phoneme" : "Add New Phoneme"}
            </DialogTitle>
            <DialogDescription>
              {editingPhoneme
                ? "Edit the phoneme details below"
                : "Enter the details for the new phoneme"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select a category</option>
                  {type === "vowel" ? (
                    <>
                      <option value="monophthongs">Monophthongs</option>
                      <option value="diphthongs">Diphthongs</option>
                      <option value="rColored">R-colored</option>
                      <option value="unstressed">Unstressed</option>
                    </>
                  ) : (
                    <>
                      <option value="stops">Stops</option>
                      <option value="fricatives">Fricatives</option>
                      <option value="affricates">Affricates</option>
                      <option value="approximants">Approximants</option>
                      <option value="nasals">Nasals</option>
                    </>
                  )}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingPhoneme ? "Save Changes" : "Add Phoneme"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
