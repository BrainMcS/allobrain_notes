import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, History } from "lucide-react";
import { toast } from 'react-toastify';
import { Note } from '../types';
import { getNotes, deleteNote } from '../services/api';

const NoteList: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await getNotes();
      setNotes(data);
      setError(null);
    } catch (err: any) {
      setError('Error loading notes');
      toast.error('Could not load notes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        setNotes(notes.filter(note => note.id !== id));
        toast.success('Note deleted successfully');
      } catch (err: any) {
        toast.error('Error deleting note');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-muted-foreground">Loading notes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive p-4 text-destructive" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <Link to="/notes/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </Link>
      </div>
      
      {notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-40 space-y-4">
            <p className="text-muted-foreground">You don't have any notes yet.</p>
            <Link to="/notes/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create my first note
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-xl truncate pr-4">{note.title}</CardTitle>
                <div className="flex space-x-2">
                  <Link to={`/notes/${note.id}/edit`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => handleDelete(note.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <Link to={`/notes/${note.id}`}>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{note.content}</p>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <span>Modified: {new Date(note.updated_at).toLocaleDateString()}</span>
                  <Link 
                    to={`/notes/${note.id}/versions`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center hover:text-primary"
                  >
                    <History className="mr-1 h-4 w-4" />
                    {note.versions.length} versions
                  </Link>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteList;
