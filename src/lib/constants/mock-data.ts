// Mock data from design — matches CLUSTERS, MOCK_SESSIONS, REPORT_SECTIONS etc.
// This is seeded Margonda data for the demo.

export const T = {
  p600: '#1B7A65', p500: '#2A9D82', p400: '#5FB8A3', p100: '#E6F3EF',
  e600: '#C17A5F', e500: '#D4917A', e100: '#F5E9E3',
  c50: '#FDFBF7', c100: '#FAF6ED', c200: '#F5F1EC',
  g500: '#6B6560', g700: '#4A4540', g900: '#1A1A1A',
  success: '#2A9D82', warning: '#D4A03D', danger: '#C45B4A', info: '#5B8BA0',
} as const;

export interface ClusterData {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  anchor: string;
  anchorType: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
  freshness: number;
  confidence: number;
  zkPoints: number;
  status: 'Active' | 'Seeding';
  completeness: number;
  categories: string[];
  priceRange: Record<string, string>;
  traffic: string;
  saturation: string;
  coName: string;
  coTier: number;
  coScore: number;
  accent: string;
  iconColor: string;
  keyStats: {
    priceCeiling: number;
    willingness: number;
    digitalPayment: number;
    peakHour: string;
    dominantAge: string;
    halal: number;
  };
  tier1Fields: Array<{
    code: string;
    name: string;
    value: string;
    status: 'VALIDATED' | 'PENDING';
  }>;
}

