import type { DemoHandoff } from '../../shared/types';

export interface DashboardDemoScenario {
  id: string;
  title: string;
  shortDesc: string;
  tag: string;
  expectedCue: string;
  handoff: DemoHandoff;
}

/**
 * Clearly labeled FICTIONAL examples for Hackathon Demo Mode.
 * All names, domains, amounts, and phone numbers are invented for demonstration only.
 */
export const DASHBOARD_DEMO_SCENARIOS: DashboardDemoScenario[] = [
  {
    id: 'fake-part-time-job',
    title: 'Fake Part-Time Job Offer',
    shortDesc: 'WhatsApp/Telegram daily payout task offer asking for an upfront activation deposit.',
    tag: 'Job Offer Checker',
    expectedCue: 'Unrealistic pay · Upfront fee · Off-platform chat',
    handoff: {
      targetPage: 'job-offer',
      label: 'Fictional Demo: Fake Part-Time Job Offer',
      companyName: 'Global Media Ratings Pvt Ltd (Fictional)',
      salaryClaimed: '₹4,500 – ₹9,000 per day for 45 minutes',
      feeRequested: '₹1,500 refundable merchant activation fee via UPI',
      recruiterContact: 'hiring.desk.tasks2026@gmail.com / Telegram @hr_fastpay_demo',
      content:
        'Hello! You have been selected for a flexible Work-From-Home Part-Time Job with Global Media Ratings. Earn ₹4,500 to ₹9,000 daily just by rating hotel listings and liking short videos for 45 minutes from your phone. No interview or experience needed! Only 4 slots left today. To activate your VIP task account and receive instant daily payouts, message our HR manager on Telegram @hr_fastpay_demo and pay the refundable ₹1,500 registration deposit via UPI within 30 minutes.',
      autoRun: true,
    },
  },
  {
    id: 'bank-verification',
    title: 'Suspicious Bank Verification Message',
    shortDesc: 'Urgent SMS threatening immediate account suspension with a lookalike KYC link.',
    tag: 'Message Scanner',
    expectedCue: 'Impersonation · Countdown urgency · Lookalike URL',
    handoff: {
      targetPage: 'message',
      label: 'Fictional Demo: Suspicious Bank Verification Message',
      channel: 'sms',
      content:
        'URGENT ALERT from National Trust Bank: Your savings account ending XXXX will be PERMANENTLY BLOCKED in 2 hours due to incomplete PAN/KYC verification. Avoid suspension immediately by confirming your net-banking login and 6-digit OTP at: http://nationaltrust-kyc-update.verify-secure-now.xyz/account/login',
      autoRun: true,
    },
  },
  {
    id: 'fake-lottery',
    title: 'Fake Lottery Notification',
    shortDesc: 'Unsolicited international prize message requesting processing fees and personal IDs.',
    tag: 'Message Scanner',
    expectedCue: 'Unsolicited prize · Advance fee · Identity harvest',
    handoff: {
      targetPage: 'message',
      label: 'Fictional Demo: Fake Lottery Notification',
      channel: 'whatsapp',
      content:
        'CONGRATULATIONS!! Your mobile number was randomly selected as the Grand Winner of the 2026 International Digital Draw! You have won $250,000 USD (approx ₹2.08 Crore). Keep this winning code WIN-99482 strictly confidential. To release your bank transfer today, reply with your full name, copy of government ID, bank account details, and transfer the mandatory $120 customs clearance charge via UPI or gift voucher before 6 PM.',
      autoRun: true,
    },
  },
  {
    id: 'delivery-payment',
    title: 'Suspicious Delivery Payment Request',
    shortDesc: 'Parcel redelivery SMS asking for a small card fee through a shortened link.',
    tag: 'Message Scanner',
    expectedCue: 'Fake carrier · Shortened URL · Card fee trap',
    handoff: {
      targetPage: 'message',
      label: 'Fictional Demo: Suspicious Delivery Payment Request',
      channel: 'sms',
      content:
        'ExpressPost Notice: Your parcel #EP-88412 could not be delivered today due to an incomplete street address. Your package will be returned to sender in 12 hours. Update your address and pay the ₹24 redelivery verification fee using your debit/credit card here: https://bit.ly/3xDemoParcelTrack99',
      autoRun: true,
    },
  },
  {
    id: 'legitimate-comparison',
    title: 'Legitimate-Looking Message (Comparison)',
    shortDesc: 'Standard dental clinic appointment reminder with no links, urgency, or payment demands.',
    tag: 'Message Scanner',
    expectedCue: 'Baseline comparison · No credential or payment ask',
    handoff: {
      targetPage: 'message',
      label: 'Fictional Demo: Legitimate-Looking Comparison Message',
      channel: 'sms',
      content:
        'Reminder from Greenview Family Dental Clinic: Your routine dental cleaning with Dr. Nair is scheduled for Thursday, 14 May at 10:30 AM. If you need to reschedule, please call our front desk at the clinic number listed on your appointment card. No prepayment or online login is required.',
      autoRun: true,
    },
  },
];

