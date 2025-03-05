from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, validator, ConfigDict


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    content: str = Field(..., min_length=1)

    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v

    @validator('content')
    def content_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Content cannot be empty')
        return v


class NoteCreate(NoteBase):
    pass


class NoteUpdate(NoteBase):
    pass


class NoteVersion(BaseModel):
    id: int
    note_id: int
    title: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Note(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime
    versions: List[NoteVersion] = []

    model_config = ConfigDict(from_attributes=True)


class NoteDiff(BaseModel):
    title_changed: bool = False
    old_title: Optional[str] = None
    new_title: Optional[str] = None
    content_diff: List[dict] = []  # List of lines with their status (added, removed, unchanged)