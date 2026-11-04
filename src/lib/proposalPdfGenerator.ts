// ============================================================
// PROPOSAL PDF GENERATOR — CATGORITHM DIGITAL GROWTH
// Strictly 2-Page A4 Executive Proposal Document.
// Design based on Studio Shodwe template with #d6c26e gold accent,
// #333132 dark grey continuation line, dual-page footers,
// clean bullet alignments, and perfectly balanced vertical distribution.
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProposalData } from '../types/proposal';
import { PROPOSAL_LOGO_BASE64 } from './proposalLogoBase64';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const PRINTABLE_W = PAGE_W - MARGIN * 2; // 174mm

// Brand Color Palette
const GOLD_COLOR: [number, number, number] = [214, 194, 110]; // #d6c26e
const DARK_GREY: [number, number, number] = [51, 49, 50];     // #333132
const CHARCOAL: [number, number, number] = [31, 41, 55];       // #1f2937
const SLATE_DARK: [number, number, number] = [15, 23, 42];     // #0f172a
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
  // Thick yellow/gold bar
  pdf.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  pdf.rect(MARGIN, yPos, goldWidth, 1.0, 'F');
  // Thin dark grey #333132 continuation line
  pdf.setFillColor(DARK_GREY[0], DARK_GREY[1], DARK_GREY[2]);
  pdf.rect(MARGIN + goldWidth, yPos + 0.35, PRINTABLE_W - goldWidth, 0.3, 'F');
}

/**
 * Draws the signature footer on both pages:
 * Thin gold divider line, with official contact email on the left and website on the right.
 */
