
import { Song } from '../pages/Rank.tsx';
import { useEffect, useRef, useState } from 'react';

type SongCardProps = {
  song: Song;
  onClick: () => void;
};

export const SongCard = ({ song, onClick }: SongCardProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = 0.5;

      // Handle errors to prevent infinite loading
      video.addEventListener('error', () => {
        setLoading(false);
        setVideoLoaded(false);
      });

      return () => {
        // Cleanup event listeners
        video.removeEventListener('error', () => {});
      };
    }
  }, []);

  const handleMouseEnter = () => {
    if (videoRef.current && videoLoaded) {
      videoRef.current.play().catch(() => {
        // Handle play errors (e.g., browser restrictions)
        setLoading(false);
      });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleCanPlay = () => {
    // Use onCanPlay for reliable "video is ready" state
    setVideoLoaded(true);
    setLoading(false);
  };

  return (
    <div
      className="rounded-xl border p-4 bg-white w-full cursor-pointer
        transition duration-100 ease-in-out transform hover:scale-105
        hover:shadow-[0_0_12px_6px_rgba(59,130,246,0.9)]"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {song.video && (
        <div className="flex justify-center items-center relative">
          {loading && (
            <div className="absolute z-10 text-gray-500 text-sm">Loading video...</div>
          )}
          <video
            ref={videoRef}
            src={song.video}
            className={`w-full max-w-lg mt-2 rounded-xl shadow-lg/40 ${videoLoaded ? '' : 'opacity-0'}`}
            style={{ height: '300px', objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }}
            loop
            onCanPlayThrough={handleCanPlay}
            onError={() => {
              setLoading(false); // Handle video load errors
              setVideoLoaded(false);
            }}
          />
        </div>
      )}
      <h3 className="text-lg text-gray-800 font-semibold mt-4">{song.title}</h3>
      <p className="text-gray-600">{song.artist}</p>
      <span className="inline-block mt-2 mr-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
        {song.type}
      </span>
      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
        {song.anime_name}
      </span>
    </div>
  );
};
