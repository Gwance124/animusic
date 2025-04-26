import { supabase } from '../supabase-client.ts';

export const SongCard = () => {

  const getRandomSong = async () => {
    const { data: song_card, error } = await supabase
      .rpc('get_random_song');
    if (error) {
      console.error('Supabase fetch error:', error);
    }
    else {
      console.log(song_card[0]);
    }
  };

  const getRandomTwoSongs = async () => {
    const { data: song_card, error } = await supabase
      .rpc('get_two_random_songs');
    if (error) {
      console.error('Supabase fetch error:', error);
    }
    else {
      console.log(song_card);
    }
  };

  return (
    <div>
      <button onClick={getRandomSong} className="bg-blue-500 px-3 py-1 rounded">
        Get One Song
      </button>
      <button onClick={getRandomTwoSongs} className="bg-blue-500 px-3 py-1 rounded">
        Get Two Songs
      </button>
    </div>
  );
};