// src/lib/constants/survey-fields.ts

/**
 * Survey field definitions with friendly copywriting for respondents.
 * These 15 fields are filled by respondents via the survey form.
 * The remaining 5 fields (M1, M4, M5, C2, C5) are filled directly by CO.
 */

export type FieldType = 
  | 'select' 
  | 'multi_select' 
  | 'scale' 
  | 'text' 
  | 'text_list' 
  | 'category_prices';

export interface SurveyFieldOption {
  value: string;
  label: string;
}

export interface SurveyFieldDefinition {
  code: string;
  category: string;
  categoryLabel: string;
  question: string;
  description?: string;
  type: FieldType;
  options?: SurveyFieldOption[];
  min?: number;
  max?: number;
  labels?: [string, string]; // For scale: [min_label, max_label]
  placeholder?: string;
  maxItems?: number; // For text_list
  required: boolean;
}

// ─── FIELD CATEGORIES ──────────────────────────────────────

export const SURVEY_CATEGORIES = [
  { id: 'DEMOGRAPHIC', label: 'Data Diri', icon: '👤', description: 'Ceritain sedikit tentang kamu' },
  { id: 'BEHAVIOURAL', label: 'Kebiasaan', icon: '🛒', description: 'Gimana sih kebiasaan makan/minum kamu?' },
  { id: 'MARKET', label: 'Pasar', icon: '🏪', description: 'Soal harga dan tempat favorit kamu' },
  { id: 'MARKET_SIGNAL', label: 'Sinyal Pasar', icon: '📊', description: 'Pengamatan kamu tentang area ini' },
  { id: 'CULTURAL', label: 'Budaya & Akses', icon: '🎯', description: 'Soal selera dan akses ke area ini' },
] as const;

// ─── SURVEY FIELDS (15 fields for respondents) ─────────────

