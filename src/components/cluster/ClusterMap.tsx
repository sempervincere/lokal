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
        map.addControl(new mapboxgl.default.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

        map.on('load', () => {
          const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: clusters.map((cluster) => ({
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [cluster.anchorLng, cluster.anchorLat] },
              properties: {
                slug: cluster.slug,
                name: cluster.name,
                anchorLabel: cluster.anchorLabel,
                confidenceScore: cluster.confidenceScore,
                status: cluster.status,
                isActive: cluster.status === 'ACTIVE',
              },
            })),
          };

          map.addSource('clusters-points', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'clusters-markers',
            type: 'circle',
            source: 'clusters-points',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 10, 14, 24],
              'circle-color': ['case', ['get', 'isActive'], T.p600, T.g500],
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 8, 2.5, 14, 4],
              'circle-opacity': 0.92,
            },
          });

          map.addLayer({
            id: 'clusters-markers-inner',
            type: 'circle',
            source: 'clusters-points',
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 4, 14, 9],
              'circle-color': '#ffffff',
              'circle-opacity': 0.85,
            },
          });

          map.addLayer({
            id: 'clusters-labels',
            type: 'symbol',
            source: 'clusters-points',
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
              'text-size': ['interpolate', ['linear'], ['zoom'], 8, 11, 14, 15],
              'text-offset': [0, 1.8],
              'text-anchor': 'top',
              'text-allow-overlap': false,
            },
            paint: {
              'text-color': T.g700,
              'text-halo-color': '#ffffff',
              'text-halo-width': 1.5,
            },
          });

          map.on('click', 'clusters-markers', (e) => {
            const feature = e.features?.[0];
            if (!feature) return;
            const props = feature.properties;
            const coords = (feature.geometry as GeoJSON.Point).coordinates;
            const slug = props?.slug;
            const name = props?.name;
            const anchorLabel = props?.anchorLabel;
            const confidenceScore = props?.confidenceScore;
            const status = props?.status;
            const isActive = props?.isActive;

            onClusterClick?.(slug);

            map.flyTo({
              center: [coords[0], coords[1]],
              zoom: 13,
              offset: [120, 0],
              duration: 900,
              essential: true,
            });

            new mapboxgl.default.Popup({ offset: 18, closeButton: true, maxWidth: '280px' })
              .setLngLat([coords[0], coords[1]])
              .setHTML(
                `<div style="font-family:system-ui,sans-serif;padding:4px">` +
                `<div style="font-size:13px;font-weight:800;color:${T.g900};margin-bottom:2px">${name}</div>` +
                `<div style="font-size:11px;color:${T.g500};margin-bottom:10px">${anchorLabel}</div>` +
                `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">` +
                `<div style="background:${T.p100};padding:8px;border-radius:6px;text-align:center">` +
                `<div style="font-size:10px;color:${T.g500};font-weight:600">Confidence</div>` +
                `<div style="font-size:18px;font-weight:800;color:${T.p600}">${confidenceScore}%</div>` +
                `</div>` +
                `<div style="background:${T.c100};padding:8px;border-radius:6px;text-align:center">` +
                `<div style="font-size:10px;color:${T.g500};font-weight:600">Status</div>` +
                `<div style="font-size:12px;font-weight:700;color:${isActive ? T.p600 : T.g500}">${isActive ? 'Aktif' : 'Seeding'}</div>` +
                `</div>` +
                `</div>` +
                `<a href="/clusters/${slug}" style="display:block;text-align:center;padding:8px 14px;background:${T.p600};color:#fff;border-radius:8px;font-weight:700;font-size:12px;text-decoration:none">Lihat Detail →</a>` +
                `</div>`
              )
              .addTo(map);
          });

          map.on('mouseenter', 'clusters-markers', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'clusters-markers', () => {
            map.getCanvas().style.cursor = '';
          });

          new mapboxgl.default.Popup({ closeButton: false, offset: 0, closeOnClick: false })
            .setLngLat([clusters[0]?.anchorLng ?? 106.8315, clusters[0]?.anchorLat ?? -6.3728])
            .setHTML(`<div style="font-size:12px;color:${T.g500};font-family:system-ui;padding:4px 8px;background:rgba(255,255,255,0.9);border-radius:6px">Klik marker untuk lihat detail cluster</div>`)
            .addTo(map);
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
            map.addControl(new mapboxgl.default.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');
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
