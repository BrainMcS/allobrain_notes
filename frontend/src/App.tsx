import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import NoteList from './components/NoteList';
import NoteDetail from './components/NoteDetail';
import NoteForm from './components/NoteForm';
import NoteVersions from './components/NoteVersions';
import NoteVersionDetail from './components/NoteVersionDetail';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<NoteList />} />
            <Route path="/notes" element={<NoteList />} />
            <Route path="/notes/new" element={<NoteForm />} />
            <Route path="/notes/:id" element={<NoteDetail />} />
            <Route path="/notes/:id/edit" element={<NoteForm />} />
            <Route path="/notes/:id/versions" element={<NoteVersions />} />
            <Route path="/notes/:id/versions/:versionId" element={<NoteVersionDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;