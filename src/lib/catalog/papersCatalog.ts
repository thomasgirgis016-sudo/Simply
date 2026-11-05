/**
 * Simply IGCSE — High-Performance Past Papers Metadata Catalog
 * 
 * Scalable Metadata Index for 9,000+ Past Papers (2010 - 2026)
 * Enables sub-millisecond client-side indexing and instant lookups
 * for queries such as "0580/42/M/J/23", "0620_w22_ms_41", etc.
 */

import { OFFICIAL_PAST_PAPER_PDFS } from '../../data/pastPapersData';
import { OfficialPaperPdf } from '../../types';

export interface PaperMetadata {
  id: string;
  syllabus: string;        // e.g. "0580", "0620", "4MA1"
  year: number;            // e.g. 2023
  series: string;          // e.g. "s" (May/June), "w" (Oct/Nov), "m" (Feb/March), "j" (Jan)
  seriesLabel: string;     // e.g. "May/June", "Oct/Nov", "Feb/March", "Jan"
  paper: number;           // e.g. 4
  variant: number;         // e.g. 2
  paperCode: string;       // e.g. "0580/42"
  title: string;           // e.g. "Paper 4 (Extended Theory)"
  board: 'CIE' | 'Edexcel' | 'OxfordAQA';
  qpUrl: string;           // Question Paper URL
  msUrl: string;           // Mark Scheme URL
  gtUrl?: string;          // Grade Thresholds URL
  erUrl?: string;          // Examiner Report URL
  tier?: string;
  isPortal?: boolean;
  isUnavailable?: boolean;
  subjectName?: string;
}

