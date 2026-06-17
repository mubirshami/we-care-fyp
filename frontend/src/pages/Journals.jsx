import React, { useEffect, useState } from 'react';
import journalsService from '../services/modules/journals';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';

function JournalsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToast } = useToast();
  const [journals, setJournals] = useState([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    async function fetchJournals() {
      try {
        const response = await journalsService.getAll(token);
        setJournals(response.data);
      } catch (error) {
        console.error(error);
        addToast('Failed to load journals', 'error');
      }
    }
    fetchJournals();
  }, [token]);

  async function handleDelete(id) {
    try {
      await journalsService.remove(id, token);
      setJournals((prev) => prev.filter((journal) => journal._id !== id));
      setConfirmDeleteId(null);
      addToast('Journal deleted', 'success');
    } catch (error) {
      console.error(error);
      addToast('Failed to delete journal', 'error');
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">My Journals</h1>
      <ul className="space-y-4">
        {journals.map((journal) => (
          <li key={journal._id} className="p-4 border rounded">
            <div className="journal-content">{journal.content}</div>
            <div className="mt-2">
              {confirmDeleteId === journal._id ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Delete this journal?</span>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                    onClick={() => handleDelete(journal._id)}
                  >
                    Confirm
                  </button>
                  <button
                    className="px-3 py-1 border rounded text-sm"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                  onClick={() => setConfirmDeleteId(journal._id)}
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JournalsPage;
