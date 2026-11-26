import type { UrlStructuralAnalysis } from './types.ts';

const KNOWN_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'rebrand.ly',
  'tiny.cc',
  's.id',
  'lnkd.in',
]);

const HIGH_ABUSE_TLDS = new Set([
  'xyz',
  'top',
  'club',
  'click',
  'link',
  'icu',
  'buzz',
  'gq',
  'tk',
  'ml',
  'cf',
  'ga',
  'work',
  'loan',
  'zip',
  'mov',
  'rest',
  'cfd',
  'sbs',
  'quest',
]);

const SENSITIVE_KEYWORDS = [
  'login',
  'signin',
  'verify',
  'verification',
  'kyc',
  'update',
  'secure',
  'account',
  'banking',
  'wallet',
  'upi',
  'refund',
  'claim',
  'reward',
  'prize',
  'lottery',
  'customs',
  'parcel',
  'delivery',
  'redelivery',
  'password',
  'otp',
  'suspend',
  'blocked',
  'unlock',
  'confirm',
  'pay',
  'invoice',
  'hr-portal',
  'job-offer',
];

/**
 * Defangs a URL so it is never accidentally rendered or copied as a clickable link.
 */
export function defangUrl(input: string): string {
  const trimmed = input.trim();
  return trimmed
    .replace(/^https:\/\//i, 'hxxps://')
    .replace(/^http:\/\//i, 'hxxp://')
    .replace(/\./g, '[.]');
}

/**
 * Pure local structural URL analyzer.
 * NEVER fetches, resolves DNS, or visits the submitted URL.
 */
export function inspectUrlStructure(rawInput: string): UrlStructuralAnalysis {
  const trimmed = rawInput.trim();
  const hasExplicitScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed);
  const candidate = hasExplicitScheme ? trimmed : `https://${trimmed}`;

  const structuralNotes: string[] = [];
  const hasNonAsciiChars = /[^\x20-\x7E]/.test(trimmed);

  let parsed: URL | null = null;
  try {
    parsed = new URL(candidate);
  } catch {
    parsed = null;
  }

  if (!parsed || !parsed.hostname) {
    return {
      rawInput: trimmed,
      defangedUrl: defangUrl(trimmed),
      isValidSyntax: false,
      scheme: hasExplicitScheme ? trimmed.split(':')[0] || 'unknown' : 'missing',
      hostname: '',
      tld: '',
      subdomainCount: 0,
      port: '',
      pathLength: 0,
      queryParamCount: 0,
      queryParamKeys: [],
      usesHttps: false,
      hasIpHost: false,
      hasPunycode: trimmed.toLowerCase().includes('xn--'),
      hasNonAsciiChars,
      hasAtSymbolInAuthority: trimmed.includes('@'),
      isKnownShortener: false,
      hasSuspiciousTld: false,
      hasExcessiveHyphensOrDigits: false,
      suspiciousKeywordsInPathOrHost: [],
      structuralNotes: ['Input could not be parsed as a standard web URL.'],
    };
  }

  const scheme = hasExplicitScheme ? parsed.protocol.replace(':', '').toLowerCase() : 'unspecified';
  const hostname = parsed.hostname.toLowerCase();
  const labels = hostname.split('.').filter(Boolean);
  const tld = labels.length >= 2 ? labels[labels.length - 1] : '';
  const subdomainCount = Math.max(0, labels.length - 2);

  const ipv4Pattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^\[.*:.*\]$/;
  const hasIpHost = ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);

  const hasPunycode = hostname.includes('xn--');
  const hasAtSymbolInAuthority = Boolean(parsed.username || parsed.password) || /\/\/[^/]*@/.test(candidate);
  const isKnownShortener = KNOWN_SHORTENERS.has(hostname);
  const hasSuspiciousTld = HIGH_ABUSE_TLDS.has(tld);

  const hyphenCount = (hostname.match(/-/g) || []).length;
  const digitCount = (hostname.match(/\d/g) || []).length;
  const hasExcessiveHyphensOrDigits = hyphenCount >= 3 || digitCount >= 5;

  const combinedInspect = `${hostname}${parsed.pathname}${parsed.search}`.toLowerCase();
  const suspiciousKeywordsInPathOrHost = SENSITIVE_KEYWORDS.filter((kw) =>
    combinedInspect.includes(kw)
  );

  const queryParamKeys = Array.from(new Set(Array.from(parsed.searchParams.keys()))).slice(0, 15);
  const usesHttps = scheme === 'https';

  if (scheme !== 'https' && scheme !== 'unspecified') {
    structuralNotes.push(`Uses non-HTTPS scheme (${scheme}).`);
  }
  if (hasIpHost) {
    structuralNotes.push('Host is a raw IP address rather than a registered domain name.');
  }
  if (hasPunycode || hasNonAsciiChars) {
    structuralNotes.push('Contains internationalized/Punycode (xn--) or non-ASCII characters, which can be used in homograph lookalike attacks.');
  }
  if (hasAtSymbolInAuthority) {
    structuralNotes.push('Contains an "@" symbol in the authority section, which can disguise the true destination host.');
  }
  if (isKnownShortener) {
    structuralNotes.push('Uses a URL shortening service that hides the true destination domain.');
  }
  if (subdomainCount >= 3) {
    structuralNotes.push(`Deep subdomain nesting (${subdomainCount} subdomains) often used to mimic trusted brand names before the real registrable domain.`);
  }
  if (hasSuspiciousTld) {
    structuralNotes.push(`Uses a top-level domain (.${tld}) frequently observed in disposable or phishing campaigns (context-dependent, not proof of malice).`);
  }
  if (hasExcessiveHyphensOrDigits) {
    structuralNotes.push('Hostname contains unusually many hyphens or digits.');
  }
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    structuralNotes.push(`Uses a non-standard port (:${parsed.port}).`);
  }
  if (suspiciousKeywordsInPathOrHost.length > 0) {
    structuralNotes.push(
      `Contains credential/urgency-adjacent terms in URL structure: ${suspiciousKeywordsInPathOrHost.slice(0, 6).join(', ')}.`
    );
  }
  if (structuralNotes.length === 0) {
    structuralNotes.push('No obvious structural anomalies detected locally; this does not verify live site reputation or ownership.');
  }

  return {
    rawInput: trimmed,
    defangedUrl: defangUrl(trimmed),
    isValidSyntax: true,
    scheme,
    hostname,
    tld,
    subdomainCount,
    port: parsed.port,
    pathLength: parsed.pathname.length,
    queryParamCount: queryParamKeys.length,
    queryParamKeys,
    usesHttps,
    hasIpHost,
    hasPunycode,
    hasNonAsciiChars,
    hasAtSymbolInAuthority,
    isKnownShortener,
    hasSuspiciousTld,
    hasExcessiveHyphensOrDigits,
    suspiciousKeywordsInPathOrHost,
    structuralNotes,
  };
}