function drawFooter(pdf: jsPDF, email: string = 'teamcatgorithm@gmail.com', website: string = 'www.catgorithm.in'): void {
  const footerY = 284;
  pdf.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  pdf.rect(MARGIN, footerY, PRINTABLE_W, 0.3, 'F');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  pdf.text(email, MARGIN, footerY + 5);
  pdf.text(website, PAGE_W - MARGIN, footerY + 5, { align: 'right' });
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
  // Evenly distributed across Page 1 from y = 14 to y = 284
  // ============================================================

  // 1. Logo at Top Left
  try {
    doc.addImage(PROPOSAL_LOGO_BASE64, 'PNG', MARGIN, 14, 42, 14);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.text('CATGORITHM', MARGIN, 24);
  }

  // 2. Header Line: Yellow #d6c26e + Dark Grey #333132 continuation
  drawPage1HeaderLine(doc, 33);

  // 3. Document Title & Client Metadata (Centered)
  let y = 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('BUS SCREEN ADVERTISEMENT PROPOSAL FOR', PAGE_W / 2, y, { align: 'center' });

  y += 7.5;
  doc.setFontSize(17);
  doc.text(clientNameDisplay, PAGE_W / 2, y, { align: 'center' });

  y += 6.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  doc.text(`Prepared by: ${data.preparedBy || 'Catgorithm'}  |  ${proposalDateDisplay}`, PAGE_W / 2, y, { align: 'center' });

  // 4. Section 1: The Objective / Opportunity
  y = 80;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(data.objectiveTitle || 'THE OBJECTIVE', MARGIN, y);

  doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  doc.rect(MARGIN, y + 2, 22, 0.6, 'F');

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

  const p1 = data.objectiveP1 || "In today's fast-moving market, building sustained top-of-mind brand visibility is essential to winning consumer preference. Catgorithm transforms everyday commuter journeys into an active, high-impact digital broadcasting channel across Kollam's prime arterial corridors.";
  const p2 = data.objectiveP2 || "By placing high-definition video advertisements directly before seated, attentive passengers during daily travel, our network generates repeated daily impressions, drives strong brand recall, and directs qualified footfall to your physical outlets and digital channels.";

  const splitP1 = doc.splitTextToSize(p1, PRINTABLE_W);
  doc.text(splitP1, MARGIN, y, { lineHeightFactor: 1.4 });
  y += splitP1.length * 4.9 + 5.5;

  const splitP2 = doc.splitTextToSize(p2, PRINTABLE_W);
  doc.text(splitP2, MARGIN, y, { lineHeightFactor: 1.4 });
  y += splitP2.length * 4.9 + 12;

  // 5. Section 2: Our Digital Transit Advertising Network
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR DIGITAL TRANSIT ADVERTISING NETWORK', MARGIN, y);

  doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  doc.rect(MARGIN, y + 2, 22, 0.6, 'F');

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  const netIntro = "Our proprietary infotainment network combines high-definition commercial screens with high-traffic commuter routes across Kollam, creating a high-retention environment for your brand:";
  const splitNet = doc.splitTextToSize(netIntro, PRINTABLE_W);
  doc.text(splitNet, MARGIN, y, { lineHeightFactor: 1.35 });
  y += splitNet.length * 4.8 + 6;

  const highlights: [string, string][] = [
    ['32-Inch Commercial Displays', 'Ultra HD digital screens with synchronized onboard audio.'],
    ['7 Prime Transit Corridors', 'Broad geographic coverage connecting Kollam’s prime commercial centers.'],
    ['40–50 Daily Ad Plays / Bus', 'Rotational high-frequency broadcast providing 1,200+ monthly plays per bus.'],
    ['15,000+ Daily Commuter Reach*', 'Captive passenger viewership with extended seated dwell time during travel.'],
    ['24/7 Campaign Monitoring', 'Dedicated advertiser web portal for transparent real-time play verification.']
  ];

  highlights.forEach(([title, desc]) => {
    // Gold Bullet Dot
    doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.circle(MARGIN + 2, y - 1, 1, 'F');

    // Title in Bold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    const leadText = title + ' : ';
    doc.text(leadText, MARGIN + 6, y);
    const titleW = doc.getTextWidth(leadText);

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(desc, MARGIN + 6 + titleW + 1.5, y);

    y += 6.5;
  });

  y += 7;

  // 6. Section 3: Why Catgorithm?
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('WHY CATGORITHM?', MARGIN, y);

  doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  doc.rect(MARGIN, y + 2, 22, 0.6, 'F');

  y += 9;
  const whyItems: [string, string][] = [
    ['Captive Audience Engagement', 'Passengers spend 20–45 minutes in a seated, distraction-free environment.'],
    ['Repeated Daily Frequency', 'Daily commuters travel the same corridors twice a day, reinforcing brand recall.'],
    ['Zero Material Costs', '100% digital video execution without recurring banner printing or mounting delays.'],
    ['Complete Transparency', 'Live web dashboard access lets you independently verify screen health and play logs.']
  ];

  whyItems.forEach(([title, desc]) => {
    // Dark grey circle dot
    doc.setFillColor(DARK_GREY[0], DARK_GREY[1], DARK_GREY[2]);
    doc.circle(MARGIN + 2, y - 1, 0.9, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    const leadText = title + ' : ';
    doc.text(leadText, MARGIN + 6, y);
    const leadW = doc.getTextWidth(leadText);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(desc, MARGIN + 6 + leadW + 1.5, y);

    y += 6.8;
  });

  // Footnote at bottom above footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(MUTED_GRAY[0], MUTED_GRAY[1], MUTED_GRAY[2]);
  doc.text('* Indicative network reach based on passenger capacity, route frequency, and daily operating hours.', MARGIN, 276);

  // Page 1 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // ============================================================
  // PAGE 2: Deliverables, Dashboard, Packages, Commitment
  // NO Logo, NO Header line, NO Running Title, NO Signoff block
  // ONLY Footer at the bottom
  // Evenly distributed across Page 2 from y = 34 to y = 284
  // ============================================================
  doc.addPage();

  y = 34;

  // Section 1: Campaign Deliverables
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('CAMPAIGN DELIVERABLES', MARGIN, y);

  doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  doc.rect(MARGIN, y + 2, 22, 0.6, 'F');

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

  const deliverables = [
    'Scheduled video advertisement playback on 32-inch commercial displays with onboard audio.',
    'Rotational broadcast across full operating transit hours (40–50 plays per bus each day).',
    'Turnkey media ingestion, scheduling, and screen synchronization managed by Catgorithm.',
    'Dedicated advertiser dashboard credentials for independent real-time campaign audit.'
  ];

  deliverables.forEach(d => {
    doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.circle(MARGIN + 2, y - 1, 1, 'F');
    const lines = doc.splitTextToSize(d, PRINTABLE_W - 6);
    doc.text(lines, MARGIN + 6, y, { lineHeightFactor: 1.35 });
    y += lines.length * 4.6 + 4;
  });

  y += 12;

  // Section 2: Live Campaign Monitoring
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('LIVE CAMPAIGN MONITORING (ADVERTISER DASHBOARD)', MARGIN, y);

  doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  doc.rect(MARGIN, y + 2, 22, 0.6, 'F');

  y += 10;

  const monitoringPoints = [
    ['Active Buses & Screens', 'Live tracking of broadcast hardware and fleet assignments.'],
    ['Plays per Screen', 'Verified daily play count timestamps and cumulative broadcast logs.'],
    ['Total Daily Screen Time', 'Cumulative airtime logs per vehicle throughout operating transit hours.'],
    ['Creative Playback Preview', 'Visual preview of running creatives with active campaign dates.']
  ];

  monitoringPoints.forEach(([head, sub]) => {
    doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.circle(MARGIN + 2, y - 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    const leadText = head + ' : ';
    doc.text(leadText, MARGIN + 6, y);
    const headW = doc.getTextWidth(leadText);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(sub, MARGIN + 6 + headW + 1.5, y);

    y += 7.8;
  });

  y += 12;

  // Section 3: Proposed Campaign Investment (Conditioned on packageMode)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);

  if (data.packageMode === 'none') {
    // Mode A: No Package Table (General Proposal)
    doc.text('CAMPAIGN INVESTMENT & TAILORED FLIGHT PLANS', MARGIN, y);
    doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.rect(MARGIN, y + 2, 22, 0.6, 'F');
    y += 10;

    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.roundedRect(MARGIN, y, PRINTABLE_W, 44, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    const noPkgText1 = "Every business has unique campaign objectives and flight requirements. Catgorithm campaigns are fully customizable across fleet size (1 to 10 private buses), advertisement durations (10s to 60s), and campaign periods (from 1 day up to annual commitments).";
    const noPkgText2 = "Our media planning team will structure a high-impact route allocation and flight frequency tailored specifically to your promotional calendar. Contact us to finalize your custom package.";

    const splitN1 = doc.splitTextToSize(noPkgText1, PRINTABLE_W - 14);
    doc.text(splitN1, MARGIN + 7, y + 10, { lineHeightFactor: 1.4 });

    const splitN2 = doc.splitTextToSize(noPkgText2, PRINTABLE_W - 14);
    doc.text(splitN2, MARGIN + 7, y + 27, { lineHeightFactor: 1.4 });

    y += 56;
  } else if (data.packageMode === 'single' && data.singlePackage) {
    // Mode B: Single Confirmed Package
    const pkg = data.singlePackage;
    doc.text('PROPOSED CAMPAIGN INVESTMENT', MARGIN, y);
    doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.rect(MARGIN, y + 2, 22, 0.6, 'F');
    y += 8;

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
        fontSize: 9.2,
        cellPadding: 4.2,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9.5,
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 55 },
        1: { halign: 'left' },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    y = (finalY || y + 36) + 14;
  } else if (data.packageMode === 'multiple' && data.multiplePackages && data.multiplePackages.length > 0) {
    // Mode C: Multiple Comparative Options (2 to 3 packages)
    const pkgs = data.multiplePackages.slice(0, 3);
    doc.text('PROPOSED CAMPAIGN INVESTMENT OPTIONS', MARGIN, y);
    doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.rect(MARGIN, y + 2, 22, 0.6, 'F');
    y += 8;

    const headRow = ['Campaign Particulars'];
    pkgs.forEach((p, idx) => {
      // Use clean text label without unicode star glyphs
      headRow.push(p.isRecommended ? `${p.name}*` : p.name || `Option ${idx + 1}`);
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

    // Determine recommended column index (1-based)
    let recColIndex = -1;
    pkgs.forEach((p, i) => {
      if (p.isRecommended) recColIndex = i + 1;
    });

    const colWidth = Math.floor((PRINTABLE_W - 45) / pkgs.length);
    const colStyles: Record<number, any> = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 45 },
    };
    for (let c = 1; c <= pkgs.length; c++) {
      if (c === recColIndex) {
        colStyles[c] = { halign: 'center', fontStyle: 'bold', fillColor: [254, 252, 232], cellWidth: colWidth };
      } else {
        colStyles[c] = { halign: 'center', cellWidth: colWidth };
      }
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
        fontSize: 9,
        cellPadding: 4.2,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9.2,
      },
      columnStyles: colStyles,
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    y = (finalY || y + 36) + 14;
  }

  // Section 4: Our Commitment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR COMMITMENT', MARGIN, y);

  doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  doc.rect(MARGIN, y + 2, 22, 0.6, 'F');

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const commitmentText = `At Catgorithm, we are committed to providing reliable, measurable, and high-impact digital transit advertising. From seamless scheduling to verified dashboard reporting, we ensure your brand captures unmissable presence along Kollam's busiest corridors. We look forward to partnering with ${clientNameDisplay}.`;
  const splitComm = doc.splitTextToSize(commitmentText, PRINTABLE_W);
  doc.text(splitComm, MARGIN, y, { lineHeightFactor: 1.45 });

  // Page 2 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // Trigger download with sanitized filename
  const cleanName = (data.clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Catgorithm_Proposal_${cleanName}.pdf`;
  doc.save(filename);
}
