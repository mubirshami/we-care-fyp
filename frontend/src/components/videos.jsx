import { useEffect, useState } from 'react';
import videosService from '../services/modules/videos';
import { useAuth } from '../context/AuthContext';

function Videos() {
  const { token } = useAuth();
  const [exerciseVideos, setExerciseVideos] = useState([]);
  const [musicVideos, setMusicVideos] = useState([]);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    videosService
      .getAll(token)
      .then((response) => {
        const data = response.data || [];
        setExerciseVideos(data.filter((vid) => vid.categoryid?.name === 'Exercise'));
        setMusicVideos(data.filter((vid) => vid.categoryid?.name === 'Music'));
      })
      .catch((error) => console.error(error));
  }, [token]);

  useEffect(() => {
    const handleUnload = async (event) => {
      event.preventDefault();
      event.returnValue = '';
      if (startTime && token) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        try {
          await videosService.postMeditationTime({ meditationTime: timeSpent }, token);
        } catch (error) {
          console.error(error);
        }
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [startTime, token]);

  const handlePlayVideo = () => setStartTime(Date.now());

  return (
    <div className="max-w-6xl mx-auto p-6">
      <section className="mb-8">
        <h1 className="text-2xl font-semibold mb-4">Exercise Videos</h1>
        <div className="grid gap-6">
          {exerciseVideos.map((vid) => (
            <div key={vid._id} className="border rounded overflow-hidden">
              <iframe
                width="100%"
                height={360}
                src={vid.url}
                title="YouTube video player"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handlePlayVideo}
                className="w-full h-64 object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h1 className="text-2xl font-semibold mb-4">Music Videos</h1>
        <div className="grid gap-6">
          {musicVideos.map((vid) => (
            <div key={vid._id} className="border rounded overflow-hidden">
              <iframe
                width="100%"
                height={360}
                src={vid.url}
                title="YouTube video player"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handlePlayVideo}
                className="w-full h-64 object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Videos;
