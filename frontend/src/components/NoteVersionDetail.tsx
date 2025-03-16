import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { toast } from 'react-toastify';
import { Note, NoteVersion, NoteDiff } from '../types';
import { getNoteVersion, getVersionDiff, revertToVersion } from '../services/api';

const NoteVersionDetail: React.FC = () => {
  const { id, versionId } = useParams();
  const [version, setVersion] = useState<NoteVersion | null>(null);
  const [diff, setDiff] = useState<NoteDiff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && versionId) {
      fetchVersionDetails(parseInt(id), parseInt(versionId));
    }
  }, [id, versionId]);

  const fetchVersionDetails = async (noteId: number, verId: number) => {
    try {
      const [versionData, diffData] = await Promise.all([
        getNoteVersion(noteId, verId),
        getVersionDiff(noteId, verId, true)
      ]);
      setVersion(versionData);
      setDiff(diffData);
    } catch (err) {
      toast.error('Error loading version details');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!id || !versionId || !window.confirm('Are you sure you want to restore this version?')) return;

    try {
      await revertToVersion(parseInt(id), parseInt(versionId));
      toast.success('Version restored successfully');
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
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!version || !diff) return null;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-2xl">{version.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Version from {new Date(version.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link to={`/notes/${id}/history`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Versions
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleRestore}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Changes from Previous Version</h3>
          {diff.additions.length > 0 && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10">
              <AlertDescription>
                <div className="font-medium text-green-600 dark:text-green-400">Additions:</div>
                {diff.additions.map((addition, index) => (
                  <div key={index} className="text-green-600 dark:text-green-400">
                    + {addition}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}
          {diff.deletions.length > 0 && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-900/10">
              <AlertDescription>
                <div className="font-medium text-red-600 dark:text-red-400">Deletions:</div>
                {diff.deletions.map((deletion, index) => (
                  <div key={index} className="text-red-600 dark:text-red-400">
                    - {deletion}
                  </div>
                ))}
              </AlertDescription>
            </Alert>
          )}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Full Content</h3>
          <div className="prose max-w-none">
            {version.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoteVersionDetail;