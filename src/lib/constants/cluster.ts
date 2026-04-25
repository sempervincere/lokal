// src/types/cluster.ts
import type { ClusterStatus, FieldStatus } from '@prisma/client';

export type { ClusterStatus, FieldStatus };

export interface FieldValue {
  id: string;
  fieldCode: string;
  fieldName: string;
  tier: number;
  category: string;
  collectionMethod: string;
  isComplex: boolean;
  value: unknown;
  status: FieldStatus;
  fieldHash?: string | null;
  solTxSignature?: string | null;
  evidenceNote?: string | null;
  validatedAt?: Date | null;
}

export interface ClusterWithFields {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  status: ClusterStatus;
  anchorLat: number;
  anchorLng: number;
  radiusKm: number;
  anchorLabel: string;
  dataCompleteness: number;
  confidenceScore: number;
  totalValidatedFields: number;
  onchainSlug?: string | null;
  createdAt: Date;
  updatedAt: Date;
  fieldValues: FieldValue[];
}

/** Public cluster summary (no raw field values exposed) */
export interface ClusterSummary {
  id: string;
  slug: string;
  name: string;
  status: ClusterStatus;
  anchorLat: number;
  anchorLng: number;
  anchorLabel: string;
  confidenceScore: number;
  dataCompleteness: number;
  totalValidatedFields: number;
}
