import { useEffect, useState } from 'react';
import videosService from '../services/modules/videos';
import AdminPanel from '../components/ui/AdminPanel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';

function DeleteVideos() {
  const navigate = useNavigate();
  const { adminToken } = useAuth();
  const { addToast } = useToast();
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
  }, [adminToken]);

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
    <div className="max-w-5xl mx-auto p-6">
      <AdminPanel />

      <section className="mb-6">
        <h1 className="text-xl font-semibold mb-3">Exercise Videos</h1>
        <ul className="space-y-4">
          {exerciseVideos.map((vid) => (
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
                  onClick={() => handleDelete(vid._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h1 className="text-xl font-semibold mb-3">Music Videos</h1>
        <ul className="space-y-4">
          {musicVideos.map((vid) => (
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
                  onClick={() => handleDelete(vid._id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default DeleteVideos;
