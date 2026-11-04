// ============================================================
// PROPOSAL PDF GENERATOR — CATGORITHM DIGITAL GROWTH
// Strictly 2-Page A4 Executive Proposal Document.
// Design based on Studio Shodwe template with #d6c26e accent line,
// dual-page footers, industry-tailored narrative, and 3 package modes.
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProposalData, ProposalPackageOption } from '../types/proposal';
import { PROPOSAL_LOGO_BASE64 } from './proposalLogoBase64';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const PRINTABLE_W = PAGE_W - MARGIN * 2; // 174mm

// Brand Color Palette
const GOLD_COLOR: [number, number, number] = [214, 194, 110]; // #d6c26e
const CHARCOAL: [number, number, number] = [31, 41, 55];       // #1f2937
const SLATE_DARK: [number, number, number] = [15, 23, 42];     // #0f172a
const GRAY_TEXT: [number, number, number] = [75, 85, 99];      // #4b5563
const MUTED_GRAY: [number, number, number] = [107, 114, 128];  // #6b7280

function formatPDFINR(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN');
  return `Rs. ${formatted}`;
}

/**
 * Draws the signature header line from Studio Shodwe template:
 * Thick gold bar on the left (~65mm width, ~0.9mm thickness)
 * continuing to the right margin as a very thin line (0.2mm thickness) on the same baseline.
 */