export interface CatalogFilterOptions {
  syllabus?: string;
  year?: number | 'All';
  series?: string | 'All';
  paper?: number | 'All';
  variant?: number | 'All';
  board?: 'All' | 'CIE' | 'Edexcel' | 'OxfordAQA';
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// METADATA BUILDER & COMPILER
// ─────────────────────────────────────────────────────────────────────────────

function buildGradeThresholdUrl(syllabus: string, seasonCode: string, year: number, board: string): string | undefined {
  if (board !== 'CIE') return undefined;
  const yy = String(year).slice(-2);
  const sc = seasonCode.toLowerCase() === 'm' ? 'm' : seasonCode.toLowerCase() === 'w' ? 'w' : 's';
  const filename = `${syllabus}_${sc}${yy}_gt.pdf`;
  return `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${filename}`;
}

function buildExaminerReportUrl(syllabus: string, seasonCode: string, year: number, board: string): string | undefined {
  if (board !== 'CIE') return undefined;
  const yy = String(year).slice(-2);
  const sc = seasonCode.toLowerCase() === 'm' ? 'm' : seasonCode.toLowerCase() === 'w' ? 'w' : 's';
  const filename = `${syllabus}_${sc}${yy}_er.pdf`;
  return `https://pastpapers.papacambridge.com/directories/CAIE/CAIE-pastpapers/upload/${filename}`;
}

function mapPdfToMetadata(pdf: OfficialPaperPdf): PaperMetadata {
  const syllabus = pdf.subjectCode || '0580';
  const seasonCode = pdf.seasonCode || (pdf.session.toLowerCase().includes('oct') ? 'w' : pdf.session.toLowerCase().includes('feb') ? 'm' : 's');
  
  let seriesLabel = 'May/June';
  if (seasonCode === 'w' || pdf.session.toLowerCase().includes('nov') || pdf.session.toLowerCase().includes('oct')) {
    seriesLabel = 'Oct/Nov';
  } else if (seasonCode === 'm' || pdf.session.toLowerCase().includes('feb') || pdf.session.toLowerCase().includes('march')) {
    seriesLabel = 'Feb/March';
  } else if (pdf.session.toLowerCase().includes('jan')) {
    seriesLabel = 'Jan';
  }

  return {
    id: pdf.id,
    syllabus,
    year: pdf.year,
    series: seasonCode,
    seriesLabel,
    paper: pdf.paperNumber || 1,
    variant: pdf.variant || 1,
    paperCode: pdf.paperCode,
    title: pdf.paperComponent,
    board: (pdf.board as any) || 'CIE',
    qpUrl: pdf.qpPdfUrl || '',
    msUrl: pdf.msPdfUrl || '',
    gtUrl: buildGradeThresholdUrl(syllabus, seasonCode, pdf.year, pdf.board || 'CIE'),
    erUrl: buildExaminerReportUrl(syllabus, seasonCode, pdf.year, pdf.board || 'CIE'),
    tier: pdf.tier,
    isPortal: pdf.isPortal,
    isUnavailable: !pdf.qpPdfUrl || !pdf.msPdfUrl,
    subjectName: pdf.subjectName
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HIGH-PERFORMANCE IN-MEMORY INDICES
// ─────────────────────────────────────────────────────────────────────────────

export const PAPERS_CATALOG: PaperMetadata[] = OFFICIAL_PAST_PAPER_PDFS.map(mapPdfToMetadata);

const indexById = new Map<string, PaperMetadata>();
const indexByNormalizedCode = new Map<string, PaperMetadata>();
const indexBySyllabusYear = new Map<string, PaperMetadata[]>();
const indexBySyllabus = new Map<string, PaperMetadata[]>();

// Normalize exam codes for ultra-fast lookup (e.g. "0580/42/M/J/23" -> "058042s23")
export function normalizeExamCodeKey(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .replace(/may[\s/_-]*june|summer/g, 's')
    .replace(/oct[\s/_-]*nov|winter/g, 'w')
    .replace(/feb[\s/_-]*march|spring/g, 'm')
    .replace(/january|jan/g, 'j')
    .replace(/paper\s*/g, '')
    .replace(/variant\s*/g, '')
    .replace(/q\d+/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Build indices once at load time
for (const paper of PAPERS_CATALOG) {
  // 1. By ID
  indexById.set(paper.id, paper);

  // 2. By Normalized Code Variants
  const yy = String(paper.year).slice(-2);
  const codeCombos = [
    `${paper.syllabus}/${paper.paper}${paper.variant}/${paper.series}/${yy}`,
    `${paper.syllabus}/${paper.paper}${paper.variant}/${paper.seriesLabel}/${paper.year}`,
    `${paper.syllabus}_${paper.series}${yy}_qp_${paper.paper}${paper.variant}`,
    `${paper.syllabus}_${paper.series}${yy}_ms_${paper.paper}${paper.variant}`,
    `${paper.syllabus}-${paper.year}-${paper.series}-${paper.paper}${paper.variant}`,
    `${paper.paperCode} ${paper.seriesLabel} ${paper.year}`,
    `${paper.syllabus} ${paper.year} ${paper.paperCode}`,
    paper.id
  ];

  for (const combo of codeCombos) {
    const norm = normalizeExamCodeKey(combo);
    if (norm && !indexByNormalizedCode.has(norm)) {
      indexByNormalizedCode.set(norm, paper);
    }
  }

  // 3. By Syllabus + Year
  const sylYearKey = `${paper.syllabus.toLowerCase()}:${paper.year}`;
  if (!indexBySyllabusYear.has(sylYearKey)) {
    indexBySyllabusYear.set(sylYearKey, []);
  }
  indexBySyllabusYear.get(sylYearKey)!.push(paper);

  // 4. By Syllabus
  const sylKey = paper.syllabus.toLowerCase();
  if (!indexBySyllabus.has(sylKey)) {
    indexBySyllabus.set(sylKey, []);
  }
  indexBySyllabus.get(sylKey)!.push(paper);
}

// ─────────────────────────────────────────────────────────────────────────────
// FAST LOOKUP & QUERY API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Retrieve paper metadata by its unique catalog ID (O(1))
 */
export function getPaperById(id: string): PaperMetadata | undefined {
  if (!id) return undefined;
  return indexById.get(id);
}

/**
 * Find paper metadata by any flexible exam code format:
 * - "0580/42/M/J/23"
 * - "0620_s22_ms_41"
 * - "4MA1/1H/June/2023"
 * - "0510-2023-s-22"
 */
export function findPaperByExamCode(code: string): PaperMetadata | undefined {
  if (!code) return undefined;
  const norm = normalizeExamCodeKey(code);
  
  // Exact normalized index hit
  if (indexByNormalizedCode.has(norm)) {
    return indexByNormalizedCode.get(norm);
  }

  // Prefix or partial match
  for (const [key, paper] of indexByNormalizedCode.entries()) {
    if (key.includes(norm) || norm.includes(key)) {
      return paper;
    }
  }

  // Fallback: extract syllabus, year, paper, variant
  const sylMatch = code.match(/([0-9]{4}|4[A-Z0-9]{3})/i);
  const yrMatch = code.match(/(20[12][0-9]|[12][0-9])/);
  if (sylMatch && yrMatch) {
    const syl = sylMatch[1].toLowerCase();
    let yr = parseInt(yrMatch[1], 10);
    if (yr < 100) yr += 2000;
    
    const candidates = indexBySyllabusYear.get(`${syl}:${yr}`) || [];
    if (candidates.length > 0) {
      // Check paper number match
      const pMatch = code.match(/paper\s*(\d)|[/\-_](\d{1,2})/i);
      if (pMatch) {
        const pNum = parseInt(pMatch[1] || pMatch[2], 10);
        const found = candidates.find(p => p.paper === pNum || p.paperCode.includes(String(pNum)));
        if (found) return found;
      }
      return candidates[0];
    }
  }

  return undefined;
}

/**
 * High-performance search and filter across the 9,000+ catalog
 */
export function searchCatalog(query: string = '', filters: CatalogFilterOptions = {}): PaperMetadata[] {
  const normQuery = query.trim().toLowerCase();
  let base: PaperMetadata[] = [];

  // Use syllabus index if provided
  if (filters.syllabus && filters.syllabus !== 'All') {
    const sylNorm = filters.syllabus.toLowerCase();
    if (filters.year && filters.year !== 'All') {
      base = indexBySyllabusYear.get(`${sylNorm}:${filters.year}`) || [];
    } else {
      base = indexBySyllabus.get(sylNorm) || [];
    }
  } else if (filters.year && filters.year !== 'All') {
    base = PAPERS_CATALOG.filter(p => p.year === filters.year);
  } else {
    base = PAPERS_CATALOG;
  }

  return base.filter(p => {
    // Board filter
    if (filters.board && filters.board !== 'All') {
      if (p.board !== filters.board) return false;
    }

    // Series filter
    if (filters.series && filters.series !== 'All') {
      const s = filters.series.toLowerCase();
      if (p.series !== s && !p.seriesLabel.toLowerCase().includes(s)) return false;
    }

    // Paper number filter
    if (filters.paper !== undefined && filters.paper !== 'All') {
      if (p.paper !== filters.paper) return false;
    }

    // Variant filter
    if (filters.variant !== undefined && filters.variant !== 'All') {
      if (p.variant !== filters.variant) return false;
    }

    // Text search query
    if (normQuery) {
      const match =
        p.paperCode.toLowerCase().includes(normQuery) ||
        p.id.toLowerCase().includes(normQuery) ||
        p.syllabus.toLowerCase().includes(normQuery) ||
        p.title.toLowerCase().includes(normQuery) ||
        (p.subjectName && p.subjectName.toLowerCase().includes(normQuery)) ||
        `${p.syllabus} ${p.year}`.includes(normQuery);

      if (!match) return false;
    }

    return true;
  }).slice(0, filters.limit || undefined);
}

/**
 * Retrieve metadata statistics
 */
export function getCatalogStats(): { totalPapers: number; subjectsCount: number; yearRange: [number, number] } {
  const syllabi = new Set(PAPERS_CATALOG.map(p => p.syllabus));
  const years = PAPERS_CATALOG.map(p => p.year);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);

  return {
    totalPapers: PAPERS_CATALOG.length,
    subjectsCount: syllabi.size,
    yearRange: [minYear, maxYear]
  };
}
