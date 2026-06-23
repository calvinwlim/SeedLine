'use client';

import dynamic from 'next/dynamic';
import { cn } from '../../lib/cn';
import type { MapMarker } from './leaflet-map';

export type { MapMarker } from './leaflet-map';

// Leaflet touches `window`, so it must only load on the client.
const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-muted">
      Loading map…
    </div>
  );
}

/**
 * Reusable map surface. Pass one marker for a venue/academy location, or many
 * to plot a directory of events. The wrapper owns the rounded frame and height.
 */
export function MapView({
  markers,
  className,
  height = 'h-72',
}: {
  markers: MapMarker[];
  className?: string;
  height?: string;
}) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-white/10', height, className)}>
      <LeafletMap markers={markers} />
    </div>
  );
}