function drawHeaderLine(pdf: jsPDF, yPos: number): void {
  // Thick gold segment on left
  pdf.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  pdf.rect(MARGIN, yPos, 65, 0.9, 'F');
  // Thin continuation line extending horizontally to the right margin
  pdf.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  pdf.rect(MARGIN + 65, yPos + 0.35, PRINTABLE_W - 65, 0.2, 'F');
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
  // ============================================================

  // 1. Official Logo at Top Left
  try {
    doc.addImage(PROPOSAL_LOGO_BASE64, 'PNG', MARGIN, 12, 42, 14);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.text('CATGORITHM', MARGIN, 22);
  }

  // 2. Signature Studio Shodwe Accent Line
  drawHeaderLine(doc, 30);

  // 3. Document Title & Client Metadata (Centered)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('BUS SCREEN ADVERTISEMENT PROPOSAL FOR', PAGE_W / 2, 42, { align: 'center' });

  doc.setFontSize(16);
  doc.text(clientNameDisplay, PAGE_W / 2, 49, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  doc.text(`Prepared by: ${data.preparedBy || 'Catgorithm'}  |  ${proposalDateDisplay}`, PAGE_W / 2, 56, { align: 'center' });

  // 4. Section 1: The Objective / Opportunity
  let y = 67;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(data.objectiveTitle || 'THE OBJECTIVE', MARGIN, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

  const p1 = data.objectiveP1 || "In today's fast-moving market, building sustained top-of-mind brand visibility is essential to winning consumer preference. Catgorithm transforms everyday commuter journeys into an active, high-impact digital broadcasting channel across Kollam's prime arterial corridors.";
  const p2 = data.objectiveP2 || "By placing high-definition video advertisements directly before seated, attentive passengers during daily travel, our network generates repeated daily impressions, drives strong brand recall, and directs qualified footfall to your physical outlets and digital channels.";

  const splitP1 = doc.splitTextToSize(p1, PRINTABLE_W);
  doc.text(splitP1, MARGIN, y);
  y += splitP1.length * 4.5 + 2.5;

  const splitP2 = doc.splitTextToSize(p2, PRINTABLE_W);
  doc.text(splitP2, MARGIN, y);
  y += splitP2.length * 4.5 + 6;

  // 5. Section 2: Our Digital Transit Advertising Network
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR DIGITAL TRANSIT ADVERTISING NETWORK', MARGIN, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const netIntro = "Our proprietary infotainment network combines high-definition commercial screens with high-traffic commuter routes across Kollam, creating a high-retention environment for your brand:";
  const splitNet = doc.splitTextToSize(netIntro, PRINTABLE_W);
  doc.text(splitNet, MARGIN, y);
  y += splitNet.length * 4.5 + 3.5;

  const highlights: [string, string][] = [
    ['32-Inch Commercial Displays', 'Ultra HD digital screens with synchronized onboard audio.'],
    ['7 Prime Transit Corridors', 'Broad geographic coverage connecting Kollam’s prime commercial and residential centers.'],
    ['40–50 Daily Ad Plays / Bus', 'Rotational high-frequency broadcast providing 1,200+ monthly plays per bus.'],
    ['15,000+ Daily Commuter Reach*', 'Captive passenger viewership with extended seated dwell time during daily travel.'],
    ['24/7 Campaign Monitoring', 'Dedicated advertiser web portal for transparent real-time play verification.']
  ];

  highlights.forEach(([title, desc]) => {
    // Gold Bullet Dot
    doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.circle(MARGIN + 2, y - 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text(title + ' — ', MARGIN + 6, y);
    const titleW = doc.getTextWidth(title + ' — ');

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    const descSplit = doc.splitTextToSize(desc, PRINTABLE_W - 6 - titleW);
    doc.text(descSplit, MARGIN + 6 + titleW, y);
    y += descSplit.length * 4.5 + 1.5;
  });

  y += 3.5;

  // 6. Section 3: Why Catgorithm?
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('WHY CATGORITHM?', MARGIN, y);

  y += 5;
  const whyItems: [string, string][] = [
    ['Captive Audience Engagement:', 'Passengers spend 20–45 minutes in a seated, distraction-free environment with direct screen line-of-sight.'],
    ['Repeated Daily Frequency:', 'Daily commuters travel the same corridors twice a day, creating compound recall that drives purchase intent.'],
    ['Zero Material Costs:', '100% digital video execution without recurring banner printing, mounting delays, or physical damage.'],
    ['Complete Transparency:', 'Live web dashboard access lets you independently verify screen health, play logs, and fleet status anytime.']
  ];

  whyItems.forEach(([title, desc]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('•  ' + title + ' ', MARGIN, y);
    const w = doc.getTextWidth('•  ' + title + ' ');

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    const split = doc.splitTextToSize(desc, PRINTABLE_W - w);
    doc.text(split, MARGIN + w, y);
    y += split.length * 4.3 + 1.2;
  });

  // Footnote at bottom above footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(MUTED_GRAY[0], MUTED_GRAY[1], MUTED_GRAY[2]);
  doc.text('* Indicative network reach based on passenger capacity, route frequency, and daily operating hours.', MARGIN, 278);

  // Page 1 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // ============================================================
  // PAGE 2: Deliverables, Live Dashboard, Package Investment, Sign-off
  // ============================================================
  doc.addPage();

  // Page 2 Running Header & Small Logo
  try {
    doc.addImage(PROPOSAL_LOGO_BASE64, 'PNG', MARGIN, 10, 30, 10);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.text('CATGORITHM', MARGIN, 17);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(MUTED_GRAY[0], MUTED_GRAY[1], MUTED_GRAY[2]);
  doc.text(`Transit Advertising Proposal  |  ${clientNameDisplay}`, PAGE_W - MARGIN, 16, { align: 'right' });

  // Thin gold running header line
  doc.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  doc.rect(MARGIN, 24, PRINTABLE_W, 0.35, 'F');

  y = 31;

  // Section 1: Campaign Deliverables
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('CAMPAIGN DELIVERABLES', MARGIN, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

  const deliverables = [
    'Scheduled video advertisement playback on 32-inch commercial displays with onboard audio.',
    'Rotational broadcast across full operating transit hours (40–50 plays per bus each day).',
    'Turnkey media ingestion, scheduling, and screen synchronization managed by Catgorithm.',
    'Dedicated advertiser dashboard credentials for independent real-time campaign audit.'
  ];

  deliverables.forEach(d => {
    doc.text('•  ' + d, MARGIN + 2, y);
    y += 4.5;
  });

  y += 3;

  // Section 2: Live Campaign Monitoring
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('LIVE CAMPAIGN MONITORING (ADVERTISER DASHBOARD)', MARGIN, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

  const monitoringPoints = [
    ['Active Buses & Screens', 'Live tracking of broadcast hardware and fleet assignments.'],
    ['Plays per Screen', 'Verified daily play count timestamps and cumulative broadcast logs.'],
    ['Total Daily Screen Time', 'Cumulative airtime logs per vehicle throughout operating transit hours.'],
    ['Creative Playback Preview', 'Visual preview of running creatives with active campaign dates.']
  ];

  monitoringPoints.forEach(([head, sub]) => {
    doc.setFont('helvetica', 'bold');
    doc.text('✔  ' + head + ': ', MARGIN + 2, y);
    const w = doc.getTextWidth('✔  ' + head + ': ');
    doc.setFont('helvetica', 'normal');
    doc.text(sub, MARGIN + 2 + w, y);
    y += 4.5;
  });

  y += 4;

  // Section 3: Proposed Campaign Investment (Conditioned on packageMode)
  if (data.packageMode === 'none') {
    // Mode A: No Package Table (General Proposal)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('CAMPAIGN INVESTMENT & TAILORED FLIGHT PLANS', MARGIN, y);
    y += 5;

    // Callout box with light warm background
    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.roundedRect(MARGIN, y, PRINTABLE_W, 26, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.7);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    const noPkgText1 = "Every business has unique campaign objectives and flight requirements. Catgorithm campaigns are fully customizable across fleet size (1 to 10 private buses), advertisement durations (10s to 60s), and campaign periods (from 1 day up to annual commitments).";
    const noPkgText2 = "Our media planning team will structure a high-impact route allocation and flight frequency tailored specifically to your promotional calendar. Contact us to finalize your custom package.";

    const splitN1 = doc.splitTextToSize(noPkgText1, PRINTABLE_W - 8);
    doc.text(splitN1, MARGIN + 4, y + 5);

    const splitN2 = doc.splitTextToSize(noPkgText2, PRINTABLE_W - 8);
    doc.text(splitN2, MARGIN + 4, y + 15);

    y += 32;
  } else if (data.packageMode === 'single' && data.singlePackage) {
    // Mode B: Single Confirmed Package
    const pkg = data.singlePackage;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('PROPOSED CAMPAIGN INVESTMENT', MARGIN, y);
    y += 3;

    const finalPrice = pkg.customPriceOverride !== undefined ? pkg.customPriceOverride : pkg.calculatedPrice;

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
        ['Live Monitoring Dashboard', 'Full 24/7 Web Portal Access (Included)'],
        ['Total Campaign Investment', `${formatPDFINR(finalPrice)} (Exclusive of GST)`],
      ],
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 2.2,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 60 },
        1: { halign: 'left' },
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    y = (finalY || y + 36) + 6;
  } else if (data.packageMode === 'multiple' && data.multiplePackages && data.multiplePackages.length > 0) {
    // Mode C: Multiple Comparative Options (2 to 3 packages)
    const pkgs = data.multiplePackages.slice(0, 3);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('PROPOSED CAMPAIGN INVESTMENT OPTIONS', MARGIN, y);
    y += 3;

    const headRow = ['Campaign Particulars'];
    pkgs.forEach((p, idx) => {
      headRow.push(p.name || `Option ${idx + 1}${p.isRecommended ? ' ⭐' : ''}`);
    });

    const fleetRow = ['Fleet Allocation'];
    const durationRow = ['Ad Duration'];
    const periodRow = ['Campaign Period'];
    const playsRow = ['Est. Total Plays'];
    const dashboardRow = ['Monitoring Dashboard'];
    const investRow = ['Campaign Investment'];

    pkgs.forEach(p => {
      fleetRow.push(`${p.buses} Private Buses`);
      durationRow.push(`${p.videoDurationSeconds} Seconds`);
      periodRow.push(p.durationLabel || `${p.days} Days`);
      playsRow.push(p.monthlyPlaysEstimate || `~${(p.buses * 45 * (p.days || 30)).toLocaleString('en-IN')} Plays`);
      dashboardRow.push('Full 24/7 Access');
      const pPrice = p.customPriceOverride !== undefined ? p.customPriceOverride : p.calculatedPrice;
      investRow.push(formatPDFINR(pPrice));
    });

    // Determine recommended column index (1-based)
    let recColIndex = -1;
    pkgs.forEach((p, i) => {
      if (p.isRecommended) recColIndex = i + 1;
    });

    const colStyles: Record<number, any> = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 46 },
    };
    for (let c = 1; c <= pkgs.length; c++) {
      if (c === recColIndex) {
        colStyles[c] = { halign: 'center', fontStyle: 'bold', fillColor: [254, 252, 232] };
      } else {
        colStyles[c] = { halign: 'center' };
      }
    }

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN, right: MARGIN },
      head: [headRow],
      body: [
        fleetRow,
        durationRow,
        periodRow,
        playsRow,
        dashboardRow,
        investRow,
      ],
      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 2.1,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: colStyles,
    });

    const finalY = (doc as any).lastAutoTable?.finalY;
    y = (finalY || y + 36) + 5;
  }

  // Section 4: Our Commitment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR COMMITMENT', MARGIN, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const commitmentText = `At Catgorithm, we are committed to providing reliable, measurable, and high-impact digital transit advertising. From seamless scheduling to verified dashboard reporting, we ensure your brand captures unmissable presence along Kollam's busiest corridors. We look forward to partnering with ${clientNameDisplay}.`;
  const splitComm = doc.splitTextToSize(commitmentText, PRINTABLE_W);
  doc.text(splitComm, MARGIN, y);
  y += splitComm.length * 4.2 + 4.5;

  // Section 5: Signoff & Contact Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('CATGORITHM DIGITAL GROWTH', MARGIN, y);
  y += 4;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  doc.text('Your Brand. In Motion.', MARGIN, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  const contactLine = `Parayathumukku, Umayanalloor, Kollam 691020   |   ${data.contactNumber || '+91 97463 36175'}   |   ${data.contactEmail || 'teamcatgorithm@gmail.com'}   |   ${data.website || 'www.catgorithm.in'}`;
  doc.text(contactLine, MARGIN, y);

  // Page 2 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // Trigger download with sanitized filename
  const cleanName = (data.clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Catgorithm_Proposal_${cleanName}.pdf`;
  doc.save(filename);
}
