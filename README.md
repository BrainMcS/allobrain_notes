# Versioned Notes Application

This application allows you to create, edit and manage notes with a complete version history. It's similar to a simplified version control system for your personal notes.

## Features

- **Note Management**: Create, edit, and delete notes
- **Versioning**: Each modification of a note automatically creates a new version
- **History**: View the complete history of modifications
- **Version Comparison**: Visualize differences between versions (additions, deletions, modifications)
- **Restoration**: Ability to revert to a previous version

## Technical Architecture

### Backend

- **Language**: Python 3.8+
- **Framework**: FastAPI
- **Database**: SQLite (easily replaceable with PostgreSQL in production)
- **ORM**: SQLAlchemy

### Frontend

- **Language**: TypeScript
- **Framework**: React
- **Routing**: React Router v6
- **Styles**: TailwindCSS
- **Notifications**: React-Toastify

## Project Structure

```
versioned-notes/
│
├── backend/             # Server code
│   ├── main.py          # API entry point
│   ├── database.py      # Database configuration
│   ├── models.py        # Data models (Pydantic schemas)
│   └── utils.py         # Utilities (diff, etc.)
│
└── frontend/            # User interface code
    ├── public/          # Static files
    └── src/             # Source code
        ├── components/  # React components
        ├── services/    # API services
        └── types/       # TypeScript types
```

## Installation

### Prerequisites

- Python 3.8+
- Node.js 14+ and npm

### Backend

1. Clone the repository:
```bash
git clone https://github.com/BrianMcS/allobrain_notes.git
cd allobrain_notes/backend
```

2. Create a virtual environment and activate it:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the server:
```bash
uvicorn main:app --reload
```

The server will start at http://localhost:8000.

### Frontend

1. In another terminal, navigate to the frontend folder:
```bash
cd allobrain_notes/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

The application will start at http://localhost:3000.

## Usage

### Create a new note

1. Click on "New Note" in the navigation bar
2. Enter a title and content
3. Click "Create"

### Edit a note

1. Click on a note in the list
2. Click "Edit" in the top right corner
3. Make your changes
4. Click "Update"

### View version history

1. Click on a note in the list
2. Click "Versions" in the top right corner
3. The list of versions will be displayed, from newest to oldest

### View a specific version

1. In the version list, click "View" next to the desired version
2. The differences with the previous or current version will be displayed

### Restore a previous version

1. In the version view, click "Restore this version"
2. Confirm the restoration
3. A new version will be created with the content of the old version

## API Documentation

An interactive API documentation is available at http://localhost:8000/docs when the server is running.

## Tests

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm test
```

## Possible Improvements

- User authentication
- Note sharing between users
- Note export (Markdown, PDF, etc.)
- Tags/categories to organize notes
- Note search
- Offline synchronization
- Mobile interface (PWA)

## License

MIT