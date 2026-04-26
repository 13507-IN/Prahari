"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, Navigation } from "lucide-react";

// Fix leaflet marker icons for webpack/next
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

// Sub-component to handle map flying
function MapFlyer({ position }: { position: L.LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);
  return null;
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLocation ? new L.LatLng(initialLocation.lat, initialLocation.lng) : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [isLocating, setIsLocating] = useState(false);

  const defaultCenter: L.LatLngTuple = [20.5937, 78.9629]; // India

  useEffect(() => {
    if (position) {
      onLocationSelect(position.lat, position.lng);
    }
  }, [position, onLocationSelect]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = new L.LatLng(parseFloat(lat), parseFloat(lon));
        setPosition(newPos);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching for location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = new L.LatLng(latitude, longitude);
        setPosition(newPos);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please check your browser permissions.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="h-full w-full relative z-0 group">
      {/* Search Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] max-w-md mx-auto">
        <form onSubmit={handleSearch} className="relative flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              className="w-full px-4 py-3 pl-11 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 placeholder:text-slate-500"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 bg-primary text-white rounded-xl shadow-lg hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all font-medium flex items-center justify-center min-w-[100px]"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
          </button>
          
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="p-3 bg-white text-primary border border-slate-200 rounded-xl shadow-lg hover:bg-slate-50 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center"
            title="Use my current location"
          >
            {isLocating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>

      <MapContainer 
        center={initialLocation ? [initialLocation.lat, initialLocation.lng] : defaultCenter} 
        zoom={initialLocation ? 14 : 5} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        className="rounded-xl overflow-hidden shadow-inner"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
        <MapFlyer position={position} />
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] text-slate-500 shadow-sm pointer-events-none">
        Click on map or search above to select location
      </div>
    </div>
  );
}
