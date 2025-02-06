import React from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Interface for individual marker
export interface Marker {
  id: number;
  lat: number;
  lng: number;
  name?: string;
}

// Interface for component props
interface MapProps {
  markers: Marker[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const MapWithMarkers: React.FC<MapProps> = ({
  markers,
  center = { lat: 28.0339, lng: 1.6596 },
  zoom = 6,
}) => {
  const containerStyle = {
    width: "100%",
    height: "400px",
  };
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom}>
        {markers.map((marker, index) => (
          <MarkerF
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            title={marker.name}
            icon={
              index === 0
                ? {
                    url: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
                  }
                : {
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  }
            }
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default MapWithMarkers;
