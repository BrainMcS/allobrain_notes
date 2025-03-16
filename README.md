# Versioned Notes Application

A full-stack web application that allows users to create, edit, and manage notes with automatic version history tracking.

## Features

- 📝 Create and edit notes with markdown support
- 🕒 Automatic version history for all changes
- 📊 Compare different versions of a note
- 🔄 Revert to any previous version
- 🔍 View detailed differences between versions
- 🎨 Clean, responsive UI built with React and Tailwind CSS

## Tech Stack

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework for building APIs with Python
- [SQLAlchemy](https://www.sqlalchemy.org/) - SQL toolkit and ORM
- [SQLite](https://www.sqlite.org/) - Lightweight database for storage
- [Pydantic](https://pydantic-docs.helpmanual.io/) - Data validation and settings management

### Frontend
- [React](https://reactjs.org/) (v19) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [React Router](https://reactrouter.com/) - Routing library for React
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn/UI](https://ui.shadcn.com/) - Re-usable UI components
- [Lucide React](https://lucide.dev/) - Icon library
- [React Toastify](https://fkhadra.github.io/react-toastify/) - Toast notifications

## Project Structure

```
/
├── backend/              # FastAPI backend
│   ├── database.py       # Database configuration and models
│   ├── main.py           # API routes and application setup
│   ├── models.py         # Pydantic models
│   ├── utils.py          # Utility functions
│   └── requirements.txt  # Python dependencies
│
└── frontend/             # React frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── services/     # API service layer
    │   ├── types/        # TypeScript interfaces
    │   └── lib/          # Utility functions
    ├── package.json      # Frontend dependencies
    └── vite.config.ts    # Vite configuration
```

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+ and npm/yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at http://localhost:8000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:5173

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/notes` | GET | Get all notes |
| `/notes` | POST | Create a new note |
| `/notes/{id}` | GET | Get a specific note |
| `/notes/{id}` | PUT | Update a note |
| `/notes/{id}` | DELETE | Delete a note |
| `/notes/{id}/versions` | GET | Get all versions of a note |
| `/notes/{id}/versions/{version_id}` | GET | Get a specific version |
| `/notes/{id}/revert/{version_id}` | POST | Revert to a previous version |
| `/notes/{id}/versions/{version_id}/diff` | GET | Get differences between versions |

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test 
```

### Building for Production

```bash
# Build the frontend
cd frontend
npm run build

# Serve the backend with the built frontend
cd backend
uvicorn main:app
```

## License

[MIT](LICENSE)