export const CLUSTERS: ClusterData[] = [
  {
    id: 'depok-margonda-001',
    slug: 'depok-margonda-001',
    name: 'Jalan Margonda',
    subtitle: 'UI Gate — Margo City',
    anchor: 'Universitas Indonesia + Margo City Mall',
    anchorType: 'University + Mall',
    city: 'Depok',
    neighborhood: 'Beji, Depok',
    lat: -6.3601, lng: 106.8272,
    freshness: 23, confidence: 87, zkPoints: 34,
    status: 'Active', completeness: 95,
    categories: ['Café', 'Street Food', 'Restaurant', 'Minuman Spesial'],
    priceRange: { cafe: 'Rp 18K–35K', restaurant: 'Rp 20K–45K', streetfood: 'Rp 8K–25K' },
    traffic: 'Sangat Tinggi', saturation: 'Tinggi',
    coName: 'Rizky F.', coTier: 3, coScore: 78,
    accent: '#E6F3EF', iconColor: '#1B7A65',
    keyStats: {
      priceCeiling: 35000, willingness: 32000, digitalPayment: 87,
      peakHour: '11.00–13.00 & 17.00–20.00', dominantAge: '18–25 tahun (58%)', halal: 4.8,
    },
    tier1Fields: [
      { code: 'B1', name: 'Max willingness to pay', value: 'Rp 28.000–35.000 (café)', status: 'VALIDATED' },
      { code: 'B2', name: 'Price sensitivity index', value: '7.2/10 (sensitif tinggi)', status: 'VALIDATED' },
      { code: 'B3', name: 'Peak hours', value: '11.00–13.00 & 17.00–20.00', status: 'VALIDATED' },
      { code: 'B4', name: 'Digital payment adoption', value: '87% (GoPay + OVO dominan)', status: 'VALIDATED' },
      { code: 'B5', name: 'Delivery vs dine-in', value: '45% delivery / 55% dine-in', status: 'VALIDATED' },
      { code: 'M1', name: 'F&B density', value: '67 outlet dalam 1.5km', status: 'VALIDATED' },
      { code: 'M2', name: 'Avg price by category', value: 'Café Rp 22K, Warung Rp 15K', status: 'VALIDATED' },
      { code: 'M3', name: 'Top 5 competitors', value: 'Kopi Kenangan (3), Fore (1), 12+ lokal', status: 'VALIDATED' },
      { code: 'M4', name: 'Saturation rating', value: 'Tinggi (café), Sedang (resto)', status: 'VALIDATED' },
      { code: 'M5', name: 'Recent closures', value: '2 café tutup Q1 2025 (overpriced)', status: 'VALIDATED' },
      { code: 'D1', name: 'Age distribution', value: '58% < 25th, 30% 25–40, 12% > 40', status: 'VALIDATED' },
      { code: 'D2', name: 'Income bracket', value: '70% Rp 1.5–4M/bln (mahasiswa+part-time)', status: 'VALIDATED' },
      { code: 'D3', name: 'Primary occupation', value: '65% mahasiswa, 22% karyawan', status: 'VALIDATED' },
      { code: 'MS1', name: 'Foot traffic estimates', value: 'Peak: 800–1200 org/jam weekday', status: 'VALIDATED' },
      { code: 'MS2', name: 'Market gap', value: 'Specialty coffee lokal harga accessible', status: 'VALIDATED' },
      { code: 'C1', name: 'Halal sensitivity', value: '4.8/5 (sangat tinggi)', status: 'VALIDATED' },
      { code: 'C2', name: 'Trend adoption lag', value: '3–4 minggu dari Jakarta', status: 'VALIDATED' },
      { code: 'C3', name: 'Dining occasion split', value: '60% hangout, 25% quick meal, 15% other', status: 'VALIDATED' },
      { code: 'C4', name: 'Transport access score', value: '8.5/10 (KRL + angkot + ojol)', status: 'VALIDATED' },
      { code: 'C5', name: 'Anchor points 500m', value: 'UI Gate, Margo City, Stasiun Depok Baru', status: 'VALIDATED' },
    ],
  },
  {
    id: 'jakarta-kemang-001',
    slug: 'jakarta-kemang-001',
    name: 'Kemang',
    subtitle: 'Jalan Kemang Raya',
    anchor: 'Kemang commercial zone',
    anchorType: 'Residential Hub',
    city: 'Jakarta Selatan',
    neighborhood: 'Kemang, Jaksel',
    lat: -6.2607, lng: 106.8146,
    freshness: 8, confidence: 92, zkPoints: 41,
    status: 'Active', completeness: 100,
    categories: ['Café', 'Restaurant', 'Bakery', 'Fine Dining'],
    priceRange: { cafe: 'Rp 45K–90K', restaurant: 'Rp 60K–150K', bakery: 'Rp 35K–80K' },
    traffic: 'Tinggi', saturation: 'Sangat Tinggi',
    coName: 'Amanda P.', coTier: 3, coScore: 91,
    accent: '#EAF3F7', iconColor: '#5B8BA0',
    keyStats: { priceCeiling: 90000, willingness: 75000, digitalPayment: 94, peakHour: '12.00–14.00 & 19.00–22.00', dominantAge: '25–40 tahun (55%)', halal: 3.2 },
    tier1Fields: [],
  },
  {
    id: 'bsd-raya-001',
    slug: 'bsd-raya-001',
    name: 'BSD Raya Utama',
    subtitle: 'Commercial Boulevard',
    anchor: 'BSD City commercial strip',
    anchorType: 'Residential Hub',
    city: 'Tangerang Selatan',
    neighborhood: 'BSD City, Tangsel',
    lat: -6.2977, lng: 106.6522,
    freshness: 15, confidence: 79, zkPoints: 28,
    status: 'Active', completeness: 78,
    categories: ['Café', 'Street Food', 'Specialty Beverage', 'Cloud Kitchen'],
    priceRange: { cafe: 'Rp 25K–55K', streetfood: 'Rp 12K–30K' },
    traffic: 'Sedang–Tinggi', saturation: 'Sedang',
    coName: 'Dimas S.', coTier: 2, coScore: 64,
    accent: '#F5E9E3', iconColor: '#C17A5F',
    keyStats: { priceCeiling: 55000, willingness: 45000, digitalPayment: 91, peakHour: '08.00–10.00 & 12.00–14.00', dominantAge: '25–40 tahun (62%)', halal: 4.5 },
    tier1Fields: [],
  },
  {
    id: 'surabaya-tunjungan-001',
    slug: 'surabaya-tunjungan-001',
    name: 'Tunjungan Plaza',
    subtitle: 'Basuki Rahmat Corridor',
    anchor: 'Tunjungan Plaza + Surabaya Plaza',
    anchorType: 'Mall',
    city: 'Surabaya',
    neighborhood: 'Genteng, Surabaya',
    lat: -7.2575, lng: 112.7383,
    freshness: 31, confidence: 74, zkPoints: 22,
    status: 'Seeding', completeness: 55,
    categories: ['Restaurant', 'Café', 'Bakery'],
    priceRange: { cafe: 'Rp 30K–70K', restaurant: 'Rp 35K–85K' },
    traffic: 'Tinggi', saturation: 'Tinggi',
    coName: 'Nadia R.', coTier: 1, coScore: 45,
    accent: '#FEF9EB', iconColor: '#D4A03D',
    keyStats: { priceCeiling: 70000, willingness: 55000, digitalPayment: 78, peakHour: '12.00–15.00 & 18.00–21.00', dominantAge: '25–45 tahun (58%)', halal: 4.6 },
    tier1Fields: [],
  },
];

export const MOCK_SESSIONS = [
  { id: 's1', cluster: 'Jalan Margonda', concept: 'Matcha Kita — Café Specialty', date: '14 Apr 2025', status: 'Selesai', score: 72, paid: true },
  { id: 's2', cluster: 'BSD Raya Utama', concept: 'Kopi Sore — Mid-range café', date: '9 Apr 2025', status: 'Selesai', score: 68, paid: true },
  { id: 's3', cluster: 'Kemang', concept: 'Eksplorasi awal', date: '2 Apr 2025', status: 'Gratis', score: null, paid: false },
];

