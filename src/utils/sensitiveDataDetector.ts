export type SensitiveCategory =
  | 'secret'
  | 'card'
  | 'national_id'
  | 'phone'
  | 'email'
  | 'upi';

export interface SensitiveCategoryInfo {
  id: SensitiveCategory;
  label: string;
  token: string;
  description: string;
}

export interface SensitiveMatch {
  category: SensitiveCategory;
  label: string;
  token: string;
  start: number;
  end: number;
  value: string;
}

export interface SensitiveAnalysis {
  hasSensitive: boolean;
  matches: string[];
  items: SensitiveMatch[];
  countsByCategory: Partial<Record<SensitiveCategory, number>>;
  categoriesFound: SensitiveCategory[];
}

export const SENSITIVE_CATEGORIES: Record<SensitiveCategory, SensitiveCategoryInfo> = {
  secret: {
    id: 'secret',
    label: 'OTP / PIN / Password',
    token: '[REDACTED-SECRET]',
    description: 'One-time codes, PINs, CVVs, or password values',
  },
  card: {
    id: 'card',
    label: 'Card / Bank Account Number',
    token: '[REDACTED-CARD]',
    description: 'Long 13–19 digit payment card or account sequences',
  },
  national_id: {
    id: 'national_id',
    label: 'National / Tax ID',
    token: '[REDACTED-ID]',
    description: 'Aadhaar, PAN, or SSN-like personal identifiers',
  },
  phone: {
    id: 'phone',
    label: 'Phone Number',
    token: '[REDACTED-PHONE]',
    description: 'Mobile or landline telephone numbers',
  },
  email: {
    id: 'email',
    label: 'Email Address',
    token: '[REDACTED-EMAIL]',
    description: 'Personal or contact email addresses',
  },
  upi: {
    id: 'upi',
    label: 'UPI Handle',
    token: '[REDACTED-UPI]',
    description: 'Payment handle formatted like name@bank',
  },
};

interface PatternRule {
  category: SensitiveCategory;
  regex: RegExp;
  /** If defined, redact only this capturing group inside the full match */
  valueGroup?: number;
}

const KNOWN_UPI_HANDLES =
  'okaxis|okhdfcbank|okicici|oksbi|ybl|ibl|axl|paytm|upi|apl|fbl|icici|sbi|hdfcbank|kotak|axisbank|barodampay|idfcbank|indus|federal|rbl|aubank|jupiteraxis|sliceaxis|postbank|airtel|jio|waaxis|wahdfcbank|waicici|wasbi';

const RULES: PatternRule[] = [
  {
    category: 'secret',
    regex:
      /\b(?:otp|one[- ]time[- ]pass(?:word|code)|pin|passcode|verification code|security code|cvv|cvc|password)\s*(?:is|:|=|-)?\s*([A-Za-z0-9!@#$%^&*_-]{4,12})\b/gi,
    valueGroup: 1,
  },
  {
    category: 'card',
    regex: /\b(?:\d[ -]?){13,19}\b/g,
  },
  {
    category: 'national_id',
    regex: /\b(?:\d{4}[\s-]\d{4}[\s-]\d{4}(?![\s-]*\d)|\d{3}-\d{2}-\d{4}|[A-Z]{5}[0-9]{4}[A-Z])\b/g,
  },
  {
    category: 'email',
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    category: 'upi',
    regex: new RegExp(`\\b[A-Za-z0-9._-]{2,64}@(?:${KNOWN_UPI_HANDLES})\\b`, 'gi'),
  },
  {
    category: 'phone',
    regex: /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{3,5}\)?[\s.-]?\d{3,5}(?:[\s.-]?\d{2,4})?|\b\d{10}\b)\b/g,
  },
];

function isValidCandidate(category: SensitiveCategory, value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (category === 'card') {
    return digits.length >= 13 && digits.length <= 19;
  }
  if (category === 'phone') {
    // Avoid short numbers, years, currency amounts, or 13+ digit card numbers
    if (digits.length < 10 || digits.length > 13) return false;
    // Avoid pure date strings like 2026-11-26
    if (/^\d{4}[-/.]\d{2}[-/.]\d{2}$/.test(value.trim())) return false;
    return true;
  }
  if (category === 'secret') {
    // Require at least one digit or length >= 6 so common words like "here" are not falsely flagged
    return /\d/.test(value) || value.length >= 8;
  }
  return true;
}

