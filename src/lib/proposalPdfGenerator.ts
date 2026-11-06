// ============================================================
// PROPOSAL PDF GENERATOR — CATGORITHM DIGITAL GROWTH
// Dynamic executive proposal generator for transit digital bus screen network:
// - Exact replica of Catgorithm's official company template
// - Untouched original logo aspect ratio (2.49756 : 1)
// - Sized-up header banner (37mm logo, 72mm gold accent bar)
// - Clean, balanced top spacing: title heading starts comfortably at y = 43.0mm
// - 100% consistent typography across ALL pages:
//   * Title: 20 pt bold
//   * Subheadings: 16 pt bold
//   * Descriptions & Intros & "Prepared by": 14.5 pt normal
//   * Bullet Points: 14.5 pt normal (strictly matching description font size across all pages)
//   * Contact section: 14.5 pt normal (strictly matching description font size)
// - Consistent slightly reduced spacing between the end of description/bullets of one subheading and the start of the next
// - Distinct, comfortable paragraph spacing between Paragraph 2 and Paragraph 3 in "Our Commitment"
// - Studio Shodwe gold (#d6c26e) & dark grey (#333132) divider lines
// - 7 campaign deliverables & 7 monitoring points
// - Client name in "Our Commitment" in original entered casing
// - Exact user contact icons (handset, envelope, wireframe globe)
// - Single/Multiple comparative investment tables (NO Route Coverage, NO Estimated Airplay, NO GST mentions)
// - Intelligent Page Flow:
//   * Mode 'none': Strictly 2 pages (Deliverables, Monitoring, Commitment on Page 2)
//   * Mode 'single' & 'multiple' (all option counts): Deliverables, Monitoring & Table on Page 2, Commitment on Page 3
// - Dual/Triple page footers at 275.5mm
// ============================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const runAutoTable: any = (autoTable as any).default || autoTable;
import type { ProposalData, ProposalPackageOption } from '../types/proposal';
import { calculateCustomPrice } from './customPricingEngine.ts';
import { PROPOSAL_LOGO_BASE64 } from './proposalLogoBase64.ts';
import { ICON_PHONE_BASE64, ICON_MAIL_BASE64, ICON_GLOBE_BASE64 } from './proposalIconsBase64.ts';

const PAGE_W = 210.1;
const MARGIN_LEFT = 21.2;
const MARGIN_RIGHT = 21.2;
const PRINTABLE_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT; // 167.7mm

// Brand Color Palette from user template
const GOLD_COLOR: [number, number, number] = [214, 194, 110]; // #d6c26e
const DARK_GREY: [number, number, number] = [51, 49, 50];     // #333132
const CHARCOAL: [number, number, number] = [31, 41, 55];       // #1f2937 (Text)
const SLATE_DARK: [number, number, number] = [15, 23, 42];     // #0f172a (Headings)

// Consistent Typography Sizing Across ALL Pages
const TITLE_FONT_SIZE = 20.0;       // 20 pt bold for centered title block
const SUBHEADING_FONT_SIZE = 16.0;  // 16 pt bold for ALL section subheadings (Pages 1, 2 & 3)
const BODY_FONT_SIZE = 14.5;        // 14.5 pt normal for ALL descriptions/intros/Prepared by/Contacts (Pages 1, 2 & 3)
const BULLET_FONT_SIZE = 14.5;      // Exactly 14.5 pt normal (strictly matching description font size across Pages 1 & 2)

// Consistent inter-section spacing between end of description/bullets of one subheading and start of the next
const SUBHEADING_SECTION_GAP = 14.0; // Consistently slightly reduced across all pages

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
 * Footer on all pages:
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
 * Exact contact icons matching user's official uploaded assets,
 * vertically aligned with 14.5 pt body text
 */
function drawContactIcons(doc: jsPDF, x: number, y: number, type: 'phone' | 'email' | 'website'): void {
  try {
    if (type === 'phone') {
      doc.addImage(ICON_PHONE_BASE64, 'PNG', x, y - 3.8, 3.8, 4.0);
    } else if (type === 'email') {
      doc.addImage(ICON_MAIL_BASE64, 'PNG', x - 0.2, y - 3.5, 4.4, 3.4);
    } else if (type === 'website') {
      doc.addImage(ICON_GLOBE_BASE64, 'PNG', x, y - 3.8, 3.8, 4.0);
    }
  } catch (err) {
    console.warn('Failed to draw icon:', err);
  }
}

