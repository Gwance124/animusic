import { Song } from '../pages/Rank.tsx';
import { useEffect, useRef, useState } from 'react';

type SongCardProps = {
  song: Song;
  onClick?: () => void;
  isPreloading?: boolean; // New prop
};

export const SongCard = ({ song, onClick, isPreloading = false }: SongCardProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Track if the video is ready to *start* playing
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  // Separate state for the initial loading indicator (only for displayed cards)
  const [isLoading, setIsLoading] = useState(!isPreloading);
  // State to track video errors specifically
  const [hasError, setHasError] = useState(false);
  // *** NEW STATE: Track if the mouse is currently hovering over the card ***
  const [isCardHovered, setIsCardHovered] = useState(false);


  // Reset state when the video source changes
  useEffect(() => {
    setIsReadyToPlay(false);
    setIsLoading(!isPreloading);
    setHasError(false);
    // No need to reset isCardHovered here, mouse state is independent of song.
    if (videoRef.current) {
      if (videoRef.current.src !== song.video) {
        videoRef.current.src = song.video;
        // Load is important if the src changes, but using key might handle this too.
        // Let's rely on the browser/React handling src change, but ensure preload is set.
        // videoRef.current.load(); // Removed - let browser handle load with preload="auto"
      }
    }
  }, [song.video, isPreloading]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isPreloading) {
      video.volume = 0.1; // Set volume
    }

    const handleVideoError = () => {
      console.error('Video Error:', song.video);
      setIsLoading(false);
      setIsReadyToPlay(false);
      setHasError(true);
    };

    const handleVideoCanPlay = () => {
      if (!hasError) {
        setIsLoading(false);
        setIsReadyToPlay(true); // Set ready state

        // *** NEW LOGIC: If the card is hovered AND it just became ready, play the video ***
        if (isCardHovered && videoRef.current && !isPreloading) {
          console.log(`Video for "${song.title}" became ready while hovered, attempting to play.`);
          videoRef.current.play().catch(playError => {
            console.error('Auto-play on video ready failed:', playError);
            // Handle potential autoplay policy errors (e.g., requires user interaction)
            // Although playsInline and user click to get here should usually allow it.
          });
        }
      }
    };

    // Add event listeners
    video.addEventListener('canplay', handleVideoCanPlay);
    video.addEventListener('error', handleVideoError);

    // Cleanup function
    return () => {
      video.removeEventListener('canplay', handleVideoCanPlay);
      video.removeEventListener('error', handleVideoError);
    };
    // Add states to dependency array as they are used inside the effect's functions
  }, [song.video, hasError, isPreloading, isCardHovered]); // Added isCardHovered dependency

  // Modify hover handlers to also update isCardHovered state
  const handleMouseEnter = () => {
    if (isPreloading) return;
    setIsCardHovered(true); // *** Set hovered state ***
    if (videoRef.current && isReadyToPlay) {
      videoRef.current.play().catch((playError) => {
        console.error('Error attempting to play video on mouse enter:', playError);
      });
    }
  };

  const handleMouseLeave = () => {
    if (isPreloading) return;
    setIsCardHovered(false); // *** Clear hovered state ***
    if (videoRef.current) {
      videoRef.current.pause();
      // videoRef.current.currentTime = 0; // Optional: rewind
    }
  };

  const cardProps = {
    className: `rounded-xl border p-4 bg-white w-full
       transition duration-100 ease-in-out transform
       ${isPreloading ? '' : 'cursor-pointer hover:scale-105 hover:shadow-[0_0_12px_6px_rgba(59,130,246,0.9)]'}`,
    onClick: isPreloading ? undefined : onClick,
    onMouseEnter: handleMouseEnter, // Use the modified handler
    onMouseLeave: handleMouseLeave, // Use the modified handler
  };


  return (
    <div {...cardProps}>
      {song.video && (
        <div className="flex justify-center items-center relative w-full" style={{ height: '300px' }}>
          {/* Loading Indicator (only show for non-preloading cards) */}
          {isLoading && !hasError && !isPreloading && (
            <div className="absolute inset-0 flex justify-center items-center z-10 text-gray-500 text-sm bg-gray-100 rounded-xl">
              Loading video...
            </div>
          )}
          {/* Error Indicator */}
          {hasError && (
            <div className="absolute inset-0 flex justify-center items-center z-10 text-red-500 text-sm bg-gray-100 rounded-xl">
              Video unavailable
            </div>
          )}
          {/* Video Element */}
          <video
            ref={videoRef}
            src={song.video}
            className={`w-full max-w-lg rounded-xl shadow-lg/40 ${
              isReadyToPlay ? 'opacity-100' : 'opacity-0'
            } ${hasError ? '!hidden' : ''} `}
            style={{ height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease-in-out' }}
            loop
            playsInline
            preload="auto"
          />
        </div>
      )}
      {!isPreloading && (
        <div>
          <h3 className="text-lg text-gray-800 font-semibold mt-4">{song.title}</h3>
          <p className="text-gray-600">{song.artist}</p>
          {song.type && (
            <span className="inline-block mt-2 mr-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                {song.type}
            </span>
          )}
          {song.anime_name && (
            <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                {song.anime_name}
            </span>
          )}
        </div>
      )}
    </div>
  );
};