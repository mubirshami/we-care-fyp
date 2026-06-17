import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import videosService from '../../services/videos';
import booksService from '../../services/books';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={[
        'px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors duration-150',
        active ? 'border-primary-500 text-primary-600' : 'border-transparent text-neutral-500 hover:text-neutral-700',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function VideoSection({ title, videos, onPlay }) {
  if (!videos.length) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
        {title === 'Exercise Videos' ? '🏃' : '🎵'}
        {title}
        <span className="ml-1 rounded-pill bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">{videos.length}</span>
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {videos.map((vid) => (
          <div key={vid._id} className="rounded-card overflow-hidden border border-neutral-200 bg-white shadow-card">
            <div className="aspect-video w-full">
              <iframe
                src={vid.url}
                title={vid.title || 'Wellness video'}
                width="100%"
                height="100%"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={onPlay}
                className="block w-full h-full"
              />
            </div>
            {vid.title && (
              <div className="px-4 py-3 border-t border-neutral-100">
                <p className="text-sm font-medium text-neutral-700">{vid.title}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function VideosTab({ token }) {
  const [exerciseVideos, setExerciseVideos] = useState([]);
  const [musicVideos, setMusicVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    videosService
      .getAll(token)
      .then((res) => {
        const all = Array.isArray(res.data) ? res.data : [];
        setExerciseVideos(all.filter((v) => v.categoryid?.name === 'Exercise'));
        setMusicVideos(all.filter((v) => v.categoryid?.name === 'Music'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    const handleUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      if (startTime && token) {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        videosService.postMeditationTime({ meditationTime: timeSpent }, token).catch(() => null);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [startTime, token]);

  const handlePlay = () => { if (!startTime) setStartTime(Date.now()); };

  if (loading) return <LoadingSkeleton variant="list" rows={4} />;

  const hasVideos = exerciseVideos.length + musicVideos.length > 0;

  if (!hasVideos) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-4xl mb-4" aria-hidden="true">🎬</p>
        <p className="text-sm font-medium text-neutral-700">No videos available yet</p>
        <p className="mt-1 text-xs text-neutral-500">Check back soon — wellness videos will be added here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <VideoSection title="Exercise Videos" videos={exerciseVideos} onPlay={handlePlay} />
      <VideoSection title="Music Videos" videos={musicVideos} onPlay={handlePlay} />
    </div>
  );
}

function BooksTab({ token }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    booksService
      .getAll(token)
      .then((res) => setBooks(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingSkeleton variant="list" rows={5} />;

  if (!books.length) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-4xl mb-4" aria-hidden="true">📚</p>
        <p className="text-sm font-medium text-neutral-700">No books available yet</p>
        <p className="mt-1 text-xs text-neutral-500">Wellness reading recommendations will appear here.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {books.map((book) => (
        <li key={book._id}>
          <a
            href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 rounded-card border border-neutral-200 bg-white p-4 shadow-card transition-all duration-150 hover:border-primary-200 hover:shadow-primary"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <span className="text-sm font-medium text-neutral-800 truncate group-hover:text-primary-700 transition-colors">{book.name}</span>
            </div>
            <svg className="h-4 w-4 shrink-0 text-neutral-400 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function Resources() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'books' ? 'books' : 'videos';
  const setTab = (tab) => setSearchParams(tab === 'videos' ? {} : { tab });

  return (
    <div className="max-w-[900px] mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-display font-semibold text-neutral-900 mb-1">Resources</h1>
      <p className="text-sm text-neutral-500 mb-6">Guided exercises, music for focus, and recommended reading for your wellness journey.</p>
      <div className="flex gap-1 border-b border-neutral-200 mb-6" role="tablist" aria-label="Resource categories">
        <Tab active={activeTab === 'videos'} onClick={() => setTab('videos')}>🎬 Videos</Tab>
        <Tab active={activeTab === 'books'} onClick={() => setTab('books')}>📚 Books</Tab>
      </div>
      <div role="tabpanel">
        {activeTab === 'videos' ? <VideosTab token={token} /> : <BooksTab token={token} />}
      </div>
    </div>
  );
}
