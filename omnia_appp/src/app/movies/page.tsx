"use client";

import Header from "../components/Header";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaHeart, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
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

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMovie, setNewMovie] = useState({
    title: "",
    description: "",
    background_image: "",
    avatar_image: "",
    likes: 0,
    liked: false
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    let filtered = movies;
    
    if (showLikedOnly) {
      filtered = filtered.filter(movie => movie.liked);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredMovies(filtered);
  }, [searchQuery, movies, showLikedOnly]);

  const fetchMovies = async () => {
    try {
      const { data, error } = await supabase
        .from('Movies_List')
        .select('*');

      if (error) throw error;
      setMovies(data || []);
      setFilteredMovies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (movieId: string) => {
    try {
      const movie = movies.find(m => m.show_id === movieId);
      if (!movie) {
        console.error('Movie not found:', movieId);
        return;
      }

      console.log('Toggling like for movie:', movieId, 'Current liked status:', movie.liked);

      const { data, error } = await supabase
        .from('Movies_List')
        .update({ liked: !movie.liked })
        .eq('show_id', movieId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Update successful:', data);

      setMovies(prev => prev.map(m => 
        m.show_id === movieId ? { ...m, liked: !m.liked } : m
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
    }
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('movies')
      .insert([newMovie])
      .select();
    
    if (error) {
      console.error('Error adding movie:', error);
      return;
    }
    
    if (data) {
      setMovies([...movies, data[0]]);
      setShowAddForm(false);
      setNewMovie({
        title: "",
        description: "",
        background_image: "",
        avatar_image: "",
        likes: 0,
        liked: false
      });
    }
  };

  if (loading) return <div className="min-h-screen p-8 bg-gray-100">Loading...</div>;
  if (error) return <div className="min-h-screen p-8 bg-gray-100">Error: {error}</div>;

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 bg-gray-100">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Movies</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaPlus /> Add Movie
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowLikedOnly(!showLikedOnly)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showLikedOnly 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              {showLikedOnly ? 'Show All' : 'Show Liked Only'}
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Movie</h2>
            <form onSubmit={handleAddMovie} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900">Title</label>
                <input
                  type="text"
                  value={newMovie.title}
                  onChange={(e) => setNewMovie({...newMovie, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Description</label>
                <textarea
                  value={newMovie.description}
                  onChange={(e) => setNewMovie({...newMovie, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Background Image URL</label>
                <input
                  type="url"
                  value={newMovie.background_image}
                  onChange={(e) => setNewMovie({...newMovie, background_image: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900">Avatar Image URL</label>
                <input
                  type="url"
                  value={newMovie.avatar_image}
                  onChange={(e) => setNewMovie({...newMovie, avatar_image: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  Add Movie
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((movie) => (
            <div 
              key={movie.show_id} 
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative cursor-pointer"
              onClick={() => setSelectedMovie(movie)}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 text-gray-900">{movie.title}</h2>
                <p className="text-gray-800">Release Year: {movie.release_year}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(movie.show_id);
                }}
                className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaHeart
                  className={`text-2xl transition-colors ${
                    movie.liked ? "text-red-500" : "text-gray-400"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {selectedMovie && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white/95 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedMovie.title}</h2>
              <div className="space-y-4">
                <p key="type" className="text-gray-800"><span className="font-semibold text-gray-900">Type:</span> {selectedMovie.type}</p>
                <p key="director" className="text-gray-800"><span className="font-semibold text-gray-900">Director:</span> {selectedMovie.director}</p>
                <p key="cast" className="text-gray-800"><span className="font-semibold text-gray-900">Cast:</span> {selectedMovie.cast}</p>
                <p key="country" className="text-gray-800"><span className="font-semibold text-gray-900">Country:</span> {selectedMovie.country}</p>
                <p key="release_year" className="text-gray-800"><span className="font-semibold text-gray-900">Release Year:</span> {selectedMovie.release_year}</p>
                <p key="rating" className="text-gray-800"><span className="font-semibold text-gray-900">Rating:</span> {selectedMovie.rating}</p>
                <p key="duration" className="text-gray-800"><span className="font-semibold text-gray-900">Duration:</span> {selectedMovie.duration}</p>
                <p key="listed_in" className="text-gray-800"><span className="font-semibold text-gray-900">Genre:</span> {selectedMovie.listed_in}</p>
                <p key="description" className="text-gray-800"><span className="font-semibold text-gray-900">Description:</span> {selectedMovie.description}</p>
              </div>
              <button
                onClick={() => setSelectedMovie(null)}
                className="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 