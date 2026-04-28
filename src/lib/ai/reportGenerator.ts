import { prisma } from '@/lib/prisma';
import { callAnthropicSync } from '@/lib/ai/anthropicClient';

interface ConceptFormInput {
  fbSubcategory: string;
  conceptName: string;
  conceptDescription: string;
  targetCustomer: string;
  specificQuestions?: string | null;
  menuItems: Array<{ name: string; price: number; description?: string }>;
}

function buildReportPrompt(
  clusterName: string,
  anchorLabel: string,
  fieldLines: string,
  concept: ConceptFormInput,
): string {
  const menuLines = concept.menuItems.map(
    item => `  - ${item.name}: Rp ${item.price.toLocaleString('id')}${item.description ? ` (${item.description})` : ''}`
  ).join('\n');

  return `Kamu adalah analis bisnis senior LOKAL. Generate laporan simulasi bisnis F&B yang komprehensif berdasarkan data pasar terverifikasi dan konsep yang disubmit.

## Data Pasar Terverifikasi — ${clusterName} (${anchorLabel})
${fieldLines}

## Konsep Bisnis yang Akan Disimulasikan
- Kategori: ${concept.fbSubcategory}
- Nama Konsep: ${concept.conceptName}
- Deskripsi: ${concept.conceptDescription}
- Target Pelanggan: ${concept.targetCustomer}
- Pertanyaan Spesifik: ${concept.specificQuestions || 'Tidak ada'}
- Menu & Harga Rencana:
${menuLines}

## Instruksi Generate Laporan

Hasilkan laporan dalam format JSON dengan tepat 10 section. Setiap section harus SUBSTANTIF dan SPESIFIK untuk konsep ini di cluster ini — bukan generik.

**CRITICAL — Section 6 (Pricing Strategy):**
Untuk setiap item menu, bandingkan harganya dengan price ceiling dari data B1/M2. Jika harga item >30% di atas price ceiling kategorinya:
- Wajib masukkan ke array \`riskFlags\`
- Format: "Item [nama] (Rp [harga]) berada [X]% di atas price ceiling [kategori] di cluster ini (Rp [ceiling]). Risiko konversi sangat tinggi."
- Ini adalah momen kunci laporan — jangan lewatkan satu item pun

Format JSON yang diperlukan:
\`\`\`json
{
  "section1": {
    "title": "Executive Summary",
    "summary": "...",
    "keyPoints": ["...", "...", "..."],
    "data": {}
  },
  "section2": {
    "title": "Profil Pelanggan",
    "summary": "...",
    "keyPoints": ["...", "..."],
    "data": { "ageDistribution": {}, "incomeDistribution": {}, "behavioralInsights": [] }
  },
  "section3": {
    "title": "Market Sizing",
    "summary": "...",
    "keyPoints": ["...", "..."],
    "data": { "footTraffic": "...", "estimatedTAM": "...", "captureRate": "..." }
  },
  "section4": {
    "title": "Competitive Landscape",
    "summary": "...",
    "keyPoints": ["...", "..."],
    "data": { "topCompetitors": [], "saturationLevel": "...", "marketGap": "..." }
  },
  "section5": {
    "title": "Location Intelligence",
    "summary": "...",
    "keyPoints": ["...", "..."],
    "data": { "anchorPoints": [], "accessScore": 0, "footTrafficPattern": "..." }
  },
  "section6": {
    "title": "Strategi Harga",
    "summary": "...",
    "keyPoints": ["...", "..."],
    "riskFlags": [],
    "priceSweet": 0,
    "priceCeiling": 0,
    "data": { "recommendations": [], "pricingRationale": "..." }
  },
  "section7": {
    "title": "Product-Market Fit",
    "summary": "...",
    "keyPoints": ["...", "..."],
    "data": { "fitScore": 0, "fitRationale": "...", "strengthFactors": [], "riskFactors": [] }
  },
  "section8": {
    "title": "Go-to-Market Playbook",
    "summary": "...",
    "keyPoints": ["...", "..."],
    "data": { "launchStrategy": [], "channelRecommendations": [], "quickWins": [] }
  },
  "section9": {
    "title": "Risk Register",
    "summary": "...",
    "keyPoints": ["...", "..."],
    "data": {
      "risks": [
        { "risk": "...", "severity": "HIGH|MED|LOW", "mitigation": "..." }
      ]
    }
  },
  "section10": {
    "title": "Skenario Finansial",
    "summary": "...",
    "keyPoints": ["...", "..."],
    "data": {
      "pessimistic": { "monthlyRevenue": 0, "monthlyProfit": 0, "breakeven": "..." },
      "realistic":   { "monthlyRevenue": 0, "monthlyProfit": 0, "breakeven": "..." },
      "optimistic":  { "monthlyRevenue": 0, "monthlyProfit": 0, "breakeven": "..." }
    }
  }
}
\`\`\`

PENTING:
- Kembalikan HANYA JSON murni, tanpa markdown fence (\`\`\`json), tanpa teks lain
- Gunakan angka Rupiah realistis untuk cluster ini (bukan placeholder)
- section6.riskFlags harus diisi jika ada item menu yang melewati price ceiling
- fitScore di section7 antara 0–100 berdasarkan analisis nyata
- Semua konten dalam Bahasa Indonesia`;
}

