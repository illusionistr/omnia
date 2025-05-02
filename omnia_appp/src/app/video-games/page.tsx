"use client";

import Header from "../components/Header";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaHeart, FaSearch, FaTimes, FaFilter } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

interface Video_Game {
  ID: number;
  GameName: string;
  Console: string;
  Review: string;
  Score: number;
  liked: boolean;
}

export default function VideoGamesPage() {
  const [games, setGames] = useState<Video_Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Video_Game[]>([]);
  const [likedCards, setLikedCards] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<Video_Game | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        console.log('Fetching games from Video_Game table...');
        const { data, error } = await supabase
          .from('Video_Game')
          .select('*');
        
        if (error) {
          console.error('Error fetching video games:', error);
          setError(error.message);
          return;
        }
        
        console.log('Fetched games:', data);
        setGames(data || []);
        setFilteredGames(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    let filtered = [...games]; // Create a new array to avoid mutating the original
    
    // Only show games when there's a search query
    if (searchQuery) {
      console.log('Searching for:', searchQuery);
      filtered = filtered.filter(game => {
        const matches = game.GameName.toLowerCase().includes(searchQuery.toLowerCase());
        console.log('Game:', game.GameName, 'Matches:', matches);
        return matches;
      });
    } else {
      // If no search query, show empty array
      filtered = [];
    }
    
    console.log('Filtered games count:', filtered.length);
    setFilteredGames(filtered);
  }, [searchQuery, games]);

  const toggleLike = async (gameId: number) => {
    try {
      const game = games.find(g => g.ID === gameId);
      if (!game) {
        console.error('Game not found:', gameId);
        return;
      }

      console.log('Toggling like for game:', gameId, 'Current liked status:', game.liked);

      const { data, error } = await supabase
        .from('Video_Game')
        .update({ liked: !game.liked })
        .eq('ID', gameId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Update successful:', data);

      setGames(prev => prev.map(g => 
        g.ID === gameId ? { ...g, liked: !g.liked } : g
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestText.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('requests')
        .insert([{ text: requestText }]);

      if (error) throw error;
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setSubmitSuccess(false);
        setRequestText("");
      }, 2000);
    } catch (err) {
      console.error('Error submitting request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = (game: Video_Game) => {
    setSelectedGame(game);
    // Update last visited in localStorage
    const lastVisited = JSON.parse(localStorage.getItem('lastVisited') || '[]');
    const newLastVisited = [
      {
        id: game.ID,
        type: 'game',
        title: game.GameName,
        timestamp: Date.now()
      },
      ...lastVisited.filter((item: any) => !(item.id === game.ID && item.type === 'game'))
    ].slice(0, 6);
    localStorage.setItem('lastVisited', JSON.stringify(newLastVisited));
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('lastVisitedUpdated', { detail: newLastVisited }));
  };

  if (loading) {
    return (
      <div>
        <Header />
        <main className="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-purple-100">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Video Games</h1>
          <p className="text-gray-800">Loading...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header />
        <main className="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-purple-100">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Video Games</h1>
          <p className="text-red-600">Error: {error}</p>
        </main>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div>
        <Header />
        <main className="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-purple-100">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Video Games</h1>
          <p className="text-gray-800">No games found in the database.</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Video Games</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search games to see results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {!searchQuery && (
          <div className="text-center text-gray-500 py-8">
            <p>Start typing in the search box to see video games</p>
          </div>
        )}

        {searchQuery && filteredGames.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No video games found matching your search</p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="mt-4 text-blue-500 hover:text-blue-600 underline"
            >
              Request this video game to be added
            </button>
          </div>
        )}

        {searchQuery && filteredGames.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div key={game.ID} className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative">
                <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                  <div className="text-white text-4xl font-bold">
                    {game.Score}/10
                  </div>
                </div>
                <div className="pt-6 pb-6 px-6">
                  <h2 className="text-xl font-bold mb-2 text-white">{game.GameName}</h2>
                  <p className="text-blue-100 mb-2">
                    <span className="font-semibold text-white">Console:</span> {game.Console}
                  </p>
                  <p className="text-blue-100">
                    <span className="font-semibold text-white">Review:</span> {game.Review}
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleCardClick(game);
                    toggleLike(game.ID);
                  }}
                  className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <FaHeart
                    className={`text-2xl transition-colors ${
                      game.liked ? "text-red-500" : "text-white/70"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedGame && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white/95 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedGame.GameName}</h2>
              <div className="space-y-4">
                {selectedGame.Console && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Console:</span> {selectedGame.Console}</p>
                )}
                {selectedGame.Review && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Review:</span> {selectedGame.Review}</p>
                )}
                {selectedGame.Score && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Score:</span> {selectedGame.Score}/10</p>
                )}
              </div>
              <button
                onClick={() => setSelectedGame(null)}
                className="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white/95 rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Request a Video Game</h2>
              <p className="text-gray-600 mb-4">
                Let us know which video game you'd like to see added to our collection.
              </p>
              <textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Enter the video game title and any additional details..."
                className="w-full p-4 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                rows={4}
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={isSubmitting || !requestText.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    isSubmitting || !requestText.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : submitSuccess ? 'Submitted!' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}