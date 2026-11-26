import { jsPDF } from 'jspdf';
import type { AnalysisResult, AttackTechnique, IndicatorSeverity, RiskLevel, ScanType } from '../../shared/types';
import { redactSensitiveData } from './sensitiveDataDetector';

type RgbColor = [number, number, number];

const COLORS = {
  white: [255, 255, 255] as RgbColor,
  navy: [15, 23, 42] as RgbColor, // #0F172A
  navyMid: [30, 41, 59] as RgbColor, // #1E293B
  slateBody: [51, 65, 85] as RgbColor, // #334155
  slateMuted: [100, 116, 139] as RgbColor, // #64748B
  border: [226, 232, 240] as RgbColor, // #E2E8F0
  panelBg: [248, 250, 252] as RgbColor, // #F8FAFC
  cyanDark: [8, 145, 178] as RgbColor, // #0891B2 (print-readable cyan)
  cyanBright: [34, 211, 238] as RgbColor, // #22D3EE
  cyanTint: [236, 254, 255] as RgbColor, // #ECFEFF
  highText: [185, 28, 28] as RgbColor, // #B91C1C
  highBar: [220, 38, 38] as RgbColor, // #DC2626
  highTint: [254, 242, 242] as RgbColor, // #FEF2F2
  medText: [180, 83, 9] as RgbColor, // #B45309
  medBar: [217, 119, 6] as RgbColor, // #D97706
  medTint: [255, 251, 235] as RgbColor, // #FFFBEB
  lowText: [4, 120, 87] as RgbColor, // #047857
  lowBar: [5, 150, 105] as RgbColor, // #059669
  lowTint: [236, 253, 245] as RgbColor, // #ECFDF5
  mutedTint: [241, 245, 249] as RgbColor, // #F1F5F9
};

const SCAN_MODULE_LABELS: Record<ScanType, string> = {
  message: 'Message Scanner',
  url: 'URL Scanner (Static Structural Inspection)',
  screenshot: 'Screenshot Scanner (Multimodal Vision)',
  'job-offer': 'Job Offer Checker',
};

const RISK_THEME: Record<
  RiskLevel,
  { label: string; text: RgbColor; bar: RgbColor; tint: RgbColor }
> = {
  High: {
    label: 'HIGH RISK',
    text: COLORS.highText,
    bar: COLORS.highBar,
    tint: COLORS.highTint,
  },
  Medium: {
    label: 'MEDIUM RISK',
    text: COLORS.medText,
    bar: COLORS.medBar,
    tint: COLORS.medTint,
  },
  Low: {
    label: 'LOW RISK',
    text: COLORS.lowText,
    bar: COLORS.lowBar,
    tint: COLORS.lowTint,
  },
  Inconclusive: {
    label: 'INCONCLUSIVE',
    text: COLORS.slateBody,
    bar: COLORS.slateMuted,
    tint: COLORS.mutedTint,
  },
};

const SEVERITY_THEME: Record<
  IndicatorSeverity | 'none',
  { label: string; text: RgbColor; tint: RgbColor; border: RgbColor }
> = {
  high: {
    label: 'HIGH',
    text: COLORS.highText,
    tint: COLORS.highTint,
    border: [252, 165, 165],
  },
  medium: {
    label: 'MEDIUM',
    text: COLORS.medText,
    tint: COLORS.medTint,
    border: [252, 211, 77],
  },
  low: {
    label: 'LOW',
    text: COLORS.cyanDark,
    tint: COLORS.cyanTint,
    border: [165, 243, 252],
  },
  none: {
    label: 'NOT OBSERVED',
    text: COLORS.slateMuted,
    tint: COLORS.mutedTint,
    border: COLORS.border,
  },
};

/**
 * Generates a unique local report reference ID (e.g., SNT-20261126-A9C4F2)
 * completely offline in the browser with no persistence or server tracking.
 */