export const SURVEY_FIELDS: SurveyFieldDefinition[] = [
  // ═══════════════════════════════════════════════════════════
  // DEMOGRAPHIC (D1, D2, D3)
  // ═══════════════════════════════════════════════════════════
  {
    code: 'D1',
    category: 'DEMOGRAPHIC',
    categoryLabel: 'Data Diri',
    question: 'Berapa umur kamu?',
    type: 'select',
    options: [
      { value: '<18', label: 'Di bawah 18 tahun' },
      { value: '18-24', label: '18 - 24 tahun' },
      { value: '25-34', label: '25 - 34 tahun' },
      { value: '35-44', label: '35 - 44 tahun' },
      { value: '45-54', label: '45 - 54 tahun' },
      { value: '55+', label: '55 tahun ke atas' },
    ],
    required: true,
  },
  {
    code: 'D2',
    category: 'DEMOGRAPHIC',
    categoryLabel: 'Data Diri',
    question: 'Kisaran penghasilan bulanan kamu?',
    description: 'Gak perlu angka pasti, cukup kisarannya aja',
    type: 'select',
    options: [
      { value: '<3jt', label: 'Di bawah Rp 3 juta' },
      { value: '3-5jt', label: 'Rp 3 - 5 juta' },
      { value: '5-10jt', label: 'Rp 5 - 10 juta' },
      { value: '10-20jt', label: 'Rp 10 - 20 juta' },
      { value: '>20jt', label: 'Di atas Rp 20 juta' },
    ],
    required: true,
  },
  {
    code: 'D3',
    category: 'DEMOGRAPHIC',
    categoryLabel: 'Data Diri',
    question: 'Pekerjaan utama kamu apa?',
    type: 'select',
    options: [
      { value: 'pelajar', label: 'Pelajar / Mahasiswa' },
      { value: 'karyawan', label: 'Karyawan Swasta' },
      { value: 'pns', label: 'PNS / BUMN' },
      { value: 'wiraswasta', label: 'Wiraswasta' },
      { value: 'freelancer', label: 'Freelancer' },
      { value: 'lainnya', label: 'Lainnya' },
    ],
    required: true,
  },

  // ═══════════════════════════════════════════════════════════
  // BEHAVIOURAL (B1, B2, B3, B4, B5)
  // ═══════════════════════════════════════════════════════════
  {
    code: 'B1',
    category: 'BEHAVIOURAL',
    categoryLabel: 'Kebiasaan',
    question: 'Berapa maksimal yang bersedia kamu bayar untuk makan/minum di area ini?',
    description: 'Tulis perkiraan harga per kategori yang biasa kamu beli',
    type: 'category_prices',
    placeholder: 'Contoh: Kopi Rp 25.000, Makanan Rp 50.000',
    required: true,
  },
  {
    code: 'B2',
    category: 'BEHAVIOURAL',
    categoryLabel: 'Kebiasaan',
    question: 'Seberapa sensitif sih harga untuk kamu?',
    description: 'Skala 1-10, di mana 1 = gak masalah mahal, 10 = harus murah',
    type: 'scale',
    min: 1,
    max: 10,
    labels: ['Santai aja', 'Harus murah'],
    required: true,
  },
  {
    code: 'B3',
    category: 'BEHAVIOURAL',
    categoryLabel: 'Kebiasaan',
    question: 'Kapan biasanya kamu ke area ini?',
    description: 'Bisa pilih lebih dari satu',
    type: 'multi_select',
    options: [
      { value: 'pagi', label: 'Pagi (06.00 - 11.00)' },
      { value: 'siang', label: 'Siang (11.00 - 14.00)' },
      { value: 'sore', label: 'Sore (14.00 - 17.00)' },
      { value: 'malam', label: 'Malam (17.00 - 21.00)' },
      { value: 'larut', label: 'Larut Malam (21.00+)' },
    ],
    required: true,
  },
  {
    code: 'B4',
    category: 'BEHAVIOURAL',
    categoryLabel: 'Kebiasaan',
    question: 'Kamu lebih sering pakai apa buat bayar?',
    type: 'select',
    options: [
      { value: 'cash', label: 'Cash' },
      { value: 'qris', label: 'QRIS' },
      { value: 'ewallet', label: 'E-Wallet (GoPay, OVO, Dana)' },
      { value: 'card', label: 'Kartu Debit / Kartu Kredit' },
      { value: 'transfer', label: 'Transfer Bank' },
    ],
    required: true,
  },
  {
    code: 'B5',
    category: 'BEHAVIOURAL',
    categoryLabel: 'Kebiasaan',
    question: 'Lebih suka makan di tempat atau delivery?',
    type: 'select',
    options: [
      { value: 'dine_in', label: 'Selalu makan di tempat' },
      { value: 'mostly_dine_in', label: 'Biasanya di tempat' },
      { value: 'balanced', label: 'Seimbang aja' },
      { value: 'mostly_delivery', label: 'Biasanya delivery' },
      { value: 'delivery', label: 'Selalu delivery' },
    ],
    required: true,
  },

  // ═══════════════════════════════════════════════════════════
  // MARKET (M2, M3)
  // ═══════════════════════════════════════════════════════════
  {
    code: 'M2',
    category: 'MARKET',
    categoryLabel: 'Pasar',
    question: 'Menurutmu, harga rata-rata untuk kategori ini di area ini berapa?',
    description: 'Pilih kategori dulu, lalu isi harga rata-ratanya',
    type: 'category_prices',
    placeholder: 'Contoh: Kopi Rp 20.000, Makanan Rp 35.000',
    required: true,
  },
  {
    code: 'M3',
    category: 'MARKET',
    categoryLabel: 'Pasar',
    question: 'Sebutin 3-5 tempat makan/minum yang paling sering kamu datangi di area ini',
    description: 'Tulis nama tempatnya aja, gak perlu alamat lengkap',
    type: 'text_list',
    placeholder: 'Contoh: Kopi Kenangan, Warteg Bahari, Indomaret Point',
    maxItems: 5,
    required: true,
  },

  // ═══════════════════════════════════════════════════════════
  // MARKET SIGNALS (MS1, MS2)
  // ═══════════════════════════════════════════════════════════
  {
    code: 'MS1',
    category: 'MARKET_SIGNAL',
    categoryLabel: 'Sinyal Pasar',
    question: 'Menurut pengamatanmu, seberapa ramai area ini?',
    type: 'select',
    options: [
      { value: 'very_quiet', label: 'Sangat Sepi' },
      { value: 'quiet', label: 'Sepi' },
      { value: 'moderate', label: 'Biasa Saja' },
      { value: 'busy', label: 'Ramai' },
      { value: 'very_busy', label: 'Sangat Ramai' },
    ],
    required: true,
  },
  {
    code: 'MS2',
    category: 'MARKET_SIGNAL',
    categoryLabel: 'Sinyal Pasar',
    question: 'Menurutmu, jenis makanan/minuman apa yang kurang di area ini?',
    description: 'Tulis jenis F&B yang menurutmu belum ada atau kurang banyak',
    type: 'text',
    placeholder: 'Contoh: Thai tea, Korean food, jus sehat, dll.',
    required: true,
  },

  // ═══════════════════════════════════════════════════════════
  // CULTURAL (C1, C3, C4)
  // ═══════════════════════════════════════════════════════════
  {
    code: 'C1',
    category: 'CULTURAL',
    categoryLabel: 'Budaya & Akses',
    question: 'Seberapa penting sertifikasi halal untuk kamu?',
    description: 'Skala 1-5, di mana 1 = gak penting, 5 = sangat penting',
    type: 'scale',
    min: 1,
    max: 5,
    labels: ['Gak penting', 'Sangat penting'],
    required: true,
  },
  {
    code: 'C3',
    category: 'CULTURAL',
    categoryLabel: 'Budaya & Akses',
    question: 'Biasanya makan di luar untuk acara apa?',
    description: 'Bisa pilih lebih dari satu',
    type: 'multi_select',
    options: [
      { value: 'sarapan', label: 'Sarapan' },
      { value: 'makan_siang', label: 'Makan Siang' },
      { value: 'makan_malam', label: 'Makan Malam' },
      { value: 'nongkrong', label: 'Nongkrong / Kumpul' },
      { value: 'kencan', label: 'Kencan' },
      { value: 'meeting', label: 'Meeting Bisnis' },
    ],
    required: true,
  },
  {
    code: 'C4',
    category: 'CULTURAL',
    categoryLabel: 'Budaya & Akses',
    question: 'Gimana akses transportasi ke area ini?',
    description: 'Pilih yang paling menggambarkan kondisi kamu',
    type: 'select',
    options: [
      { value: 'walking', label: 'Jalan Kaki' },
      { value: 'motorcycle', label: 'Motor' },
      { value: 'car', label: 'Mobil' },
      { value: 'public_transport', label: 'Transportasi Umum' },
      { value: 'mixed', label: 'Campuran (beberapa cara)' },
    ],
    required: true,
  },
];

