// ============================================================
// PROPOSAL PDF GENERATOR — CATGORITHM DIGITAL GROWTH
// Strictly 2-Page A4 Executive Proposal Document.
// Design based on Studio Shodwe template with #d6c26e gold accent,
// #333132 dark grey continuation line, dual-page footers,
// 15pt bold centered headings, 13pt justified descriptions,
// font-colored bullet points, and lowered footer text.
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProposalData } from '../types/proposal';
import { PROPOSAL_LOGO_BASE64 } from './proposalLogoBase64';

const PAGE_W = 210;
const MARGIN = 18;
const PRINTABLE_W = PAGE_W - MARGIN * 2; // 174mm

// Brand Color Palette
const GOLD_COLOR: [number, number, number] = [214, 194, 110]; // #d6c26e
const DARK_GREY: [number, number, number] = [51, 49, 50];     // #333132
const CHARCOAL: [number, number, number] = [31, 41, 55];       // #1f2937 (Font color)
const SLATE_DARK: [number, number, number] = [15, 23, 42];     // #0f172a (Primary text)
const GRAY_TEXT: [number, number, number] = [75, 85, 99];      // #4b5563
const MUTED_GRAY: [number, number, number] = [107, 114, 128];  // #6b7280

function formatPDFINR(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN');
  return `Rs. ${formatted}`;
}

/**
 * Page 1 Header line:
 * Yellow/Gold #d6c26e on the left (60mm, 1mm thickness)
 * Continuing with Dark Grey #333132 (0.3mm thickness) to the right margin
 */
function drawPage1HeaderLine(pdf: jsPDF, yPos: number): void {
  const goldWidth = 60;
  pdf.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  pdf.rect(MARGIN, yPos, goldWidth, 1.0, 'F');
  pdf.setFillColor(DARK_GREY[0], DARK_GREY[1], DARK_GREY[2]);
  pdf.rect(MARGIN + goldWidth, yPos + 0.35, PRINTABLE_W - goldWidth, 0.3, 'F');
}

/**
 * Footer on both pages:
 * Line at 280mm. Text lowered to 289mm (9mm gap below the line).
 */
function drawFooter(pdf: jsPDF, email: string = 'teamcatgorithm@gmail.com', website: string = 'www.catgorithm.in'): void {
  const lineY = 280;
  const textY = 289;

  pdf.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  pdf.rect(MARGIN, lineY, PRINTABLE_W, 0.3, 'F');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  pdf.text(email, MARGIN, textY);
  pdf.text(website, PAGE_W - MARGIN, textY, { align: 'right' });
}

/**
 * Draws a bullet item with bullet dot in font color (CHARCOAL),
 * bold title (13pt), and flowing justified/wrapped description (13pt).
 */
function drawBulletItem(doc: jsPDF, title: string, desc: string, y: number, lineH: number = 5.2): number {
  const bulletX = MARGIN + 2;
  const textX = MARGIN + 6;
  const maxW = PRINTABLE_W - 6;

  // Bullet Dot (same color as font: CHARCOAL)
  doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.circle(bulletX, y - 1, 0.9, 'F');

  if (!title) {
    // Pure description bullet
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(desc, textX, y, { align: 'justify', maxWidth: maxW, lineHeightFactor: 1.3 });
    const lines = doc.splitTextToSize(desc, maxW);
    return y + lines.length * lineH + 2;
  }

  // Title in Bold
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  const titleText = title + ' : ';
  const titleW = doc.getTextWidth(titleText);
  doc.text(titleText, textX, y);

  // Description in Normal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

  const words = desc.split(' ');
  let line1 = '';
  let idx = 0;
  const remW = maxW - titleW - 2.0; // 2mm gap after title

  while (idx < words.length) {
    const test = line1 ? line1 + ' ' + words[idx] : words[idx];
    if (doc.getTextWidth(test) <= remW) {
      line1 = test;
      idx++;
    } else {
      break;
    }
  }

  // Print first line with gap after title
  doc.text(line1, textX + titleW + 2.0, y);

  const remWords = words.slice(idx).join(' ');
  if (remWords) {
    const nextLines = doc.splitTextToSize(remWords, maxW);
    for (let i = 0; i < nextLines.length; i++) {
      y += lineH;
      doc.text(nextLines[i], textX, y);
    }
  }

  return y + lineH + 1.8;
}