export const DEMO_URLS: Array<{ label: string; url: string; context: string }> = [
  {
    label: 'Lookalike Bank KYC URL',
    url: 'http://sbi-online-kyc-alert.secure-verify-portal.xyz/login?session=urgent_block&otp=req',
    context: 'Received in an SMS claiming my bank account will be blocked in 2 hours.',
  },
  {
    label: 'Authority "@" Trick URL',
    url: 'https://www.paypal.com@198.51.100.42/verify-billing/confirm-card',
    context: 'Found in an email claiming an unauthorized $499 invoice was billed.',
  },
  {
    label: 'Shortened Delivery Link',
    url: 'https://bit.ly/3xDemoParcelFee',
    context: 'SMS asking to pay a small redelivery charge to release a parcel.',
  },
  {
    label: 'Official Domain Comparison',
    url: 'https://www.cybercrime.gov.in/',
    context: 'Reference comparison of a clean official government domain structure.',
  },
];

export const DEMO_JOB_OFFERS: Array<{
  label: string;
  companyName: string;
  salaryClaimed: string;
  feeRequested: string;
  recruiterContact: string;
  content: string;
}> = [
  {
    label: 'Fake Task / Deposit Job',
    companyName: 'Global Media Ratings Pvt Ltd (Fictional)',
    salaryClaimed: '₹4,500 – ₹9,000 per day',
    feeRequested: '₹1,500 UPI registration deposit',
    recruiterContact: 'hiring.desk.tasks2026@gmail.com / Telegram',
    content:
      'Congratulations! You are shortlisted for our Part-Time Remote Review Executive role. Work 1 hour daily from your phone and earn ₹4,500–₹9,000 per day. No resume or interview required. Confirm your seat immediately by paying a refundable ₹1,500 merchant activation deposit via UPI to our Telegram coordinator.',
  },
  {
    label: 'Fake Upfront Equipment/Visa Offer',
    companyName: 'NorthStar Tech Overseas (Fictional)',
    salaryClaimed: '$8,500 / month remote',
    feeRequested: '$350 laptop courier & document verification fee',
    recruiterContact: 'northstar.careers.hr@outlook.com',
    content:
      'Dear Candidate, Following your profile review, you have been directly selected as Junior Data Analyst at $8,500/month with zero interview rounds. To dispatch your company MacBook and complete visa sponsorship paperwork, please transfer $350 to our designated logistics vendor via crypto or wire transfer within 24 hours.',
  },
  {
    label: 'Legitimate-Looking Offer (Comparison)',
    companyName: 'Kaveri Software Systems (Fictional)',
    salaryClaimed: '₹6.5 LPA (standard entry-level range)',
    feeRequested: 'None',
    recruiterContact: 'careers@kaverisoftware.example.com',
    content:
      'Dear Applicant, Thank you for completing both technical interview rounds with our engineering team on 18 April. We are pleased to share your formal offer letter for the Graduate Frontend Engineer role (₹6.5 LPA, Kochi hybrid). Please review the attached terms and respond via our careers portal by next Friday. As always, we never charge candidates any onboarding or equipment fees.',
  },
];