export const REPORT_SECTIONS = [
  { id: 1, icon: 'BarChart2', title: 'Executive Cluster Summary', summary: 'Margonda adalah salah satu koridor F&B paling kompetitif di Depok dengan 67+ outlet aktif.', points: ['67 outlet F&B dalam radius 1.5km dari UI Gate', 'Didominasi segmen mahasiswa usia 18–25 tahun (58%)', 'Digital payment adoption 87% — GoPay & OVO dominan', 'Confidence score cluster: 87/100 berdasarkan 34 titik data terverifikasi'] },
  { id: 2, icon: 'Users', title: 'Customer Profile', summary: 'Target pasar utama: mahasiswa dan young professional dengan budget terbatas namun frekuensi tinggi.', points: ['Usia 18–25: 58% populasi aktif (mahasiswa UI, Gunadarma, dll)', 'Income Rp 1.5–4M/bulan (allowance + part-time income)', 'Frekuensi makan di luar: 5–7× per minggu', 'Sangat terpengaruh media sosial (Instagram, TikTok) untuk discovery'] },
  { id: 3, icon: 'DollarSign', title: 'Market Sizing', summary: 'Estimasi pasar harian Rp 180–240 juta. Penetrasi 0.5% = Rp 900K–1.2M gross/hari.', points: ['67 outlet × avg 80 tx/hari × Rp 22K = Rp 117.9M/hari (konservatif)', 'Pertumbuhan YoY cluster: ~12% berdasarkan outlet baru 2024 vs 2023', 'Potensi pasar belum tersentuh: specialty coffee lokal affordable', 'Estimasi capturable market untuk konsep baru: Rp 28–45M/bulan'] },
  { id: 4, icon: 'BarChart2', title: 'Competitive Landscape', summary: '15 café serius, 12 warung kopi, 3 chain nasional. Gap di specialty coffee harga accessible.', points: ['Chain: Kopi Kenangan (3 outlet), Fore Coffee (1), Janji Jiwa (2)', 'Local café terkuat: Kopi Tjampur (Rp 22–32K, 4.5⭐ GMap)', 'Closure analysis Q1 2025: 2 café tutup karena pricing di atas Rp 40K', 'Gap terbuka: single-origin coffee dengan brand story lokal Rp 25–32K'] },
  { id: 5, icon: 'MapPin', title: 'Location Intelligence', summary: 'Tiga zona optimal dalam cluster berdasarkan foot traffic dan ketersediaan komersial.', points: ['Zona A: Depan UI Gate (traffic tertinggi 800–1200 org/jam peak, sewa Rp 20–25jt/bln)', 'Zona B: Jalan Kukusan (traffic sedang, sewa lebih murah Rp 12–15jt/bln, parking available)', 'Zona C: Area Stasiun Depok Baru (commuter traffic, peak pagi & sore)', 'Rekomendasi: Zona B untuk konsep dengan brand story kuat, Zona A untuk high-volume'] },
  { id: 6, icon: 'TrendingDown', title: 'Pricing Strategy', summary: 'Price ceiling café Rp 35K. Sweet spot konversi Rp 22–28K. 2 menu kamu perlu revisi.', points: ['Price ceiling terverifikasi: Rp 35.000 untuk kategori café/minuman', 'Sweet spot maksimal konversi: Rp 22.000–28.000 per produk', 'Signature Matcha Rp 55K: 57% di atas ceiling → risiko kegagalan sangat tinggi', 'Rekomendasi: turunkan ke Rp 28K atau buat versi "mini" Rp 22K'] },
  { id: 7, icon: 'Star', title: 'Product-Market Fit Simulation', summary: 'Fit score 68/100. Konsep kuat, pricing perlu penyesuaian agar menjangkau segmen utama.', points: ['Fit score: 68/100 (Good — perlu penyesuaian harga)', 'Kekuatan: niche specialty coffee belum banyak kompetitor kuat di segmen ini', 'Kelemahan: harga rencana saat ini melampaui kemampuan segmen mahasiswa', 'Rekomendasi segmen primer: young professional & mahasiswa S2/kerja paruh waktu'] },
  { id: 8, icon: 'Sparkles', title: 'Go-to-Market Playbook', summary: 'Strategi launch 3 bulan pertama berbasis data perilaku cluster Margonda.', points: ['Bulan 1: Soft launch dengan promo khusus mahasiswa (student price weekday)', 'Bulan 2: Konten TikTok + Instagram Reels tentang brand story lokal (origin kopi)', 'Bulan 3: Loyalty program via WhatsApp group + stamp card fisik', 'Channel utama: TikTok (discovery), Instagram (brand), GofFood/ShopeeFood (delivery)'] },
  { id: 9, icon: 'AlertTriangle', title: 'Risk Register', summary: '3 risiko utama teridentifikasi. 1 risiko tinggi (pricing), 2 risiko sedang.', points: ['⚠️ TINGGI: Pricing di atas sweet spot → solusi: turunkan atau buat tier harga', '🔶 SEDANG: Saturasi chain nasional → diferensiasi via brand story & kualitas kopi', '🔶 SEDANG: Ketergantungan pada traffic UI → diversifikasi dengan delivery (target 45% mix)', '✅ RENDAH: Digital payment sudah 87% adoption, tidak ada barrier adopsi'] },
  { id: 10, icon: 'DollarSign', title: 'Financial Scenario Modeling', summary: 'Break-even 4–6 bulan asumsi modal Rp 80M dan 50–80 transaksi/hari.', points: ['Skenario konservatif: 50 tx/hari × Rp 25K = Rp 37.5M/bulan gross', 'Skenario moderat: 80 tx/hari × Rp 26K = Rp 62.4M/bulan gross', 'Estimasi COGS 35% + rent Rp 15M + labor Rp 12M = Rp 40.5M/bulan total cost', 'Break-even: bulan ke-4 (konservatif) hingga bulan ke-6 (moderat)'] },
];

