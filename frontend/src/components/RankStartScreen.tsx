export const RankStartScreen = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-start pt-20 h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Song Rank!</h1>
      <p className="mb-6 text-gray-600">Rank your favorite anime songs.</p>
      <button
        onClick={onStart}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
      >
        Start Ranking
      </button>
    </div>
  );
};