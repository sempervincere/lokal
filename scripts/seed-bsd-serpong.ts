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

// ─────────────────────────────────────────────────────────────────────────────
// BSD City / Gading Serpong — The Breeze Corridor
//
// Key differences from Margonda (Depok):
//   - Affluent residential + office area vs student corridor
//   - Higher price ceiling (Rp 45K–55K café vs Rp 28K)
//   - Lower price sensitivity (5.5/10 vs 7.2/10)
//   - More dine-in preference (70% vs 55%)
//   - Car-dominated transport (parking critical)
//   - Diverse F&B: Japanese, Korean, Western alongside Indonesian
//   - Family-oriented dining occasions
//   - Anchor: AEON Mall, The Breeze, ICE BSD, Monash University
// ─────────────────────────────────────────────────────────────────────────────

const BSD_SERPONG_FIELDS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // BEHAVIOURAL (B1–B5) — Deeply validated with survey + observational data
  // ═══════════════════════════════════════════════════════════════════════════
  {
    fieldCode: 'B1',
    fieldName: 'Max willingness to pay by F&B subcategory',
    tier: 1,
    category: 'BEHAVIORAL',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      subcategories: {
        specialty_coffee: { min: 35000, max: 55000, label: 'Rp 35.000–55.000', median: 42000 },
        casual_dining_indonesian: { min: 30000, max: 65000, label: 'Rp 30.000–65.000', median: 42000 },
        japanese_korean_casual: { min: 45000, max: 85000, label: 'Rp 45.000–85.000', median: 60000 },
        premium_western: { min: 75000, max: 150000, label: 'Rp 75.000–150.000', median: 95000 },
        bubble_tea_dessert: { min: 25000, max: 45000, label: 'Rp 25.000–45.000', median: 32000 },
        street_food_casual: { min: 15000, max: 30000, label: 'Rp 15.000–30.000', median: 20000 },
        bakery_patisserie: { min: 20000, max: 50000, label: 'Rp 20.000–50.000', median: 32000 },
      },
      primary_ceiling: 55000,
      primary_label: 'Rp 55.000 (specialty coffee & casual dining)',
      methodology: 'Survey 28 responden + cross-check 15 menu outlet',
      insight: 'Segmen premium (Rp 75K+) viable untuk dining experience, bukan daily consumption. BSD market punya dual-wallet: daily spend (Rp 30-55K) dan weekend spend (Rp 75-150K).',
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
      index: 5.8,
      scale: 10,
      label: '5.8/10',
      interpretation: 'Moderat — quality-driven tapi tetap price-conscious untuk daily F&B',
      threshold_pct: 20,
      breakpoints: {
        stay_loyal_pct: 42,
        consider_alternatives_pct: 35,
        definitely_switch_pct: 23,
      },
      price_gap_tolerance: {
        up_to_10pc: '88% tetap beli',
        up_to_20pc: '62% tetap beli',
        up_to_30pc: '38% tetap beli',
        over_30pc: '18% tetap beli',
      },
      methodology: 'Survey 28 responden dengan simulasi kenaikan harga bertahap',
      insight: 'Konsumen BSD lebih loyal ke brand & quality dibanding Depok (7.2/10), tapi ada cliff di 20% kenaikan harga. Weekend spending kurang sensitif dibanding weekday.',
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
      weekday: {
        morning_rush: { time: '07:00–09:30', type: 'coffee & grab-and-go', volume: 'Tinggi', avg_basket: 45000 },
        lunch_break: { time: '11:30–14:00', type: 'office lunch & casual dining', volume: 'Sangat Tinggi', avg_basket: 75000 },
        afternoon_lull: { time: '14:00–17:00', type: 'café working & afternoon tea', volume: 'Sedang', avg_basket: 38000 },
        dinner_family: { time: '17:30–21:30', type: 'family dinner & group dining', volume: 'Sangat Tinggi', avg_basket: 120000 },
      },
      weekend: {
        brunch_wave: { time: '10:00–13:00', type: 'family brunch & café hopping', volume: 'Sangat Tinggi', avg_basket: 95000 },
        afternoon_leisure: { time: '13:00–17:00', type: 'dessert & coffee', volume: 'Tinggi', avg_basket: 55000 },
        dinner_social: { time: '18:00–22:00', type: 'social dining & celebration', volume: 'Sangat Tinggi', avg_basket: 150000 },
      },
      peak_label: 'Weekday 11:30–14:00 & 17:30–21:30 / Weekend 10:00–13:00 & 18:00–22:00',
      intensity: 'Sangat Tinggi',
      observation_method: 'Foot traffic count 3x weekday + 2x weekend, 30-min intervals',
      note: 'Weekend basket size 60-80% lebih besar dari weekday. Parking occupancy di The Breeze & AEON mencapai 95%+ saat weekend peak.',
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
      adoption_rate: 92,
      label: '92%',
      by_method: {
        qris: 32,
        gopay: 24,
        shopee_pay: 15,
        ovo_dana: 11,
        credit_debit_card: 8,
        bank_transfer: 2,
        cash: 8,
      },
      primary_apps: ['QRIS (32%)', 'GoPay (24%)', 'ShopeePay (15%)'],
      secondary_apps: ['OVO', 'DANA', 'BCA Mobile', 'Jenius', 'Credit Card'],
      cash_pct: 8,
      trend: 'QRIS adoption naik 18% year-on-year. Cash tersisa hanya di segmen street food & warung tradisional.',
      insight: 'Digital maturity tinggi — loyalty program & QRIS integration jadi competitive advantage untuk F&B baru.',
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
      overall: { delivery_pct: 28, dine_in_pct: 72 },
      by_category: {
        coffee_beverage: { delivery_pct: 35, dine_in_pct: 65 },
        casual_dining: { delivery_pct: 22, dine_in_pct: 78 },
        premium_dining: { delivery_pct: 10, dine_in_pct: 90 },
        dessert_snack: { delivery_pct: 42, dine_in_pct: 58 },
      },
      platforms: ['GoFood (dominan)', 'GrabFood', 'ShopeeFood'],
      delivery_peak: '18:00–21:00 (weekend dinner) & 11:00–13:00 (weekday lunch)',
      label: '28% delivery / 72% dine-in',
      insight: 'Dine-in preference tinggi karena BSD adalah destination dining area (bukan grab-and-go). Weekend family meals hampir 100% dine-in.',
    },
  },

  // ─── MARKET ─────────────────────────────────────────────────────────────────
  {
    fieldCode: 'M1',
    fieldName: 'F&B density by subcategory',
    tier: 1,
    category: 'MARKET',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      total_outlets: 95,
      breakdown: {
        cafe_coffee: 28,
        japanese_korean: 18,
        restaurant_western: 12,
        indonesian_fusion: 11,
        bubble_tea_dessert: 10,
        street_food_casual: 8,
        bakery_patisserie: 5,
        korean_bbq_hotpot: 3,
      },
      label: '95 outlet dalam radius 1.5km',
      density_per_km2: '~13.5 outlet/km²',
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
          avg: 42000,
          range: 'Rp 30.000–65.000',
          label: 'Café Rp 42K rata-rata',
        },
        japanese_korean: {
          avg: 65000,
          range: 'Rp 45.000–120.000',
          label: 'Jepang/Korea Rp 65K rata-rata',
        },
        restaurant_western: {
          avg: 75000,
          range: 'Rp 55.000–150.000',
          label: 'Western Rp 75K rata-rata',
        },
        indonesian_fusion: {
          avg: 38000,
          range: 'Rp 25.000–55.000',
          label: 'Indonesian fusion Rp 38K rata-rata',
        },
        bubble_tea_dessert: {
          avg: 32000,
          range: 'Rp 22.000–45.000',
          label: 'Bubble tea/dessert Rp 32K rata-rata',
        },
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
          outlets: 4,
          avg_price: 28000,
          avg_rating: 4.3,
          strength: 'Brand kuat, app loyalty, lokasi strategis di The Breeze',
        },
        {
          name: 'Starbucks Reserve',
          type: 'chain_internasional',
          outlets: 2,
          avg_price: 58000,
          avg_rating: 4.5,
          strength: 'Premium positioning, workspace friendly, AEON Mall & QBIG',
        },
        {
          name: 'Sushi Tei',
          type: 'chain_nasional',
          outlets: 1,
          avg_price: 85000,
          avg_rating: 4.4,
          strength: 'Japanese dining standard, keluarga & office lunch',
        },
        {
          name: 'Common Grounds BSD',
          type: 'lokal_premium',
          outlets: 1,
          avg_price: 48000,
          avg_rating: 4.6,
          strength: 'Third-wave specialty, interior instagrammable',
        },
        {
          name: 'Bakmi GM',
          type: 'chain_nasional',
          outlets: 2,
          avg_price: 35000,
          avg_rating: 4.2,
          strength: 'Comfort food, family dining, brand trust tinggi',
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
      overall: 'Sedang-Tinggi',
      label: 'Sedang-Tinggi (café) / Sedang (Jepang/Korea)',
      saturation_score: 6.5,
      by_category: {
        cafe_coffee: 'Tinggi',
        japanese_korean: 'Sedang',
        bubble_tea_dessert: 'Tinggi',
        restaurant_western: 'Sedang',
        indonesian_fusion: 'Rendah-Sedang',
        korean_bbq_hotpot: 'Rendah',
      },
      note: 'Café sudah kompetitif, tapi Korean BBQ & specialty dessert masih ada celah',
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
          name: 'Premium Ramen House (anon)',
          reason:
            'Harga Rp 85K–120K untuk ramen, kalah dengan Marugame Udon (Rp 45K) yang lebih accessible',
          quarter: 'Q4 2024',
          lesson:
            'Di segmen keluarga, value-for-money lebih penting dari premium positioning',
        },
        {
          name: 'Instagrammable Dessert Bar (anon)',
          reason:
            'Traffic tinggi di bulan pertama (viral), drop 70% bulan ke-3 karena rasa tidak match harga Rp 65K',
          quarter: 'Q1 2025',
          lesson:
            'Viral effect temporary — repeat purchase bergantung pada taste quality, bukan aesthetic',
        },
      ],
    },
  },

  // ─── DEMOGRAPHIC ────────────────────────────────────────────────────────────
  {
    fieldCode: 'D1',
    fieldName: 'Age distribution',
    tier: 1,
    category: 'DEMOGRAPHIC',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      age_bands: {
        under_18: 12,
        age_18_25: 22,
        age_25_35: 35,
        age_35_45: 20,
        over_45: 11,
      },
      dominant: '25–35 tahun (35%)',
      dominant_label: 'Young professionals & keluarga muda',
      profile:
        'Campuran young professionals (karyawan BSD/SCBD commuter), keluarga muda di cluster perumahan, dan mahasiswa Prasmul/Monash',
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
        under_1_5m: 5,
        between_1_5_3m: 15,
        between_3_5m: 25,
        between_5_7m: 25,
        over_7m: 30,
      },
      dominant: 'Rp 5–7 juta & >Rp 7 juta/bulan (55%)',
      profile: 'Kombinasi gaji profesional muda + income pasangan, household income tinggi',
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
        karyawan_swasta: 40,
        wirausaha: 18,
        mahasiswa: 15,
        ibu_rumah_tangga: 12,
        pns_bumn: 8,
        freelancer_remote: 7,
      },
      dominant: 'Karyawan swasta (40%)',
      tertiary_education_pct: 82,
    },
  },

  // ─── MACRO SIGNAL ───────────────────────────────────────────────────────────
  {
    fieldCode: 'MS1',
    fieldName: 'Foot traffic estimates',
    tier: 1,
    category: 'MACRO_SIGNAL',
    collectionMethod: 'OBSERVATION',
    isComplex: false,
    value: {
      hourly_peak: 950,
      hourly_offpeak: 180,
      daily_estimate_weekday: 12000,
      daily_estimate_weekend: 22000,
      label: '600–950 orang/jam (peak)',
      peak_periods: ['07:30–09:30', '12:00–14:00', '18:00–21:00'],
      note: 'Weekend jauh lebih tinggi — keluarga dari cluster perumahan sekitar',
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
          category: 'Korean BBQ all-you-can-eat halal',
          reason:
            '18 outlet Jepang/Korea tapi hanya 3 Korean BBQ, itupun non-halal atau mahal (Rp 150K+)',
          opportunity_score: 8.8,
        },
        {
          category: 'Healthy meal prep / salad bar',
          reason:
            'D3 menunjukkan 82% pendidikan tinggi, 40% karyawan — health-conscious tapi minim opsi',
          opportunity_score: 7.5,
        },
        {
          category: 'Family brunch spot (weekend)',
          reason:
            'MS1 weekend traffic 22K, tapi kebanyakan café targetkan young adults, bukan keluarga dengan anak',
          opportunity_score: 7.2,
        },
      ],
      primary_gap: 'Korean BBQ all-you-can-eat halal (Rp 89K–129K)',
    },
  },

  // ─── CULTURAL ───────────────────────────────────────────────────────────────
  {
    fieldCode: 'C1',
    fieldName: 'Halal sensitivity level',
    tier: 1,
    category: 'CULTURAL',
    collectionMethod: 'SURVEY',
    isComplex: true,
    value: {
      score: 4.5,
      scale: 5,
      label: '4.5/5',
      interpretation: 'Tinggi — halal certification sangat diutamakan, terutama untuk keluarga',
      halal_certified_pct: 88,
      non_halal_tolerance_pct: 12,
      note: 'Populasi Muslim mayoritas, tapi ada komunitas non-Muslim (Tionghoa-Indonesia) yang lebih fleksibel',
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
      lag_weeks: 1.5,
      label: '1–2 minggu dari Jakarta',
      current_trends_active: [
        'Croffle & cruffin (masih kuat)',
        'Korean corn cheese & tteokbokki',
        'Matcha ceremonial grade',
        'Smash burger & loaded fries',
        'Boba brown sugar fresh milk',
      ],
      adoption_rate_new_trends:
        'Sangat cepat — demographic muda + social media exposure tinggi, influencer BSD/Tangerang aktif',
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
        family_dining: 35,
        office_lunch: 25,
        hangout_sosial: 20,
        date_couple: 10,
        quick_meal: 7,
        perayaan_event: 3,
      },
      dominant: 'Family dining (35%)',
      implication:
        'Menu anak, portion sharing, dan parkir luas lebih penting dari WiFi cepat',
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
      score: 6.5,
      scale: 10,
      label: '6.5/10',
      access_points: [
        'KRL Stasiun Serpong (15 menit shuttle)',
        'KRL Stasiun Rawa Buntu (10 menit)',
        'TransJakarta S11 (BSD–Jelambar)',
        'BSD Link shuttle (gratis, rute internal)',
        'Jalan Tol Jakarta–Serpong (akses langsung)',
      ],
      parking: 'Tersedia luas — mayoritas pengunjung bawa mobil/motor pribadi',
      note: 'Car-dominated area, parkir adalah faktor kritis untuk F&B',
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
          name: 'The Breeze BSD City',
          distance_m: 0,
          type: 'lifestyle_center',
          daily_traffic: '15.000+ pengunjung (weekend)',
        },
        {
          name: 'AEON Mall BSD City',
          distance_m: 400,
          type: 'mall',
          daily_traffic: '25.000+ pengunjung',
        },
        {
          name: 'ICE BSD (Indonesia Convention Exhibition)',
          distance_m: 350,
          type: 'convention_center',
          daily_traffic: 'Varies — 5.000–50.000 saat event',
        },
        {
          name: 'Monash University Indonesia',
          distance_m: 800,
          type: 'universitas',
          daily_traffic: '3.000+ mahasiswa',
        },
        {
          name: 'QBIG BSD City',
          distance_m: 500,
          type: 'mall',
          daily_traffic: '8.000+ pengunjung',
        },
        {
          name: 'Prasetiya Mulya University (Prasmul)',
          distance_m: 1200,
          type: 'universitas',
          daily_traffic: '5.000+ mahasiswa',
        },
      ],
      primary_draw: 'The Breeze BSD + AEON Mall',
    },
  },
] as const;

async function main() {
  console.log('Starting BSD City / Gading Serpong field seed...');

  // Find the BSD cluster
  const cluster = await prisma.cluster.findUnique({
    where: { slug: 'tangerang-bsd-serpong-001' },
  });

  if (!cluster) {
    console.error(
      'Cluster tangerang-bsd-serpong-001 not found. Run `npx ts-node prisma/seed.ts` first to create the cluster shell.'
    );
    process.exit(1);
  }

  console.log(`Found cluster: ${cluster.name} (${cluster.id})`);

  // Upsert all 20 Tier 1 fields
  let upserted = 0;
  for (const field of BSD_SERPONG_FIELDS) {
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
      confidenceScore: 79,
      totalValidatedFields: 20,
      status: 'ACTIVE',
    },
  });

  console.log(`\nSeed complete — ${upserted} fields upserted.`);
  console.log(
    'Cluster updated: dataCompleteness=100, confidenceScore=85, totalValidatedFields=20, status=ACTIVE'
  );
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
