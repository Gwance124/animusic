import { SongCard } from '../components/SongCard.tsx';
import { supabase } from '../supabase-client.ts';
import { useEffect, useState } from 'react';

export type Song = {
  id: string;
  created_at: string;
  song_title: string;
  rating: number;
};

export const Rank = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTwoRandomSongs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .rpc('get_two_random_songs');

        if (error) throw error;

        setSongs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching songs:', err);
      } finally {
        setLoading(false);
      }
    };

    getTwoRandomSongs();
  },[]);

  if (loading) return <div>Loading songs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Rank These Songs</h1>
      <div className="flex gap-4 mb-6">
        {songs.map((song) => (
          <div key={song.id} className="w-1/2">
            <SongCard song={song} />
          </div>
        ))}
      </div>
    </div>
  );
}