export const MENU_ITEMS = [
  { name: 'Matcha Latte', price: 28000, ceiling: 32000, status: 'ok' as const, note: 'Aman — dalam range pasar' },
  { name: 'Signature Matcha', price: 55000, ceiling: 32000, status: 'risk' as const, note: '+72% di atas ceiling — risiko tinggi' },
  { name: 'Iced Americano', price: 22000, ceiling: 30000, status: 'ok' as const, note: 'Aman — sweet spot konversi' },
  { name: 'Matcha Croissant', price: 38000, ceiling: 35000, status: 'warn' as const, note: '+8.5% di atas ceiling — pantau' },
];

export const CO_FIELDS = [
  { code: 'B1', name: 'Max willingness to pay', complex: true, status: 'VALIDATED' as const, value: 'Rp 28K–35K (café)' },
  { code: 'B2', name: 'Price sensitivity index', complex: true, status: 'VALIDATED' as const, value: '7.2/10' },
  { code: 'B3', name: 'Peak hours pattern', complex: false, status: 'VALIDATED' as const, value: '11.00–13.00, 17.00–20.00' },
  { code: 'B4', name: 'Digital payment adoption', complex: true, status: 'VALIDATED' as const, value: '87%' },
  { code: 'B5', name: 'Delivery vs dine-in', complex: true, status: 'VALIDATED' as const, value: '45% / 55%' },
  { code: 'M1', name: 'F&B density', complex: false, status: 'VALIDATED' as const, value: '67 outlet' },
  { code: 'M2', name: 'Avg price by subcategory', complex: false, status: 'VALIDATED' as const, value: 'Café Rp 22K' },
  { code: 'M3', name: 'Top 5 competitors', complex: false, status: 'VALIDATED' as const, value: 'Kopi Kenangan × 3, ...' },
  { code: 'M4', name: 'Category saturation', complex: false, status: 'VALIDATED' as const, value: 'Tinggi (café)' },
  { code: 'M5', name: 'Recent closure case', complex: false, status: 'PENDING' as const, value: '—' },
  { code: 'D1', name: 'Age distribution', complex: true, status: 'VALIDATED' as const, value: '58% < 25th' },
  { code: 'D2', name: 'Income distribution', complex: true, status: 'VALIDATED' as const, value: '70% Rp 1.5–4M' },
  { code: 'D3', name: 'Primary occupation mix', complex: true, status: 'VALIDATED' as const, value: '65% mahasiswa' },
  { code: 'MS1', name: 'Foot traffic estimates', complex: false, status: 'VALIDATED' as const, value: '800–1200/jam peak' },
  { code: 'MS2', name: 'Market gap', complex: false, status: 'PENDING' as const, value: '—' },
  { code: 'C1', name: 'Halal sensitivity', complex: true, status: 'VALIDATED' as const, value: '4.8/5' },
  { code: 'C2', name: 'Trend adoption lag', complex: false, status: 'VALIDATED' as const, value: '3–4 minggu' },
  { code: 'C3', name: 'Dining occasion split', complex: true, status: 'VALIDATED' as const, value: '60% hangout' },
  { code: 'C4', name: 'Transport access score', complex: false, status: 'VALIDATED' as const, value: '8.5/10' },
  { code: 'C5', name: 'Anchor points 500m', complex: false, status: 'VALIDATED' as const, value: 'UI Gate, Margo City, Depok Baru' },
];
