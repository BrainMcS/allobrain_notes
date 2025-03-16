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
    <div className="flex gap-6">
      {/* Left Sidebar */}
      <Card className="w-1/3 bg-gradient-to-br from-green-900 to-black min-h-[calc(100vh-8rem)]">
        <CardHeader className="border-b border-green-600">
          <CardTitle className="text-xl font-bold text-white text-center">Version History</CardTitle>
          <p className="text-sm text-green-300 text-center">
            {note.versions.length} versions
          </p>
        </CardHeader>
        <CardContent className="p-4">
          {note.versions.map((version: NoteVersion, index: number) => (
            <div
              key={version.id}
              className="mb-3 p-3 border border-green-700 rounded-lg hover:bg-green-800 transition-colors cursor-pointer"
            >
              <div className="text-white font-bold">{version.title}</div>
              <div className="text-green-200 text-sm">
                Version {note.versions.length - index}
              </div>
              <div className="text-green-300 text-xs">
                {new Date(version.created_at).toLocaleString()}
              </div>
              <div className="flex gap-2 mt-2">
                <Link to={`/notes/${note.id}/history/${version.id}`} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full hover:bg-green-700 text-white">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </Link>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(version.id)}
                    className="flex-1 hover:bg-green-700 text-white"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restore
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card className="flex-1 bg-gradient-to-br from-green-900 to-black">
        <CardHeader className="flex flex-col items-center text-center space-y-4 border-b border-green-600">
          <div>
            <CardTitle className="text-3xl font-bold text-white">{note.title}</CardTitle>
          </div>
          <Link to={`/notes/${note.id}`}>
            <Button variant="outline" size="sm" className="hover:bg-green-700 border-green-500 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Note
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-6">
          {/* Add your main content here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteVersions;
