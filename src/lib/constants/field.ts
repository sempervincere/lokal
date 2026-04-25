// src/lib/constants/fields.ts

export type FieldCategory = 'BEHAVIORAL' | 'MARKET' | 'DEMOGRAPHIC' | 'MACRO_SIGNAL' | 'CULTURAL';
export type CollectionMethod = 'SURVEY' | 'OBSERVATION' | 'RESEARCH';

export interface FieldDefinition {
  code: string;
  name: string;
  tier: 1 | 2 | 3;
  category: FieldCategory;
  collectionMethod: CollectionMethod;
  isComplex: boolean; // true = survey-based (needs 20+ respondents)
}

export const TIER_1_FIELDS: FieldDefinition[] = [
  // BEHAVIORAL (B1-B5)
  { code: 'B1', name: 'Max willingness to pay by F&B subcategory', tier: 1, category: 'BEHAVIORAL', collectionMethod: 'SURVEY', isComplex: true },
  { code: 'B2', name: 'Price sensitivity index', tier: 1, category: 'BEHAVIORAL', collectionMethod: 'SURVEY', isComplex: true },
  { code: 'B3', name: 'Peak hours pattern', tier: 1, category: 'BEHAVIORAL', collectionMethod: 'OBSERVATION', isComplex: false },
  { code: 'B4', name: 'Digital payment adoption rate', tier: 1, category: 'BEHAVIORAL', collectionMethod: 'SURVEY', isComplex: true },
  { code: 'B5', name: 'Delivery vs dine-in preference split', tier: 1, category: 'BEHAVIORAL', collectionMethod: 'SURVEY', isComplex: true },
  // MARKET (M1-M5)
  { code: 'M1', name: 'F&B density by subcategory', tier: 1, category: 'MARKET', collectionMethod: 'OBSERVATION', isComplex: false },
  { code: 'M2', name: 'Average price by F&B subcategory', tier: 1, category: 'MARKET', collectionMethod: 'OBSERVATION', isComplex: false },
  { code: 'M3', name: 'Top 5 local competitors', tier: 1, category: 'MARKET', collectionMethod: 'OBSERVATION', isComplex: false },
  { code: 'M4', name: 'Category saturation rating', tier: 1, category: 'MARKET', collectionMethod: 'OBSERVATION', isComplex: false },
  { code: 'M5', name: 'Recent closure case study', tier: 1, category: 'MARKET', collectionMethod: 'RESEARCH', isComplex: false },
  // DEMOGRAPHIC (D1-D3)
  { code: 'D1', name: 'Age distribution', tier: 1, category: 'DEMOGRAPHIC', collectionMethod: 'SURVEY', isComplex: true },
  { code: 'D2', name: 'Income bracket distribution', tier: 1, category: 'DEMOGRAPHIC', collectionMethod: 'SURVEY', isComplex: true },
  { code: 'D3', name: 'Primary occupation mix', tier: 1, category: 'DEMOGRAPHIC', collectionMethod: 'SURVEY', isComplex: true },
  // MACRO SIGNAL (MS1-MS2)
  { code: 'MS1', name: 'Foot traffic estimates', tier: 1, category: 'MACRO_SIGNAL', collectionMethod: 'OBSERVATION', isComplex: false },
  { code: 'MS2', name: 'Market gap / underserved category', tier: 1, category: 'MACRO_SIGNAL', collectionMethod: 'OBSERVATION', isComplex: false },
  // CULTURAL (C1-C5)
  { code: 'C1', name: 'Halal sensitivity level', tier: 1, category: 'CULTURAL', collectionMethod: 'SURVEY', isComplex: true },
  { code: 'C2', name: 'Trend adoption lag', tier: 1, category: 'CULTURAL', collectionMethod: 'RESEARCH', isComplex: false },
  { code: 'C3', name: 'Dining occasion split', tier: 1, category: 'CULTURAL', collectionMethod: 'SURVEY', isComplex: true },
  { code: 'C4', name: 'Transport access score', tier: 1, category: 'CULTURAL', collectionMethod: 'OBSERVATION', isComplex: false },
  { code: 'C5', name: 'Anchor points within 500m', tier: 1, category: 'CULTURAL', collectionMethod: 'OBSERVATION', isComplex: false },
];

// Quick lookup: code → definition
export const TIER_1_FIELD_CODES: Record<string, FieldDefinition> = Object.fromEntries(
  TIER_1_FIELDS.map((f) => [f.code, f])
);

// All valid codes as a const array for validation
export const VALID_FIELD_CODES = TIER_1_FIELDS.map((f) => f.code) as string[];
