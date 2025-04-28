"use client";

import Header from "../components/Header";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
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
    const filtered = games.filter(game => 
      game.GameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.Console.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.Review.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  if (loading) {
    return (
      <div>
        <Header />
        <main className="min-h-screen p-8 bg-gray-100">
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
        <main className="min-h-screen p-8 bg-gray-100">
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
        <main className="min-h-screen p-8 bg-gray-100">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Video Games</h1>
          <p className="text-gray-800">No games found in the database.</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 bg-gray-100">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Video Games</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search games by name, console, or review..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div key={game.ID} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative">
              <div className="relative h-48 bg-gray-800 flex items-center justify-center">
                <div className="text-white text-4xl font-bold">
                  {game.Score}/10
                </div>
              </div>
              <div className="pt-6 pb-6 px-6">
                <h2 className="text-xl font-bold mb-2 text-gray-900">{game.GameName}</h2>
                <p className="text-gray-800 mb-2">
                  <span className="font-semibold text-gray-900">Console:</span> {game.Console}
                </p>
                <p className="text-gray-800">
                  <span className="font-semibold text-gray-900">Review:</span> {game.Review}
                </p>
              </div>
              <button
                onClick={() => toggleLike(game.ID)}
                className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaHeart
                  className={`text-2xl transition-colors ${
                    game.liked ? "text-red-500" : "text-gray-400"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}