/**
 * Generates a realistic, clearly watermarked FICTIONAL scam screenshot PNG locally
 * on an HTML5 canvas so hackathon judges can test the live Gemini multimodal
 * Screenshot Scanner in a single click without needing an external file.
 */
export async function generateDemoScamScreenshotFile(): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 760;
  canvas.height = 960;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to initialize canvas for demo screenshot.');
  }

  // Dark chat phone mockup background
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Top fictional watermark bar
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, canvas.width, 64);
  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('FICTIONAL DEMO SCREENSHOT — FOR TESTING ONLY', 28, 40);

  // Fake messaging header
  ctx.fillStyle = '#172554';
  ctx.fillRect(0, 64, canvas.width, 84);
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('+91 90000 00000 (Unknown Sender)', 28, 108);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '16px sans-serif';
  ctx.fillText('Claims to be: QuickPay Refund Support', 28, 134);

  // Incoming scam chat bubble 1
  ctx.fillStyle = '#1E293B';
  roundRect(ctx, 28, 180, 660, 260, 18);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('URGENT: Pending Cashback Refund ₹14,999', 52, 224);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '20px sans-serif';
  const lines1 = [
    'Dear Customer, your ₹14,999 UPI refund will EXPIRE in 15',
    'minutes. To RECEIVE the refund into your bank account',
    'immediately, open your UPI app, accept the collect request',
    'for ₹14,999, and enter your 6-digit UPI PIN.',
    '',
    'Or click fast: http://quickpay-refund-claim.xyz/upi-verify',
  ];
  lines1.forEach((line, idx) => {
    ctx.fillStyle = idx === 5 ? '#38BDF8' : '#E2E8F0';
    ctx.fillText(line, 52, 266 + idx * 30);
  });

  // Incoming scam chat bubble 2 (Fake QR / urgency block)
  ctx.fillStyle = '#1E293B';
  roundRect(ctx, 28, 470, 660, 320, 18);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.stroke();

  ctx.fillStyle = '#F87171';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('FINAL WARNING — DO NOT DELAY', 52, 514);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = '19px sans-serif';
  const lines2 = [
    'Also install our QuickSupport APK so our agent can credit',
    'your account faster. Share the 6-digit OTP sent to your',
    'mobile number to verify refund ownership.',
  ];
  lines2.forEach((line, idx) => {
    ctx.fillText(line, 52, 554 + idx * 30);
  });

  // Stylized placeholder QR box
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(52, 650, 110, 110);
  ctx.fillStyle = '#0F172A';
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if ((r + c) % 2 === 0 || (r === 0 && c < 2) || (r === 4 && c > 2)) {
        ctx.fillRect(62 + c * 18, 660 + r * 18, 14, 14);
      }
    }
  }
  ctx.fillStyle = '#CBD5E1';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('SCAN & ENTER UPI PIN TO', 184, 695);
  ctx.fillText('RECEIVE ₹14,999 REFUND', 184, 725);
  ctx.fillStyle = '#94A3B8';
  ctx.font = '15px sans-serif';
  ctx.fillText('(Fictional mock illustration — not a real QR)', 184, 755);

  // Footer
  ctx.fillStyle = '#64748B';
  ctx.font = '16px sans-serif';
  ctx.fillText('Sentra AI Hackathon Demo Asset · Generated locally in browser', 28, 920);

  return new Promise<File>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate demo PNG image.'));
        return;
      }
      resolve(new File([blob], 'fictional-upi-refund-scam-demo.png', { type: 'image/png' }));
    }, 'image/png');
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
