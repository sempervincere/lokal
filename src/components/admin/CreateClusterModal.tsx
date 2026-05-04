'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, MapPin, AlertTriangle, Loader2, Navigation } from 'lucide-react';
import { T } from '@/lib/constants/mock-data';
import { Modal } from '@/components/ui/Modal';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ClusterOwner {
  id: string;
  user: {
    fullName: string;
    email: string;
  };
}

interface CreateClusterModalProps {
  open: boolean;
  onClose: () => void;
  owners: ClusterOwner[];
  onSubmit: (body: Record<string, any>) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Default center: Jakarta / Depok area
const DEFAULT_CENTER: [number, number] = [106.8272, -6.3601];
const DEFAULT_ZOOM = 11;

// ─── Fixed input styles (outside component to prevent re-creation) ────────
const inputBaseStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: `1.5px solid ${T.c200}`,
  fontFamily: 'inherit',
  fontSize: 13,
  color: T.g900,
  background: '#fff',
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
};

function FormInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
  required,
  helper,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
  required?: boolean;
  helper?: string;
}) {
  const [focused, setFocused] = useState(false);

  const style: React.CSSProperties = {
    ...inputBaseStyle,
    borderColor: focused ? T.p500 : T.c200,
    boxShadow: focused ? `0 0 0 3px ${T.p100}` : 'none',
  };

  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        step={step}
        style={style}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {helper && (
        <div style={{ fontSize: 10, color: T.g500, marginTop: 3 }}>{helper}</div>
      )}
    </div>
  );
}

function FormTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 10,
        border: `1.5px solid ${focused ? T.p500 : T.c200}`,
        fontFamily: 'inherit',
        fontSize: 13,
        color: T.g900,
        background: '#fff',
        outline: 'none',
        resize: 'vertical',
        lineHeight: 1.5,
        boxShadow: focused ? `0 0 0 3px ${T.p100}` : 'none',
        transition: 'border-color 150ms, box-shadow 150ms',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

