from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import datetime
from typing import List, Optional

from database import get_db, create_tables, DBNote, DBNoteVersion
from models import Note, NoteCreate, NoteUpdate, NoteVersion, NoteDiff
from utils import compare_versions
from sqlalchemy.orm import joinedload

# Initialize the FastAPI application
app = FastAPI(title="Versioned Notes API")

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create tables at application startup
create_tables()


@app.get("/")
def read_root():
    return {"message": "Welcome to the Versioned Notes API"}


@app.get("/notes", response_model=List[Note])
def get_notes(db: Session = Depends(get_db)):
    """Get all notes"""
    try:
        print("Fetching all notes")  # Debug log
        print("Database session status:", db.is_active)
        
        # Query notes with eager loading of versions
        notes = db.query(DBNote).options(
            joinedload(DBNote.versions)
        ).all()
        
        print(f"Found {len(notes)} notes")  # Debug log
        
        # Convert to Pydantic models
        return [
            Note(
                id=note.id,
                title=note.title,
                content=note.content,
                created_at=note.created_at,
                updated_at=note.updated_at,
                versions=[
                    NoteVersion(
                        id=v.id,
                        note_id=v.note_id,
                        title=v.title,
                        content=v.content,
                        created_at=v.created_at
                    ) for v in note.versions
                ]
            ) for note in notes
        ]
        
    except Exception as e:
        print(f"Error fetching notes: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching notes: {str(e)}"
        )


@app.post("/notes", response_model=Note, status_code=status.HTTP_201_CREATED)
async def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    """Create a new note with its first version"""
    try:
        # Log incoming request data
        print(f"Received request data: {note.dict()}")
        
        now = datetime.datetime.utcnow()
        
        # Create the note
        db_note = DBNote(
            title=note.title,
            content=note.content,
            created_at=now,
            updated_at=now
        )
        db.add(db_note)
        try:
            db.commit()
            db.refresh(db_note)
            print(f"Note created with ID: {db_note.id}")
        except Exception as e:
            db.rollback()
            print(f"Database error creating note: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {str(e)}"
            )
        
        # Create the first version
        db_version = DBNoteVersion(
            note_id=db_note.id,
            title=note.title,
            content=note.content,
            created_at=now
        )
        db.add(db_version)
        try:
            db.commit()
            db.refresh(db_note)
        except Exception as e:
            db.rollback()
            print(f"Database error creating version: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {str(e)}"
            )
        
        # Convert to Pydantic model for response
        return Note(
            id=db_note.id,
            title=db_note.title,
            content=db_note.content,
            created_at=db_note.created_at,
            updated_at=db_note.updated_at,
            versions=[NoteVersion(
                id=v.id,
                note_id=v.note_id,
                title=v.title,
                content=v.content,
                created_at=v.created_at
            ) for v in db_note.versions]
        )
        
    except Exception as e:
        db.rollback()
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/notes/{note_id}", response_model=Note)
def get_note(note_id: int, db: Session = Depends(get_db)):
    """Get a note by its ID"""
    try:
        print(f"Fetching note with ID: {note_id}")  # Debug log
        
        # Add debug logging for database connection
        print("Database session status:", db.is_active)
        
        # Query the note with eager loading of versions
        note = db.query(DBNote).options(
            joinedload(DBNote.versions)
        ).filter(DBNote.id == note_id).first()
        
        print(f"Query result: {note}")  # Debug log
        
        if note is None:
            print(f"Note {note_id} not found")  # Debug log
            raise HTTPException(status_code=404, detail="Note not found")
        
        try:
            # Convert to Pydantic model with error checking
            note_dict = {
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "created_at": note.created_at,
                "updated_at": note.updated_at,
                "versions": []
            }
            
            # Add versions if they exist
            if hasattr(note, 'versions'):
                note_dict["versions"] = [
                    {
                        "id": v.id,
                        "note_id": v.note_id,
                        "title": v.title,
                        "content": v.content,
                        "created_at": v.created_at
                    }
                    for v in note.versions
                ]
            
            return Note(**note_dict)
            
        except Exception as conversion_error:
            print(f"Error converting note to Pydantic model: {str(conversion_error)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error processing note data: {str(conversion_error)}"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching note {note_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching note: {str(e)}"
        )


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
