import React, { useState, useEffect, useCallback } from 'react';
import booksService from '../../services/books';
import AdminShell from './AdminShell';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';

function AddTab({ adminToken, addToast }) {
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
    <form onSubmit={handleSubmit} aria-busy={loading}>
      <div className="mb-4">
        <label htmlFor="book-name" className="block text-sm font-medium mb-1">
          Book Name
        </label>
        <input
          type="text"
          id="book-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'book-name-error' : undefined}
        />
        {errors.name && (
          <p id="book-name-error" className="text-sm text-red-600 mt-1">
            {errors.name}
          </p>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="book-url" className="block text-sm font-medium mb-1">
          Book URL
        </label>
        <input
          type="url"
          id="book-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-invalid={!!errors.url}
          aria-describedby={errors.url ? 'book-url-error' : undefined}
        />
        {errors.url && (
          <p id="book-url-error" className="text-sm text-red-600 mt-1">
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
  );
}

function ManageTab({ adminToken, addToast }) {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const fetchBooks = useCallback(async () => {
    try {
      const response = await booksService.getAll(adminToken);
      setBooks(response.data);
    } catch (error) {
      console.error(error);
    }
  }, [adminToken]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleDelete = async (id) => {
    try {
      await booksService.remove(id, adminToken);
      fetchBooks();
      addToast('Book deleted successfully', 'success');
    } catch (error) {
      console.error(error);
      addToast('Failed to delete book', 'error');
    }
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setName(book.name);
    setUrl(book.url);
  };

  const handleUpdate = async () => {
    try {
      if (!selectedBook) return;
      await booksService.update(selectedBook._id, { name, url }, adminToken);
      fetchBooks();
      setSelectedBook(null);
      setName('');
      setUrl('');
      addToast('Book updated successfully', 'success');
    } catch (error) {
      console.error(error);
      addToast('Failed to update book', 'error');
    }
  };

  return (
    <>
      <ul className="space-y-3">
        {books.map((book) => (
          <li key={book._id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <p className="font-medium">{book.name}</p>
              <p className="text-sm text-gray-600">{book.url}</p>
            </div>
            <div className="space-x-2">
              <button className="px-3 py-1 bg-yellow-400 rounded" onClick={() => handleEdit(book)}>
                Edit
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => handleDelete(book._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {selectedBook && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-lg font-semibold mb-2">Edit Book</h2>
          <input
            className="w-full mb-2 border rounded px-2 py-1"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Book name"
          />
          <input
            className="w-full mb-2 border rounded px-2 py-1"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Book URL"
          />
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={handleUpdate}>
              Update
            </button>
            <button
              className="px-3 py-1 bg-gray-300 rounded"
              onClick={() => {
                setSelectedBook(null);
                setName('');
                setUrl('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function BooksPanel() {
  const { adminToken } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('add');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AdminShell />
      <h1 className="text-2xl font-bold mb-4">Books</h1>
      <div className="flex gap-4 border-b mb-6">
        <button
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'add' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('add')}
        >
          Add Book
        </button>
        <button
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'manage' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Books
        </button>
      </div>
      {activeTab === 'add' ? (
        <AddTab adminToken={adminToken} addToast={addToast} />
      ) : (
        <ManageTab adminToken={adminToken} addToast={addToast} />
      )}
    </div>
  );
}
