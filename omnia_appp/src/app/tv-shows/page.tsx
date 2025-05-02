"use client";

import Header from "../components/Header";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaHeart, FaSearch, FaTimes, FaFilter } from "react-icons/fa";
import { supabase } from "../lib/supabase";

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

export default function TVShowsPage() {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [filteredShows, setFilteredShows] = useState<TVShow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
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
    fetchShows();
  }, []);

  useEffect(() => {
    // Extract unique categories from shows and group them alphabetically
    const uniqueCategories = new Set<string>();
    shows.forEach(show => {
      if (show.listed_in) {
        show.listed_in.split(',').forEach(category => {
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
  }, [shows]);

  useEffect(() => {
    let filtered = [...shows]; // Create a new array to avoid mutating the original
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(show => 
        show.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      filtered = [];
    }
    
    // Apply category filter if selected
    if (selectedCategory) {
      filtered = filtered.filter(show => 
        show.listed_in && show.listed_in.includes(selectedCategory)
      );
    }
    
    setFilteredShows(filtered);
  }, [searchQuery, shows, selectedCategory]);

  const fetchShows = async () => {
    try {
      const { data, error } = await supabase
        .from('TV_Shows')
        .select('*');

      if (error) throw error;
      setShows(data || []);
      setFilteredShows(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (showId: string) => {
    try {
      const show = shows.find(s => s.show_id === showId);
      if (!show) {
        console.error('Show not found:', showId);
        return;
      }

      console.log('Toggling like for show:', showId, 'Current liked status:', show.liked);

      const { data, error } = await supabase
        .from('TV_Shows')
        .update({ liked: !show.liked })
        .eq('show_id', showId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Update successful:', data);

      setShows(prev => prev.map(s => 
        s.show_id === showId ? { ...s, liked: !s.liked } : s
      ));
    } catch (err) {
      console.error('Error toggling like:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
    }
  };

  const handleCardClick = (show: TVShow) => {
    setSelectedShow(show);
    // Update last visited in localStorage
    const lastVisited = JSON.parse(localStorage.getItem('lastVisited') || '[]');
    const newLastVisited = [
      {
        id: show.show_id,
        type: 'tvshow',
        title: show.title,
        timestamp: Date.now()
      },
      ...lastVisited.filter((item: any) => !(item.id === show.show_id && item.type === 'tvshow'))
    ].slice(0, 6);
    localStorage.setItem('lastVisited', JSON.stringify(newLastVisited));
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('lastVisitedUpdated', { detail: newLastVisited }));
  };

  const closeModal = () => {
    setSelectedShow(null);
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

  if (loading) return <div className="min-h-screen p-8 bg-gray-100">Loading...</div>;
  if (error) return <div className="min-h-screen p-8 bg-gray-100">Error: {error}</div>;

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-purple-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">TV Shows</h1>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search TV shows to see results..."
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

        {!searchQuery && (
          <div className="text-center text-gray-500 py-8">
            <p>Start typing in the search box to see TV shows</p>
          </div>
        )}

        {searchQuery && filteredShows.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No TV shows found matching your search</p>
            <button
              onClick={() => setShowRequestModal(true)}
              className="mt-4 text-blue-500 hover:text-blue-600 underline"
            >
              Request this TV show to be added
            </button>
          </div>
        )}

        {searchQuery && filteredShows.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShows.map((show) => (
              <div
                key={show.show_id}
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative cursor-pointer"
                onClick={() => handleCardClick(show)}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 text-white">{show.title}</h2>
                  <p className="text-blue-100">Release Year: {show.release_year}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(show.show_id);
                  }}
                  className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <FaHeart
                    className={`text-2xl transition-colors ${
                      show.liked ? "text-red-500" : "text-white/70"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedShow && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <div
              className="bg-white/95 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900">{selectedShow.title}</h2>
              <div className="space-y-4">
                {selectedShow.type && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Type:</span> {selectedShow.type}</p>
                )}
                {selectedShow.director && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Director:</span> {selectedShow.director}</p>
                )}
                {selectedShow.cast && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Cast:</span> {selectedShow.cast}</p>
                )}
                {selectedShow.country && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Country:</span> {selectedShow.country}</p>
                )}
                {selectedShow.release_year && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Release Year:</span> {selectedShow.release_year}</p>
                )}
                {selectedShow.rating && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Rating:</span> {selectedShow.rating}</p>
                )}
                {selectedShow.duration && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Duration:</span> {selectedShow.duration}</p>
                )}
                {selectedShow.listed_in && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Genre:</span> {selectedShow.listed_in}</p>
                )}
                {selectedShow.description && (
                  <p className="text-gray-800"><span className="font-semibold text-gray-900">Description:</span> {selectedShow.description}</p>
                )}
              </div>
              <button
                onClick={closeModal}
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
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Request a TV Show</h2>
              <p className="text-gray-600 mb-4">
                Let us know which TV show you'd like to see added to our collection.
              </p>
              <textarea
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Enter the TV show title and any additional details..."
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