/**
 * Renders the "OUR COMMITMENT" section with generous paragraph spacing
 * and 14.5 pt contact details strictly matching description font size.
 */
function renderCommitment(
  doc: jsPDF,
  startY: number,
  clientNameEntered: string,
  contactEmail: string = 'teamcatgorithm@gmail.com',
  website: string = 'www.catgorithm.in'
): number {
  let y = startY;

  // Subheading
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // Exact 16 pt bold
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR COMMITMENT', MARGIN_LEFT, y);

  y += 9.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_FONT_SIZE); // Exact 14.5 pt normal
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

  const cP1 = "At Catgorithm, we aim to make advertising more accessible, measurable and effective for businesses.";
  const cP2 = "From campaign activation to ongoing monitoring, we are committed to providing a reliable advertising experience that helps your brand stay visible where your customers travel every day.";
  const cP3 = `We look forward to building a successful advertising partnership with ${clientNameEntered}. For any questions or further discussion, please feel free to contact us:`;

  const LINE_STEP = 7.15; // Vertical step between wrapped lines at 14.5 pt with 1.40 lineHeightFactor
  const PARA_GAP = 9.5;   // Base paragraph gap

  // Paragraph 1
  doc.text(cP1, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.40 });
  const p1Lines = doc.splitTextToSize(cP1, PRINTABLE_W);
  y += (p1Lines.length - 1) * LINE_STEP + PARA_GAP;

  // Paragraph 2
  doc.text(cP2, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.40 });
  const p2Lines = doc.splitTextToSize(cP2, PRINTABLE_W);
  // Clear, generous paragraph spacing between Paragraph 2 and Paragraph 3 (starts with "We look forward...")
  y += (p2Lines.length - 1) * LINE_STEP + PARA_GAP + 2.0;

  // Paragraph 3 ("We look forward to building a successful...")
  doc.text(cP3, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.40 });
  const p3Lines = doc.splitTextToSize(cP3, PRINTABLE_W);
  y += (p3Lines.length - 1) * LINE_STEP + PARA_GAP + 2.5;

  // Contact items (font size strictly matches description: BODY_FONT_SIZE = 14.5 pt)
  const contactItems: { type: 'phone' | 'email' | 'website'; text: string }[] = [
    { type: 'phone', text: 'WhatsApp / Call: +91 9746336175' },
    { type: 'email', text: `Email: ${contactEmail}` },
    { type: 'website', text: `Website: ${website}` }
  ];

  contactItems.forEach((item, idx) => {
    drawContactIcons(doc, MARGIN_LEFT + 0.5, y, item.type);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BODY_FONT_SIZE); // Exactly 14.5 pt (matching description font size!)
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(item.text, MARGIN_LEFT + 7.5, y);
    if (idx < contactItems.length - 1) {
      y += 8.2;
    }
  });

  return y;
}

/**
 * Resolves commercial pricing metrics (Actual standard tariff, discount rate, final price)
 * for any single or multiple comparative option in the proposal table.
 */
function getPackagePricingMetrics(pkg: ProposalPackageOption) {
  const b = pkg.buses || 1;
  const d = pkg.days || 30;
  const s = pkg.videoDurationSeconds || 30;
  const calc = calculateCustomPrice(b, d, s);

  const finalPrice = pkg.customPriceOverride !== undefined
    ? pkg.customPriceOverride
    : (pkg.calculatedPrice !== undefined ? pkg.calculatedPrice : calc.totalPrice);

  const standardPrice = pkg.standardPrice !== undefined ? pkg.standardPrice : calc.standardPrice;
  const savings = Math.max(0, standardPrice - finalPrice);
  const discountRate = pkg.discountRate !== undefined
    ? pkg.discountRate
    : (standardPrice > 0 ? Math.round((savings / standardPrice) * 100) : 0);

  return {
    finalPrice,
    standardPrice,
    discountRate,
    savings,
    dailyPlays: pkg.dailyPlaysPerBus || '40–50 Plays / Day',
  };
}

/**
 * Renders the proposed campaign investment table (Single or Multiple options).
 * Returns the final bottom Y coordinate of the rendered table.
 */
