import React, { useEffect, useState, useCallback } from 'react';
import booksService from '../services/modules/books';
import AdminPanel from '../components/ui/AdminPanel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';

const DeleteBooks = () => {
  const navigate = useNavigate();
  const { adminToken } = useAuth();
  const { addToast } = useToast();
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
    <div className="max-w-4xl mx-auto p-6">
      <AdminPanel />
      <h2 className="text-lg font-semibold mb-3">Book List</h2>
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
    </div>
  );
};

export default DeleteBooks;