// ─── BULK ACCEPT FIELDS ──────────────────────────────────────
// These fields can be bulk-accepted by CO (accept all pending responses at once)

export const BULK_ACCEPT_FIELD_CODES = ['D1', 'D2', 'D3', 'B2', 'B4', 'B5', 'C1', 'C3'] as const;

// ─── HELPER FUNCTIONS ─────────────────────────────────────────

/**
 * Get survey field definition by code
 */
export function getSurveyFieldByCode(code: string): SurveyFieldDefinition | undefined {
  return SURVEY_FIELDS.find(f => f.code === code);
}

/**
 * Get all survey field codes
 */
export function getSurveyFieldCodes(): string[] {
  return SURVEY_FIELDS.map(f => f.code);
}

/**
 * Get fields by category
 */
export function getSurveyFieldsByCategory(category: string): SurveyFieldDefinition[] {
  return SURVEY_FIELDS.filter(f => f.category === category);
}

/**
 * Check if a field supports bulk accept
 */
export function isBulkAcceptField(fieldCode: string): boolean {
  return (BULK_ACCEPT_FIELD_CODES as readonly string[]).includes(fieldCode);
}

/**
 * Get all survey categories with their fields
 */
export function getSurveyCategoriesWithFields() {
  return SURVEY_CATEGORIES.map(cat => ({
    ...cat,
    fields: SURVEY_FIELDS.filter(f => f.category === cat.id),
  }));
}

// ─── F&B CATEGORIES FOR PRICE FIELDS ──────────────────────────

export const FB_CATEGORIES = [
  { value: 'kopi', label: 'Kopi', icon: '☕' },
  { value: 'teh', label: 'Teh', icon: '🍵' },
  { value: 'jus', label: 'Jus / Minuman Sehat', icon: '🥤' },
  { value: 'makanan_berat', label: 'Makanan Berat', icon: '🍚' },
  { value: 'makanan_ringan', label: 'Makanan Ringan / Snack', icon: '🍿' },
  { value: 'dessert', label: 'Dessert / Kue', icon: '🍰' },
  { value: 'fast_food', label: 'Fast Food', icon: '🍔' },
  { value: 'bakso_mi', label: 'Bakso / Mie', icon: '🍜' },
  { value: 'sate_grill', label: 'Sate / Grill', icon: '🍢' },
  { value: 'seafood', label: 'Seafood', icon: '🦐' },
] as const;
