// src/types/session.ts
import type { SessionStatus, ReportStatus } from '@prisma/client';
import { ReportSection, PricingSection } from './report';

export type { SessionStatus, ReportStatus };

export interface MenuItem {
  name: string;
  price: number;       // in Rupiah (e.g. 28000)
  description?: string;
  category?: string;
}

export interface ConceptFormData {
  fbSubcategory: string;    // e.g. "Café/Coffee Shop"
  conceptName: string;
  conceptDescription: string;
  targetCustomer: string;
  specificQuestions?: string;
  menuItems: MenuItem[];
}

export interface SessionWithRelations {
  id: string;
  userId: string;
  clusterId: string;
  status: SessionStatus;
  amountIdrx: number;
  solTxSignature?: string | null;
  freeMessageCount: number;
  activatedAt?: Date | null;
  expiresAt?: Date | null;
  createdAt: Date;
  conceptForm?: ConceptFormData | null;
  report?: {
    id: string;
    status: ReportStatus;
    sections?: ReportSections | null;
    pdfUrl?: string | null;
    errorMessage?: string | null;
  } | null;
}

export interface ReportSections {
  section1: ReportSection;
  section2: ReportSection;
  section3: ReportSection;
  section4: ReportSection;
  section5: ReportSection;
  section6: PricingSection;    // special — has riskFlags
  section7: ReportSection;
  section8: ReportSection;
  section9: ReportSection;
  section10: ReportSection;
}
