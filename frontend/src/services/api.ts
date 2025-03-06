// src/services/api.ts
import { Note, NoteVersion, NoteDiff, NoteFormData, ApiError } from '../types';

const API_URL = 'http://localhost:8000';  // Remove /api since backend doesn't use it

// Helper function to handle API errors
const handleApiError = async (response: Response): Promise<any> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error: ApiError = {
      status: response.status,
      message: errorData?.detail || `Error: ${response.statusText}`
    };
    throw error;
  }
  
  return response.json();
};

// Get all notes
export const getNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_URL}/notes`);
  return handleApiError(response);
};

// Get a single note by ID
export const getNote = async (id: number): Promise<Note> => {
  const response = await fetch(`${API_URL}/notes/${id}`);
  return handleApiError(response);
};

// Create a new note
export const createNote = async (noteData: NoteFormData): Promise<Note> => {
  const response = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      title: noteData.title.trim(),
      content: noteData.content.trim()
    }),
  });
  return handleApiError(response);
};

// Update an existing note
export const updateNote = async (id: number, noteData: NoteFormData): Promise<Note> => {
  const response = await fetch(`${API_URL}/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });
  return handleApiError(response);
};

// Delete a note
export const deleteNote = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/notes/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    await handleApiError(response);
  }
};

// Get all versions of a note
export const getNoteVersions = async (noteId: number): Promise<NoteVersion[]> => {
  const response = await fetch(`${API_URL}/notes/${noteId}/versions`);
  return handleApiError(response);
};

// Get a specific version of a note
export const getNoteVersion = async (noteId: number, versionId: number): Promise<NoteVersion> => {
  const response = await fetch(`${API_URL}/notes/${noteId}/versions/${versionId}`);
  return handleApiError(response);
};

// Revert to a specific version
export const revertToVersion = async (noteId: number, versionId: number): Promise<Note> => {
  const response = await fetch(`${API_URL}/notes/${noteId}/revert/${versionId}`, {
    method: 'POST',
  });
  return handleApiError(response);
};

// Get differences between versions
export const getVersionDiff = async (
  noteId: number, 
  versionId: number, 
  compareToPrevious: boolean = false
): Promise<NoteDiff> => {
  const url = `${API_URL}/notes/${noteId}/versions/${versionId}/diff?previous=${compareToPrevious}`;
  const response = await fetch(url);
  return handleApiError(response);
};

// Add this function to your existing API service
export const restoreVersion = async (noteId: number, versionId: number): Promise<Note> => {
  const response = await fetch(`${API_URL}/notes/${noteId}/versions/${versionId}/restore`, {
    method: 'POST',
  });
  return handleApiError(response);
};
