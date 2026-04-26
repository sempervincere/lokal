import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Pooler URL (port 6543) works in WSL2 — direct URL (port 5432) is IPv6 only
const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!connectionString) {
  console.error('DATABASE_URL is required in .env.local');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// All 20 Tier 1 field definitions for Margonda cluster
const MARGONDA_FIELDS = [
  {
    fieldCode: 'B1',
    fieldName: 'Max willingness to pay by F&B subcategory',
    tier: 1,
    category: 'BEHAVIORAL',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      subcategories: {
        cafe: { min: 22000, max: 28000, label: 'Rp 22.000–28.000' },
        restaurant: { min: 35000, max: 50000, label: 'Rp 35.000–50.000' },
        streetFood: { min: 8000, max: 18000, label: 'Rp 8.000–18.000' },
        bubbleTea: { min: 15000, max: 22000, label: 'Rp 15.000–22.000' },
      },
      primary_ceiling: 28000,
      primary_label: 'Rp 28.000 (café/minuman)',
    },
  },
  {
    fieldCode: 'B2',
    fieldName: 'Price sensitivity index',
    tier: 1,
    category: 'BEHAVIORAL',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      index: 7.2,
      scale: 10,
      label: '7.2/10',
      interpretation:
        'Sangat sensitif — 73% konsumen aktif pindah ke kompetitor jika harga 15% lebih mahal',
      threshold_pct: 15,
    },
  },
  {
    fieldCode: 'B3',
    fieldName: 'Peak hours pattern',
    tier: 1,
    category: 'BEHAVIORAL',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      weekday: [
        '07:00–09:00 (pre-class)',
        '11:30–13:30 (lunch break)',
        '17:00–20:00 (post-class)',
      ],
      weekend: ['10:00–22:00 (steady flow)'],
      peak_label: '11:30–13:30 & 17:00–20:00 (weekday)',
      intensity: 'Sangat Tinggi',
    },
  },
  {
    fieldCode: 'B4',
    fieldName: 'Digital payment adoption rate',
    tier: 1,
    category: 'BEHAVIORAL',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      adoption_rate: 87,
      label: '87%',
      primary_apps: ['GoPay', 'OVO'],
      secondary_apps: ['DANA', 'ShopeePay', 'BNI Mobile'],
      cash_pct: 13,
    },
  },
  {
    fieldCode: 'B5',
    fieldName: 'Delivery vs dine-in preference split',
    tier: 1,
    category: 'BEHAVIORAL',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      delivery_pct: 45,
      dine_in_pct: 55,
      label: '45% delivery / 55% dine-in',
      platforms: ['GoFood', 'ShopeeFood', 'GrabFood'],
      delivery_peak: '11:30–13:00 (lunch delivery spike)',
    },
  },
  {
    fieldCode: 'M1',
    fieldName: 'F&B density by subcategory',
    tier: 1,
    category: 'MARKET',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      total_outlets: 67,
      breakdown: {
        cafe_coffee: 21,
        warung_kopi: 15,
        restaurant: 14,
        bubble_tea: 8,
        cloud_kitchen: 5,
        bakery: 4,
      },
      label: '67 outlet dalam radius 1.5km',
      density_per_km2: '~9.5 outlet/km²',
    },
  },
  {
    fieldCode: 'M2',
    fieldName: 'Average price by F&B subcategory',
    tier: 1,
    category: 'MARKET',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      by_category: {
        cafe_coffee: {
          avg: 22000,
          range: 'Rp 18.000–28.000',
          label: 'Café Rp 22K rata-rata',
        },
        warung_indonesian: {
          avg: 15000,
          range: 'Rp 12.000–22.000',
          label: 'Warung Rp 15K rata-rata',
        },
        bubble_tea: { avg: 20000, range: 'Rp 15.000–25.000' },
        street_food: { avg: 12000, range: 'Rp 8.000–18.000' },
      },
    },
  },
  {
    fieldCode: 'M3',
    fieldName: 'Top 5 local competitors',
    tier: 1,
    category: 'MARKET',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      competitors: [
        {
          name: 'Kopi Kenangan',
          type: 'chain_nasional',
          outlets: 3,
          avg_price: 25000,
          avg_rating: 4.3,
          strength: 'Brand awareness + app loyalty',
        },
        {
          name: 'Fore Coffee',
          type: 'chain_nasional',
          outlets: 1,
          avg_price: 28000,
          avg_rating: 4.4,
          strength: 'Premium positioning, target karyawan',
        },
        {
          name: 'Kopi Tjampur',
          type: 'lokal_kuat',
          outlets: 1,
          avg_price: 22000,
          avg_rating: 4.5,
          strength: 'Loyal regulars, harga accessible',
        },
        {
          name: 'Es Teh Indonesia',
          type: 'chain_nasional',
          outlets: 2,
          avg_price: 10000,
          avg_rating: 4.2,
          strength: 'Harga ultra-murah, volume tinggi',
        },
        {
          name: 'Warung Kopi Mang Udin',
          type: 'lokal',
          outlets: 1,
          avg_price: 12000,
          avg_rating: 4.0,
          strength: 'Sarapan pagi, warung culture',
        },
      ],
    },
  },
  {
    fieldCode: 'M4',
    fieldName: 'Category saturation rating',
    tier: 1,
    category: 'MARKET',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      overall: 'Tinggi',
      label: 'Tinggi (café) / Sedang (resto)',
      saturation_score: 7.8,
      by_category: {
        cafe_coffee: 'Sangat Tinggi',
        bubble_tea: 'Tinggi',
        warung_indonesian: 'Sedang',
        restaurant_formal: 'Rendah-Sedang',
      },
      note: 'Pasar café sudah crowded — diferensiasi kritis',
    },
  },
  {
    fieldCode: 'M5',
    fieldName: 'Recent closure case study',
    tier: 1,
    category: 'MARKET',
    collectionMethod: 'RESEARCH',
    isComplex: false,
    value: {
      cases: [
        {
          name: 'Café Premium (anon)',
          reason:
            'Harga menu Rp 42.000–55.000 melampaui ceiling segmen mahasiswa',
          quarter: 'Q1 2025',
          lesson:
            'Premium pricing tanpa anchor mahasiswa ke kampus lain = fatal',
        },
        {
          name: 'Warung Instagramable (anon)',
          reason: 'Harga naik 35% setelah viral, kehilangan loyal base',
          quarter: 'Q4 2024',
          lesson:
            'Elastisitas harga sangat rendah di segmen ini',
        },
      ],
    },
  },
  {
    fieldCode: 'D1',
    fieldName: 'Age distribution',
    tier: 1,
    category: 'DEMOGRAPHIC',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      age_bands: {
        under_18: 5,
        age_18_25: 65,
        age_25_35: 20,
        age_35_45: 7,
        over_45: 3,
      },
      dominant: '18–25 tahun (65%)',
      dominant_label: 'Mahasiswa aktif',
      profile:
        'Didominasi mahasiswa UI, Gunadarma, dan kampus sekitar Margonda',
    },
  },
  {
    fieldCode: 'D2',
    fieldName: 'Income bracket distribution',
    tier: 1,
    category: 'DEMOGRAPHIC',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      brackets: {
        under_1_5m: 30,
        between_1_5_3m: 40,
        between_3_5m: 20,
        between_5_7m: 7,
        over_7m: 3,
      },
      dominant: 'Rp 1,5–3 juta/bulan (40%)',
      profile: 'Kombinasi uang saku mahasiswa + part-time income',
    },
  },
  {
    fieldCode: 'D3',
    fieldName: 'Primary occupation mix',
    tier: 1,
    category: 'DEMOGRAPHIC',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      mix: {
        mahasiswa: 65,
        karyawan_swasta: 18,
        wirausaha: 8,
        pns: 5,
        lainnya: 4,
      },
      dominant: 'Mahasiswa (65%)',
      tertiary_education_pct: 78,
    },
  },
  {
    fieldCode: 'MS1',
    fieldName: 'Foot traffic estimates',
    tier: 1,
    category: 'MACRO_SIGNAL',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      hourly_peak: 1200,
      hourly_offpeak: 280,
      daily_estimate_weekday: 15000,
      daily_estimate_weekend: 18000,
      label: '800–1.200 orang/jam (peak)',
      peak_periods: ['07:00–09:00', '11:30–14:00', '17:00–21:00'],
    },
  },
  {
    fieldCode: 'MS2',
    fieldName: 'Market gap / underserved category',
    tier: 1,
    category: 'MACRO_SIGNAL',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      gaps: [
        {
          category: 'Specialty coffee lokal harga accessible',
          reason:
            '22+ café tapi hanya 2 specialty lokal di harga Rp 22K–28K',
          opportunity_score: 8.5,
        },
        {
          category: 'Healthy lunch bowl halal',
          reason:
            'D3 menunjukkan 78% pendidikan tinggi, tren healthy eating naik',
          opportunity_score: 7.2,
        },
        {
          category: 'Dessert café malam hari (post-21:00)',
          reason:
            'B3 weekend flow steady sampai 22:00, gap di dessert night scene',
          opportunity_score: 6.8,
        },
      ],
      primary_gap: 'Specialty coffee lokal harga accessible (Rp 22K–28K)',
    },
  },
  {
    fieldCode: 'C1',
    fieldName: 'Halal sensitivity level',
    tier: 1,
    category: 'CULTURAL',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      score: 4.8,
      scale: 5,
      label: '4.8/5',
      interpretation: 'Sangat tinggi — halal certification non-negotiable',
      halal_certified_pct: 92,
      non_halal_tolerance_pct: 8,
      note: 'Populasi Muslim mayoritas, dekat masjid UI',
    },
  },
  {
    fieldCode: 'C2',
    fieldName: 'Trend adoption lag',
    tier: 1,
    category: 'CULTURAL',
    collectionMethod: 'RESEARCH',
    isComplex: false,
    value: {
      lag_weeks: 3.5,
      label: '3–4 minggu dari Jakarta',
      current_trends_active: [
        'Matcha series (brown sugar, ceremonial grade)',
        'Cold brew single origin',
        'Brown sugar milk tea',
      ],
      adoption_rate_new_trends:
        'Cepat jika ada influencer/KOL lokal yang promosi',
    },
  },
  {
    fieldCode: 'C3',
    fieldName: 'Dining occasion split',
    tier: 1,
    category: 'CULTURAL',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      occasions: {
        hangout_sosial: 60,
        quick_meal: 22,
        belajar_kerja: 12,
        meeting: 4,
        perayaan: 2,
      },
      dominant: 'Hangout / sosial (60%)',
      implication:
        'Ambiance dan WiFi lebih penting dari kecepatan service',
    },
  },
  {
    fieldCode: 'C4',
    fieldName: 'Transport access score',
    tier: 1,
    category: 'CULTURAL',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      score: 8.5,
      scale: 10,
      label: '8.5/10',
      access_points: [
        'KRL Stasiun Depok Baru (5 menit jalan)',
        'KRL Stasiun Depok (10 menit)',
        'Angkot 8+ rute melewati koridor',
        'Gojek/Grab sangat aktif',
      ],
      parking: 'Terbatas — mayoritas pengunjung tidak berkendara',
    },
  },
  {
    fieldCode: 'C5',
    fieldName: 'Anchor points within 500m',
    tier: 1,
    category: 'CULTURAL',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      points: [
        {
          name: 'UI Gate (Gerbang Rektorat)',
          distance_m: 150,
          type: 'universitas',
          daily_traffic: '25.000+ mahasiswa aktif',
        },
        {
          name: 'Margo City Mall',
          distance_m: 800,
          type: 'mall',
          daily_traffic: 'Ratusan pengunjung',
        },
        {
          name: 'Stasiun Depok Baru (KRL)',
          distance_m: 1200,
          type: 'transportasi',
          daily_traffic: '30.000+ penumpang/hari',
        },
        {
          name: 'RSUI (RS Universitas Indonesia)',
          distance_m: 600,
          type: 'rumah_sakit',
        },
        {
          name: 'Masjid UI',
          distance_m: 300,
          type: 'ibadah',
          note: 'Peak Jumat + Ramadan',
        },
      ],
      primary_draw: 'Universitas Indonesia',
    },
  },
] as const;

