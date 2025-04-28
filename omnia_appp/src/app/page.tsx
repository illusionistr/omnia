"use client";

import Image from "next/image";
import Header from "./components/Header";
import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { supabase } from "@/lib/supabase";

interface Movie {
  show_id: string;
  type: string;
  title: string;
  director: string;
  cast: string;
  country: string;
  date_added: string;
  release_year: number;
  rating: string;
  duration: string;
  listed_in: string;
  description: string;
  liked: boolean;
}

interface TVShow {
  show_id: string;
  type: string;
  title: string;
  director: string;
  cast: string;
  country: string;
  date_added: string;
  release_year: number;
  rating: string;
  duration: string;
  listed_in: string;
  description: string;
  liked: boolean;
}

interface VideoGame {
  ID: number;
  GameName: string;
  Console: string;
  Review: string;
  Score: number;
  liked: boolean;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [videoGames, setVideoGames] = useState<VideoGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLikedItems = async () => {
      try {
        // Fetch liked movies
        const { data: moviesData, error: moviesError } = await supabase
          .from('Movies_List')
          .select('*')
          .eq('liked', true);

        if (moviesError) {
          console.error('Movies fetch error:', moviesError);
          throw new Error(`Failed to fetch movies: ${moviesError.message}`);
        }

        // Fetch liked TV shows
        const { data: tvShowsData, error: tvShowsError } = await supabase
          .from('TV_Shows')
          .select('*')
          .eq('liked', true);

        if (tvShowsError) {
          console.error('TV Shows fetch error:', tvShowsError);
          throw new Error(`Failed to fetch TV shows: ${tvShowsError.message}`);
        }

        // Fetch liked video games
        const { data: gamesData, error: gamesError } = await supabase
          .from('Video_Game')
          .select('*')
          .eq('liked', true);

        if (gamesError) {
          console.error('Video Games fetch error:', gamesError);
          throw new Error(`Failed to fetch video games: ${gamesError.message}`);
        }

        setMovies(moviesData || []);
        setTVShows(tvShowsData || []);
        setVideoGames(gamesData || []);
      } catch (err) {
        console.error('Error in fetchLikedItems:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedItems();
  }, []);

  if (loading) return <div className="min-h-screen p-8 bg-gray-100">Loading...</div>;
  if (error) return <div className="min-h-screen p-8 bg-gray-100">Error: {error}</div>;

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Liked Items</h1>
        
        {/* Movies Section */}
        {movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Movies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.map((movie) => (
                <div key={movie.show_id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{movie.title}</h3>
                    <p className="text-gray-800">Release Year: {movie.release_year}</p>
                    <p className="text-gray-800">Director: {movie.director}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TV Shows Section */}
        {tvShows.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">TV Shows</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tvShows.map((show) => (
                <div key={show.show_id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{show.title}</h3>
                    <p className="text-gray-800">Release Year: {show.release_year}</p>
                    <p className="text-gray-800">Director: {show.director}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Games Section */}
        {videoGames.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Video Games</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoGames.map((game) => (
                <div key={game.ID} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{game.GameName}</h3>
                    <p className="text-gray-800">Console: {game.Console}</p>
                    <p className="text-gray-800">Score: {game.Score}/10</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {movies.length === 0 && tvShows.length === 0 && videoGames.length === 0 && (
          <p className="text-gray-600 text-center">You haven't liked any items yet.</p>
        )}
      </main>
    </div>
  );
}
