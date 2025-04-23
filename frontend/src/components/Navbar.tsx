import { Link } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const {signInWithGoogle, signOut, user} = useAuth();

  const displayName = user?.user_metadata.user_name || user?.email;

  return (
    <nav
      className="fixed top-0 w-full z-40 bg-[rgba(10,10,10,0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg"
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="font-mono text-xl font-bold text-white">
            Ani<span className="text-purple-500">Tunes</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/rank" className="text-gray-300 hover:text-white transition-colors">
              Rank
            </Link>
            <Link to="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
              Leaderboard
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.user_metadata.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="text-gray-300"> {displayName} </span>
                <button
                  onClick={signOut}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="bg-blue-500 px-3 py-1 rounded"
              >
                Sign In With Google
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>


      {/* Mobile Menu */}
      {menuOpen && (
        <div>
          <div>
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Home
            </Link>
            <Link
              to="/rank"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Rank
            </Link>
            <Link
              to="/leaderboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};