'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { MapPlaceholder } from '@/components/ui/MapPlaceholder';

interface ClusterMapProps {
  anchorLat?: number;
  anchorLng?: number;
  anchorLabel?: string;
  radiusKm?: number;
  height?: number;
  showControls?: boolean;

  clusters?: Array<{
    anchorLat: number;
    anchorLng: number;
    anchorLabel: string;
    slug: string;
    name: string;
    confidenceScore: number;
    status: string;
  }>;
  onClusterClick?: (slug: string) => void;
  broadView?: boolean;
}

function buildCircleGeoJson(
  lat: number,
  lng: number,
  radiusKm: number,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const POINTS = 64;
  const coords: [number, number][] = [];
  const earthRadius = 6371;

  for (let i = 0; i <= POINTS; i++) {
    const angle = (i / POINTS) * 2 * Math.PI;
    const dx = (radiusKm / earthRadius) * (180 / Math.PI) / Math.cos((lat * Math.PI) / 180);
    const dy = (radiusKm / earthRadius) * (180 / Math.PI);
    coords.push([lng + dx * Math.cos(angle), lat + dy * Math.sin(angle)]);
  }

  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  };
}

export function ClusterMap({
  anchorLat,
  anchorLng,
  anchorLabel,
  radiusKm = 1.5,
  height = 300,
  showControls = false,
  clusters,
  onClusterClick,
  broadView = false,
}: ClusterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState(false);

  const isBroadView = broadView && clusters && clusters.length > 0;

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapRef.current) {
      setError(true);
      return;
    }

    let map: mapboxgl.Map;

    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = token;

      if (isBroadView && clusters) {
        const avgLat = clusters.reduce((s, c) => s + c.anchorLat, 0) / clusters.length;
        const avgLng = clusters.reduce((s, c) => s + c.anchorLng, 0) / clusters.length;

        map = new mapboxgl.default.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [avgLng || 106.8315, avgLat || -6.3728],
          zoom: 10,
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        map.addControl(new mapboxgl.default.NavigationControl(), 'bottom-right');

        map.on('load', () => {
          clusters.forEach((cluster) => {
            const el = document.createElement('div');
            el.style.cssText = [
              'width:36px', 'height:36px',
              `background:${T.p600}`,
              'border:3px solid #fff',
              'border-radius:50%',
              'box-shadow:0 2px 10px rgba(0,0,0,0.25)',
              'cursor:pointer',
            ].join(';');

            const popup = new mapboxgl.default.Popup({ offset: 22, closeButton: false })
              .setHTML(
                `<div style="font-size:13px;font-weight:800;color:${T.g900};margin-bottom:4px">${cluster.name}</div>` +
                `<div style="font-size:11px;color:${T.g500};margin-bottom:8px">Confidence: ${cluster.confidenceScore}%</div>` +
                `<a href="/clusters/${cluster.slug}" style="font-size:12px;color:${T.p600};font-weight:700;text-decoration:none">Lihat Cluster →</a>`
              );

            const marker = new mapboxgl.default.Marker({ element: el })
              .setLngLat([cluster.anchorLng, cluster.anchorLat])
              .setPopup(popup)
              .addTo(map);

            el.addEventListener('click', () => {
              onClusterClick?.(cluster.slug);
              map.flyTo({ center: [cluster.anchorLng, cluster.anchorLat], zoom: 13, duration: 800 });
              marker.togglePopup();
            });
          });
        });

        map.on('error', () => setError(true));
      } else if (anchorLat != null && anchorLng != null) {
        map = new mapboxgl.default.Map({
          container: mapRef.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [anchorLng, anchorLat],
          zoom: 14,
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        map.on('load', () => {
          map.addSource('catchment', {
            type: 'geojson',
            data: buildCircleGeoJson(anchorLat, anchorLng, radiusKm),
          });

          map.addLayer({
            id: 'catchment-fill',
            type: 'fill',
            source: 'catchment',
            paint: {
              'fill-color': T.p600,
              'fill-opacity': 0.12,
            },
          });

          map.addLayer({
            id: 'catchment-border',
            type: 'line',
            source: 'catchment',
            paint: {
              'line-color': T.p600,
              'line-width': 2,
              'line-dasharray': [4, 3],
            },
          });

          const el = document.createElement('div');
          el.style.cssText = [
            'width:32px', 'height:32px',
            `background:${T.p600}`,
            'border:3px solid #fff',
            'border-radius:50%',
            'box-shadow:0 2px 8px rgba(0,0,0,0.3)',
            'cursor:pointer',
          ].join(';');

          new mapboxgl.default.Marker({ element: el })
            .setLngLat([anchorLng, anchorLat])
            .setPopup(
              new mapboxgl.default.Popup({ offset: 20 }).setHTML(
                `<div style="font-size:13px;font-weight:700;color:${T.g900}">${anchorLabel ?? ''}</div>` +
                `<div style="font-size:11px;color:${T.g500};margin-top:2px">Radius: ${radiusKm}km catchment</div>`
              )
            )
            .addTo(map);

          if (showControls) {
            map.addControl(new mapboxgl.default.NavigationControl(), 'bottom-right');
          }
        });

        map.on('error', () => setError(true));
      } else {
        setError(true);
        return;
      }
    }).catch(() => setError(true));

    return () => {
      map?.remove();
      mapInstanceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorLat, anchorLng, isBroadView]);

  if (error) {
    return (
      <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
        <MapPlaceholder height={height} label={anchorLabel ?? 'Map'} />
        {anchorLabel && (
          <div style={{
            position: 'absolute',
            bottom: 10, left: 10,
            background: 'rgba(255,255,255,0.9)',
            borderRadius: 6, padding: '4px 10px',
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 11, color: T.g500,
          }}>
            <MapPin size={11} />
            {anchorLabel}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', height, position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {!isBroadView && (
        <div style={{
          position: 'absolute',
          top: 10, left: 10,
          background: 'rgba(255,255,255,0.92)',
          borderRadius: 8, padding: '5px 10px',
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 600, color: T.g900,
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}>
          <div style={{ width: 10, height: 10, background: T.p600, borderRadius: '50%', opacity: 0.7 }} />
          {radiusKm}km radius
        </div>
      )}
    </div>
  );
}
