import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash, X } from "lucide-react";

const LexicalSetAdmin = () => {
  const [lexicalSets, setLexicalSets] = useState([]);
  const [selectedLexicalSet, setSelectedLexicalSet] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    order: "",
  });

  useEffect(() => {
    fetchLexicalSets();
  }, []);

  const fetchLexicalSets = async () => {
    try {
      const response = await fetch("/api/dictionary/lexical-sets");
      if (!response.ok) {
        console.error(
          "Error fetching lexical sets:",
          response.status,
          response.statusText
        );
        setLexicalSets([]);
        return;
      }
      const data = await response.json();
      setLexicalSets(data);
    } catch (error) {
      console.error("Error fetching lexical sets:", error);
      setLexicalSets([]);
    }
  };

  const handleOpenDialog = (lexicalSet = null) => {
    if (lexicalSet) {
      setSelectedLexicalSet(lexicalSet);
      setFormData({
        name: lexicalSet.name,
        description: lexicalSet.description || "",
        order: lexicalSet.order ? lexicalSet.order.toString() : "",
      });
    } else {
      setSelectedLexicalSet(null);
      setFormData({
        name: "",
        description: "",
        order: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLexicalSet(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedLexicalSet
        ? `/api/dictionary/lexical-sets/${selectedLexicalSet.id}`
        : "/api/dictionary/lexical-sets";

      const method = selectedLexicalSet ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchLexicalSets();
      } else {
        console.error("Error saving lexical set");
      }
    } catch (error) {
      console.error("Error saving lexical set:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lexical set?")) {
      try {
        console.log(`Attempting to delete lexical set with ID: ${id}`);
        const response = await fetch(`/api/dictionary/lexical-sets/${id}`, {
          method: "DELETE",
        });

        console.log(`Delete response status: ${response.status}`);

        if (response.ok) {
          console.log("Lexical set deleted successfully");
          fetchLexicalSets();
        } else {
          const errorData = await response.json().catch(() => null);
          console.error("Error deleting lexical set:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
          });
        }
      } catch (error) {
        console.error("Error in handleDelete:", error);
      }
    }
  };

  const handleRemoveUsage = async (lexicalSetId, usageId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this word from the lexical set?"
      )
    ) {
      try {
        console.log(
          `Attempting to remove usage ${usageId} from lexical set ${lexicalSetId}`
        );
        const response = await fetch(
          `/api/dictionary/lexical-sets/${lexicalSetId}/usages/${usageId}`,
          {
            method: "DELETE",
          }
        );

        console.log(`Remove usage response status: ${response.status}`);

        if (response.ok) {
          console.log("Usage removed successfully");
          fetchLexicalSets();
        } else {
          const errorData = await response.json().catch(() => null);
          console.error("Error removing usage:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
          });
        }
      } catch (error) {
        console.error("Error in handleRemoveUsage:", error);
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lexical Set Administration</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Lexical Set
        </Button>
      </div>

      {lexicalSets.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Lexical Sets Found</CardTitle>
            <CardDescription>
              There are no lexical sets yet. Click the "Add New Lexical Set"
              button to create one.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {lexicalSets.map((lexicalSet) => (
            <Card key={lexicalSet.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{lexicalSet.name}</CardTitle>
                  {lexicalSet.description && (
                    <CardDescription>{lexicalSet.description}</CardDescription>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenDialog(lexicalSet)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(lexicalSet.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lexicalSet.usages && lexicalSet.usages.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Word</TableHead>
                        <TableHead>Part of Speech</TableHead>
                        <TableHead>Meaning</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lexicalSet.usages.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell>{usage.wordUsage.entry.word}</TableCell>
                          <TableCell>{usage.wordUsage.partOfSpeech}</TableCell>
                          <TableCell>{usage.wordUsage.meaning}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handleRemoveUsage(
                                  lexicalSet.id,
                                  usage.wordUsage.id
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">
                    No words in this lexical set.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLexicalSet ? "Edit Lexical Set" : "Add New Lexical Set"}
            </DialogTitle>
            <DialogDescription>
              {selectedLexicalSet
                ? "Edit the lexical set details below."
                : "Fill in the details for the new lexical set."}
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
                  required
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
                <Label htmlFor="order">Order (optional)</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, order: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LexicalSetAdmin;
