import { Song } from '../pages/Rank.tsx';

type SongCardProps = {
  song: Song;
};

export const SongCard = ({ song }: SongCardProps) => {
  return (
    <div className="rounded-xl border p-4 shadow-md bg-white w-full">
      <h3 className="text-lg text-gray-800 font-semibold">Title: {song.song_title}</h3>
      <p className="text-gray-600">Rating: {song.rating}</p>
    </div>
  );
};