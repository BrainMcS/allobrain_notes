import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye, RotateCcw } from "lucide-react";
import { toast } from 'react-toastify';
import { Note, NoteVersion } from '../types';
import { getNote, restoreVersion } from '../services/api';

const NoteVersions: React.FC = () => {
  const { id } = useParams();
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
      toast.error('Error loading note versions');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId: number) => {
    if (!note || !window.confirm('Are you sure you want to restore this version?')) return;

    try {
      await restoreVersion(note.id, versionId);
      toast.success('Version restored successfully');
      fetchNote(note.id);
    } catch (err) {
      toast.error('Error restoring version');
    }
  };

  if (loading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!note) return null;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-2xl">{note.title} - Version History</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {note.versions.length} versions
          </p>
        </div>
        <Link to={`/notes/${note.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Note
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {note.versions.map((version: NoteVersion, index: number) => (
              <TableRow key={version.id}>
                <TableCell className="font-medium">
                  {note.versions.length - index}
                </TableCell>
                <TableCell>
                  {new Date(version.created_at).toLocaleString()}
                </TableCell>
                <TableCell>{version.title}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Link to={`/notes/${note.id}/versions/${version.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(version.id)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default NoteVersions;
