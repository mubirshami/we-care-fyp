import { useEffect, useState } from 'react';
import AdminPanel from '../components/ui/AdminPanel';
import videosService from '../services/modules/videos';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';

function AddVideo() {
  const { adminToken } = useAuth();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    videosService
      .getCategories(adminToken)
      .then((response) => setCategories(response.data))
      .catch((err) => console.error(err));
  }, [adminToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'url') setUrl(value);
    else if (name === 'categoryId') setCategoryId(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!url.trim()) errs.url = 'This field is required';
    if (!categoryId.trim()) errs.categoryId = 'This field is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await videosService.postVideo({ url, categoryid: categoryId }, adminToken);
      addToast('Video posted successfully', 'success');
      setUrl('');
      setCategoryId('');
    } catch (err) {
      console.error(err);
      addToast('Failed to post video', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <AdminPanel />
      <h1 className="text-2xl font-bold mb-4">Post a Video</h1>
      <form onSubmit={handleSubmit} aria-busy={loading}>
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium mb-1">
            Video URL
          </label>
          <input
            id="url"
            name="url"
            type="url"
            value={url}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
          {errors.url && <p className="text-sm text-red-600 mt-1">{errors.url}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="categoryId" className="block text-sm font-medium mb-1">
            Select Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={categoryId}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">--Select a Category--</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-sm text-red-600 mt-1">{errors.categoryId}</p>}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}

export default AddVideo;