// ─── Mapbox Map Component ─────────────────────────────────────────────────
function MapboxPicker({
  onSelect,
  lat,
  lng,
}: {
  onSelect: (lat: number, lng: number, placeName: string) => void;
  lat: string;
  lng: string;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoading(false);

      // If lat/lng already provided, fly there
      const existingLat = parseFloat(lat);
      const existingLng = parseFloat(lng);
      if (!isNaN(existingLat) && !isNaN(existingLng)) {
        map.flyTo({ center: [existingLng, existingLat], zoom: 15 });
        const marker = new mapboxgl.Marker({ color: T.p600 })
          .setLngLat([existingLng, existingLat])
          .addTo(map);
        markerRef.current = marker;
      }
    });

    map.on('click', async (e) => {
      const clickedLng = e.lngLat.lng;
      const clickedLat = e.lngLat.lat;
      handleLocationSelect(clickedLat, clickedLng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  async function handleLocationSelect(selectedLat: number, selectedLng: number) {
    const map = mapRef.current;
    if (!map) return;

    if (markerRef.current) {
      markerRef.current.setLngLat([selectedLng, selectedLat]);
    } else {
      markerRef.current = new mapboxgl.Marker({ color: T.p600 })
        .setLngLat([selectedLng, selectedLat])
        .addTo(map);
    }

    map.flyTo({ center: [selectedLng, selectedLat], zoom: 15 });

    setGeocoding(true);
    let placeName = '';
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${selectedLng},${selectedLat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await res.json();
      if (data.features?.length > 0) {
        placeName = data.features[0].place_name;
      }
    } catch {
      // silent fail
    } finally {
      setGeocoding(false);
    }

    onSelect(selectedLat, selectedLng, placeName);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoError('Browser tidak mendukung geolocation.');
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        handleLocationSelect(lat, lng);
      },
      () => {
        setGeoError('Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 11, color: T.g500 }}>Klik peta untuk memilih lokasi</div>
        <button
          type="button"
          onClick={useCurrentLocation}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            borderRadius: 9999,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 11,
            fontWeight: 600,
            color: T.p600,
            background: T.p100,
            transition: 'all 150ms',
          }}
        >
          <Navigation size={12} />
          📍 Lokasi Saya
        </button>
      </div>
      {geoError && (
        <div style={{ fontSize: 11, color: T.danger, marginBottom: 6 }}>{geoError}</div>
      )}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${T.c200}` }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: 260 }} />
        {mapLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: T.c100,
            }}
          >
            <Loader2 size={24} color={T.p600} style={{ animation: 'lokal-spin 800ms linear infinite' }} />
          </div>
        )}
        {geocoding && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(26,26,26,0.8)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Loader2 size={12} style={{ animation: 'lokal-spin 800ms linear infinite' }} />
            Mendeteksi lokasi...
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Modal Component ─────────────────────────────────────────────────
export function CreateClusterModal({
  open,
  onClose,
  owners,
  onSubmit,
}: CreateClusterModalProps) {
  const [form, setForm] = useState({
    slug: '',
    name: '',
    description: '',
    anchorLat: '',
    anchorLng: '',
    anchorLabel: '',
    ownerId: '',
    initOnChain: false,
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setForm({
      slug: '',
      name: '',
      description: '',
      anchorLat: '',
      anchorLng: '',
      anchorLabel: '',
      ownerId: '',
      initOnChain: false,
    });
    setFormError(null);
    setLoading(false);
  }, []);

  const handleClose = useCallback(() => {
    if (!loading) {
      reset();
      onClose();
    }
  }, [loading, onClose, reset]);

  const updateField = useCallback((key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleMapSelect = useCallback((lat: number, lng: number, placeName: string) => {
    setForm((prev) => ({
      ...prev,
      anchorLat: lat.toFixed(6),
      anchorLng: lng.toFixed(6),
      ...(placeName && !prev.anchorLabel ? { anchorLabel: placeName } : {}),
    }));
  }, []);

  async function handleSubmit() {
    setFormError(null);

    const { slug, name, anchorLat, anchorLng, anchorLabel, ownerId } = form;

    if (!slug || !name || !anchorLat || !anchorLng || !anchorLabel || !ownerId) {
      setFormError('Semua field wajib diisi kecuali deskripsi.');
      return;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setFormError('Slug hanya boleh huruf kecil, angka, dan strip.');
      return;
    }

    const lat = parseFloat(anchorLat);
    const lng = parseFloat(anchorLng);

    if (isNaN(lat) || isNaN(lng)) {
      setFormError('Koordinat harus berupa angka.');
      return;
    }

    setLoading(true);
    await onSubmit({
      slug,
      name,
      description: form.description || undefined,
      anchorLat: lat,
      anchorLng: lng,
      anchorLabel,
      ownerId,
      initOnChain: form.initOnChain,
    });
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={handleClose} title="Buat Cluster Baru" maxWidth={720}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {formError && (
          <div
            style={{
              background: '#FEE2E2',
              border: `1px solid ${T.danger}30`,
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <AlertTriangle size={14} color={T.danger} />
            <span style={{ fontSize: 12, color: T.danger, fontWeight: 600 }}>
              {formError}
            </span>
          </div>
        )}

        {/* Mapbox Map */}
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.g700,
              display: 'block',
              marginBottom: 6,
            }}
          >
            Pilih Lokasi di Peta
          </label>
          <MapboxPicker onSelect={handleMapSelect} lat={form.anchorLat} lng={form.anchorLng} />
        </div>

        {/* Coordinates row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.g700,
                display: 'block',
                marginBottom: 5,
              }}
            >
              Latitude <span style={{ color: T.danger }}>*</span>
            </label>
            <FormInput
              value={form.anchorLat}
              onChange={(v) => updateField('anchorLat', v)}
              placeholder="-6.3601"
              type="number"
              step="any"
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.g700,
                display: 'block',
                marginBottom: 5,
              }}
            >
              Longitude <span style={{ color: T.danger }}>*</span>
            </label>
            <FormInput
              value={form.anchorLng}
              onChange={(v) => updateField('anchorLng', v)}
              placeholder="106.8272"
              type="number"
              step="any"
            />
          </div>
        </div>

        {/* Anchor Label */}
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.g700,
              display: 'block',
              marginBottom: 5,
            }}
          >
            Anchor Label <span style={{ color: T.danger }}>*</span>
          </label>
          <FormInput
            value={form.anchorLabel}
            onChange={(v) => updateField('anchorLabel', v)}
            placeholder="Universitas Indonesia + Margo City Mall"
          />
        </div>

        {/* Slug + Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.g700,
                display: 'block',
                marginBottom: 5,
              }}
            >
              Slug <span style={{ color: T.danger }}>*</span>
            </label>
            <FormInput
              value={form.slug}
              onChange={(v) => updateField('slug', v)}
              placeholder="depok-margonda-001"
              helper="huruf kecil, angka, strip saja"
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: T.g700,
                display: 'block',
                marginBottom: 5,
              }}
            >
              Nama Cluster <span style={{ color: T.danger }}>*</span>
            </label>
            <FormInput
              value={form.name}
              onChange={(v) => updateField('name', v)}
              placeholder="Jalan Margonda"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.g700,
              display: 'block',
              marginBottom: 5,
            }}
          >
            Deskripsi
          </label>
          <FormTextarea
            value={form.description}
            onChange={(v) => updateField('description', v)}
            placeholder="Koridor F&B dari UI Gate sampai Margo City"
          />
        </div>

        {/* Owner */}
        <div>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.g700,
              display: 'block',
              marginBottom: 5,
            }}
          >
            Cluster Owner <span style={{ color: T.danger }}>*</span>
          </label>
          <select
            value={form.ownerId}
            onChange={(e) => updateField('ownerId', e.target.value)}
            style={{
              ...inputBaseStyle,
              cursor: 'pointer',
            }}
          >
            <option value="">Pilih Cluster Owner...</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.user.fullName} ({o.user.email})
              </option>
            ))}
          </select>
        </div>

        {/* On-chain checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
          <input
            type="checkbox"
            id="initOnChain"
            checked={form.initOnChain}
            onChange={(e) => updateField('initOnChain', e.target.checked)}
            style={{ width: 16, height: 16, accentColor: T.p600, cursor: 'pointer' }}
          />
          <label htmlFor="initOnChain" style={{ fontSize: 13, color: T.g700, cursor: 'pointer' }}>
            Inisialisasi on-chain (Opsional — membuat PDA di Solana)
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              padding: '9px 18px',
              borderRadius: 9999,
              border: `1.5px solid ${T.c200}`,
              background: 'transparent',
              color: T.g700,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 22px',
              borderRadius: 9999,
              border: 'none',
              background: loading ? T.p600 + '60' : T.p600,
              color: T.c50,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 150ms',
            }}
          >
            {loading ? 'Membuat...' : 'Buat Cluster'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
