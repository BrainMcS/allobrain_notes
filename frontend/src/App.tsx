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
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-black">
        <Header />
        <main className="container mx-auto py-8 px-4 max-w-7xl">
          <div className="bg-green-800 rounded-lg shadow-lg p-6">
            <Routes>
              <Route path="/" element={<NoteList />} />
              <Route path="/notes" element={<NoteList />} />
              <Route path="/notes/new" element={<NoteForm />} />
              <Route path="/notes/:id" element={<NoteDetail />} />
              <Route path="/notes/:id/edit" element={<NoteForm />} />
              <Route path="/notes/:id/history" element={<NoteVersions />} />
              <Route path="/notes/:id/history/:versionId" element={<NoteVersionDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;