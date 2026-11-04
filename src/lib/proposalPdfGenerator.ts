// ============================================================
// PROPOSAL PDF GENERATOR — CATGORITHM DIGITAL GROWTH
// Strictly 2-Page A4 Executive Proposal Document.
// Pixel-accurate replica of Catgorithm's official company template:
// - Untouched original logo aspect ratio (2.49756 : 1)
// - Sized-up header banner (37mm logo, 72mm gold accent bar)
// - Centered Title Heading: 20 pt bold with generous top spacing from header line
// - Exact equal spacing between [Client Name] & [Prepared by], and [Prepared by] & [THE OPPORTUNITY]
// - Mathematical unified spacing: all subheading-to-description gaps and all
//   inter-section transitions are identical across both pages
// - Page 2 follows the exact same spacing and typography whether No Package or Package mode
// - 7 campaign deliverables & 7 monitoring points
// - Client name in "Our Commitment" in original entered casing
// - Exact user contact icons (handset, envelope, wireframe globe)
// - Single/Multiple comparative investment tables
//   (NO Route Coverage, NO Estimated Airplay, NO GST mentions)
// - Dual-page footers at 275.5mm
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const runAutoTable: any = (autoTable as any).default || autoTable;
import type { ProposalData } from '../types/proposal';
import { PROPOSAL_LOGO_BASE64 } from './proposalLogoBase64';
import { ICON_PHONE_BASE64, ICON_MAIL_BASE64, ICON_GLOBE_BASE64 } from './proposalIconsBase64';

const PAGE_W = 210.1;
const MARGIN_LEFT = 21.2;
const MARGIN_RIGHT = 21.2;
const PRINTABLE_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT; // 167.7mm

// Brand Color Palette from user template
const GOLD_COLOR: [number, number, number] = [214, 194, 110]; // #d6c26e
const DARK_GREY: [number, number, number] = [51, 49, 50];     // #333132
const CHARCOAL: [number, number, number] = [31, 41, 55];       // #1f2937 (Text)
const SLATE_DARK: [number, number, number] = [15, 23, 42];     // #0f172a (Headings)
const GRAY_TEXT: [number, number, number] = [75, 85, 99];      // #4b5563 (Metadata)

// Consistent Typography Sizing Requested by User
const TITLE_FONT_SIZE = 20.0;       // 20 pt bold for both lines of centered title block
const SUBHEADING_FONT_SIZE = 15.0;  // Consistent 15 pt bold for ALL section subheadings
const P1_BODY_FONT_SIZE = 12.8;     // Page 1 body
const P1_BULLET_FONT_SIZE = 12.2;   // Page 1 bullets

const P2_BODY_FONT_SIZE = 11.5;     // Page 2 body & intros across ALL modes
const P2_BULLET_FONT_SIZE = 10.8;   // Page 2 bullets across ALL modes

// Mathematical Spacing Constants:
// Exact unified gap for all subheading-to-content and inter-section transitions
const UNIFIED_GAP = 11.5;           // Exactly 11.5mm everywhere
const META_SPACING = 13.0;          // Space between Title & Prepared by, and Prepared by & The Opportunity

function formatPDFINR(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN');
  return `Rs. ${formatted}`;
}

/**
 * Top divider line:
 * Yellow/Gold #d6c26e on left (72mm), continuing with thin dark grey #333132
 */
function drawHeaderLine(pdf: jsPDF, yPos: number): void {
  const goldWidth = 72.0;
  pdf.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  pdf.rect(MARGIN_LEFT, yPos, goldWidth, 2.2, 'F');

  const greyStart = MARGIN_LEFT + goldWidth;
  const greyWidth = PRINTABLE_W - goldWidth;
  pdf.setFillColor(DARK_GREY[0], DARK_GREY[1], DARK_GREY[2]);
  pdf.rect(greyStart, yPos + 0.9, greyWidth, 0.35, 'F');
}

/**
 * Footer on both pages:
 * Gold line at 275.5mm, contact email & website lowered to 283.5mm
 */
