import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Clock, Trash2 } from "lucide-react";
import { toast } from 'react-toastify';
import { Note } from '../types';
import { getNote, deleteNote } from '../services/api';

const NoteDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchNote(parseInt(id));
    }
  }, [id]);

  const fetchNote = async (noteId: number) => {
    try {
      const data = await getNote(noteId);
      setNote(data);
    } catch (err) {
      toast.error('Error loading note');
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteNote(note.id);
      toast.success('Note deleted successfully');
      navigate('/notes');
    } catch (err) {
      toast.error('Error deleting note');
    }
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!note) return null;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-2xl mb-2">{note.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last modified: {new Date(note.updated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link to={`/notes/${note.id}/versions`}>
            <Button variant="outline" size="sm">
              <Clock className="mr-2 h-4 w-4" />
              History
            </Button>
          </Link>
          <Link to={`/notes/${note.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          {note.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <span>Created: {new Date(note.created_at).toLocaleString()}</span>
        <span>{note.versions.length} versions</span>
      </CardFooter>
    </Card>
  );
};

export default NoteDetail;
