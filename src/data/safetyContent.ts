export interface SafetyTopic {
  id: string;
  category: string;
  title: string;
  summary: string;
  howItWorks: string;
  redFlags: string[];
  verificationChecklist: string[];
  reportingGuidance: string[];
}

export const SAFETY_TOPICS: SafetyTopic[] = [
  {
    id: 'phishing',
    category: 'Messaging & Email',
    title: 'Phishing & Smishing Attacks',
    summary:
      'Deceptive emails, SMS, or messaging links pretending to be banks, delivery carriers, or government services to steal logins and OTPs.',
    howItWorks:
      'Attackers send urgent alerts about suspended accounts, failed deliveries, or security breaches with links pointing to lookalike login pages designed to harvest credentials.',
    redFlags: [
      'Urgent countdowns ("account suspended within 2 hours") demanding immediate login.',
      'Lookalike domains using extra hyphens, unusual TLDs (.xyz, .top), or misspelled brand names.',
      'Requests for passwords, PINs, CVV codes, or one-time passcodes via a web link.',
      'Generic greetings paired with mismatched sender email domains.',
    ],
    verificationChecklist: [
      'Do not click links or call numbers listed inside the suspicious message.',
      'Open the official mobile app or manually type the organization’s verified website.',
      'Check your official account notifications or call the number printed on the back of your bank card.',
    ],
    reportingGuidance: [
      'Forward phishing emails to the impersonated organization’s official abuse address.',
      'Report spam SMS through your telecom provider’s spam reporting tool or DND app.',
      'File a report at your national cybercrime portal if credentials or funds were exposed.',
    ],
  },
  {
    id: 'upi-fraud',
    category: 'Digital Payments',
    title: 'UPI & Payment Request Fraud',
    summary:
      'Scammers trick victims into approving "Collect" payment requests or scanning QR codes under the guise of receiving a refund, cashback, or buyer payment.',
    howItWorks:
      'Fraudsters pose as online marketplace buyers, customer support agents, or prize coordinators and send a UPI Collect request or QR code claiming you must enter your UPI PIN to receive funds.',
    redFlags: [
      'Anyone asking you to enter your UPI PIN or scan a QR code to RECEIVE money.',
      'Screen-sharing app requests (AnyDesk, TeamViewer, QuickSupport) during a "refund" call.',
      'Fake screenshots of credited payments followed by pressure to "return the excess amount".',
      'Customer care numbers found in unverified search ads or social media comments.',
    ],
    verificationChecklist: [
      'Remember: entering a UPI PIN ONLY sends money out—it is never required to receive funds.',
      'Check your actual bank balance inside your official banking app instead of trusting SMS or screenshots.',
      'Reject any unexpected collect request and block the requesting VPA handle.',
    ],
    reportingGuidance: [
      'Call your bank and UPI app support immediately to raise a dispute with the UTR transaction reference.',
      'Report financial cyber fraud promptly (in India, call 1930 or visit cybercrime.gov.in; elsewhere contact your bank and local financial fraud authority).',
      'Preserve transaction IDs, VPA handles, and call logs as evidence.',
    ],
  },
  {
    id: 'fake-jobs',
    category: 'Employment',
    title: 'Fake Job & Part-Time Task Offers',
    summary:
      'Fraudulent recruitment offers promising high daily income for simple tasks (liking videos, reviewing hotels) or demanding upfront registration and training fees.',
    howItWorks:
      'Scammers contact targets on WhatsApp or Telegram with effortless high-pay work. After small initial payouts to build trust, they demand escalating "prepaid task deposits" or "document verification fees" and vanish.',
    redFlags: [
      'Unrealistic pay for minimal effort (e.g., high daily earnings for liking posts or simple data entry).',
      'Upfront demands for registration, security deposits, laptop shipping, or "VIP task" unlocks.',
      'Interviews conducted solely over WhatsApp/Telegram chat without official company email verification.',
      'Recruiters using free personal email domains (@gmail.com) while claiming to represent major firms.',
    ],
    verificationChecklist: [
      'Search the official company careers page to confirm the role actually exists.',
      'Verify the recruiter’s email domain matches the organization’s real domain.',
      'Never pay money to get hired, unlock earnings, or buy equipment from a designated "vendor".',
    ],
    reportingGuidance: [
      'Report fraudulent job listings on the job board or messaging platform where they appeared.',
      'Alert the impersonated company’s official HR or security team.',
      'Report any financial loss to your bank and national cybercrime reporting portal.',
    ],
  },
  {
    id: 'identity-theft',
    category: 'Identity & KYC',
    title: 'Identity Theft & Fake KYC Updates',
    summary:
      'Impersonators posing as banks, telecom providers, or government officers demanding ID copies, biometrics, or remote device access to avoid disconnection.',
    howItWorks:
      'Victims receive alarming notices claiming SIM deactivation, expired KYC, or legal warrants, pressuring them to submit government ID photos, bank details, or install APK files.',
    redFlags: [
      'Threats of immediate SIM cutoff, bank freeze, or "digital arrest" unless you comply on a video call.',
      'Links asking you to install `.apk` files outside official app stores.',
      'Requests to send photos of Aadhaar, PAN, passport, or debit cards over chat.',
    ],
    verificationChecklist: [
      'Complete KYC updates strictly inside official bank branches or verified official apps.',
      'Law enforcement never conducts "digital arrests" or demands transfers to "verification accounts".',
      'Never install APK files sent over WhatsApp, SMS, or Telegram.',
    ],
    reportingGuidance: [
      'If you installed an unknown APK, disconnect from the internet, uninstall the app, and reset passwords from a clean device.',
      'Monitor your credit report and bank statements for unauthorized accounts.',
      'Report identity misuse to your national cybercrime authority.',
    ],
  },
  {
    id: 'investment-scams',
    category: 'Finance & Crypto',
    title: 'Investment, Trading & Crypto Scams',
    summary:
      'Fake trading groups, celebrity-endorsed crypto schemes, and bogus investment apps promising guaranteed high returns with zero risk.',
    howItWorks:
      'Victims are added to curated WhatsApp/Telegram "VIP stock tips" groups where fake members post profits. Victims deposit funds into a counterfeit app that displays fabricated gains but blocks withdrawals with "tax" or "unlock" fees.',
    redFlags: [
      'Guaranteed daily/weekly high returns or "risk-free AI trading bots".',
      'Requests to transfer investment money into rotating personal or unrelated shell bank accounts.',
      'Apps downloaded via direct web links rather than verified regulated brokers.',
      'Withdrawal blocked unless you pay extra "capital gains tax" or "liquidity fees" upfront.',
    ],
    verificationChecklist: [
      'Verify broker and advisor registration directly on your national financial regulator’s database (e.g., SEBI, SEC, FCA).',
      'Never pay additional fees to unlock a withdrawal from a trading platform.',
      'Be skeptical of unsolicited investment groups you were added to without consent.',
    ],
    reportingGuidance: [
      'Stop sending additional funds immediately—paying "unlock taxes" never releases stolen funds.',
      'Report the bank accounts, wallet addresses, and app URLs to your bank and cybercrime authority.',
      'Warn others by reporting impersonated social profiles and group admins.',
    ],
  },
  {
    id: 'social-media',
    category: 'Social Engineering',
    title: 'Social Media & Account Impersonation Scams',
    summary:
      'Cloned or hijacked profiles of friends, colleagues, or influencers asking for emergency money transfers, giveaway fees, or verification codes.',
    howItWorks:
      'Scammers copy a friend’s profile photo or take over their account via an OTP trick, then message contacts claiming a medical emergency or asking them to forward a "login recovery code".',
    redFlags: [
      'A friend or relative suddenly messaging from a new account asking for an urgent money transfer.',
      'Requests to send back a 6-digit verification code "sent to your phone by mistake".',
      'Unsolicited giveaway wins requiring a shipping fee or login link.',
    ],
    verificationChecklist: [
      'Call the friend on their known phone number (outside the chat app) before sending money.',
      'Never share login codes or account recovery links—even if the request seems to come from someone you trust.',
      'Enable two-factor authentication (2FA) using an authenticator app on all social accounts.',
    ],
    reportingGuidance: [
      'Report the impersonating or compromised profile directly through the platform’s Help Center.',
      'Notify the real person via phone so they can alert their other contacts.',
    ],
  },
];
