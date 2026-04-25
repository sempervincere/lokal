// src/types/report.ts

export interface ReportSection {
  title: string;
  summary: string;
  keyPoints: string[];
  data?: Record<string, unknown>;
}

export interface RiskItem {
  item: string;           // e.g. "Signature Matcha Latte"
  price: number;          // e.g. 50000
  ceiling: number;        // e.g. 28000
  percentAbove: number;   // e.g. 79
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;        // Full flag text for UI display
}

export interface ScenarioItem {
  label: string;          // e.g. "Conservative"
  dailyTransactions: number;
  avgPrice: number;
  monthlyGross: number;
  breakEvenMonths: number;
}

export interface PricingSection extends ReportSection {
  riskFlags: RiskItem[];         // REQUIRED — demo hero moment
  priceSweet: { min: number; max: number };
  priceCeiling: number;
}

export interface ReportSections {
  section1: ReportSection;   // Executive Cluster Summary
  section2: ReportSection;   // Customer Profile
  section3: ReportSection;   // Market Sizing
  section4: ReportSection;   // Competitive Landscape
  section5: ReportSection;   // Location Intelligence
  section6: PricingSection;  // Pricing Strategy ← hero section
  section7: ReportSection;   // Product-Market Fit Simulation
  section8: ReportSection;   // Go-to-Market Playbook
  section9: ReportSection;   // Risk Register
  section10: ReportSection;  // Financial Scenario Modeling
}