export async function generateProposalPDF(data: ProposalData): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const clientNameDisplay = (data.clientName || 'Valued Client').trim().toUpperCase();
  const proposalDateDisplay = data.proposalDate || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });

  // ============================================================
  // PAGE 1: Brand Introduction, Network Highlights & Value Prop
  // Headings: Size 15, Bold, Centered
  // Descriptions: Size 13, Normal, Justified
  // NO underline under headings
  // Bullet dots: Same color as font
  // ============================================================

  // 1. Logo at Top Left
  try {
    doc.addImage(PROPOSAL_LOGO_BASE64, 'PNG', MARGIN, 10, 38, 12);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.text('CATGORITHM', MARGIN, 20);
  }

  // 2. Header Line: Yellow #d6c26e + Dark Grey #333132
  drawPage1HeaderLine(doc, 25);

  // 3. Document Title Block (Center Aligned, Equal Headings)
  let y = 34;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('BUS SCREEN ADVERTISEMENT PROPOSAL FOR', PAGE_W / 2, y, { align: 'center' });

  y += 7;
  doc.setFontSize(18);
  doc.text(clientNameDisplay, PAGE_W / 2, y, { align: 'center' });

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  doc.text(`Prepared by: ${data.preparedBy || 'Catgorithm'}  |  ${proposalDateDisplay}`, PAGE_W / 2, y, { align: 'center' });

  // 4. Section 1: THE OBJECTIVE (Centered, 15pt, NO underline)
  y += 11;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(data.objectiveTitle || 'THE OBJECTIVE', PAGE_W / 2, y, { align: 'center' });

  y += 6.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

  const p1 = data.objectiveP1 || "In today's fast-moving market, building sustained top-of-mind brand visibility is essential to winning consumer preference. Catgorithm transforms everyday commuter journeys into an active, high-impact digital broadcasting channel across Kollam's prime arterial corridors.";
  const p2 = data.objectiveP2 || "By placing high-definition video advertisements directly before seated, attentive passengers during daily travel, our network generates repeated daily impressions, drives strong brand recall, and directs qualified footfall to your physical outlets and digital channels.";

  // Justified descriptions
  doc.text(p1, MARGIN, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.28 });
  const p1Lines = doc.splitTextToSize(p1, PRINTABLE_W);
  y += p1Lines.length * 5.3 + 3;

  doc.text(p2, MARGIN, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.28 });
  const p2Lines = doc.splitTextToSize(p2, PRINTABLE_W);
  y += p2Lines.length * 5.3 + 7;

  // 5. Section 2: OUR DIGITAL TRANSIT ADVERTISING NETWORK (Centered, 15pt, NO underline)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR DIGITAL TRANSIT ADVERTISING NETWORK', PAGE_W / 2, y, { align: 'center' });

  y += 6.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const netIntro = "Our proprietary infotainment network combines high-definition commercial screens with high-traffic commuter routes across Kollam, creating a high-retention environment for your brand:";
  doc.text(netIntro, MARGIN, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.28 });
  const netLines = doc.splitTextToSize(netIntro, PRINTABLE_W);
  y += netLines.length * 5.3 + 3.5;

  const highlights: [string, string][] = [
    ['32-Inch Commercial Displays', 'Ultra HD digital screens with synchronized audio.'],
    ['7 Prime Transit Corridors', 'Broad geographic coverage connecting Kollam’s prime centers.'],
    ['40–50 Daily Ad Plays / Bus', 'Rotational broadcast providing 1,200+ monthly plays per bus.'],
    ['15,000+ Daily Commuter Reach*', 'Captive passenger viewership with extended seated dwell time.'],
    ['24/7 Campaign Monitoring', 'Dedicated advertiser web portal for transparent real-time verification.']
  ];

  highlights.forEach(([title, desc]) => {
    y = drawBulletItem(doc, title, desc, y, 5.2);
  });

  y += 3.5;

  // 6. Section 3: WHY CATGORITHM? (Centered, 15pt, NO underline)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('WHY CATGORITHM?', PAGE_W / 2, y, { align: 'center' });

  y += 6.5;
  const whyItems: [string, string][] = [
    ['Captive Audience Engagement', 'Passengers spend 20–45 minutes in a seated, distraction-free environment.'],
    ['Repeated Daily Frequency', 'Daily commuters travel the same corridors twice a day, reinforcing brand recall.'],
    ['Zero Material Costs', '100% digital video execution without recurring banner printing or mounting delays.'],
    ['Complete Transparency', 'Live web dashboard access lets you independently verify screen health and play logs.']
  ];

  whyItems.forEach(([title, desc]) => {
    y = drawBulletItem(doc, title, desc, y, 5.2);
  });

  // Footnote
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(MUTED_GRAY[0], MUTED_GRAY[1], MUTED_GRAY[2]);
  doc.text('* Indicative network reach based on passenger capacity, route frequency, and daily operating hours.', MARGIN, 273);

  // Page 1 Footer (Line at 280, text lowered to 289)
  drawFooter(doc, data.contactEmail, data.website);

  // ============================================================
  // PAGE 2: Deliverables, Dashboard, Packages, Commitment
  // NO Logo, NO Header line, NO Running Title, NO Signoff block
  // Headings: Size 15, Bold, Centered
  // Descriptions: Size 13, Normal, Justified
  // Bullet dots: Same color as font
  // NO highlight on Option 2
  // ONLY Footer at the bottom
  // ============================================================
  doc.addPage();

  y = 26;

  // Section 1: CAMPAIGN DELIVERABLES (Centered, 15pt, NO underline)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('CAMPAIGN DELIVERABLES', PAGE_W / 2, y, { align: 'center' });

  y += 7;

  const deliverables = [
    'Scheduled video advertisement playback on 32-inch commercial displays with onboard audio.',
    'Rotational broadcast across full operating transit hours (40–50 plays per bus each day).',
    'Turnkey media ingestion, scheduling, and screen synchronization managed by Catgorithm.',
    'Dedicated advertiser dashboard credentials for independent real-time campaign audit.'
  ];

  deliverables.forEach(d => {
    y = drawBulletItem(doc, '', d, y, 5.2);
  });

  y += 4;

  // Section 2: LIVE CAMPAIGN MONITORING (ADVERTISER DASHBOARD) (Centered, 15pt, NO underline)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('LIVE CAMPAIGN MONITORING (ADVERTISER DASHBOARD)', PAGE_W / 2, y, { align: 'center' });

  y += 7;

  const monitoringPoints: [string, string][] = [
    ['Active Buses & Screens', 'Live tracking of broadcast hardware and fleet assignments.'],
    ['Plays per Screen', 'Verified daily play count timestamps and cumulative broadcast logs.'],
    ['Total Daily Screen Time', 'Cumulative airtime logs per vehicle throughout operating transit hours.'],
    ['Creative Playback Preview', 'Visual preview of running creatives with active campaign dates.']
  ];

  monitoringPoints.forEach(([head, sub]) => {
    y = drawBulletItem(doc, head, sub, y, 5.2);
  });

  y += 5;

  // Section 3: PROPOSED CAMPAIGN INVESTMENT (Centered, 15pt, NO underline)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);

  if (data.packageMode === 'none') {
    // Mode A: No Package Table (General Proposal)
    doc.text('CAMPAIGN INVESTMENT & TAILORED FLIGHT PLANS', PAGE_W / 2, y, { align: 'center' });
    y += 7;

    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.roundedRect(MARGIN, y, PRINTABLE_W, 38, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    const noPkgText1 = "Every business has unique campaign objectives and flight requirements. Catgorithm campaigns are fully customizable across fleet size (1 to 10 private buses), advertisement durations (10s to 60s), and campaign periods (from 1 day up to annual commitments).";
    const noPkgText2 = "Our media planning team will structure a high-impact route allocation and flight frequency tailored specifically to your promotional calendar. Contact us to finalize your custom package.";

    doc.text(noPkgText1, MARGIN + 6, y + 8, { align: 'justify', maxWidth: PRINTABLE_W - 12, lineHeightFactor: 1.3 });
    const n1Lines = doc.splitTextToSize(noPkgText1, PRINTABLE_W - 12);
    const nextY = y + 8 + n1Lines.length * 5.3 + 3;

    doc.text(noPkgText2, MARGIN + 6, nextY, { align: 'justify', maxWidth: PRINTABLE_W - 12, lineHeightFactor: 1.3 });
    y += 46;
  } else if (data.packageMode === 'single' && data.singlePackage) {
    // Mode B: Single Confirmed Package
    const pkg = data.singlePackage;
    doc.text('PROPOSED CAMPAIGN INVESTMENT', PAGE_W / 2, y, { align: 'center' });
    y += 5.5;

    const finalPrice = pkg.customPriceOverride !== undefined ? pkg.customPriceOverride : pkg.calculatedPrice;

    // NO Monitoring Dashboard row in table
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [['Campaign Particulars', 'Package Details']],
      body: [
        ['Fleet Allocation', `${pkg.buses} Private Buses (Commercial Screen Displays)`],
        ['Video Ad Duration', `${pkg.videoDurationSeconds} Seconds (High-Definition with Audio)`],
        ['Campaign Period', `${pkg.durationLabel || `${pkg.days} Days`}`],
        ['Route Coverage', `${pkg.routesLabel || 'Selected High-Traffic Transit Corridors'}`],
        ['Estimated Total Airplay', `${pkg.monthlyPlaysEstimate || `~${(pkg.buses * 45 * (pkg.days || 30)).toLocaleString('en-IN')} Verified Plays`}`],
        ['Total Campaign Investment', `${formatPDFINR(finalPrice)} (Exclusive of GST)`],
      ],
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10.5,
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 55 },
        1: { halign: 'left' },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    y = (finalY || y + 36) + 8;
  } else if (data.packageMode === 'multiple' && data.multiplePackages && data.multiplePackages.length > 0) {
    // Mode C: Multiple Comparative Options (2 to 3 packages)
    const pkgs = data.multiplePackages.slice(0, 3);
    doc.text('PROPOSED CAMPAIGN INVESTMENT OPTIONS', PAGE_W / 2, y, { align: 'center' });
    y += 5.5;

    const headRow = ['Campaign Particulars'];
    pkgs.forEach((p, idx) => {
      headRow.push(p.name || `Option ${idx + 1}`);
    });

    const fleetRow = ['Fleet Allocation'];
    const durationRow = ['Ad Duration'];
    const periodRow = ['Campaign Period'];
    const playsRow = ['Estimated Total Plays'];
    const investRow = ['Campaign Investment'];

    pkgs.forEach(p => {
      fleetRow.push(`${p.buses} Private Buses`);
      durationRow.push(`${p.videoDurationSeconds} Seconds`);
      periodRow.push(p.durationLabel || `${p.days} Days`);
      playsRow.push(p.monthlyPlaysEstimate || `~${(p.buses * 45 * (p.days || 30)).toLocaleString('en-IN')} Plays`);
      const pPrice = p.customPriceOverride !== undefined ? p.customPriceOverride : p.calculatedPrice;
      investRow.push(formatPDFINR(pPrice));
    });

    const colWidth = Math.floor((PRINTABLE_W - 45) / pkgs.length);
    const colStyles: Record<number, any> = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 45 },
    };
    for (let c = 1; c <= pkgs.length; c++) {
      // NO yellow fill or highlight on Option 2! Uniform clean styling across all options
      colStyles[c] = { halign: 'center', cellWidth: colWidth };
    }

    // NO Monitoring Dashboard row in table
    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [headRow],
      body: [
        fleetRow,
        durationRow,
        periodRow,
        playsRow,
        investRow,
      ],
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10,
      },
      columnStyles: colStyles,
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    y = (finalY || y + 36) + 8;
  }

  // Section 4: OUR COMMITMENT (Centered, 15pt, NO underline)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR COMMITMENT', PAGE_W / 2, y, { align: 'center' });

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const commitmentText = `At Catgorithm, we are committed to providing reliable, measurable, and high-impact digital transit advertising. From seamless scheduling to verified dashboard reporting, we ensure your brand captures unmissable presence along Kollam's busiest corridors. We look forward to partnering with ${clientNameDisplay}.`;

  doc.text(commitmentText, MARGIN, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.32 });
  const cLines = doc.splitTextToSize(commitmentText, PRINTABLE_W);
  y += cLines.length * 5.3;

  // Page 2 Footer (Line at 280, text lowered to 289)
  drawFooter(doc, data.contactEmail, data.website);

  // Trigger download with sanitized filename
  const cleanName = (data.clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Catgorithm_Proposal_${cleanName}.pdf`;
  doc.save(filename);
}