function drawFooter(pdf: jsPDF, email: string = 'teamcatgorithm@gmail.com', website: string = 'www.catgorithm.in'): void {
  const lineY = 275.5;
  const textY = 283.5;

  pdf.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  pdf.rect(MARGIN_LEFT, lineY, PRINTABLE_W, 0.4, 'F');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  pdf.text(email, MARGIN_LEFT, textY);
  pdf.text(website, PAGE_W - MARGIN_RIGHT, textY, { align: 'right' });
}

/**
 * Exact contact icons matching user's official uploaded assets
 */
function drawContactIcons(doc: jsPDF, x: number, y: number, type: 'phone' | 'email' | 'website'): void {
  try {
    if (type === 'phone') {
      doc.addImage(ICON_PHONE_BASE64, 'PNG', x, y - 3.4, 3.6, 3.8);
    } else if (type === 'email') {
      doc.addImage(ICON_MAIL_BASE64, 'PNG', x - 0.2, y - 3.0, 4.2, 3.25);
    } else if (type === 'website') {
      doc.addImage(ICON_GLOBE_BASE64, 'PNG', x, y - 3.4, 3.6, 3.8);
    }
  } catch (err) {
    console.warn('Failed to draw icon:', err);
  }
}

export async function generateProposalPDF(data: ProposalData): Promise<any> {
  const PDFConstructor: any = (jsPDF as any).jsPDF || jsPDF;
  const doc = new PDFConstructor({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const clientNameEntered = (data.clientName || 'Valued Client').trim();
  const clientNameTitle = clientNameEntered.toUpperCase();
  const proposalDate = data.proposalDate || new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
  const preparedBy = data.preparedBy || 'Catgorithm';
  const mode = data.packageMode || 'none';

  // ==========================================
  // PAGE 1: EXACT REPLICA OF USER TEMPLATE
  // ==========================================
  // 1. Logo at Top Left (Strict original aspect ratio: 2.49756 : 1)
  const logoW = 37.0;
  const logoH = logoW / 2.49756; // 14.81mm
  try {
    doc.addImage(PROPOSAL_LOGO_BASE64, 'PNG', MARGIN_LEFT, 9.5, logoW, logoH);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.text('CATGORITHM', MARGIN_LEFT, 20);
  }

  // 2. Header Line (Gold 72mm + continuation dark grey at 26.5mm)
  drawHeaderLine(doc, 26.5);

  // 3. Document Title Block (Centered)
  // Generous spacing at top: starts at y = 53.5mm (~20mm below header line)
  let y = 53.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(TITLE_FONT_SIZE);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('BUS SCREEN ADVERTISEMENT PROPOSAL FOR', PAGE_W / 2, y, { align: 'center' });

  y += 10.0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(TITLE_FONT_SIZE); // Exact 20 pt bold
  doc.text(clientNameTitle, PAGE_W / 2, y, { align: 'center' });

  // EXACT same spacing between [Client Name] and [Prepared by],
  // and between [Prepared by] and [THE OPPORTUNITY]
  y += META_SPACING;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.0);
  doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  doc.text(`Prepared by: ${preparedBy} | ${proposalDate}`, PAGE_W / 2, y, { align: 'center' });

  y += META_SPACING + 0.5;

  // 4. Section 1: THE OPPORTUNITY
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // 15 pt
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(data.objectiveTitle || 'THE OPPORTUNITY', MARGIN_LEFT, y);

  // Exact UNIFIED_GAP from subheading to description first line
  y += UNIFIED_GAP;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(P1_BODY_FONT_SIZE);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const oppText = data.objectiveP1 || "Catgorithm offers digital bus screen advertising across Kollam, helping businesses reach local audiences through strategically placed displays inside private buses. Our platform builds brand visibility, recall and awareness through repeated exposure during everyday commutes.";
  doc.text(oppText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.38 });
  const oppLines = doc.splitTextToSize(oppText, PRINTABLE_W);
  // Advance to last line of oppText:
  y += (oppLines.length - 1) * 5.8;

  // 5. Section 2: OUR ADVERTISING NETWORK
  // Exact UNIFIED_GAP (+2.0mm to equalize visual cap-height distance) to next subheading
  y += UNIFIED_GAP + 2.0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // 15 pt
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR ADVERTISING NETWORK', MARGIN_LEFT, y);

  // Exact UNIFIED_GAP from subheading to description first line
  y += UNIFIED_GAP;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(P1_BODY_FONT_SIZE);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const netText = "Our network consists of digital display screens installed inside selected private buses, operating along established routes throughout Kollam. Each screen provides a dedicated space for promotional content, with advertisements scheduled to run as part of a continuous digital display network. The higlight of our network are :";
  doc.text(netText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.38 });
  const netLines = doc.splitTextToSize(netText, PRINTABLE_W);
  // Advance to last line of netText:
  y += (netLines.length - 1) * 5.8 + 7.5;

  const networkBullets: [string, string][] = [
    ['7 Advertising Routes', 'Coverage across key corridors in Kollam.'],
    ['32-inch Commercial Displays', 'HD digital screens with audio.'],
    ['Flexible Advertisement Duration', 'Video advertisements of up to 60 seconds.'],
    ['40–50 Daily Plays', 'Approximate daily advertisement plays per bus.'],
    ['24/7 Campaign Monitoring', 'Dedicated advertiser dashboard access.']
  ];

  networkBullets.forEach(([title, desc], idx) => {
    // Bullet Dot
    doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.circle(MARGIN_LEFT + 2.0, y - 1.2, 0.95, 'F');

    // Title in bold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(P1_BULLET_FONT_SIZE);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    const titleStr = title + ' : ';
    doc.text(titleStr, MARGIN_LEFT + 6.0, y);
    const tw = doc.getTextWidth(titleStr);

    // Desc in normal
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

    const fullDescText = desc;
    const descAvailW = PRINTABLE_W - 6.0 - tw - 1.5;
    const descLines = doc.splitTextToSize(fullDescText, descAvailW);

    if (descLines.length === 1) {
      doc.text(fullDescText, MARGIN_LEFT + 6.0 + tw + 1.5, y);
    } else {
      doc.text(descLines[0], MARGIN_LEFT + 6.0 + tw + 1.5, y);
      y += 5.5;
      doc.text(descLines[1], MARGIN_LEFT + 6.0 + tw + 1.5, y);
    }

    // Advance only between bullets, not after the last bullet
    if (idx < networkBullets.length - 1) {
      y += 6.8;
    }
  });

  // 6. Section 3: WHY CATGORITHM?
  // Exact UNIFIED_GAP (+1.0mm) between last bullet and WHY CATGORITHM subheading
  y += UNIFIED_GAP + 1.0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // 15 pt
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('WHY CATGORITHM?', MARGIN_LEFT, y);

  // Exact UNIFIED_GAP from subheading to description first line
  y += UNIFIED_GAP;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(P1_BODY_FONT_SIZE);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const whyText = "We bring together strategically placed digital displays, engaging video content and flexible advertising plans in one platform. With a focus on convenience, campaign adaptability and performance transparency, we offer businesses a practical alternative to conventional outdoor advertising.";
  doc.text(whyText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.38 });

  // Page 1 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // ==========================================
  // PAGE 2: UNIFIED CONSISTENT SPACING ACROSS ALL MODES
  // ==========================================
  doc.addPage();

  const BULLET_STEP = 5.2;

  y = 24.0;

  // 1. Deliverables
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // 15 pt
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('CAMPAIGN DELIVERABLES', MARGIN_LEFT, y);

  // Exact UNIFIED_GAP between subheading and "Every campaign is supported by..."
  y += UNIFIED_GAP;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(P2_BODY_FONT_SIZE);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text('Every campaign is supported by the following:', MARGIN_LEFT, y);
  y += 5.5;

  const deliverables = [
    'Advertisement playback on the selected bus screens.',
    'Repeated advertisement exposure throughout operating hours.',
    'Digital advertisement delivery with audio.',
    'Campaign activation and scheduling.',
    'Dedicated advertiser dashboard access.',
    'Campaign activity monitoring.',
    'Advertisement preview and campaign status tracking.'
  ];

  deliverables.forEach((d, idx) => {
    doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.circle(MARGIN_LEFT + 2.0, y - 1.1, 0.85, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(P2_BULLET_FONT_SIZE);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(d, MARGIN_LEFT + 6.0, y);
    if (idx < deliverables.length - 1) {
      y += BULLET_STEP;
    }
  });

  // 2. Campaign Monitoring
  // Exact UNIFIED_GAP (+1.0mm) between last deliverable bullet and "CAMPAIGN MONITORING" subheading
  y += UNIFIED_GAP + 1.0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // 15 pt
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('CAMPAIGN MONITORING', MARGIN_LEFT, y);

  // Exact UNIFIED_GAP between subheading and "Our advertiser dashboard provides..."
  y += UNIFIED_GAP;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(P2_BODY_FONT_SIZE);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text('Our advertiser dashboard provides campaign visibility through:', MARGIN_LEFT, y);
  y += 5.5;

  const monitoringItems = [
    'Active buses and screens.',
    'Advertisement plays per screen.',
    'Daily screen time.',
    'Running advertisements.',
    'Advertisement preview.',
    'Campaign description and expiry date.',
    'Number of days the advertisement has been played.'
  ];

  monitoringItems.forEach((m, idx) => {
    doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.circle(MARGIN_LEFT + 2.0, y - 1.1, 0.85, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(P2_BULLET_FONT_SIZE);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(m, MARGIN_LEFT + 6.0, y);
    if (idx < monitoringItems.length - 1) {
      y += BULLET_STEP;
    }
  });

  // 3. Package Options (if selected)
  if (mode === 'single' && data.singlePackage) {
    const pkg = data.singlePackage;
    // Exact UNIFIED_GAP (+1.0mm) between last monitoring bullet and package subheading
    y += UNIFIED_GAP + 1.0;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SUBHEADING_FONT_SIZE); // 15 pt
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('PROPOSED CAMPAIGN INVESTMENT', MARGIN_LEFT, y);

    // Exact spacing from subheading to table
    y += 5.0;

    const finalPrice = pkg.customPriceOverride !== undefined ? pkg.customPriceOverride : pkg.calculatedPrice;

    runAutoTable(doc, {
      startY: y,
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      tableWidth: PRINTABLE_W,
      head: [['Particulars', 'Campaign Specification']],
      body: [
        ['Fleet Allocation', `${pkg.buses} Private Buses`],
        ['Ad Duration', `${pkg.videoDurationSeconds} Seconds`],
        ['Campaign Period', `${pkg.durationLabel || `${pkg.days} Days`}`],
        ['Campaign Investment', formatPDFINR(finalPrice)],
      ],
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9.8,
        cellPadding: 2.2,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 10.0,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'left' },
      },
    });
    const finalY = (doc as any).lastAutoTable?.finalY;
    y = finalY || y + 24;

  } else if (mode === 'multiple' && data.multiplePackages && data.multiplePackages.length > 0) {
    const pkgs = data.multiplePackages;
    // Exact UNIFIED_GAP (+1.0mm) between last monitoring bullet and package subheading
    y += UNIFIED_GAP + 1.0;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SUBHEADING_FONT_SIZE); // 15 pt
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('PROPOSED CAMPAIGN OPTIONS', MARGIN_LEFT, y);

    // Exact spacing from subheading to table
    y += 5.0;

    const headRow = ['Particulars'];
    pkgs.forEach((p, idx) => {
      headRow.push(p.name || `Option ${idx + 1}`);
    });

    const isMany = pkgs.length >= 4;
    const fleetRow = ['Fleet Allocation'];
    const durationRow = ['Ad Duration'];
    const periodRow = ['Campaign Period'];
    const investRow = ['Campaign Investment'];

    pkgs.forEach(p => {
      fleetRow.push(`${p.buses} Buses`);
      durationRow.push(isMany ? `${p.videoDurationSeconds}s` : `${p.videoDurationSeconds} Seconds`);
      periodRow.push(p.durationLabel || `${p.days} Days`);
      const pPrice = p.customPriceOverride !== undefined ? p.customPriceOverride : p.calculatedPrice;
      investRow.push(formatPDFINR(pPrice));
    });

    const particularWidth = pkgs.length >= 5 ? 34 : (pkgs.length === 4 ? 38 : 44);
    const colStyles: Record<number, any> = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: particularWidth },
    };
    for (let c = 1; c <= pkgs.length; c++) {
      colStyles[c] = { halign: 'center' };
    }

    const tableFontSize = pkgs.length >= 5 ? 7.6 : (pkgs.length === 4 ? 8.4 : 9.5);
    const cellPad = pkgs.length >= 5 ? 1.5 : (pkgs.length === 4 ? 1.8 : 2.2);

    runAutoTable(doc, {
      startY: y,
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      tableWidth: PRINTABLE_W,
      head: [headRow],
      body: [
        fleetRow,
        durationRow,
        periodRow,
        investRow,
      ],
      styles: {
        font: 'helvetica',
        fontSize: tableFontSize,
        cellPadding: cellPad,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: tableFontSize + 0.3,
      },
      columnStyles: colStyles,
    });
    const finalY = (doc as any).lastAutoTable?.finalY;
    y = finalY || y + 26;
  }

  // 4. Our Commitment
  // Exact UNIFIED_GAP between previous section (last bullet or table) and "OUR COMMITMENT"
  y += mode === 'none' ? (UNIFIED_GAP + 1.8) : (UNIFIED_GAP + 1.0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // 15 pt
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR COMMITMENT', MARGIN_LEFT, y);

  // Exact UNIFIED_GAP between subheading and commitment description
  y += UNIFIED_GAP;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(P2_BODY_FONT_SIZE);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

  const cP1 = "At Catgorithm, we aim to make advertising more accessible, measurable and effective for businesses.";
  const cP2 = "From campaign activation to ongoing monitoring, we are committed to providing a reliable advertising experience that helps your brand stay visible where your customers travel every day.";
  const cP3 = `We look forward to building a successful advertising partnership with ${clientNameEntered}. For any questions or further discussion, please feel free to contact us:`;

  doc.text(cP1, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.35 });
  const p1Lines = doc.splitTextToSize(cP1, PRINTABLE_W);
  y += (p1Lines.length - 1) * 4.8 + 3.2;

  doc.text(cP2, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.35 });
  const p2Lines = doc.splitTextToSize(cP2, PRINTABLE_W);
  y += (p2Lines.length - 1) * 4.8 + 3.2;

  doc.text(cP3, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.35 });
  const p3Lines = doc.splitTextToSize(cP3, PRINTABLE_W);
  y += (p3Lines.length - 1) * 4.8 + 5.0;

  // Contact items with official icons
  const contactItems: { type: 'phone' | 'email' | 'website'; text: string }[] = [
    { type: 'phone', text: 'WhatsApp / Call: +91 9746336175' },
    { type: 'email', text: 'Email: teamcatgorithm@gmail.com' },
    { type: 'website', text: 'Website: www.catgorithm.in' }
  ];

  contactItems.forEach((item, idx) => {
    drawContactIcons(doc, MARGIN_LEFT + 0.5, y, item.type);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.0);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(item.text, MARGIN_LEFT + 6.2, y);
    if (idx < contactItems.length - 1) {
      y += 5.8;
    }
  });

  // Page 2 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // Trigger download in browser environment
  if (typeof window !== 'undefined') {
    const cleanName = (data.clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Catgorithm_Proposal_${cleanName}.pdf`;
    doc.save(filename);
  }
  return doc;
}
