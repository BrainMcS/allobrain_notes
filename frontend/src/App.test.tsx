import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Notes Application
          </h1>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="text-lg text-gray-700">
            This is a test to see if styling is working properly.
          </p>
          <div className="mt-6 flex gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Test Button
            </button>
            <button className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded">
              Another Button
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;