async function main() {
  console.log('Starting Margonda field seed...');

  // Find the Margonda cluster
  const cluster = await prisma.cluster.findUnique({
    where: { slug: 'depok-margonda-001' },
  });

  if (!cluster) {
    console.error(
      'Cluster depok-margonda-001 not found. Run `npx ts-node prisma/seed.ts` first.'
    );
    process.exit(1);
  }

  console.log(`Found cluster: ${cluster.name} (${cluster.id})`);

  // Upsert all 20 Tier 1 fields
  let upserted = 0;
  for (const field of MARGONDA_FIELDS) {
    await prisma.clusterFieldValue.upsert({
      where: {
        clusterId_fieldCode: {
          clusterId: cluster.id,
          fieldCode: field.fieldCode,
        },
      },
      update: {
        value: field.value,
        status: 'VALIDATED',
        validatedAt: new Date(),
      },
      create: {
        clusterId: cluster.id,
        fieldCode: field.fieldCode,
        fieldName: field.fieldName,
        tier: field.tier,
        category: field.category,
        collectionMethod: field.collectionMethod,
        isComplex: field.isComplex,
        value: field.value,
        status: 'VALIDATED',
        validatedAt: new Date(),
      },
    });
    console.log(`  Upserted field ${field.fieldCode}: ${field.fieldName}`);
    upserted++;
  }

  // Update cluster stats
  await prisma.cluster.update({
    where: { id: cluster.id },
    data: {
      dataCompleteness: 100,
      confidenceScore: 87,
      totalValidatedFields: 20,
      status: 'ACTIVE',
    },
  });

  console.log(`\nSeed complete — ${upserted} fields upserted.`);
  console.log(
    'Cluster updated: dataCompleteness=100, confidenceScore=87, totalValidatedFields=20, status=ACTIVE'
  );
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
