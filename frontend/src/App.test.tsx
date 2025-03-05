import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import NoteList from './components/NoteList';
import NoteForm from './components/NoteForm';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock API server
const server = setupServer(
  // Mock for GET /notes
  http.get('http://localhost:8000/notes', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Test Note',
        content: 'This is a test note content',
        created_at: '2023-04-15T10:30:00',
        updated_at: '2023-04-15T10:30:00',
        versions: [
          {
            id: 1,
            note_id: 1,
            title: 'Test Note',
            content: 'This is a test note content',
            created_at: '2023-04-15T10:30:00'
          }
        ]
      }
    ]);
  }),

  // Mock for POST /notes
  http.post('http://localhost:8000/notes', () => {
    return HttpResponse.json(
      {
        id: 2,
        title: 'New Note',
        content: 'Content of the new note',
        created_at: '2023-04-15T11:00:00',
        updated_at: '2023-04-15T11:00:00',
        versions: []
      },
      { status: 201 }
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test App component
test('renders header with app title', () => {
  render(<App />);
  const headerElement = screen.getByText(/Versioned Notes/i);
  expect(headerElement).toBeInTheDocument();
});

// Test NoteList component
test('NoteList displays loading state and then notes', async () => {
  render(
    <BrowserRouter>
      <NoteList />
    </BrowserRouter>
  );
  
  // Check loading state
  expect(screen.getByText(/Loading notes/i)).toBeInTheDocument();
  
  // Wait for notes to display
  const noteTitle = await screen.findByText(/Test Note/i);
  expect(noteTitle).toBeInTheDocument();
});

// Test NoteForm component in create mode
test('NoteForm renders correctly in create mode', () => {
  render(
    <BrowserRouter>
      <NoteForm />
    </BrowserRouter>
  );
  
  // Check that the form is displayed with the correct title
  expect(screen.getByText(/Create New Note/i)).toBeInTheDocument();
  
  // Check for form fields
  expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
  
  // Check for buttons
  expect(screen.getByText(/Create/i)).toBeInTheDocument();
  expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
});
