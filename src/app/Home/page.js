'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapProvider } from 'react-map-gl/mapbox';
import MapView from '../../components/ui/MapView';
import SearchBar from '../../components/ui/SearchBar';
import ViewModeToggle from '../../components/ui/ViewModeToggle';
import NavigationControls from '../../components/NavigationControls';
import UploadButton from '../../components/ui/UploadButton';
import CapsuleBottomSheet from '../../components/ui/CapsuleBottomSheet';
import UploadModal from '../../components/ui/UploadModal';
import { mockCapsules, mockUsers } from '../../lib/mockData';


export default function Home() {
  const [viewMode, setViewMode] = useState('capsules');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [capsules, setCapsules] = useState(mockCapsules);
  const [users, setUsers] = useState(mockUsers);
  const [userLocation, setUserLocation] = useState(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Taipei location
          setUserLocation([121.5654, 25.0330]);
        }
      );
    } else {
      // Fallback to Taipei location
      setUserLocation([121.5654, 25.0330]);
    }
  }, []);

  // Filter capsules based on search query
  const filteredCapsules = capsules.filter(capsule => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      capsule.title.toLowerCase().includes(query) ||
      capsule.artist.toLowerCase().includes(query) ||
      capsule.hashtag.toLowerCase().includes(query)
    );
  });

  const handleCapsuleClick = useCallback((capsule) => {
    setSelectedCapsule(capsule);
  }, []);

  const handleUpload = useCallback((newCapsule) => {
    const capsule = {
      ...newCapsule,
      id: Date.now().toString(),
    };
    setCapsules(prev => [...prev, capsule]);
    setIsUploadModalOpen(false);
  }, []);

  return (
    <MapProvider>
      <div className="relative w-full h-screen overflow-hidden bg-gray-50">
        {/* Map Container */}
        <div className="absolute inset-0">
          <MapView
            viewMode={viewMode}
            capsules={filteredCapsules}
            users={users}
            userLocation={userLocation}
            onCapsuleClick={handleCapsuleClick}
          />
        </div>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
          <div className="p-4 space-y-3">
            {/* Navigation and Search Row */}
            <div className="flex items-center gap-3">
              <NavigationControls />
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="搜尋歌曲或 #主題標籤"
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex justify-end">
              <ViewModeToggle
                viewMode={viewMode}
                onChange={setViewMode}
              />
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <UploadButton 
          onClick={() => setIsUploadModalOpen(true)}
        />

        {/* Bottom Sheet for Capsule Details */}
        <CapsuleBottomSheet
          capsule={selectedCapsule}
          onClose={() => setSelectedCapsule(null)}
        />

        {/* Upload Modal */}
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleUpload}
          userLocation={userLocation}
        />
      </div>
    </MapProvider>
  );
}