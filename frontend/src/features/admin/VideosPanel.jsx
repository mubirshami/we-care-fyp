import React, { useEffect, useState } from 'react';
import videosService from '../../services/videos';
import AdminShell from './AdminShell';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastProvider';

function AddTab({ adminToken, addToast }) {
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
    <form onSubmit={handleSubmit} aria-busy={loading}>
      <div className="mb-4">
        <label htmlFor="video-url" className="block text-sm font-medium mb-1">
          Video URL
        </label>
        <input
          id="video-url"
          name="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        {errors.url && <p className="text-sm text-red-600 mt-1">{errors.url}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="video-category" className="block text-sm font-medium mb-1">
          Select Category
        </label>
        <select
          id="video-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
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
  );
}

function VideoList({ videos, title, onDelete }) {
  return (
    <section className="mb-6">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <ul className="space-y-4">
        {videos.map((vid) => (
          <li key={vid._id} className="border rounded p-3">
            <iframe
              width={560}
              height={315}
              src={vid.url}
              title="YouTube video player"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-64 object-cover rounded"
            />
            <div className="mt-2">
              <button
                className="px-3 py-1 bg-red-500 text-white rounded"
                onClick={() => onDelete(vid._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ManageTab({ adminToken, addToast }) {
  const [exerciseVideos, setExerciseVideos] = useState([]);
  const [musicVideos, setMusicVideos] = useState([]);

  useEffect(() => {
    const getVideos = async () => {
      try {
        const response = await videosService.getAll(adminToken);
        const data = response.data || [];
        setExerciseVideos(data.filter((vid) => vid.categoryid?.name === 'Exercise'));
        setMusicVideos(data.filter((vid) => vid.categoryid?.name === 'Music'));
      } catch (error) {
        console.error(error);
        addToast('Failed to load videos', 'error');
      }
    };
    getVideos();
  }, [adminToken, addToast]);

  const handleDelete = async (videoId) => {
    try {
      await videosService.remove(videoId, adminToken);
      setExerciseVideos((prev) => prev.filter((vid) => vid._id !== videoId));
      setMusicVideos((prev) => prev.filter((vid) => vid._id !== videoId));
      addToast('Video deleted successfully', 'success');
    } catch (error) {
      console.error(error);
      addToast('Failed to delete video', 'error');
    }
  };

  return (
    <>
      <VideoList videos={exerciseVideos} title="Exercise Videos" onDelete={handleDelete} />
      <VideoList videos={musicVideos} title="Music Videos" onDelete={handleDelete} />
    </>
  );
}

export default function VideosPanel() {
  const { adminToken } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('add');

  return (
    <div className="max-w-5xl mx-auto p-6">
      <AdminShell />
      <h1 className="text-2xl font-bold mb-4">Videos</h1>
      <div className="flex gap-4 border-b mb-6">
        <button
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'add' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('add')}
        >
          Add Video
        </button>
        <button
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'manage' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Videos
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
