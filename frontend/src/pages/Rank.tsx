import { SongCard } from '../components/SongCard.tsx';
import { supabase } from '../supabase-client.ts';
import { useEffect, useRef, useState, useCallback } from 'react';
import { RankStartScreen } from '../components/RankStartScreen.tsx';

// Song type remains the same
export type Song = {
  id: number;
  title: string;
  artist: string;
  type: string;
  anime_id: number;
  video: string;
  rating: number;
  rating_deviation: number;
  matches_played: number;
  last_updated: string;
  created_at: string;
  anime_name: string | null;
  anime_season: string | null;
  anime_year: number | null;
  anime_image: string | null;
};

// --- Configuration ---
const BATCH_SIZE = 10; // How many songs to fetch at once
const FETCH_THRESHOLD = 4; // Fetch more when fewer than this many songs (must be even number >= 2) remain *after* the current pair
const PRELOAD_COUNT = 2; // How many songs *after* the displayed pair to preload videos for

export const Rank = () => {
  const [started, setStarted] = useState(false);
  // Queue holds all fetched songs
  const [songQueue, setSongQueue] = useState<Song[]>([]);
  // Index points to the first song of the *next* pair to display
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Loading state for initial batch and urgent fetches
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Loading state specifically for background fetches
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Ref to prevent fetching multiple batches simultaneously
  const isCurrentlyFetching = useRef(false);

  // --- Fetching Logic ---
  const fetchSongBatch = useCallback(async () => {
    // Prevent concurrent fetches
    if (isCurrentlyFetching.current) return;
    isCurrentlyFetching.current = true;

    // Determine if it's a background fetch or initial/urgent fetch
    const isBackground = songQueue.length > 0;
    if (isBackground) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true); // Show main loading for the very first fetch
    }
    setError(null); // Clear previous errors

    try {
      // Call the new RPC function
      const { data, error: rpcError } = await supabase.rpc('get_n_random_songs', {
        count: BATCH_SIZE,
      });

      if (rpcError) throw rpcError;

      if (data) {
        // Append new songs to the queue
        // Add filtering here if you want to avoid duplicates within the queue
        setSongQueue((prevQueue) => [...prevQueue, ...data]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching song batch:', err);
      // Keep existing songs if fetch fails? Or clear queue? Depends on desired UX.
    } finally {
      if (isBackground) {
        setIsFetchingMore(false);
      } else {
        setIsLoading(false);
      }
      isCurrentlyFetching.current = false; // Allow fetching again
    }
  }, [songQueue.length]); // Dependency ensures correct isBackground check

  // --- Effects ---
  // Initial fetch when started
  useEffect(() => {
    // Only fetch if started, queue is empty, and not already loading/fetching
    if (started && songQueue.length === 0 && !isLoading && !isFetchingMore) {
      fetchSongBatch();
    }
  }, [started, songQueue.length, isLoading, isFetchingMore, fetchSongBatch]);

  // Effect to trigger background fetching when threshold is met
  useEffect(() => {
    const remainingSongs = songQueue.length - currentIndex;
    // Check if we need more and are not already fetching
    if (
      started &&
      songQueue.length > 0 && // Only if queue has items
      remainingSongs <= FETCH_THRESHOLD &&
      !isFetchingMore &&
      !isLoading && // Also don't background fetch if initial load is happening
      !isCurrentlyFetching.current // Double check ref
    ) {
      console.log(`Threshold reached (${remainingSongs} remaining), fetching more...`);
      fetchSongBatch(); // Trigger background fetch
    }
  }, [songQueue.length, currentIndex, started, isFetchingMore, isLoading, fetchSongBatch]);


  // --- Event Handler ---
  const handleSongSelection = () => {
    // Calculate the index for the *next* pair
    const nextIndex = currentIndex + 2;

    // Check if the next pair exists in the current queue
    if (nextIndex < songQueue.length) {
      setCurrentIndex(nextIndex);
    } else {
      // We've run out of songs unexpectedly (e.g., fetch failed or too slow)
      console.warn('Ran out of pre-fetched songs. Attempting urgent fetch...');
      // Trigger an urgent fetch - show loading indicator
      if (!isLoading && !isFetchingMore) {
        fetchSongBatch(); // Fetch immediately
        // Ideally, keep the user on the current pair until fetch completes,
        // or show a specific "loading next pair" message.
        // For simplicity here, we just fetch. The UI will update when songQueue changes.
      }
      // Do not advance currentIndex yet. It will advance when the fetch completes
      // and the queue is populated enough via the derived state below.
    }
    // The background fetch logic is handled by the useEffect above.
  };

  // --- Derived State ---
  // Calculate the songs to display based on the current index and queue
  const displayedSongs = songQueue.slice(currentIndex, currentIndex + 2);

  // Calculate the songs to preload (the next pair after the displayed ones)
  const preloadedSongs = songQueue.slice(currentIndex + 2, currentIndex + 2 + PRELOAD_COUNT);


  // --- Render Logic ---
  if (!started) return <RankStartScreen onStart={() => setStarted(true)} />;

  // Show loading indicator only for the very first load
  if (isLoading && songQueue.length === 0) return <div>Loading initial songs...</div>;

  if (error && songQueue.length === 0) return <div>Error loading songs: {error}. Please try again.</div>; // Show error prominently if initial load fails

  // Handle case where queue might be temporarily empty after an error or during fetch
  // or if we are waiting for the very first pair to load
  if (displayedSongs.length === 0 && !isLoading && !isFetchingMore) {
    return <div>No more songs available.</div>;
  }


  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Rank These Songs ({currentIndex / 2 + 1} / {Math.ceil(songQueue.length / 2)})
        {isFetchingMore && <span className="text-sm text-gray-500 ml-2">(Loading more...)</span>}
        {error && <span className="text-sm text-red-500 ml-2">(Error fetching!)</span>}
      </h1>
      <div className="flex flex-col md:flex-row gap-6 md:gap-14 mb-6 justify-center items-start">
        {displayedSongs.length === 2 ? (
          displayedSongs.map((song) => (
            <div key={song.id} className="w-full md:w-1/2 max-w-lg"> {/* Ensure key is unique */}
              {/* Pass the handleSongSelection function */}
              <SongCard song={song} onClick={handleSongSelection} />
            </div>
          ))
        ) : (
          // Render something if exactly 2 songs aren't ready (e.g., loading the very first pair, or end of list issue)
          // This condition might briefly be true if the initial fetch is slow
          <div className="text-center w-full">
            {isLoading || isFetchingMore ? "Loading next pair..." : "Preparing songs..."}
          </div>
        )}
      </div>

      {/* --- Preload Container --- */}
      {/* Render upcoming SongCards hidden to trigger video preloading */}
      <div className="hidden-preload-container">
        {preloadedSongs.map((song) => (
          <SongCard key={song.id} song={song} isPreloading={true} />
        ))}
      </div>
      {/* --- End Preload Container --- */}


      {/* Optional: Display Queue Length/Index for Debugging */}
      {/* <div className="text-center text-xs text-gray-400">
            Queue: {songQueue.length} songs | Index: {currentIndex} | Displayed: {displayedSongs.length} | Preloading: {preloadedSongs.length} | Fetching: {isFetchingMore.toString()} | Loading: {isLoading.toString()}
       </div> */}
    </div>
  );
};