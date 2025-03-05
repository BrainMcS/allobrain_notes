import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base
from main import app, get_db

# Create in-memory database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables for testing
Base.metadata.create_all(bind=engine)

# Replace the get_db dependency with a test version
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create a test client
client = TestClient(app)

# Tests for API endpoints
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Versioned Notes API"}


def test_create_note():
    # Create a new note
    response = client.post(
        "/notes",
        json={"title": "Test Note", "content": "This is a test note"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Note"
    assert data["content"] == "This is a test note"
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data
    assert "versions" in data
    assert len(data["versions"]) > 0
    
    # Store the ID for subsequent tests
    note_id = data["id"]
    
    # Verify that the note was created
    response = client.get(f"/notes/{note_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Test Note"
    
    return note_id


def test_update_note():
    # First create a note
    note_id = test_create_note()
    
    # Update the note
    response = client.put(
        f"/notes/{note_id}",
        json={"title": "Updated Note", "content": "This note has been updated"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Note"
    assert data["content"] == "This note has been updated"
    
    # Verify that the note was updated
    response = client.get(f"/notes/{note_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Note"
    
    # Verify that a new version was created
    response = client.get(f"/notes/{note_id}/versions")
    assert response.status_code == 200
    versions = response.json()
    assert len(versions) == 2  # Original version + update
    
    return note_id


def test_versions_and_diff():
    # First create a note and update it
    note_id = test_update_note()
    
    # Get the versions
    response = client.get(f"/notes/{note_id}/versions")
    assert response.status_code == 200
    versions = response.json()
    assert len(versions) >= 2
    
    # Check the latest version
    latest_version_id = versions[0]["id"]
    response = client.get(f"/notes/{note_id}/versions/{latest_version_id}")
    assert response.status_code == 200
    latest_version = response.json()
    assert latest_version["title"] == "Updated Note"
    
    # Check differences between versions
    response = client.get(f"/notes/{note_id}/versions/{latest_version_id}/diff?previous=true")
    assert response.status_code == 200
    diff = response.json()
    assert diff["title_changed"] == True
    assert "content_diff" in diff
    
    return note_id, latest_version_id


def test_revert_to_version():
    # First create a note, update it, and get the versions
    note_id, version_id = test_versions_and_diff()
    
    # Get the old version
    response = client.get(f"/notes/{note_id}/versions")
    assert response.status_code == 200
    versions = response.json()
    old_version_id = versions[-1]["id"]  # The oldest version
    
    # Revert to the old version
    response = client.post(f"/notes/{note_id}/revert/{old_version_id}")
    assert response.status_code == 200
    reverted_note = response.json()
    assert reverted_note["title"] == "Test Note"  # The original title
    
    # Verify that a new version was created
    response = client.get(f"/notes/{note_id}/versions")
    assert response.status_code == 200
    versions = response.json()
    assert len(versions) == 3  # Original version + update + reversion
    
    return note_id


def test_delete_note():
    # First create a note
    note_id = test_create_note()
    
    # Delete the note
    response = client.delete(f"/notes/{note_id}")
    assert response.status_code == 204
    
    # Verify that the note was deleted
    response = client.get(f"/notes/{note_id}")
    assert response.status_code == 404


# Run all tests in sequence
def test_all():
    test_read_root()
    note_id = test_create_note()
    note_id = test_update_note()
    note_id, version_id = test_versions_and_diff()
    note_id = test_revert_to_version()
    test_delete_note()
