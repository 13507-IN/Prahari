"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Report } from "@/lib/api";

// Fix leaflet marker icons for webpack/next
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom Red Icon for High Priority
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Black Icon for Normal Priority
const blackIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ReportsMapProps {
  reports: Report[];
}

function MapBoundsManager({ reports }: { reports: Report[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(
        reports.map(r => [r.latitude!, r.longitude!])
      );
      // Pad the bounds slightly so markers aren't on the edge
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [reports, map]);

  return null;
}

export default function ReportsMap({ reports }: ReportsMapProps) {
  const defaultCenter: L.LatLngTuple = [20.5937, 78.9629]; // Center of India

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {reports.map((report) => {
          if (!report.latitude || !report.longitude) return null;
          
          const isHigh = report.urgency === "high" || report.isPriority;
          
          return (
            <Marker 
              key={report.id} 
              position={[report.latitude, report.longitude]}
              icon={isHigh ? redIcon : blackIcon}
            >
              <Popup className="font-sans">
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black tracking-widest uppercase ${isHigh ? 'text-red-600' : 'text-gray-500'}`}>
                      {report.urgency} Priority
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {report.category.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-black uppercase leading-tight mb-2">{report.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{report.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        <MapBoundsManager reports={reports} />
      </MapContainer>
    </div>
  );
}
