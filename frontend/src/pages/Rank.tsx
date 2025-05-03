import { SongCard } from '../components/SongCard.tsx';
import { supabase } from '../supabase-client.ts';
import { useEffect, useRef, useState } from 'react';
import { RankStartScreen } from '../components/RankStartScreen.tsx';

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

export const Rank = () => {
  const [started, setStarted] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const getTwoRandomSongs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_two_random_songs');

      if (error) throw error;

      setSongs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching songs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      getTwoRandomSongs();
    }
  }, [started]);

  if (!started) return <RankStartScreen onStart={() => setStarted(true)} />;
  if (loading) return <div>Loading songs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Rank These Songs</h1>
      <div className="flex gap-14 mb-6">
        {songs.map((song) => (
          <div key={song.id} className="w-1/2">
            <SongCard song={song} onClick={getTwoRandomSongs} />
          </div>
        ))}
      </div>
    </div>
  );
};