export function generateReportReference(isoTimestamp: string): string {
  const dateObj = new Date(isoTimestamp);
  const y = Number.isNaN(dateObj.getTime()) ? new Date().getUTCFullYear() : dateObj.getUTCFullYear();
  const m = String(
    (Number.isNaN(dateObj.getTime()) ? new Date().getUTCMonth() : dateObj.getUTCMonth()) + 1
  ).padStart(2, '0');
  const d = String(
    Number.isNaN(dateObj.getTime()) ? new Date().getUTCDate() : dateObj.getUTCDate()
  ).padStart(2, '0');

  let hex = '';
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(3);
    globalThis.crypto.getRandomValues(bytes);
    hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  } else {
    hex = Math.floor(0x100000 + Math.random() * 0x8fffff)
      .toString(16)
      .toUpperCase();
  }

  return `SNT-${y}${m}${d}-${hex}`;
}

/**
 * Redacts residual sensitive PII, defangs active URLs, and normalizes characters
 * to clean WinAnsi/ASCII so built-in vector PDF Helvetica renders crisply without mojibake.
 */
function sanitizeForPdf(raw: string, redactPii = true): string {
  let text = redactPii ? redactSensitiveData(raw) : raw;

  // Defang any live HTTP/HTTPS links inside evidence text
  text = text.replace(/https?:\/\/([^\s/]+)/gi, (match, host: string) => {
    const scheme = match.toLowerCase().startsWith('https') ? 'hxxps' : 'hxxp';
    return `${scheme}://${host.replace(/\./g, '[.]')}`;
  });

  // Normalize common Unicode punctuation & currency symbols cleanly for Helvetica
  text = text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u2014/g, ' - ')
    .replace(/\u2013/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00B7/g, ' | ')
    .replace(/\u2022/g, '-')
    .replace(/\u20B9/g, 'INR ')
    .replace(/\u20AC/g, 'EUR ')
    .replace(/\u00A3/g, 'GBP ')
    .replace(/\u00A0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, '  ');

  // Replace characters outside standard Latin-1 printable range to prevent garbled glyphs
  const cleaned = text.replace(/[^\x0A\x20-\x7E\xA1-\xFF]/g, '');
  const trimmed = cleaned.replace(/\s{2,}/g, ' ').trim();

  if (!trimmed && raw.trim().length > 0) {
    return '[Original non-Latin script excerpt omitted in PDF; see English explanation]';
  }
  return trimmed;
}

/**
 * Draws the vector Sentra AI shield logo directly into the PDF (crisp at any zoom).
 */
function drawSentraShieldLogo(doc: jsPDF, x: number, y: number, sizeMm: number): void {
  const s = sizeMm / 36;
  const ox = x;
  const oy = y;

  // Outer shield polygon (approximating smooth shield silhouette cleanly with vector lines)
  const shieldPoints: Array<[number, number]> = [
    [18, 2.5],
    [31, 8],
    [31, 17.5],
    [29.4, 23.5],
    [25.6, 28.8],
    [18, 33.8],
    [10.4, 28.8],
    [6.6, 23.5],
    [5, 17.5],
    [5, 8],
  ];

  // Build relative delta vectors for jsPDF.lines()
  const startX = ox + shieldPoints[0][0] * s;
  const startY = oy + shieldPoints[0][1] * s;
  const vectors: number[][] = [];
  for (let i = 1; i < shieldPoints.length; i++) {
    const prev = shieldPoints[i - 1];
    const curr = shieldPoints[i];
    vectors.push([(curr[0] - prev[0]) * s, (curr[1] - prev[1]) * s]);
  }

  doc.setFillColor(...COLORS.navy);
  doc.setDrawColor(...COLORS.cyanBright);
  doc.setLineWidth(0.65);
  doc.lines(vectors, startX, startY, [1, 1], 'FD', true);

  // Subtle inner cyan accent stroke on top half
  doc.setDrawColor(...COLORS.white);
  doc.setLineWidth(0.85);
  doc.setLineCap('round');
  doc.setLineJoin('round');

  // Crisp checkmark inside shield
  const c1x = ox + 13.2 * s;
  const c1y = oy + 18.4 * s;
  const c2x = ox + 16.6 * s;
  const c2y = oy + 21.8 * s;
  const c3x = ox + 23.4 * s;
  const c3y = oy + 14.4 * s;
  doc.line(c1x, c1y, c2x, c2y);
  doc.line(c2x, c2y, c3x, c3y);
}

