from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import datetime
from typing import List, Optional

from database import get_db, create_tables, DBNote, DBNoteVersion
from models import Note, NoteCreate, NoteUpdate, NoteVersion, NoteDiff
from utils import compare_versions

# Initialize the FastAPI application
app = FastAPI(title="Versioned Notes API")

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables at application startup
create_tables()


@app.get("/")
def read_root():
    return {"message": "Welcome to the Versioned Notes API"}


@app.get("/notes", response_model=List[Note])
def get_notes(db: Session = Depends(get_db)):
    """Get all notes"""
    notes = db.query(DBNote).all()
    return notes


@app.post("/notes", response_model=Note, status_code=status.HTTP_201_CREATED)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    """Create a new note with its first version"""
    db_note = DBNote(title=note.title, content=note.content)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    # Create the first version of the note
    db_version = DBNoteVersion(
        note_id=db_note.id,
        title=note.title,
        content=note.content
    )
    db.add(db_version)
    db.commit()
    
    return db_note


@app.get("/notes/{note_id}", response_model=Note)
def get_note(note_id: int, db: Session = Depends(get_db)):
    """Get a note by its ID"""
    note = db.query(DBNote).filter(DBNote.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@app.put("/notes/{note_id}", response_model=Note)
def update_note(note_id: int, note_update: NoteUpdate, db: Session = Depends(get_db)):
    """Update a note and create a new version"""
    db_note = db.query(DBNote).filter(DBNote.id == note_id).first()
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Check if the content has actually changed to avoid unnecessary versions
    if db_note.title == note_update.title and db_note.content == note_update.content:
        return db_note
    
    # Update the note
    db_note.title = note_update.title
    db_note.content = note_update.content
    db_note.updated_at = datetime.datetime.utcnow()
    
    # Create a new version
    db_version = DBNoteVersion(
        note_id=db_note.id,
        title=note_update.title,
        content=note_update.content
    )
    
    db.add(db_version)
    db.commit()
    db.refresh(db_note)
    
    return db_note


@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    """Delete a note and all its versions"""
    db_note = db.query(DBNote).filter(DBNote.id == note_id).first()
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(db_note)
    db.commit()
    
    return None


@app.get("/notes/{note_id}/versions", response_model=List[NoteVersion])
def get_note_versions(note_id: int, db: Session = Depends(get_db)):
    """Get all versions of a note"""
    note = db.query(DBNote).filter(DBNote.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    versions = db.query(DBNoteVersion).filter(
        DBNoteVersion.note_id == note_id
    ).order_by(DBNoteVersion.created_at.desc()).all()
    
    return versions


@app.get("/notes/{note_id}/versions/{version_id}", response_model=NoteVersion)
def get_note_version(note_id: int, version_id: int, db: Session = Depends(get_db)):
    """Get a specific version of a note"""
    version = db.query(DBNoteVersion).filter(
        DBNoteVersion.note_id == note_id,
        DBNoteVersion.id == version_id
    ).first()
    
    if version is None:
        raise HTTPException(status_code=404, detail="Version not found")
    
    return version


@app.post("/notes/{note_id}/revert/{version_id}", response_model=Note)
def revert_to_version(note_id: int, version_id: int, db: Session = Depends(get_db)):
    """Revert to a previous version of a note"""
    # Check that the note exists
    note = db.query(DBNote).filter(DBNote.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Get the version to restore
    version = db.query(DBNoteVersion).filter(
        DBNoteVersion.note_id == note_id,
        DBNoteVersion.id == version_id
    ).first()
    
    if version is None:
        raise HTTPException(status_code=404, detail="Version not found")
    
    # Update the note with the content of the version
    note.title = version.title
    note.content = version.content
    note.updated_at = datetime.datetime.utcnow()
    
    # Create a new version that is a copy of the old one
    new_version = DBNoteVersion(
        note_id=note.id,
        title=version.title,
        content=version.content
    )
    
    db.add(new_version)
    db.commit()
    db.refresh(note)
    
    return note


@app.get("/notes/{note_id}/versions/{version_id}/diff", response_model=NoteDiff)
def get_version_diff(note_id: int, version_id: int, previous: Optional[bool] = False, db: Session = Depends(get_db)):
    """
    Get the differences between two versions of a note.
    If previous=True, compare with the previous version.
    Otherwise, compare with the current version of the note.
    """
    # Check that the note exists
    note = db.query(DBNote).filter(DBNote.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Get the requested version
    version = db.query(DBNoteVersion).filter(
        DBNoteVersion.note_id == note_id,
        DBNoteVersion.id == version_id
    ).first()
    
    if version is None:
        raise HTTPException(status_code=404, detail="Version not found")
    
    if previous:
        # Compare with the previous version
        previous_versions = db.query(DBNoteVersion).filter(
            DBNoteVersion.note_id == note_id,
            DBNoteVersion.created_at < version.created_at
        ).order_by(DBNoteVersion.created_at.desc()).first()
        
        if previous_versions is None:
            raise HTTPException(status_code=404, detail="No previous version")
        
        old_version = {
            "title": previous_versions.title,
            "content": previous_versions.content
        }
    else:
        # Compare with the current version
        old_version = {
            "title": note.title,
            "content": note.content
        }
    
    new_version = {
        "title": version.title,
        "content": version.content
    }
    
    # Calculate the differences
    diff = compare_versions(old_version, new_version)
    
    return diff


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
