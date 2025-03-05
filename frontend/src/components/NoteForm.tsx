import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { toast } from 'react-toastify';
import { Note } from '../types';
import { createNote, updateNote, getNote } from '../services/api';

const NoteForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<Partial<Note>>({
    title: '',
    content: ''
  });

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await updateNote(parseInt(id), note);
        toast.success('Note updated successfully');
      } else {
        await createNote(note);
        toast.success('Note created successfully');
      }
      navigate('/notes');
    } catch (err) {
      toast.error(id ? 'Error updating note' : 'Error creating note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{id ? 'Edit Note' : 'Create New Note'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={note.title}
              onChange={(e) => setNote({ ...note, title: e.target.value })}
              placeholder="Enter note title"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <Textarea
              id="content"
              value={note.content}
              onChange={(e) => setNote({ ...note, content: e.target.value })}
              placeholder="Enter note content"
              className="min-h-[200px]"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/notes')}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : id ? 'Update' : 'Create'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default NoteForm;
