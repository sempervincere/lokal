'use client';

import { createContext, useContext } from 'react';

export interface CoContextValue {
  co: {
    fullName: string;
    coScore: number;
    trustScore: number;
    kycCompleted: boolean;
    email: string;
    nftMintAddress: string | null;
    nftTxSignature: string | null;
    isActive: boolean;
    tier: { tier: number; label: string; shareRate: number; shareIdrx: number; multiplier: number };
  } | null;
  cluster: {
    id: string;
    slug: string;
    name: string;
    anchorLabel: string;
    anchorLat: number;
    anchorLng: number;
    radiusKm: number;
    status: string;
    confidenceScore: number;
    dataCompleteness: number;
    totalValidatedFields: number;
    totalFields: number;
    validatedCount: number;
    pendingCount: number;
    updatedAt: string;
  } | null;
  earningsOverview: { totalIdrx: number; pendingIdrx: number };
  sessionsThisMonth: number;
  revenueShareThisMonth: number;
  recentActivity: Array<{ id: string; type: string; amountIdrx: number; description: string; createdAt: string; isPaid: boolean }>;
}

export const CoContext = createContext<CoContextValue | null>(null);

export function useCoContext() {
  return useContext(CoContext);
}
