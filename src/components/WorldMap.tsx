'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { formatCurrency } from '@/lib/formatters';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  value: number;
  countryCode: string;
}

interface WorldMapProps {
  markers: MapMarker[];
}

// ---------------------------------------------------------------------------
// Color helper: green for high salary, red for low
// ---------------------------------------------------------------------------

function salaryColor(value: number, min: number, max: number): string {
  if (max === min) return '#3b82f6';
  const ratio = (value - min) / (max - min);
  // Interpolate hue from 0 (red) to 120 (green)
  const hue = Math.round(ratio * 120);
  return `hsl(${hue}, 70%, 50%)`;
}

// ---------------------------------------------------------------------------
// Inner Map component (only rendered on client -- requires `window`)
// ---------------------------------------------------------------------------

function WorldMapInner({ markers }: WorldMapProps) {
  // These imports MUST be inside the component body so they are only
  // evaluated on the client where `window` is available.
  /* eslint-disable @typescript-eslint/no-require-imports */
  const {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
  } = require('react-leaflet') as typeof import('react-leaflet');

  // Leaflet CSS is needed at runtime
  require('leaflet/dist/leaflet.css');
  /* eslint-enable @typescript-eslint/no-require-imports */

  const values = markers.map((m) => m.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 1);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom
      className="h-full w-full rounded-2xl"
      style={{ minHeight: 400 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {markers.map((marker) => (
        <CircleMarker
          key={`${marker.countryCode}-${marker.lat}-${marker.lng}`}
          center={[marker.lat, marker.lng]}
          radius={10}
          pathOptions={{
            color: salaryColor(marker.value, minVal, maxVal),
            fillColor: salaryColor(marker.value, minVal, maxVal),
            fillOpacity: 0.7,
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-slate-900">{marker.label}</p>
              <p className="text-slate-600">
                Avg. salary: {formatCurrency(marker.value)}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

// ---------------------------------------------------------------------------
// Dynamic wrapper (SSR disabled -- Leaflet cannot render on the server)
// ---------------------------------------------------------------------------

const WorldMapDynamic: ComponentType<WorldMapProps> = dynamic(
  () => Promise.resolve(WorldMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-[#0f172a]">
        <p className="text-sm text-slate-400">Loading map...</p>
      </div>
    ),
  },
);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export default WorldMapDynamic;

/** Named export for convenience */
export { WorldMapDynamic as WorldMap };
