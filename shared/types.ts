import { z } from 'zod';

export type ScanType = 'message' | 'url' | 'screenshot' | 'job-offer';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Inconclusive';

export type IndicatorSeverity = 'low' | 'medium' | 'high';

export type AttackTechniqueId =
  | 'urgency'
  | 'financial_manipulation'
  | 'impersonation'
  | 'credential_harvesting'
  | 'deceptive_promises';

export type PageId =
  | 'dashboard'
  | 'message'
  | 'url'
  | 'screenshot'
  | 'job-offer'
  | 'safety-center'
  | 'about';

export const WarningSignSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high']),
  evidence: z.string().min(1),
  explanation: z.string().min(1),
});

export type WarningSign = z.infer<typeof WarningSignSchema>;

export const HighlightedPhraseSchema = z.object({
  id: z.string().min(1),
  phrase: z.string().min(1),
  category: z.enum([
    'urgency',
    'financial_manipulation',
    'impersonation',
    'credential_harvesting',
    'deceptive_promises',
    'other',
  ]),
  severity: z.enum(['low', 'medium', 'high']),
  explanation: z.string().min(1),
});

export type HighlightedPhrase = z.infer<typeof HighlightedPhraseSchema>;

export const AttackTechniqueSchema = z.object({
  technique: z.enum([
    'urgency',
    'financial_manipulation',
    'impersonation',
    'credential_harvesting',
    'deceptive_promises',
  ]),
  label: z.string().min(1),
  detected: z.boolean(),
  severity: z.enum(['none', 'low', 'medium', 'high']),
  evidence: z.array(z.string()),
  reasoning: z.string().min(1),
});

export type AttackTechnique = z.infer<typeof AttackTechniqueSchema>;

export const SmartActionPlanSchema = z.object({
  immediateActions: z.array(z.string()).min(1),
  verificationSteps: z.array(z.string()).min(1),
  reportingGuidance: z.array(z.string()).min(1),
  recoverySteps: z.array(z.string()).min(1),
});

export type SmartActionPlan = z.infer<typeof SmartActionPlanSchema>;

export const RubricFactorSchema = z.object({
  factor: z.string().min(1),
  score: z.number().int().min(0).max(25),
  maxScore: z.number().int().min(1).max(25),
  rationale: z.string().min(1),
});

export type RubricFactor = z.infer<typeof RubricFactorSchema>;

export const UrlStructuralAnalysisSchema = z.object({
  rawInput: z.string(),
  defangedUrl: z.string(),
  isValidSyntax: z.boolean(),
  scheme: z.string(),
  hostname: z.string(),
  tld: z.string(),
  subdomainCount: z.number().int().min(0),
  port: z.string(),
  pathLength: z.number().int().min(0),
  queryParamCount: z.number().int().min(0),
  queryParamKeys: z.array(z.string()),
  usesHttps: z.boolean(),
  hasIpHost: z.boolean(),
  hasPunycode: z.boolean(),
  hasNonAsciiChars: z.boolean(),
  hasAtSymbolInAuthority: z.boolean(),
  isKnownShortener: z.boolean(),
  hasSuspiciousTld: z.boolean(),
  hasExcessiveHyphensOrDigits: z.boolean(),
  suspiciousKeywordsInPathOrHost: z.array(z.string()),
  structuralNotes: z.array(z.string()),
});

export type UrlStructuralAnalysis = z.infer<typeof UrlStructuralAnalysisSchema>;

export const AnalysisResultSchema = z.object({
  scanType: z.enum(['message', 'url', 'screenshot', 'job-offer']),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Inconclusive']),
  heuristicRiskIndex: z.number().int().min(0).max(100),
  summary: z.string().min(1),
  potentialScamCategory: z.string().min(1),
  warningSigns: z.array(WarningSignSchema),
  highlightedPhrases: z.array(HighlightedPhraseSchema),
  attackBreakdown: z.array(AttackTechniqueSchema),
  rubricBreakdown: z.array(RubricFactorSchema),
  missingInformation: z.array(z.string()),
  recommendedActions: z.array(z.string()),
  independentVerificationSteps: z.array(z.string()),
  actionPlan: SmartActionPlanSchema,
  uncertaintyNotice: z.string().min(1),
  submittedText: z.string().optional(),
  privacyRedacted: z.boolean().optional(),
  extractedTextPreview: z.string().optional(),
  structuralUrlAnalysis: UrlStructuralAnalysisSchema.optional(),
  analyzedAt: z.string(),
  isDemoSample: z.boolean().optional(),
  demoLabel: z.string().optional(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export interface MessageScanRequest {
  content: string;
  channel?: 'sms' | 'whatsapp' | 'email' | 'social' | 'other';
  privacyRedacted?: boolean;
  isDemoSample?: boolean;
  demoLabel?: string;
}

export interface UrlScanRequest {
  url: string;
  context?: string;
  privacyRedacted?: boolean;
  isDemoSample?: boolean;
  demoLabel?: string;
}

export interface ScreenshotScanRequest {
  imageBase64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  context?: string;
  privacyRedacted?: boolean;
  isDemoSample?: boolean;
  demoLabel?: string;
}

export interface JobOfferScanRequest {
  content: string;
  companyName?: string;
  salaryClaimed?: string;
  feeRequested?: string;
  recruiterContact?: string;
  privacyRedacted?: boolean;
  isDemoSample?: boolean;
  demoLabel?: string;
}

export interface DemoHandoff {
  targetPage: 'message' | 'url' | 'job-offer' | 'screenshot';
  label: string;
  content?: string;
  channel?: 'sms' | 'whatsapp' | 'email' | 'social' | 'other';
  url?: string;
  companyName?: string;
  salaryClaimed?: string;
  feeRequested?: string;
  recruiterContact?: string;
  autoRun?: boolean;
}
