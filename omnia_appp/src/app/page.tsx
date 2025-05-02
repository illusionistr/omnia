"use client";

import Image from "next/image";
import Header from "./components/Header";
import { useState, useEffect } from "react";
import { FaHeart, FaTrash, FaTimes, FaStar } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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
  platform: string;
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
  platform: string;
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

interface LastVisitedItem {
  id: string | number;
  type: 'movie' | 'tvshow' | 'game';
  title: string;
  timestamp: number;
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [videoGames, setVideoGames] = useState<VideoGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Movie | TVShow | VideoGame | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [itemType, setItemType] = useState<'movie' | 'tvshow' | 'game' | null>(null);
  const [lastVisited, setLastVisited] = useState<LastVisitedItem[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [allTVShows, setAllTVShows] = useState<TVShow[]>([]);
  const [allVideoGames, setAllVideoGames] = useState<VideoGame[]>([]);

  useEffect(() => {
    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  useEffect(() => {
    const fetchLikedItems = async () => {
      try {
        // Fetch all movies
        const { data: allMoviesData, error: allMoviesError } = await supabase
          .from('Movies_List')
          .select('*');

        if (allMoviesError) {
          console.error('All movies fetch error:', allMoviesError);
          throw new Error(`Failed to fetch all movies: ${allMoviesError.message}`);
        }

        // Fetch all TV shows
        const { data: allTVShowsData, error: allTVShowsError } = await supabase
          .from('TV_Shows')
          .select('*');

        if (allTVShowsError) {
          console.error('All TV shows fetch error:', allTVShowsError);
          throw new Error(`Failed to fetch all TV shows: ${allTVShowsError.message}`);
        }

        // Fetch all video games
        const { data: allGamesData, error: allGamesError } = await supabase
          .from('Video_Game')
          .select('*');

        if (allGamesError) {
          console.error('All video games fetch error:', allGamesError);
          throw new Error(`Failed to fetch all video games: ${allGamesError.message}`);
        }

        // Store all items in state
        setAllMovies(allMoviesData || []);
        setAllTVShows(allTVShowsData || []);
        setAllVideoGames(allGamesData || []);

        // Filter for liked items
        const likedMovies = allMoviesData?.filter(movie => movie.liked) || [];
        const likedTVShows = allTVShowsData?.filter(show => show.liked) || [];
        const likedGames = allGamesData?.filter(game => game.liked) || [];

        setMovies(likedMovies);
        setTVShows(likedTVShows);
        setVideoGames(likedGames);
      } catch (err) {
        console.error('Error in fetchLikedItems:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedItems();
  }, []);

  useEffect(() => {
    // Load last visited items from localStorage
    const storedLastVisited = localStorage.getItem('lastVisited');
    if (storedLastVisited) {
      const lastVisitedItems = JSON.parse(storedLastVisited);
      // Filter out items older than 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentItems = lastVisitedItems.filter((item: LastVisitedItem) => item.timestamp > thirtyDaysAgo);
      setLastVisited(recentItems);
      // Update localStorage with only recent items
      localStorage.setItem('lastVisited', JSON.stringify(recentItems));
    }

    // Listen for lastVisitedUpdated events
    const handleLastVisitedUpdated = (event: CustomEvent) => {
      const items = event.detail;
      // Filter out items older than 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentItems = items.filter((item: LastVisitedItem) => item.timestamp > thirtyDaysAgo);
      setLastVisited(recentItems);
    };

    window.addEventListener('lastVisitedUpdated', handleLastVisitedUpdated as EventListener);

    return () => {
      window.removeEventListener('lastVisitedUpdated', handleLastVisitedUpdated as EventListener);
    };
  }, []);

  const removeFromFavorites = async (type: 'movie' | 'tvshow' | 'game', id: string | number) => {
    try {
      let tableName = '';
      let idField = '';
      
      switch (type) {
        case 'movie':
          tableName = 'Movies_List';
          idField = 'show_id';
          break;
        case 'tvshow':
          tableName = 'TV_Shows';
          idField = 'show_id';
          break;
        case 'game':
          tableName = 'Video_Game';
          idField = 'ID';
          break;
      }

      const { error } = await supabase
        .from(tableName)
        .update({ liked: false })
        .eq(idField, id);

      if (error) throw error;

      // Update local state
      switch (type) {
        case 'movie':
          setMovies(prev => prev.filter(m => m.show_id !== id));
          break;
        case 'tvshow':
          setTVShows(prev => prev.filter(s => s.show_id !== id));
          break;
        case 'game':
          setVideoGames(prev => prev.filter(g => g.ID !== id));
          break;
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
    }
  };

  const openModal = (item: Movie | TVShow | VideoGame, type: 'movie' | 'tvshow' | 'game') => {
    setSelectedItem(item);
    setItemType(type);
    setShowModal(true);
    updateLastVisited(item, type);
  };

  const updateLastVisited = (item: Movie | TVShow | VideoGame, type: 'movie' | 'tvshow' | 'game') => {
    const newLastVisited: LastVisitedItem = {
      id: type === 'game' ? (item as VideoGame).ID : (item as Movie | TVShow).show_id,
      type,
      title: type === 'game' ? (item as VideoGame).GameName : (item as Movie | TVShow).title,
      timestamp: Date.now()
    };

    setLastVisited(prev => {
      const updated = [
        newLastVisited,
        ...prev.filter(i => !(i.id === newLastVisited.id && i.type === newLastVisited.type))
      ].slice(0, 6); // Keep only the 6 most recent items
      localStorage.setItem('lastVisited', JSON.stringify(updated));
      return updated;
    });
  };

  if (loading) return <div className="min-h-screen p-8 bg-gray-100">Loading...</div>;
  if (error) return <div className="min-h-screen p-8 bg-gray-100">Error: {error}</div>;

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 bg-gradient-to-br from-blue-200 to-purple-200">
        {/* Welcome Modal */}
        {showWelcomeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Welcome to Omnia!</h2>
              <p className="text-gray-700 mb-4">
                Please note that all the data contained in this website is from 2023 and might not reflect the present.
              </p>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                I Understand
              </button>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                {itemType === 'game' 
                  ? (selectedItem as VideoGame).GameName 
                  : (selectedItem as Movie | TVShow).title}
              </h2>
              
              {itemType === 'movie' && (
                <>
                  {(selectedItem as Movie).director && <p className="text-gray-700 mb-2"><span className="font-semibold">Director:</span> {(selectedItem as Movie).director}</p>}
                  {(selectedItem as Movie).cast && <p className="text-gray-700 mb-2"><span className="font-semibold">Cast:</span> {(selectedItem as Movie).cast}</p>}
                  {(selectedItem as Movie).country && <p className="text-gray-700 mb-2"><span className="font-semibold">Country:</span> {(selectedItem as Movie).country}</p>}
                  {(selectedItem as Movie).release_year && <p className="text-gray-700 mb-2"><span className="font-semibold">Release Year:</span> {(selectedItem as Movie).release_year}</p>}
                  {(selectedItem as Movie).rating && <p className="text-gray-700 mb-2"><span className="font-semibold">Rating:</span> {(selectedItem as Movie).rating}</p>}
                  {(selectedItem as Movie).duration && <p className="text-gray-700 mb-2"><span className="font-semibold">Duration:</span> {(selectedItem as Movie).duration}</p>}
                  {(selectedItem as Movie).listed_in && <p className="text-gray-700 mb-2"><span className="font-semibold">Genre:</span> {(selectedItem as Movie).listed_in}</p>}
                  {(selectedItem as Movie).platform && <p className="text-gray-700 mb-2"><span className="font-semibold">Platform:</span> {(selectedItem as Movie).platform.split(',').map(p => p.trim()).join(', ')}</p>}
                  {(selectedItem as Movie).description && <p className="text-gray-700 mb-2"><span className="font-semibold">Description:</span> {(selectedItem as Movie).description}</p>}
                </>
              )}

              {itemType === 'tvshow' && (
                <>
                  {(selectedItem as TVShow).director && <p className="text-gray-700 mb-2"><span className="font-semibold">Director:</span> {(selectedItem as TVShow).director}</p>}
                  {(selectedItem as TVShow).cast && <p className="text-gray-700 mb-2"><span className="font-semibold">Cast:</span> {(selectedItem as TVShow).cast}</p>}
                  {(selectedItem as TVShow).country && <p className="text-gray-700 mb-2"><span className="font-semibold">Country:</span> {(selectedItem as TVShow).country}</p>}
                  {(selectedItem as TVShow).release_year && <p className="text-gray-700 mb-2"><span className="font-semibold">Release Year:</span> {(selectedItem as TVShow).release_year}</p>}
                  {(selectedItem as TVShow).rating && <p className="text-gray-700 mb-2"><span className="font-semibold">Rating:</span> {(selectedItem as TVShow).rating}</p>}
                  {(selectedItem as TVShow).duration && <p className="text-gray-700 mb-2"><span className="font-semibold">Duration:</span> {(selectedItem as TVShow).duration}</p>}
                  {(selectedItem as TVShow).listed_in && <p className="text-gray-700 mb-2"><span className="font-semibold">Genre:</span> {(selectedItem as TVShow).listed_in}</p>}
                  {(selectedItem as TVShow).platform && <p className="text-gray-700 mb-2"><span className="font-semibold">Platform:</span> {(selectedItem as TVShow).platform.split(',').map(p => p.trim()).join(', ')}</p>}
                  {(selectedItem as TVShow).description && <p className="text-gray-700 mb-2"><span className="font-semibold">Description:</span> {(selectedItem as TVShow).description}</p>}
                </>
              )}

              {itemType === 'game' && (
                <>
                  {(selectedItem as VideoGame).Console && <p className="text-gray-700 mb-2"><span className="font-semibold">Console:</span> {(selectedItem as VideoGame).Console}</p>}
                  {(selectedItem as VideoGame).Review && <p className="text-gray-700 mb-2"><span className="font-semibold">Review:</span> {(selectedItem as VideoGame).Review}</p>}
                  {(selectedItem as VideoGame).Score && (
                    <div className="flex items-center text-gray-700 mb-2">
                      <span className="font-semibold mr-2">Score:</span>
                      <div className="flex items-center">
                        {[...Array(10)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-xl ${i < (selectedItem as VideoGame).Score ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Dashboard</h1>

        {/* Last Visited Section */}
        {lastVisited.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Last Visited</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lastVisited.map((item) => {
                const data = item.type === 'movie' 
                  ? allMovies.find(m => m.show_id === item.id)
                  : item.type === 'tvshow'
                    ? allTVShows.find(s => s.show_id === item.id)
                    : allVideoGames.find(g => g.ID === item.id);

                if (!data) return null;

                return (
                  <div 
                    key={`${item.type}-${item.id}`}
                    className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative cursor-pointer"
                    onClick={() => openModal(data, item.type)}
                  >
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-white">
                        {item.type === 'game' 
                          ? (data as VideoGame).GameName 
                          : (data as Movie | TVShow).title}
                      </h3>
                      <p className="text-blue-100">
                        {item.type === 'game' 
                          ? `Score: ${(data as VideoGame).Score}/10`
                          : `Release Year: ${(data as Movie | TVShow).release_year}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Liked Items Section */}
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Liked Items</h2>
        
        {/* Movies Section */}
        {movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Movies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {movies.map((movie) => (
                <div 
                  key={movie.show_id} 
                  className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative cursor-pointer"
                  onClick={() => openModal(movie, 'movie')}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-white">{movie.title}</h3>
                    <p className="text-blue-100">Release Year: {movie.release_year}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites('movie', movie.show_id);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                    title="Remove from favorites"
                  >
                    <FaTrash className="text-white text-xl" />
                  </button>
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
                <div 
                  key={show.show_id} 
                  className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative cursor-pointer"
                  onClick={() => openModal(show, 'tvshow')}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-white">{show.title}</h3>
                    <p className="text-blue-100">Release Year: {show.release_year}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites('tvshow', show.show_id);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                    title="Remove from favorites"
                  >
                    <FaTrash className="text-white text-xl" />
                  </button>
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
                <div 
                  key={game.ID} 
                  className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative cursor-pointer"
                  onClick={() => openModal(game, 'game')}
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-white">{game.GameName}</h3>
                    <p className="text-blue-100">Score: {game.Score}/10</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromFavorites('game', game.ID);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                    title="Remove from favorites"
                  >
                    <FaTrash className="text-white text-xl" />
                  </button>
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