function renderPackageTable(
  doc: jsPDF,
  mode: 'single' | 'multiple',
  data: ProposalData,
  startY: number
): number {
  let y = startY;

  if (mode === 'single' && data.singlePackage) {
    const pkg = data.singlePackage;
    const metrics = getPackagePricingMetrics(pkg);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SUBHEADING_FONT_SIZE); // Exact 16 pt bold
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('PROPOSED CAMPAIGN INVESTMENT', MARGIN_LEFT, y);
    y += 7.5;

    runAutoTable(doc, {
      startY: y,
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      tableWidth: PRINTABLE_W,
      head: [['Particulars', 'Campaign Specification']],
      body: [
        ['Fleet Allocation', `${pkg.buses} Private Buses`],
        ['Ad Duration', `${pkg.videoDurationSeconds} Seconds`],
        ['Campaign Period', `${pkg.durationLabel || `${pkg.days} Days`}`],
        ['Daily Plays', '40–50 Plays / Day'],
        ['Actual Price', formatPDFINR(metrics.standardPrice)],
        ['Discount Rate', metrics.discountRate > 0 ? `${metrics.discountRate}% Off` : '0%'],
        ['Campaign Investment', formatPDFINR(metrics.finalPrice)],
      ],
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 10.0,
        cellPadding: 2.6,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 10.5,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 54 },
        1: { halign: 'left' },
      },
      didParseCell: (cellData: any) => {
        if (cellData.section === 'body') {
          if (cellData.row.index === 6) { // Campaign Investment row
            cellData.cell.styles.fontStyle = 'bold';
            cellData.cell.styles.textColor = [15, 23, 42];
          } else if (cellData.row.index === 5) { // Discount Rate row
            cellData.cell.styles.textColor = [22, 101, 52]; // vibrant emerald green
            cellData.cell.styles.fontStyle = 'bold';
          } else if (cellData.row.index === 4) { // Actual Price row
            cellData.cell.styles.textColor = [100, 116, 139]; // subtle slate-500
          }
        }
      },
    });
    const finalY = (doc as any).lastAutoTable?.finalY;
    return finalY || y + 42;

  } else if (mode === 'multiple' && data.multiplePackages && data.multiplePackages.length > 0) {
    const pkgs = data.multiplePackages;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SUBHEADING_FONT_SIZE); // Exact 16 pt bold
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('PROPOSED CAMPAIGN OPTIONS', MARGIN_LEFT, y);
    y += 7.5;

    const headRow = ['Particulars'];
    pkgs.forEach((p, idx) => {
      headRow.push(p.name || `Option ${idx + 1}`);
    });

    const isMany = pkgs.length >= 4;
    const fleetRow = ['Fleet Allocation'];
    const durationRow = ['Ad Duration'];
    const periodRow = ['Campaign Period'];
    const playsRow = ['Daily Plays'];
    const actualPriceRow = ['Actual Price'];
    const discountRow = ['Discount Rate'];
    const investRow = ['Campaign Investment'];

    pkgs.forEach(p => {
      const metrics = getPackagePricingMetrics(p);
      fleetRow.push(`${p.buses} Buses`);
      durationRow.push(isMany ? `${p.videoDurationSeconds}s` : `${p.videoDurationSeconds} Seconds`);
      periodRow.push(p.durationLabel || `${p.days} Days`);
      playsRow.push(isMany ? '40–50 / Day' : '40–50 Plays / Day');
      actualPriceRow.push(formatPDFINR(metrics.standardPrice));
      discountRow.push(metrics.discountRate > 0 ? `${metrics.discountRate}% Off` : '0%');
      investRow.push(formatPDFINR(metrics.finalPrice));
    });

    const particularWidth = pkgs.length >= 6 ? 32 : (pkgs.length === 5 ? 34 : (pkgs.length === 4 ? 38 : 44));
    const colStyles: Record<number, any> = {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: particularWidth },
    };
    for (let c = 1; c <= pkgs.length; c++) {
      colStyles[c] = { halign: 'center' };
    }

    const tableFontSize = pkgs.length >= 6 ? 7.2 : (pkgs.length === 5 ? 7.8 : (pkgs.length === 4 ? 8.8 : 9.5));
    const cellPad = pkgs.length >= 6 ? 1.4 : (pkgs.length >= 5 ? 1.8 : 2.4);

    runAutoTable(doc, {
      startY: y,
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      tableWidth: PRINTABLE_W,
      head: [headRow],
      body: [
        fleetRow,
        durationRow,
        periodRow,
        playsRow,
        actualPriceRow,
        discountRow,
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
        fontSize: tableFontSize + 0.5,
      },
      columnStyles: colStyles,
      didParseCell: (cellData: any) => {
        if (cellData.section === 'body') {
          if (cellData.row.index === 6) { // Campaign Investment row
            cellData.cell.styles.fontStyle = 'bold';
            cellData.cell.styles.textColor = [15, 23, 42];
          } else if (cellData.row.index === 5) { // Discount Rate row
            cellData.cell.styles.textColor = [22, 101, 52]; // vibrant emerald green
            cellData.cell.styles.fontStyle = 'bold';
          } else if (cellData.row.index === 4) { // Actual Price row
            cellData.cell.styles.textColor = [100, 116, 139]; // subtle slate-500
          }
        }
      },
    });
    const finalY = (doc as any).lastAutoTable?.finalY;
    return finalY || y + 42;
  }

  return y;
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
  // Perfectly balanced top spacing: starts at y = 43.0mm (~14.3mm below header line)
  let y = 43.0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(TITLE_FONT_SIZE);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('BUS SCREEN ADVERTISEMENT PROPOSAL FOR', PAGE_W / 2, y, { align: 'center' });

  y += 8.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(TITLE_FONT_SIZE); // Exact 20 pt bold
  doc.text(clientNameTitle, PAGE_W / 2, y, { align: 'center' });

  // Prepared by section (matching description font size with ample gap above)
  y += 10.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_FONT_SIZE); // Exactly 14.5 pt (same font size as descriptions!)
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text(`Prepared by: ${preparedBy} | ${proposalDate}`, PAGE_W / 2, y, { align: 'center' });

  y += 13.5;

  // 4. Section 1: THE OPPORTUNITY
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // 16 pt bold
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(data.objectiveTitle || 'THE OPPORTUNITY', MARGIN_LEFT, y);

  // Generous spacing between subheading and description
  y += 9.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_FONT_SIZE); // 14.5 pt
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const oppText = data.objectiveP1 || "Catgorithm offers digital bus screen advertising across Kollam, helping businesses reach local audiences through strategically placed displays inside private buses. Our platform builds brand visibility, recall and awareness through repeated exposure during everyday commutes.";
  doc.text(oppText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.42 });
  const oppLines = doc.splitTextToSize(oppText, PRINTABLE_W);
  // Consistent slightly reduced spacing between end of description and starting of next subheading
  y += (oppLines.length - 1) * 7.25 + SUBHEADING_SECTION_GAP;

  // 5. Section 2: OUR ADVERTISING NETWORK
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // 16 pt bold
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR ADVERTISING NETWORK', MARGIN_LEFT, y);

  y += 9.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_FONT_SIZE); // 14.5 pt
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const netText = "Our network consists of digital display screens installed inside selected private buses, operating along established routes throughout Kollam. Each screen provides a dedicated space for promotional content, with advertisements scheduled to run as part of a continuous digital display network. The higlight of our network are :";
  doc.text(netText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.42 });
  const netLines = doc.splitTextToSize(netText, PRINTABLE_W);
  
  // Advance to end of paragraph text + spacing before bullets
  y += (netLines.length - 1) * 7.25 + 11.0;

  const networkBullets: [string, string][] = [
    ['7 Advertising Routes', 'Coverage across key corridors in Kollam.'],
    ['32-inch Commercial Displays', 'HD digital screens with audio.'],
    ['Flexible Duration', 'Video advertisements of up to 60 seconds.'],
    ['40–50 Daily Plays', 'Approximate daily advertisement plays per bus.'],
    ['24/7 Campaign Monitoring', 'Dedicated advertiser dashboard access.']
  ];

  networkBullets.forEach(([title, desc], idx) => {
    // Bullet Dot optically centered with 14.5 pt text
    doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.circle(MARGIN_LEFT + 2.0, y - 1.5, 0.95, 'F');

    // Title in bold (14.5 pt, strictly matching description font size)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(BULLET_FONT_SIZE); // 14.5 pt
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    const titleStr = title + ' : ';
    doc.text(titleStr, MARGIN_LEFT + 6.0, y);
    const tw = doc.getTextWidth(titleStr);

    // Desc in normal (14.5 pt, strictly matching description font size)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BULLET_FONT_SIZE); // 14.5 pt
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

    const fullDescText = desc;
    const descAvailW = PRINTABLE_W - 6.0 - tw - 1.5;
    const descLines = doc.splitTextToSize(fullDescText, descAvailW);

    if (descLines.length === 1) {
      doc.text(fullDescText, MARGIN_LEFT + 6.0 + tw + 1.5, y);
    } else {
      descLines.forEach((line: string, lIdx: number) => {
        if (lIdx > 0) y += 6.5;
        doc.text(line, MARGIN_LEFT + 6.0 + tw + 1.5, y);
      });
    }

    if (idx < networkBullets.length - 1) {
      y += 8.2;
    }
  });

  // 6. Section 3: WHY CATGORITHM?
  // Consistent slightly reduced spacing between end of bullets and starting of WHY CATGORITHM?
  y += SUBHEADING_SECTION_GAP;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // 16 pt bold
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('WHY CATGORITHM?', MARGIN_LEFT, y);

  y += 9.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_FONT_SIZE); // 14.5 pt
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const whyText = "We bring together strategically placed digital displays, engaging video content and flexible advertising plans in one platform. With a focus on convenience, campaign adaptability and performance transparency, we offer businesses a practical alternative to conventional outdoor advertising.";
  doc.text(whyText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.42 });

  // Page 1 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // ==========================================
  // PAGE 2: DELIVERABLES, MONITORING & PROPOSED CAMPAIGN OPTIONS
  // ==========================================
  doc.addPage();

  const hasPackages = mode === 'single' || (mode === 'multiple' && data.multiplePackages && data.multiplePackages.length > 0);

  // Bullet step: comfortable 6.8mm spacing between 14.5 pt bullet items
  const P2_BULLET_STEP = 6.8;
  y = 22.0;

  // 1. CAMPAIGN DELIVERABLES
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // Exact 16 pt bold
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('CAMPAIGN DELIVERABLES', MARGIN_LEFT, y);

  y += 8.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_FONT_SIZE); // Exact same 14.5 pt as Page 1!
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text('Every campaign is supported by the following:', MARGIN_LEFT, y);
  y += 6.5;

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
    // Bullet Dot optically centered with 14.5 pt text
    doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.circle(MARGIN_LEFT + 2.0, y - 1.5, 0.95, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BULLET_FONT_SIZE); // Exactly 14.5 pt (matching description font size!)
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(d, MARGIN_LEFT + 6.0, y);
    if (idx < deliverables.length - 1) {
      y += P2_BULLET_STEP;
    }
  });

  // 2. CAMPAIGN MONITORING
  // Consistent slightly reduced spacing between end of Deliverables and CAMPAIGN MONITORING
  y += SUBHEADING_SECTION_GAP;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE); // Exact 16 pt bold
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('CAMPAIGN MONITORING', MARGIN_LEFT, y);

  y += 8.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_FONT_SIZE); // Exact same 14.5 pt as Page 1!
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text('Our advertiser dashboard provides campaign visibility through:', MARGIN_LEFT, y);
  y += 6.5;

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
    // Bullet Dot optically centered with 14.5 pt text
    doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.circle(MARGIN_LEFT + 2.0, y - 1.5, 0.95, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(BULLET_FONT_SIZE); // Exactly 14.5 pt (matching description font size!)
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(m, MARGIN_LEFT + 6.0, y);
    if (idx < monitoringItems.length - 1) {
      y += P2_BULLET_STEP;
    }
  });

  // ==========================================================
  // PAGE 2 & PAGE 3 ROUTING:
  // - Mode 'none': Strictly 2 pages (Deliverables, Monitoring, Commitment on Page 2)
  // - Single or Multiple Packages (no matter how many options):
  //   * Proposed campaign options table sits on Page 2 itself
  //   * OUR COMMITMENT is placed on the next page (Page 3)
  // ==========================================================
  if (!hasPackages) {
    // Mode A: No Package -> Everything fits comfortably on 2 pages
    y += SUBHEADING_SECTION_GAP;
    renderCommitment(doc, y, clientNameEntered, data.contactEmail, data.website);
    drawFooter(doc, data.contactEmail, data.website);

  } else {
    // Mode B: Single Package or Multiple Packages (all option counts)
    // Table is placed on Page 2 itself!
    y += SUBHEADING_SECTION_GAP;
    renderPackageTable(doc, mode, data, y);
    drawFooter(doc, data.contactEmail, data.website);

    // PAGE 3: OUR COMMITMENT (Spacious, uncrowded layout with 14.5 pt contacts)
    doc.addPage();
    renderCommitment(doc, 26.0, clientNameEntered, data.contactEmail, data.website);
    drawFooter(doc, data.contactEmail, data.website);
  }

  // Trigger download in browser environment
  if (typeof window !== 'undefined') {
    const cleanName = (data.clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Catgorithm_Proposal_${cleanName}.pdf`;
    doc.save(filename);
  }
  return doc;
}