/**
 * Formats date/time clearly in both local readable form and UTC ISO timestamp.
 */
function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  const formattedLocal = d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const utcShort = d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  return `${formattedLocal} (${utcShort})`;
}

export interface GeneratedPdfReport {
  doc: jsPDF;
  reportReference: string;
  filename: string;
  pageCount: number;
}

/**
 * Builds a complete, vector-rendered, paginated A4 cybersecurity assessment PDF document.
 * Excludes raw unredacted content and sensitive PII by default.
 */
export function buildSecurityAssessmentPdf(result: AnalysisResult): GeneratedPdfReport {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2; // 174mm
  const topSafeY = 22;
  const bottomSafeY = pageHeight - 20;

  const reportReference = generateReportReference(result.analyzedAt);
  const riskTheme = RISK_THEME[result.riskLevel];

  doc.setProperties({
    title: `Sentra AI Security Assessment Report - ${reportReference}`,
    subject: `Digital Safety Assessment (${result.potentialScamCategory})`,
    author: 'Sentra AI — Think Before You Trust.',
    creator: 'Sentra AI Client-Side PDF Generator',
  });

  let y = 16;

  const startNewPage = () => {
    doc.addPage();
    y = topSafeY;
  };

  const ensureSpace = (neededMm: number) => {
    if (y + neededMm > bottomSafeY) {
      startNewPage();
    }
  };

  const drawSectionHeading = (numLabel: string, title: string, subtitle?: string) => {
    const heightNeeded = subtitle ? 16 : 12;
    ensureSpace(heightNeeded + 12);

    // Subtle cyan accent rule on left of section title
    doc.setFillColor(...COLORS.cyanDark);
    doc.rect(marginX, y - 3.6, 2.2, 5.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.cyanDark);
    doc.text(numLabel, marginX + 4.5, y);

    const numW = doc.getTextWidth(numLabel);
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.navy);
    doc.text(title, marginX + 4.5 + numW + 2.5, y);

    y += 2.2;
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, marginX + contentWidth, y);

    if (subtitle) {
      y += 4.3;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.slateMuted);
      const subLines = doc.splitTextToSize(sanitizeForPdf(subtitle, false), contentWidth);
      doc.text(subLines, marginX, y);
      y += subLines.length * 3.8 + 2;
    } else {
      y += 4.5;
    }
  };

  const drawPill = (
    text: string,
    x: number,
    baselineY: number,
    bgColor: RgbColor,
    textColor: RgbColor,
    borderColor?: RgbColor
  ): number => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    const padX = 2.6;
    const w = doc.getTextWidth(text) + padX * 2;
    const h = 4.6;
    doc.setFillColor(...bgColor);
    if (borderColor) {
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.25);
      doc.roundedRect(x, baselineY - 3.4, w, h, 1.1, 1.1, 'FD');
    } else {
      doc.roundedRect(x, baselineY - 3.4, w, h, 1.1, 1.1, 'F');
    }
    doc.setTextColor(...textColor);
    doc.text(text, x + padX, baselineY);
    return w;
  };

  // =========================================================================
  // PAGE 1: TOP ACCENT STRIP + BRAND HEADER + METADATA TABLE
  // =========================================================================
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, 3.5, 'F');
  doc.setFillColor(...COLORS.cyanBright);
  doc.rect(0, 3.5, pageWidth, 1.0, 'F');

  y = 14;
  drawSentraShieldLogo(doc, marginX, y - 2, 12.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...COLORS.navy);
  doc.text('Sentra AI', marginX + 15.5, y + 3.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(...COLORS.cyanDark);
  doc.text('Think Before You Trust.', marginX + 15.5, y + 8.2);

  // Right-aligned document title & reference
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.navy);
  doc.text('CYBERSECURITY RISK ASSESSMENT REPORT', pageWidth - marginX, y + 2.8, {
    align: 'right',
  });

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.slateMuted);
  doc.text(`REF: ${reportReference}`, pageWidth - marginX, y + 8.0, { align: 'right' });

  y += 14.5;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.4);
  doc.line(marginX, y, marginX + contentWidth, y);
  y += 5;

  // Report Metadata Grid
  const metaRows: Array<[string, string, string, string]> = [
    ['Report Reference', reportReference, 'Scanner Module', SCAN_MODULE_LABELS[result.scanType]],
    [
      'Analysis Timestamp',
      formatTimestamp(result.analyzedAt),
      'Potential Category',
      sanitizeForPdf(result.potentialScamCategory, false),
    ],
    [
      'Privacy Handling',
      result.privacyRedacted
        ? 'Privacy Shield redacted; unredacted source excluded'
        : 'Original unredacted content excluded by default',
      'Assessment Basis',
      result.isDemoSample
        ? 'Fictional Demo Sample (Live Gemini AI)'
        : 'Live Gemini AI Heuristic Inspection',
    ],
  ];

  const metaBoxH = 26.5;
  doc.setFillColor(...COLORS.panelBg);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, y, contentWidth, metaBoxH, 2, 2, 'FD');

  const col1X = marginX + 3.5;
  const col2X = marginX + contentWidth / 2 + 2;
  let my = y + 5;

  for (const [l1, v1, l2, v2] of metaRows) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.slateMuted);
    doc.text(l1.toUpperCase(), col1X, my);
    doc.text(l2.toUpperCase(), col2X, my);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(...COLORS.navy);
    const v1Clip = doc.splitTextToSize(v1, contentWidth / 2 - 6)[0] || v1;
    const v2Clip = doc.splitTextToSize(v2, contentWidth / 2 - 6)[0] || v2;
    doc.text(v1Clip, col1X, my + 3.8);
    doc.text(v2Clip, col2X, my + 3.8);
    my += 8.4;
  }

  y += metaBoxH + 6;

  // =========================================================================
  // EXECUTIVE RISK SUMMARY CARD (GAUGE SCORE + CLASSIFICATION + SUMMARY)
  // =========================================================================
  const summaryLines = doc.splitTextToSize(
    sanitizeForPdf(result.summary, true),
    contentWidth - 54
  );
  const execHeight = Math.max(38, 18 + summaryLines.length * 4.3);
  ensureSpace(execHeight + 6);

  doc.setFillColor(...COLORS.white);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.35);
  doc.roundedRect(marginX, y, contentWidth, execHeight, 2.2, 2.2, 'FD');

  // Left score panel
  const scorePanelW = 45;
  doc.setFillColor(...riskTheme.tint);
  doc.roundedRect(marginX + 1.5, y + 1.5, scorePanelW, execHeight - 3, 1.8, 1.8, 'F');

  const scoreCenterX = marginX + 1.5 + scorePanelW / 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLORS.slateMuted);
  doc.text('HEURISTIC RISK INDEX', scoreCenterX, y + 7.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...riskTheme.text);
  const scoreDisplay = result.riskLevel === 'Inconclusive' ? '--' : String(result.heuristicRiskIndex);
  doc.text(scoreDisplay, scoreCenterX, y + 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.slateMuted);
  doc.text('out of 100', scoreCenterX, y + 23.5, { align: 'center' });

  // Classification badge inside left panel
  doc.setFillColor(...riskTheme.bar);
  const badgeW = 34;
  doc.roundedRect(scoreCenterX - badgeW / 2, y + 26.5, badgeW, 5.8, 1.2, 1.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.white);
  doc.text(riskTheme.label, scoreCenterX, y + 30.4, { align: 'center' });

  // Right summary content
  const rightX = marginX + scorePanelW + 6.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.navy);
  doc.text('Executive Assessment Summary', rightX, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.slateBody);
  doc.text(summaryLines, rightX, y + 13.8);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.4);
  doc.setTextColor(...COLORS.slateMuted);
  doc.text(
    'Note: Evidence-based 0-100 rubric score (not a statistically validated fraud probability).',
    rightX,
    y + execHeight - 3.5
  );

  y += execHeight + 8;

  // =========================================================================
  // SECTION 01: FOUR-DIMENSIONAL RISK SCORING BREAKDOWN
  // =========================================================================
  drawSectionHeading(
    '01',
    'Four-Dimensional Risk Scoring Breakdown',
    'Transparent heuristic scoring across four equal 0-25 assessment criteria totaling 0-100.'
  );

  const rubricItems = result.rubricBreakdown.slice(0, 4);
  for (const item of rubricItems) {
    const rationaleText = sanitizeForPdf(item.rationale, true);
    const rationaleLines = doc.splitTextToSize(rationaleText, contentWidth - 10);
    const cardH = 14 + rationaleLines.length * 3.8;
    ensureSpace(cardH + 3.5);

    doc.setFillColor(...COLORS.panelBg);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(marginX, y, contentWidth, cardH, 1.8, 1.8, 'FD');

    const pct = Math.min(1, Math.max(0, item.score / Math.max(1, item.maxScore)));
    const barColor: RgbColor =
      pct >= 0.65 ? COLORS.highBar : pct >= 0.35 ? COLORS.medBar : COLORS.lowBar;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(...COLORS.navy);
    doc.text(sanitizeForPdf(item.factor, false), marginX + 4, y + 5.5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(...barColor);
    doc.text(`${item.score} / ${item.maxScore}`, marginX + contentWidth - 4, y + 5.5, {
      align: 'right',
    });

    // Progress bar track + fill
    const barX = marginX + 4;
    const barY = y + 7.6;
    const barW = contentWidth - 8;
    doc.setFillColor(...COLORS.border);
    doc.roundedRect(barX, barY, barW, 2.1, 0.9, 0.9, 'F');
    if (pct > 0) {
      doc.setFillColor(...barColor);
      doc.roundedRect(barX, barY, Math.max(2, barW * pct), 2.1, 0.9, 0.9, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.3);
    doc.setTextColor(...COLORS.slateBody);
    doc.text(rationaleLines, marginX + 4, y + 13.4);

    y += cardH + 3;
  }

  y += 4;

  // =========================================================================
  // SECTION 02: SCAM MANIPULATION TECHNIQUES
  // =========================================================================
  drawSectionHeading(
    '02',
    'Scam Manipulation Techniques',
    'Evaluation of five common social-engineering tactics with evidence-based reasoning.'
  );

  const techniques: AttackTechnique[] = result.attackBreakdown;
  for (const tech of techniques) {
    const sevKey = tech.detected ? tech.severity : 'none';
    const sev = SEVERITY_THEME[sevKey];
    const reasonLines = doc.splitTextToSize(sanitizeForPdf(tech.reasoning, true), contentWidth - 10);
    const cleanedEv = tech.detected
      ? tech.evidence.map((e) => sanitizeForPdf(e, true)).filter(Boolean)
      : [];
    const evLineText = cleanedEv.length > 0 ? `Citations: ${cleanedEv.map((e) => `"${e}"`).join('  |  ')}` : '';
    const evLines = evLineText ? doc.splitTextToSize(evLineText, contentWidth - 10) : [];

    const rowH = 10 + reasonLines.length * 3.8 + (evLines.length > 0 ? evLines.length * 3.6 + 2.5 : 0);
    ensureSpace(rowH + 3);

    doc.setFillColor(...(tech.detected ? COLORS.white : COLORS.panelBg));
    doc.setDrawColor(...(tech.detected ? sev.border : COLORS.border));
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, y, contentWidth, rowH, 1.6, 1.6, 'FD');

    // Left vertical severity indicator strip
    doc.setFillColor(...(tech.detected ? sev.text : COLORS.border));
    doc.rect(marginX, y + 1.2, 1.4, rowH - 2.4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(...COLORS.navy);
    doc.text(sanitizeForPdf(tech.label, false), marginX + 4.5, y + 5.6);

    // Status pill aligned right
    const badgeLabel = tech.detected ? `DETECTED - ${sev.label}` : 'NOT OBSERVED';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    const pillW = doc.getTextWidth(badgeLabel) + 5.2;
    drawPill(badgeLabel, marginX + contentWidth - 4 - pillW, y + 5.3, sev.tint, sev.text, sev.border);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.3);
    doc.setTextColor(...COLORS.slateBody);
    doc.text(reasonLines, marginX + 4.5, y + 10.5);

    if (evLines.length > 0) {
      const evY = y + 10.5 + reasonLines.length * 3.8 + 1.5;
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.6);
      doc.setTextColor(...COLORS.navyMid);
      doc.text(evLines, marginX + 4.5, evY);
    }

    y += rowH + 2.8;
  }

  y += 4;

  // =========================================================================
  // SECTION 03: DETECTED EVIDENCE & EXPLANATIONS (+ OPTIONAL URL STRUCTURE)
  // =========================================================================
  drawSectionHeading(
    '03',
    'Detected Evidence & Explanations',
    'Only verified warning indicators directly observed in the analyzed item. Sensitive patterns are auto-redacted.'
  );

  // Optional Static URL Structural Breakdown (always defanged, never clickable)
  if (result.structuralUrlAnalysis) {
    const s = result.structuralUrlAnalysis;
    const defangedLines = doc.splitTextToSize(sanitizeForPdf(s.defangedUrl, false), contentWidth - 10);
    const notes = s.structuralNotes.map((n) => `- ${sanitizeForPdf(n, false)}`);
    const noteLines = notes.flatMap((n) => doc.splitTextToSize(n, contentWidth - 10));
    const urlBoxH = 22 + defangedLines.length * 3.8 + noteLines.length * 3.8;
    ensureSpace(urlBoxH + 5);

    doc.setFillColor(...COLORS.cyanTint);
    doc.setDrawColor(165, 243, 252);
    doc.setLineWidth(0.3);
    doc.roundedRect(marginX, y, contentWidth, urlBoxH, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(...COLORS.navy);
    doc.text('Local Static URL Structural Summary (Destination URL Was Not Visited)', marginX + 4, y + 5.5);

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(...COLORS.cyanDark);
    doc.text(defangedLines, marginX + 4, y + 10.5);

    const metaY = y + 11 + defangedLines.length * 3.8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slateBody);
    doc.text(
      `Scheme: ${s.scheme}   |   Hostname: ${sanitizeForPdf(s.hostname || 'N/A', false)}   |   Subdomains: ${s.subdomainCount}   |   Query Params: ${s.queryParamCount}`,
      marginX + 4,
      metaY
    );

    if (noteLines.length > 0) {
      doc.setFontSize(8);
      doc.text(noteLines, marginX + 4, metaY + 5);
    }

    y += urlBoxH + 4;
  }

  if (result.warningSigns.length === 0) {
    ensureSpace(14);
    doc.setFillColor(...COLORS.panelBg);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(marginX, y, contentWidth, 11, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(...COLORS.slateBody);
    doc.text(
      'No strong scam warning indicators were detected in the analyzed submission.',
      marginX + 4,
      y + 6.8
    );
    y += 15;
  } else {
    result.warningSigns.forEach((ws, idx) => {
      const sev = SEVERITY_THEME[ws.severity];
      const safeEvidence = sanitizeForPdf(ws.evidence, true);
      const safeExplain = sanitizeForPdf(ws.explanation, true);

      const evLines = doc.splitTextToSize(`Observed Evidence: "${safeEvidence}"`, contentWidth - 12);
      const exLines = doc.splitTextToSize(safeExplain, contentWidth - 10);
      const cardH = 12 + evLines.length * 3.7 + exLines.length * 3.8 + 4;

      ensureSpace(cardH + 3.5);

      doc.setFillColor(...COLORS.white);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.roundedRect(marginX, y, contentWidth, cardH, 1.8, 1.8, 'FD');

      const numTag = `#${String(idx + 1).padStart(2, '0')}`;
      const pillW = drawPill(sev.label, marginX + 4, y + 5.8, sev.tint, sev.text, sev.border);

      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.slateMuted);
      doc.text(numTag, marginX + 4 + pillW + 2.5, y + 5.8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...COLORS.navy);
      const titleX = marginX + 4 + pillW + 10.5;
      const titleClip = doc.splitTextToSize(
        sanitizeForPdf(ws.title, false),
        marginX + contentWidth - 4 - titleX
      )[0];
      doc.text(titleClip || sanitizeForPdf(ws.title, false), titleX, y + 5.8);

      // Shaded evidence quote box
      const evBoxY = y + 8.5;
      const evBoxH = evLines.length * 3.7 + 3.2;
      doc.setFillColor(...COLORS.panelBg);
      doc.roundedRect(marginX + 4, evBoxY, contentWidth - 8, evBoxH, 1.2, 1.2, 'F');
      doc.setFont('courier', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(...COLORS.navyMid);
      doc.text(evLines, marginX + 6, evBoxY + 3.6);

      // Explanation paragraph
      const exY = evBoxY + evBoxH + 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.4);
      doc.setTextColor(...COLORS.slateBody);
      doc.text(exLines, marginX + 4, exY);

      y += cardH + 3;
    });
  }

  // Verified Suspicious Phrases table if present
  if (result.highlightedPhrases.length > 0) {
    ensureSpace(16);
    y += 1.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(...COLORS.navy);
    doc.text('Verified Flagged Phrases (Excerpted & Sanitized)', marginX, y);
    y += 4.5;

    result.highlightedPhrases.forEach((hp) => {
      const sev = SEVERITY_THEME[hp.severity];
      const safePhrase = sanitizeForPdf(hp.phrase, true);
      const safeExpl = sanitizeForPdf(hp.explanation, true);
      const textLines = doc.splitTextToSize(`"${safePhrase}"  -  ${safeExpl}`, contentWidth - 22);
      const rowH = Math.max(7.5, textLines.length * 3.7 + 3);
      ensureSpace(rowH + 2);

      drawPill(sev.label, marginX, y + 3.4, sev.tint, sev.text, sev.border);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(...COLORS.slateBody);
      doc.text(textLines, marginX + 18, y + 3.4);

      y += rowH + 1.2;
    });
  }

  y += 4;

  // =========================================================================
  // SECTION 04: PRIORITIZED SAFETY ACTION PLAN
  // =========================================================================
  drawSectionHeading(
    '04',
    'Prioritized Safety Action Plan',
    'Immediate containment steps followed by urgent recovery guidance if funds or data were already shared.'
  );

  const renderNumberedBlock = (
    blockTitle: string,
    items: string[],
    accentColor: RgbColor,
    bgTint: RgbColor,
    borderTint: RgbColor
  ) => {
    ensureSpace(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(...accentColor);
    doc.text(blockTitle, marginX, y);
    y += 4.2;

    items.forEach((step, idx) => {
      const safeStep = sanitizeForPdf(step, false);
      const lines = doc.splitTextToSize(safeStep, contentWidth - 15);
      const itemH = lines.length * 3.9 + 4;
      ensureSpace(itemH + 2);

      doc.setFillColor(...bgTint);
      doc.setDrawColor(...borderTint);
      doc.setLineWidth(0.25);
      doc.roundedRect(marginX, y, contentWidth, itemH, 1.3, 1.3, 'FD');

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.3);
      doc.setTextColor(...accentColor);
      doc.text(`${String(idx + 1).padStart(2, '0')}.`, marginX + 3.5, y + 4.4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.navyMid);
      doc.text(lines, marginX + 11.5, y + 4.4);

      y += itemH + 2;
    });

    y += 3;
  };

  renderNumberedBlock(
    'Priority 1: Immediate Safety Recommendations',
    result.actionPlan.immediateActions,
    COLORS.lowText,
    COLORS.lowTint,
    [167, 243, 208]
  );

  renderNumberedBlock(
    'Priority 2: Recovery Steps (If You Already Shared Money, Credentials, or Personal Data)',
    result.actionPlan.recoverySteps,
    COLORS.highText,
    COLORS.highTint,
    [254, 202, 202]
  );

  // =========================================================================
  // SECTION 05: INDEPENDENT VERIFICATION & FRAUD REPORTING GUIDANCE
  // =========================================================================
  drawSectionHeading(
    '05',
    'Independent Verification & Reporting Guidance',
    'Confirm legitimacy strictly through independent official channels and report suspected fraud.'
  );

  renderNumberedBlock(
    'Independent Verification Steps',
    result.actionPlan.verificationSteps,
    COLORS.cyanDark,
    COLORS.cyanTint,
    [165, 243, 252]
  );

  renderNumberedBlock(
    'Fraud Reporting Guidance',
    result.actionPlan.reportingGuidance,
    COLORS.medText,
    COLORS.medTint,
    [253, 230, 138]
  );

  if (result.missingInformation.length > 0) {
    ensureSpace(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(...COLORS.navy);
    doc.text('Missing Information & Verification Gaps', marginX, y);
    y += 4.5;

    result.missingInformation.forEach((gap) => {
      const gapLines = doc.splitTextToSize(`- ${sanitizeForPdf(gap, false)}`, contentWidth - 4);
      const h = gapLines.length * 3.8 + 1.5;
      ensureSpace(h + 2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.3);
      doc.setTextColor(...COLORS.slateBody);
      doc.text(gapLines, marginX + 2, y);
      y += h;
    });
    y += 3;
  }

  // =========================================================================
  // SECTION 06: AI LIMITATIONS & RESPONSIBLE-USE DISCLAIMER
  // =========================================================================
  drawSectionHeading(
    '06',
    'AI Limitations & Responsible-Use Disclaimer'
  );

  const disclaimerParagraphs = [
    sanitizeForPdf(result.uncertaintyNotice, false),
    'Heuristic Indicator Only: Sentra AI computes an evidence-based heuristic score (0-100) using Google Gemini AI. This score is NOT a statistically validated probability of fraud, legal determination, or security certification.',
    'Low Risk Does Not Guarantee Safety: A Low-risk assessment never proves a communication, URL, screenshot, or job offer is authentic. Always independently confirm banking, payment, account, or employment claims via official channels.',
    'Privacy & Redaction Standard: This PDF was generated locally in your browser. Original unredacted submissions and raw uploaded images are excluded by default, and residual sensitive number/identifier patterns are automatically masked. Sentra AI does not store scan data or report history by default.',
  ];

  const wrappedDisclaimer = disclaimerParagraphs.map((p) =>
    doc.splitTextToSize(p, contentWidth - 10)
  );
  const totalDisclaimerLines = wrappedDisclaimer.reduce((acc, lines) => acc + lines.length, 0);
  const disclaimerH = totalDisclaimerLines * 3.7 + disclaimerParagraphs.length * 2.8 + 7;

  ensureSpace(disclaimerH + 4);
  doc.setFillColor(...COLORS.panelBg);
  doc.setDrawColor(...COLORS.navyMid);
  doc.setLineWidth(0.35);
  doc.roundedRect(marginX, y, contentWidth, disclaimerH, 1.8, 1.8, 'FD');

  let dy = y + 5.5;
  wrappedDisclaimer.forEach((lines, idx) => {
    doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...(idx === 0 ? COLORS.navy : COLORS.slateBody));
    doc.text(lines, marginX + 5, dy);
    dy += lines.length * 3.7 + 2.6;
  });

  // =========================================================================
  // APPLY RUNNING HEADER (PAGES 2+) & RUNNING FOOTER (ALL PAGES)
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    if (p > 1) {
      doc.setFillColor(...COLORS.navy);
      doc.rect(0, 0, pageWidth, 2.2, 'F');
      doc.setFillColor(...COLORS.cyanBright);
      doc.rect(0, 2.2, pageWidth, 0.7, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.navy);
      doc.text('Sentra AI  |  Cybersecurity Risk Assessment Report', marginX, 11.5);

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(...COLORS.slateMuted);
      doc.text(`REF: ${reportReference}`, pageWidth - marginX, 11.5, { align: 'right' });

      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.line(marginX, 14, pageWidth - marginX, 14);
    }

    // Footer on every page
    const footerY = pageHeight - 10;
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(marginX, footerY - 4, pageWidth - marginX, footerY - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.4);
    doc.setTextColor(...COLORS.slateMuted);
    doc.text(
      'Sentra AI - Think Before You Trust.  |  Generated locally (Zero default storage | Unredacted source excluded)',
      marginX,
      footerY
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(...COLORS.navy);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, footerY, { align: 'right' });
  }

  const filename = `Sentra-AI-Security-Report-${reportReference}.pdf`;
  return {
    doc,
    reportReference,
    filename,
    pageCount: totalPages,
  };
}

/**
 * Generates and triggers a client-side browser download of the A4 PDF security report.
 */
export function downloadSecurityPdfReport(result: AnalysisResult): {
  reportReference: string;
  filename: string;
} {
  const { doc, reportReference, filename } = buildSecurityAssessmentPdf(result);
  doc.save(filename);
  return { reportReference, filename };
}
