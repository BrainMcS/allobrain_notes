// src/types/index.ts

export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  versions: NoteVersion[];
}

export interface NoteVersion {
  id: number;
  note_id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface NoteDiff {
  title_changed: boolean;
  old_title: string | null;
  new_title: string | null;
  content_diff: DiffLine[];
}

export interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
}

export interface NoteFormData {
  title: string;
  content: string;
}

export interface ApiError {
  status: number;
  message: string;
}
