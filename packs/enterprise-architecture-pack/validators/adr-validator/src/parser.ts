// ADR Markdown parser — regex-based section extractor
// Recognizes standard ADR headings and extracts their content.

export interface AdrSection {
  heading: string;
  content: string;
}

export interface ParsedAdr {
  title: string;
  date: string | null;
  status: string | null;
  deciders: string | null;
  sections: Record<string, AdrSection>;
  rawContent: string;
  filePath: string;
}

// Known section headings (case-insensitive match)
const KNOWN_SECTIONS = [
  'context',
  'decision',
  'alternatives considered',
  'alternatives rejected',
  'consequences',
  'compliance impact',
  'risks',
  'implementation notes',
] as const;

// Metadata patterns in the header block
const DATE_RE = /\*\*Date:\*\*\s*([^\n|*]+)/i;
const STATUS_RE = /\*\*Status:\*\*\s*([^\n|*]+)/i;
const DECIDERS_RE = /\*\*Deciders?:\*\*\s*([^\n|*]+)/i;

export function parseAdr(content: string, filePath: string): ParsedAdr {
  const lines = content.split('\n');

  // Extract title (first H1 only - ADRs must have # title, not ##)
  const titleLine = lines.find((l) => /^#\s/.test(l));
  const title = titleLine ? titleLine.replace(/^#+\s+/, '').trim() : '';

  // Extract metadata
  const date = extractMatch(content, DATE_RE);
  const status = extractMatch(content, STATUS_RE);
  const deciders = extractMatch(content, DECIDERS_RE);

  // Split content into sections by ## headings
  const sections: Record<string, AdrSection> = {};
  const sectionPattern = /^#{2,3}\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  const sectionPositions: Array<{ heading: string; start: number }> = [];

  while ((match = sectionPattern.exec(content)) !== null) {
    sectionPositions.push({ heading: match[1].trim(), start: match.index });
  }

  for (let i = 0; i < sectionPositions.length; i++) {
    const { heading, start } = sectionPositions[i];
    const end = i < sectionPositions.length - 1 ? sectionPositions[i + 1].start : content.length;
    const sectionContent = content.slice(start, end).trim();
    const normalizedKey = heading.toLowerCase();
    sections[normalizedKey] = { heading, content: sectionContent };
  }

  return { title, date, status, deciders, sections, rawContent: content, filePath };
}

function extractMatch(content: string, re: RegExp): string | null {
  const m = content.match(re);
  return m ? m[1].trim() : null;
}

export function hasSection(adr: ParsedAdr, name: string): boolean {
  const key = name.toLowerCase();
  return (
    key in adr.sections ||
    Object.keys(adr.sections).some((k) => k.includes(key))
  );
}

export function getSectionContent(adr: ParsedAdr, name: string): string {
  const key = name.toLowerCase();
  const exactMatch = adr.sections[key];
  if (exactMatch) return exactMatch.content;
  const fuzzyKey = Object.keys(adr.sections).find((k) => k.includes(key));
  return fuzzyKey ? adr.sections[fuzzyKey].content : '';
}

// Count alternatives in the "Alternatives Considered / Rejected" section
export function countAlternatives(adr: ParsedAdr): number {
  const content = getSectionContent(adr, 'alternatives');
  if (!content) return 0;
  // Count table rows (excluding header/separator) or bullet items
  const tableRows = content.match(/^\|[^|]+\|[^|]+\|/gm) || [];
  const tableDataRows = tableRows.filter(
    (r) => !r.includes('---') && !r.toLowerCase().includes('alternative'),
  );
  if (tableDataRows.length > 0) return tableDataRows.length;
  // Fall back to bullet/numbered list items
  const listItems = content.match(/^[-*\d]\s+\S/gm) || [];
  return listItems.length;
}

// Check if alternatives have rejection reasons
export function alternativesHaveRejectionReasons(adr: ParsedAdr): boolean {
  const content = getSectionContent(adr, 'alternatives');
  if (!content) return false;
  const rejectionKeywords = [
    'rejected',
    'rejected because',
    'rejection',
    'why rejected',
    'not chosen',
    'discarded',
  ];
  return rejectionKeywords.some((kw) => content.toLowerCase().includes(kw));
}