export async function generateReport(sessionId: string): Promise<void> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      cluster: {
        include: {
          fieldValues: { where: { status: 'VALIDATED' }, orderBy: { fieldCode: 'asc' } },
          owner: true,
        },
      },
      conceptForm: true,
      report: true,
    },
  });

  if (!session?.conceptForm) {
    throw new Error(`Session ${sessionId} has no concept form`);
  }

  const report = session.report;
  if (!report) throw new Error(`No report record for session ${sessionId}`);

  await prisma.report.update({
    where: { id: report.id },
    data: { status: 'GENERATING' },
  });

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'GENERATING_REPORT' },
  });

  const startTime = Date.now();

  try {
    const fieldLines = session.cluster.fieldValues.map(f => {
      const val = typeof f.value === 'string' ? f.value : JSON.stringify(f.value);
      return `[${f.fieldCode}] ${f.fieldName}: ${val}`;
    }).join('\n');

    const menuItems = (session.conceptForm.menuItems as Array<{ name: string; price: number; description?: string }>);

    const prompt = buildReportPrompt(
      session.cluster.name,
      session.cluster.anchorLabel,
      fieldLines,
      {
        fbSubcategory: session.conceptForm.fbSubcategory,
        conceptName: session.conceptForm.conceptName,
        conceptDescription: session.conceptForm.conceptDescription,
        targetCustomer: session.conceptForm.targetCustomer,
        specificQuestions: session.conceptForm.specificQuestions,
        menuItems,
      },
    );

    let rawContent: string = await callAnthropicSync(
      'You are a senior F&B business analyst. Respond with pure JSON only, no markdown fences.',
      [{ role: 'user', content: prompt }],
      7500,
      0.3,
    );

    // Strip markdown fences if present
    rawContent = rawContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    let sections: Record<string, unknown>;
    try {
      sections = JSON.parse(rawContent);
    } catch {
      // Second attempt: extract JSON object
      const match = rawContent.match(/\{[\s\S]+\}/);
      if (!match) throw new Error('Could not extract JSON from AI response');
      sections = JSON.parse(match[0]);
    }

    const generationTimeMs = Date.now() - startTime;
    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt.getTime() + 12 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.report.update({
        where: { id: report.id },
        data: {
          status: 'COMPLETE',
          sections: sections as never,
          tokensUsed: null,
          generationTimeMs,
          completedAt: new Date(),
        },
      });

      await tx.session.update({
        where: { id: sessionId },
        data: {
          status: 'ACTIVE',
          activatedAt,
          expiresAt,
        },
      });

      // CO earnings: 5% of session price
      if (session.cluster.owner) {
        await tx.coEarning.create({
          data: {
            coId: session.cluster.owner.id,
            type: 'SESSION_SHARE',
            amountIdrx: 20000,
            description: `Revenue share dari sesi ${sessionId} — ${session.cluster.name}`,
            clusterId: session.clusterId,
            sessionId,
          },
        });
      }
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.$transaction([
      prisma.report.update({
        where: { id: report.id },
        data: {
          status: 'FAILED',
          errorMessage: msg,
          generationTimeMs: Date.now() - startTime,
        },
      }),
      prisma.session.update({
        where: { id: sessionId },
        data: { status: 'FAILED' },
      }),
    ]);
    throw err;
  }
}
