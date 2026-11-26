import type { AnalysisResult } from '../../shared/types';

/**
 * Formats an actual AnalysisResult into a transparent plain-text report
 * suitable for copying or downloading as a .txt file.
 */
export function formatAnalysisReportText(result: AnalysisResult): string {
  const lines: string[] = [];

  lines.push('================================================================');
  lines.push('SENTRA AI — DIGITAL SAFETY ANALYSIS REPORT');
  lines.push('Tagline: Think Before You Trust.');
  lines.push('================================================================');
  lines.push(`Scan Module:          ${result.scanType.toUpperCase()}`);
  lines.push(`Analyzed At (UTC):    ${result.analyzedAt}`);
  if (result.privacyRedacted) {
    lines.push('Privacy Shield:       Active (Sensitive fields redacted before AI scan)');
  }
  if (result.isDemoSample) {
    lines.push(`Demo Sample:          Yes (${result.demoLabel || 'Fictional Hackathon Sample'})`);
  }
  lines.push(`Risk Classification:  ${result.riskLevel}`);
  lines.push(`Heuristic Risk Index: ${result.heuristicRiskIndex} / 100 (Evidence-based rubric score, NOT a statistical probability)`);
  lines.push(`Potential Category:   ${result.potentialScamCategory}`);
  lines.push('');

  lines.push('--- ANALYSIS SUMMARY ---');
  lines.push(result.summary);
  lines.push('');

  if (result.highlightedPhrases.length > 0) {
    lines.push('--- EVIDENCE INTELLIGENCE (VERIFIED SUSPICIOUS PHRASES) ---');
    result.highlightedPhrases.forEach((hp, idx) => {
      lines.push(`${idx + 1}. [${hp.severity.toUpperCase()}] "${hp.phrase}"`);
      lines.push(`   Explanation: ${hp.explanation}`);
    });
    lines.push('');
  }

  if (result.attackBreakdown.length > 0) {
    lines.push('--- SCAM ATTACK BREAKDOWN ---');
    result.attackBreakdown.forEach((tech) => {
      const status = tech.detected ? `DETECTED (${tech.severity.toUpperCase()})` : 'NOT OBSERVED';
      lines.push(`- ${tech.label}: ${status}`);
      lines.push(`  Reasoning: ${tech.reasoning}`);
      if (tech.evidence.length > 0) {
        lines.push(`  Evidence:  ${tech.evidence.map((e) => `"${e}"`).join('; ')}`);
      }
    });
    lines.push('');
  }

  if (result.structuralUrlAnalysis) {
    const s = result.structuralUrlAnalysis;
    lines.push('--- LOCAL URL STRUCTURAL ANALYSIS (URL WAS NOT VISITED) ---');
    lines.push(`Defanged URL:         ${s.defangedUrl}`);
    lines.push(`Scheme:               ${s.scheme}`);
    lines.push(`Hostname:             ${s.hostname || 'Unparsed'}`);
    lines.push(`TLD:                  ${s.tld || 'N/A'}`);
    lines.push(`Subdomain Depth:      ${s.subdomainCount}`);
    lines.push(`Query Parameters:     ${s.queryParamCount}`);
    if (s.structuralNotes.length > 0) {
      lines.push('Observations:');
      s.structuralNotes.forEach((note) => lines.push(`  - ${note}`));
    }
    lines.push('');
  }

  if (result.extractedTextPreview) {
    lines.push('--- VISIBLE TEXT OBSERVED IN SCREENSHOT ---');
    lines.push(result.extractedTextPreview);
    lines.push('');
  }

  lines.push('--- DETECTED WARNING SIGNS & EVIDENCE ---');
  if (result.warningSigns.length === 0) {
    lines.push('No strong warning signs were detected in the submitted content.');
  } else {
    result.warningSigns.forEach((ws, idx) => {
      lines.push(`${idx + 1}. [${ws.severity.toUpperCase()}] ${ws.title}`);
      lines.push(`   Evidence:    "${ws.evidence}"`);
      lines.push(`   Explanation: ${ws.explanation}`);
    });
  }
  lines.push('');

  lines.push('--- TRANSPARENT SCORING RUBRIC ---');
  result.rubricBreakdown.forEach((item) => {
    lines.push(`- ${item.factor}: ${item.score}/${item.maxScore}`);
    lines.push(`  Rationale: ${item.rationale}`);
  });
  lines.push('');

  lines.push('--- SMART ACTION PLAN ---');
  lines.push('1) Immediate Safety Recommendations:');
  result.actionPlan.immediateActions.forEach((a, i) => lines.push(`   ${i + 1}. ${a}`));
  lines.push('');
  lines.push('2) Independent Verification Steps:');
  result.actionPlan.verificationSteps.forEach((v, i) => lines.push(`   ${i + 1}. ${v}`));
  lines.push('');
  lines.push('3) Fraud Reporting Guidance:');
  result.actionPlan.reportingGuidance.forEach((r, i) => lines.push(`   ${i + 1}. ${r}`));
  lines.push('');
  lines.push('4) Recovery Steps (If Money or Information Was Already Shared):');
  result.actionPlan.recoverySteps.forEach((rec, i) => lines.push(`   ${i + 1}. ${rec}`));
  lines.push('');

  lines.push('--- MISSING INFORMATION & VERIFICATION GAPS ---');
  if (result.missingInformation.length === 0) {
    lines.push('- None listed.');
  } else {
    result.missingInformation.forEach((m) => lines.push(`- ${m}`));
  }
  lines.push('');

  lines.push('--- UNCERTAINTY & SAFETY DISCLOSURE ---');
  lines.push(result.uncertaintyNotice);
  lines.push(
    'Important: A Low-risk result never proves that a message, URL, screenshot, or offer is safe or legitimate. Always verify critical claims independently through official channels.'
  );
  lines.push('================================================================');

  return lines.join('\n');
}

export function downloadTextReport(result: AnalysisResult): void {
  const text = formatAnalysisReportText(result);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const timestamp = result.analyzedAt.replace(/[:.]/g, '-').slice(0, 19);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `sentra-ai-${result.scanType}-report-${timestamp}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