/**
 * Runs local client-side detection for sensitive personal/financial information
 * without sending anything over the network.
 */
export function analyzeSensitiveContent(text: string): SensitiveAnalysis {
  if (!text.trim()) {
    return {
      hasSensitive: false,
      matches: [],
      items: [],
      countsByCategory: {},
      categoriesFound: [],
    };
  }

  const rawItems: SensitiveMatch[] = [];

  for (const rule of RULES) {
    const regex = new RegExp(rule.regex.source, rule.regex.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      let start = match.index;
      let value = fullMatch;

      if (rule.valueGroup && match[rule.valueGroup]) {
        value = match[rule.valueGroup];
        const innerOffset = fullMatch.lastIndexOf(value);
        if (innerOffset >= 0) {
          start = match.index + innerOffset;
        }
      }

      const end = start + value.length;
      if (!isValidCandidate(rule.category, value)) {
        continue;
      }

      const info = SENSITIVE_CATEGORIES[rule.category];
      rawItems.push({
        category: rule.category,
        label: info.label,
        token: info.token,
        start,
        end,
        value,
      });
    }
  }

  // Sort by start ascending, then by rule priority / longer span first to deduplicate overlaps
  const priorityOrder: Record<SensitiveCategory, number> = {
    secret: 0,
    card: 1,
    national_id: 2,
    email: 3,
    upi: 4,
    phone: 5,
  };

  rawItems.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    if (priorityOrder[a.category] !== priorityOrder[b.category]) {
      return priorityOrder[a.category] - priorityOrder[b.category];
    }
    return b.end - a.end;
  });

  const nonOverlapping: SensitiveMatch[] = [];
  for (const item of rawItems) {
    const overlaps = nonOverlapping.some(
      (kept) => item.start < kept.end && item.end > kept.start
    );
    if (!overlaps) {
      nonOverlapping.push(item);
    }
  }

  const countsByCategory: Partial<Record<SensitiveCategory, number>> = {};
  const categoriesFound: SensitiveCategory[] = [];
  for (const item of nonOverlapping) {
    if (!countsByCategory[item.category]) {
      categoriesFound.push(item.category);
    }
    countsByCategory[item.category] = (countsByCategory[item.category] ?? 0) + 1;
  }

  const matches = categoriesFound.map((cat) => SENSITIVE_CATEGORIES[cat].label);

  return {
    hasSensitive: nonOverlapping.length > 0,
    matches,
    items: nonOverlapping,
    countsByCategory,
    categoriesFound,
  };
}

export interface RedactedSegment {
  text: string;
  redacted: boolean;
  category?: SensitiveCategory;
  original?: string;
}

/**
 * Applies selective redaction for the user's chosen sensitive categories
 * and returns both the final safe string and renderable highlight segments.
 */
export function applySelectiveRedaction(
  text: string,
  enabledCategories: SensitiveCategory[]
): { redactedText: string; segments: RedactedSegment[]; redactedCount: number } {
  const analysis = analyzeSensitiveContent(text);
  const enabledSet = new Set(enabledCategories);
  const activeItems = analysis.items.filter((item) => enabledSet.has(item.category));

  if (activeItems.length === 0) {
    return {
      redactedText: text,
      segments: [{ text, redacted: false }],
      redactedCount: 0,
    };
  }

  const segments: RedactedSegment[] = [];
  let cursor = 0;

  for (const item of activeItems) {
    if (item.start > cursor) {
      segments.push({ text: text.slice(cursor, item.start), redacted: false });
    }
    segments.push({
      text: item.token,
      redacted: true,
      category: item.category,
      original: item.value,
    });
    cursor = item.end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), redacted: false });
  }

  const redactedText = segments.map((s) => s.text).join('');
  return {
    redactedText,
    segments,
    redactedCount: activeItems.length,
  };
}

/**
 * Backwards-compatible summary helper.
 */
export function detectSensitiveData(text: string): { hasSensitive: boolean; matches: string[] } {
  const result = analyzeSensitiveContent(text);
  return { hasSensitive: result.hasSensitive, matches: result.matches };
}

/**
 * Backwards-compatible full redaction helper.
 */
export function redactSensitiveData(text: string): string {
  const allCategories = Object.keys(SENSITIVE_CATEGORIES) as SensitiveCategory[];
  return applySelectiveRedaction(text, allCategories).redactedText;
}
