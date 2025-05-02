"use client";

import Header from "../components/Header";
import { useState, useEffect } from "react";
import { FaHeart, FaSearch, FaTimes, FaFilter } from "react-icons/fa";
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
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ letter: string; items: string[] }[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    // Extract unique categories from movies and group them alphabetically
    const uniqueCategories = new Set<string>();
    movies.forEach(movie => {
      if (movie.listed_in) {
        movie.listed_in.split(',').forEach(category => {
          uniqueCategories.add(category.trim());
        });
      }
    });
    
    // Group categories by first letter
    const groupedCategories = Array.from(uniqueCategories)
      .sort()
      .reduce((acc, category) => {
        const firstLetter = category.charAt(0).toUpperCase();
        const group = acc.find(g => g.letter === firstLetter) || { letter: firstLetter, items: [] };
        if (!acc.find(g => g.letter === firstLetter)) {
          acc.push(group);
        }
        group.items.push(category);
        return acc;
      }, [] as { letter: string; items: string[] }[]);
    
    setCategories(groupedCategories);
  }, [movies]);

  useEffect(() => {
    let filtered = [...movies]; // Create a new array to avoid mutating the original
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      filtered = [];
    }
    
    // Apply category filter if selected
    if (selectedCategory) {
      filtered = filtered.filter(movie => 
        movie.listed_in && movie.listed_in.includes(selectedCategory)
      );
    }
    
    setFilteredMovies(filtered);
  }, [searchQuery, movies, selectedCategory]);

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

  const handleCardClick = (movie: Movie) => {
    setSelectedMovie(movie);
    // Update last visited in localStorage
    const lastVisited = JSON.parse(localStorage.getItem('lastVisited') || '[]');
    const newLastVisited = [
      {
        id: movie.show_id,
        type: 'movie',
        title: movie.title,
        timestamp: Date.now()
      },
      ...lastVisited.filter((item: any) => !(item.id === movie.show_id && item.type === 'movie'))
    ].slice(0, 6);
    localStorage.setItem('lastVisited', JSON.stringify(newLastVisited));
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('lastVisitedUpdated', { detail: newLastVisited }));
  };

  if (loading) return <div className="min-h-screen p-8 bg-gray-100">Loading...</div>;
  if (error) return <div className="min-h-screen p-8 bg-gray-100">Error: {error}</div>;

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Movies</h1>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search movies to see results..."
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
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                <FaFilter />
                {selectedCategory ? selectedCategory : 'Filter'}
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-10 max-h-[60vh] overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setShowFilterDropdown(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    All Categories
                  </button>
                  {categories.map((group) => (
                    <div key={group.letter} className="border-t border-gray-100">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {group.letter}
                      </div>
                      {group.items.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowFilterDropdown(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            selectedCategory === category
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {!searchQuery && (
          <div className="text-center text-gray-500 py-8">
            <p>Start typing in the search box to see movies</p>
          </div>
        )}

        {searchQuery && filteredMovies.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No movies found matching your search</p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="mt-4 text-blue-500 hover:text-blue-600 underline"
            >
              Request this movie to be added
            </button>
          </div>
        )}

        {searchQuery && filteredMovies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMovies.map((movie) => (
              <div 
                key={movie.show_id} 
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative cursor-pointer"
                onClick={() => handleCardClick(movie)}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 text-white">{movie.title}</h2>
                  <p className="text-blue-100">Release Year: {movie.release_year}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(movie.show_id);
                  }}
                  className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <FaHeart
                    className={`text-2xl transition-colors ${
                      movie.liked ? "text-red-500" : "text-white/70"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedMovie && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white/95 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedMovie.title}</h2>
              <div className="space-y-4">
                {selectedMovie.type && (
                  <p key="type" className="text-gray-800"><span className="font-semibold text-gray-900">Type:</span> {selectedMovie.type}</p>
                )}
                {selectedMovie.director && (
                  <p key="director" className="text-gray-800"><span className="font-semibold text-gray-900">Director:</span> {selectedMovie.director}</p>
                )}
                {selectedMovie.cast && (
                  <p key="cast" className="text-gray-800"><span className="font-semibold text-gray-900">Cast:</span> {selectedMovie.cast}</p>
                )}
                {selectedMovie.country && (
                  <p key="country" className="text-gray-800"><span className="font-semibold text-gray-900">Country:</span> {selectedMovie.country}</p>
                )}
                {selectedMovie.release_year && (
                  <p key="release_year" className="text-gray-800"><span className="font-semibold text-gray-900">Release Year:</span> {selectedMovie.release_year}</p>
                )}
                {selectedMovie.rating && (
                  <p key="rating" className="text-gray-800"><span className="font-semibold text-gray-900">Rating:</span> {selectedMovie.rating}</p>
                )}
                {selectedMovie.duration && (
                  <p key="duration" className="text-gray-800"><span className="font-semibold text-gray-900">Duration:</span> {selectedMovie.duration}</p>
                )}
                {selectedMovie.listed_in && (
                  <p key="listed_in" className="text-gray-800"><span className="font-semibold text-gray-900">Genre:</span> {selectedMovie.listed_in}</p>
                )}
                {selectedMovie.description && (
                  <p key="description" className="text-gray-800"><span className="font-semibold text-gray-900">Description:</span> {selectedMovie.description}</p>
                )}
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

        {/* Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white/95 rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Request a Movie</h2>
              <p className="text-gray-600 mb-4">
                Let us know which movie you'd like to see added to our collection.
              </p>
              <textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Enter the movie title and any additional details..."
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