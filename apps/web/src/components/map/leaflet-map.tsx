'use client';

import 'leaflet/dist/leaflet.css';
import { LatLngBounds } from 'leaflet';
import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import Link from 'next/link';

export interface MapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  subtitle?: string;
  href?: string;
}

/** Pans/zooms the map to fit all markers whenever they change. */
function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    const first = markers[0];
    if (!first) return;
    if (markers.length === 1) {
      map.setView([first.latitude, first.longitude], 11);
      return;
    }
    const bounds = new LatLngBounds(markers.map((m) => [m.latitude, m.longitude]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 11 });
  }, [map, markers]);
  return null;
}

/**
 * An interactive map built on Leaflet + OpenStreetMap tiles. No API key is
 * required, which keeps the app runnable standalone. Vector circle markers are
 * used instead of image pins so there are no asset-loading quirks under the
 * bundler.
 */
export default function LeafletMap({ markers }: { markers: MapMarker[] }) {
  const first = markers[0];
  const center: [number, number] = first ? [first.latitude, first.longitude] : [20, 0];

  return (
    <MapContainer
      center={center}
      zoom={markers.length ? 6 : 2}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ background: '#0f1620' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds markers={markers} />
      {markers.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.latitude, marker.longitude]}
          radius={9}
          pathOptions={{
            color: '#e9b949',
            weight: 2,
            fillColor: '#e9b949',
            fillOpacity: 0.7,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            {marker.name}
          </Tooltip>
          <Popup>
            <div style={{ minWidth: 140 }}>
              <strong>{marker.name}</strong>
              {marker.subtitle && (
                <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{marker.subtitle}</div>
              )}
              {marker.href && (
                <Link href={marker.href} style={{ color: '#b8860b', fontSize: 12 }}>
                  View details →
                </Link>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
