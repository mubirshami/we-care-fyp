import { useState, useEffect } from 'react';
import AdminPanel from '../components/ui/AdminPanel';
import booksService from '../services/modules/books';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';

function AddBooks() {
  const { adminToken } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!url.trim()) errs.url = 'URL is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await booksService.postBook({ name, url }, adminToken);
      addToast('Book added successfully', 'success');
      setName('');
      setUrl('');
    } catch (err) {
      console.error(err);
      addToast('Failed to add book. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <AdminPanel />
      <h1 className="text-2xl font-bold mb-4">Add a Book</h1>
      <form onSubmit={handleSubmit} aria-busy={loading}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Book Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-red-600 mt-1">
              {errors.name}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium mb-1">
            Book URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-invalid={!!errors.url}
            aria-describedby={errors.url ? 'url-error' : undefined}
          />
          {errors.url && (
            <p id="url-error" className="text-sm text-red-600 mt-1">
              {errors.url}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

export default AddBooks;
