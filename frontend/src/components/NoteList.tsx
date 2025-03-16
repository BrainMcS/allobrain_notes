import { useEffect, useState } from "react";
import { getNotes, deleteNote } from "../services/api";
import { Note } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil, Trash2, History, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export default function NoteList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error) {
      toast.error("Failed to load notes");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteNote(id);
      await fetchNotes();
      toast.success("Note deleted successfully");
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await Promise.all(notes.map(note => deleteNote(note.id)));
      await fetchNotes();
      toast.success("All notes deleted successfully");
    } catch (error) {
      toast.error("Failed to delete notes");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tight">Notes</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/notes/new")} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No notes yet. Create your first note!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Card key={note.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{note.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Last updated: {new Date(note.updated_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="line-clamp-3 text-muted-foreground">{note.content}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-secondary"
                  onClick={() => navigate(`/notes/${note.id}/history`)}
                >
                  <History className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-secondary"
                  onClick={() => navigate(`/notes/${note.id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDelete(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
