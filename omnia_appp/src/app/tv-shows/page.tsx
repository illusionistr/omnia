"use client";

import Header from "../components/Header";
import Image from "next/image";
import { useState, useEffect } from "react";
import { FaHeart, FaSearch, FaTimes } from "react-icons/fa";
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
  const [showLikedOnly, setShowLikedOnly] = useState(false);

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    let filtered = shows;
    
    if (showLikedOnly) {
      filtered = filtered.filter(show => show.liked);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(show => 
        show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredShows(filtered);
  }, [searchQuery, shows, showLikedOnly]);

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
  };

  const closeModal = () => {
    setSelectedShow(null);
  };

  if (loading) return <div className="min-h-screen p-8 bg-gray-100">Loading...</div>;
  if (error) return <div className="min-h-screen p-8 bg-gray-100">Error: {error}</div>;

  return (
    <div>
      <Header />
      <main className="min-h-screen p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">TV Shows</h1>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search TV shows..."
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShows.map((show) => (
            <div
              key={show.show_id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden relative cursor-pointer"
              onClick={() => handleCardClick(show)}
            >
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 text-gray-900">{show.title}</h2>
                <p className="text-gray-800">Release Year: {show.release_year}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(show.show_id);
                }}
                className="absolute bottom-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FaHeart
                  className={`text-2xl transition-colors ${
                    show.liked ? "text-red-500" : "text-gray-400"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

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
                <p className="text-gray-800"><span className="font-semibold text-gray-900">Type:</span> {selectedShow.type}</p>
                <p className="text-gray-800"><span className="font-semibold text-gray-900">Director:</span> {selectedShow.director}</p>
                <p className="text-gray-800"><span className="font-semibold text-gray-900">Cast:</span> {selectedShow.cast}</p>
                <p className="text-gray-800"><span className="font-semibold text-gray-900">Country:</span> {selectedShow.country}</p>
                <p className="text-gray-800"><span className="font-semibold text-gray-900">Release Year:</span> {selectedShow.release_year}</p>
                <p className="text-gray-800"><span className="font-semibold text-gray-900">Rating:</span> {selectedShow.rating}</p>
                <p className="text-gray-800"><span className="font-semibold text-gray-900">Duration:</span> {selectedShow.duration}</p>
                <p className="text-gray-800"><span className="font-semibold text-gray-900">Genre:</span> {selectedShow.listed_in}</p>
                <p className="text-gray-800"><span className="font-semibold text-gray-900">Description:</span> {selectedShow.description}</p>
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
      </main>
    </div>
  );
} 