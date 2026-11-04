// ============================================================
// PROPOSAL PDF GENERATOR — CATGORITHM DIGITAL GROWTH
// Strictly 2-Page A4 Executive Proposal Document.
// Pixel-accurate replica of Catgorithm's official company template:
// - Untouched original logo aspect ratio (2.4976 : 1)
// - Exact left-aligned section headings without underlines
// - Centered title header block
// - Studio Shodwe gold (#d6c26e) & dark grey (#333132) divider lines
// - 7 campaign deliverables & 7 monitoring points
// - Our commitment closing with contact channels
// - Optional clean single/multiple comparative investment tables
//   (NO Route Coverage, NO Estimated Airplay, NO GST mention anywhere)
// - Dual-page footers at 275.5mm
// ==========================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const runAutoTable: any = (autoTable as any).default || autoTable;
import type { ProposalData } from '../types/proposal';
import { PROPOSAL_LOGO_BASE64 } from './proposalLogoBase64';

const PAGE_W = 210.1;
const MARGIN_LEFT = 21.2;
const MARGIN_RIGHT = 21.2;
const PRINTABLE_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT; // 167.7mm

// Brand Color Palette from user template
const GOLD_COLOR: [number, number, number] = [214, 194, 110]; // #d6c26e
const DARK_GREY: [number, number, number] = [51, 49, 50];     // #333132
const CHARCOAL: [number, number, number] = [31, 41, 55];       // #1f2937 (Text)
const SLATE_DARK: [number, number, number] = [15, 23, 42];     // #0f172a (Headings)
const GRAY_TEXT: [number, number, number] = [75, 85, 99];      // #4b5563

function formatPDFINR(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN');
  return `Rs. ${formatted}`;
}

/**
 * Top divider line:
 * Yellow/Gold #d6c26e on left (58mm), continuing with thin dark grey #333132
 */
function drawHeaderLine(pdf: jsPDF, yPos: number): void {
  const goldWidth = 58;
  pdf.setFillColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
  pdf.rect(MARGIN_LEFT, yPos, goldWidth, 1.8, 'F');
  pdf.setFillColor(DARK_GREY[0], DARK_GREY[1], DARK_GREY[2]);
  pdf.rect(MARGIN_LEFT + goldWidth, yPos + 0.75, PRINTABLE_W - goldWidth, 0.3, 'F');
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
 * Minimalist vector contact icons
 */
function drawContactIcons(doc: jsPDF, x: number, y: number, type: 'phone' | 'email' | 'website'): void {
  doc.setDrawColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.setFillColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);

  if (type === 'phone') {
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y - 2.8, 2.2, 3.8, 0.6, 0.6, 'S');
    doc.rect(x + 0.3, y - 2.2, 1.6, 2.4, 'S');
    doc.circle(x + 1.1, y + 0.4, 0.25, 'F');
  } else if (type === 'email') {
    doc.setLineWidth(0.35);
    doc.rect(x, y - 2.6, 3.8, 2.8, 'S');
    doc.line(x, y - 2.6, x + 1.9, y - 1.2);
    doc.line(x + 1.9, y - 1.2, x + 3.8, y - 2.6);
  } else if (type === 'website') {
    doc.setLineWidth(0.35);
    doc.circle(x + 1.8, y - 1.4, 1.7, 'S');
    doc.line(x + 0.1, y - 1.4, x + 3.5, y - 1.4);
    doc.ellipse(x + 1.8, y - 1.4, 0.8, 1.7, 'S');
  }
}

export async function generateProposalPDF(data: ProposalData): Promise<void> {
  const PDFConstructor: any = (jsPDF as any).jsPDF || jsPDF;
  const doc = new PDFConstructor({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const clientName = (data.clientName || 'Valued Client').trim().toUpperCase();
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
  const logoW = 32.5;
  const logoH = logoW / 2.49756; // 13.01mm
  try {
    doc.addImage(PROPOSAL_LOGO_BASE64, 'PNG', MARGIN_LEFT, 10.0, logoW, logoH);
  } catch {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(GOLD_COLOR[0], GOLD_COLOR[1], GOLD_COLOR[2]);
    doc.text('CATGORITHM', MARGIN_LEFT, 20);
  }

  // 2. Header Line (Gold on left, thin dark on right)
  drawHeaderLine(doc, 26.3);

  // 3. Document Title Block (Centered)
  let y = 37.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('BUS SCREEN ADVERTISEMENT PROPOSAL FOR', PAGE_W / 2, y, { align: 'center' });

  y += 7.2;
  doc.setFontSize(17.5);
  doc.text(clientName, PAGE_W / 2, y, { align: 'center' });

  y += 6.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  doc.text(`Prepared by: ${preparedBy} | ${proposalDate}`, PAGE_W / 2, y, { align: 'center' });

  // 4. Section 1: THE OPPORTUNITY (Left-aligned, Bold, NO underline)
  y = 73.0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(data.objectiveTitle || 'THE OPPORTUNITY', MARGIN_LEFT, y);

  y += 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const oppText = data.objectiveP1 || "Catgorithm offers digital bus screen advertising across Kollam, helping businesses reach local audiences through strategically placed displays inside private buses. Our platform builds brand visibility, recall and awareness through repeated exposure during everyday commutes.";
  doc.text(oppText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.35 });
  const oppLines = doc.splitTextToSize(oppText, PRINTABLE_W);
  y += oppLines.length * 5.2 + 10.0;

  // 5. Section 2: OUR ADVERTISING NETWORK (Left-aligned, Bold, NO underline)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR ADVERTISING NETWORK', MARGIN_LEFT, y);

  y += 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const netText = "Our network consists of digital display screens installed inside selected private buses, operating along established routes throughout Kollam. Each screen provides a dedicated space for promotional content, with advertisements scheduled to run as part of a continuous digital display network. The highlight of our network are :";
  doc.text(netText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.35 });
  const netLines = doc.splitTextToSize(netText, PRINTABLE_W);
  y += netLines.length * 5.2 + 6.0;

  const networkBullets: [string, string][] = [
    ['7 Advertising Routes', 'Coverage across key corridors in Kollam.'],
    ['32-inch Commercial Displays', 'HD digital screens with audio.'],
    ['Flexible Advertisement Duration', 'Video advertisements of up to 60 seconds.'],
    ['40-50 Daily Plays', 'Approximate daily advertisement plays per bus.'],
    ['24/7 Campaign Monitoring', 'Dedicated advertiser dashboard access.']
  ];

  networkBullets.forEach(([title, desc]) => {
    // Bullet Dot
    doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.circle(MARGIN_LEFT + 2.0, y - 1.1, 0.9, 'F');

    // Title in bold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    const titleStr = title + ' : ';
    doc.text(titleStr, MARGIN_LEFT + 6.0, y);
    const tw = doc.getTextWidth(titleStr);

    // Desc in normal
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(desc, MARGIN_LEFT + 6.0 + tw + 1.5, y);

    y += 6.5;
  });

  y += 6.0;

  // 6. Section 3: WHY CATGORITHM? (Left-aligned, Bold, NO underline)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('WHY CATGORITHM?', MARGIN_LEFT, y);

  y += 7.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const whyText = "We bring together strategically placed digital displays, engaging video content and flexible advertising plans in one platform. With a focus on convenience, campaign adaptability and performance transparency, we offer businesses a practical alternative to conventional outdoor advertising.";
  doc.text(whyText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.35 });

  // Page 1 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // ==========================================
  // PAGE 2: EXACT REPLICA OF USER TEMPLATE
  // ==========================================
  doc.addPage();
  y = 20.0;

  // Deliverables
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('CAMPAIGN DELIVERABLES', MARGIN_LEFT, y);

  y += 7.0;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text('Every campaign is supported by the following:', MARGIN_LEFT, y);
  y += 6.0;

  const deliverables = [
    'Advertisement playback on the selected bus screens.',
    'Repeated advertisement exposure throughout operating hours.',
    'Digital advertisement delivery with audio.',
    'Campaign activation and scheduling.',
    'Dedicated advertiser dashboard access.',
    'Campaign activity monitoring.',
    'Advertisement preview and campaign status tracking.'
  ];

  const dSpacing = mode === 'none' ? 6.0 : 4.8;
  deliverables.forEach(d => {
    doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.circle(MARGIN_LEFT + 2.0, y - 1.1, 0.85, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.0);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(d, MARGIN_LEFT + 6.0, y);
    y += dSpacing;
  });

  y += (mode === 'none' ? 7.0 : 4.0);

  // Campaign Monitoring
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('CAMPAIGN MONITORING', MARGIN_LEFT, y);

  y += 7.0;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  doc.text('Our advertiser dashboard provides campaign visibility through:', MARGIN_LEFT, y);
  y += 6.0;

  const monitoringItems = [
    'Active buses and screens.',
    'Advertisement plays per screen.',
    'Daily screen time.',
    'Running advertisements.',
    'Advertisement preview.',
    'Campaign description and expiry date.',
    'Number of days the advertisement has been played.'
  ];

  const mSpacing = mode === 'none' ? 6.0 : 4.8;
  monitoringItems.forEach(m => {
    doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.circle(MARGIN_LEFT + 2.0, y - 1.1, 0.85, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.0);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(m, MARGIN_LEFT + 6.0, y);
    y += mSpacing;
  });

  y += (mode === 'none' ? 7.0 : 4.0);

  // Optional Package Section (Single or Multiple)
  if (mode === 'single' && data.singlePackage) {
    const pkg = data.singlePackage;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13.0);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('PROPOSED CAMPAIGN INVESTMENT', MARGIN_LEFT, y);
    y += 4.5;

    const finalPrice = pkg.customPriceOverride !== undefined ? pkg.customPriceOverride : pkg.calculatedPrice;

    // NO Route Coverage, NO Estimated Airplay, NO GST mention!
    runAutoTable(doc, {
      startY: y,
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      head: [['Campaign Particulars', 'Package Details']],
      body: [
        ['Fleet Allocation', `${pkg.buses} Private Buses (Commercial Screen Displays)`],
        ['Video Ad Duration', `${pkg.videoDurationSeconds} Seconds (High-Definition with Audio)`],
        ['Campaign Period', `${pkg.durationLabel || `${pkg.days} Days`}`],
        ['Total Campaign Investment', formatPDFINR(finalPrice)],
      ],
      styles: {
        font: 'helvetica',
        fontSize: 9.5,
        cellPadding: 2.8,
        textColor: [31, 41, 55],
        lineColor: [229, 231, 235],
        lineWidth: 0.25,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', cellWidth: 55 },
        1: { halign: 'left' },
      },
    });
    const finalY = (doc as any).lastAutoTable?.finalY;
    y = (finalY || y + 26) + 6.0;
  } else if (mode === 'multiple' && data.multiplePackages && data.multiplePackages.length > 0) {
    const pkgs = data.multiplePackages;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13.0);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('PROPOSED CAMPAIGN OPTIONS', MARGIN_LEFT, y);
    y += 4.5;

    const headRow = ['Particulars'];
    pkgs.forEach((p, idx) => {
      headRow.push(p.name || `Option ${idx + 1}`);
    });

    const fleetRow = ['Fleet Allocation'];
    const durationRow = ['Ad Duration'];
    const periodRow = ['Campaign Period'];
    const investRow = ['Campaign Investment'];

    const isMany = pkgs.length >= 4;
    pkgs.forEach(p => {
      fleetRow.push(isMany ? `${p.buses} Buses` : `${p.buses} Buses`);
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

    // Dynamic sizing based on number of package columns
    const tableFontSize = pkgs.length >= 5 ? 7.6 : (pkgs.length === 4 ? 8.4 : 9.5);
    const cellPad = pkgs.length >= 5 ? 1.6 : (pkgs.length === 4 ? 2.0 : 2.6);

    // Clean uniform table without Option 2 highlight
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
    y = (finalY || y + 26) + 6.0;
  }

  // OUR COMMITMENT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR COMMITMENT', MARGIN_LEFT, y);

  y += 7.0;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.0);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

  const cP1 = "At Catgorithm, we aim to make advertising more accessible, measurable and effective for businesses.";
  const cP2 = "From campaign activation to ongoing monitoring, we are committed to providing a reliable advertising experience that helps your brand stay visible where your customers travel every day.";
  const cP3 = `We look forward to building a successful advertising partnership with ${clientName}. For any questions or further discussion, please feel free to contact us :`;

  const paraGap = mode === 'none' ? 5.0 : 3.0;
  doc.text(cP1, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.3 });
  const p1l = doc.splitTextToSize(cP1, PRINTABLE_W);
  y += p1l.length * 4.8 + paraGap;

  doc.text(cP2, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.3 });
  const p2l = doc.splitTextToSize(cP2, PRINTABLE_W);
  y += p2l.length * 4.8 + paraGap;

  doc.text(cP3, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.3 });
  const p3l = doc.splitTextToSize(cP3, PRINTABLE_W);
  y += p3l.length * 4.8 + (mode === 'none' ? 6.0 : 3.5);

  // Contact items with clean icons
  const contactItems: { type: 'phone' | 'email' | 'website'; text: string }[] = [
    { type: 'phone', text: 'WhatsApp / Call: +91 9746336175' },
    { type: 'email', text: 'Email: teamcatgorithm@gmail.com' },
    { type: 'website', text: 'Website: www.catgorithm.in' }
  ];

  contactItems.forEach(item => {
    drawContactIcons(doc, MARGIN_LEFT + 0.5, y, item.type);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text(item.text, MARGIN_LEFT + 6.0, y);
    y += (mode === 'none' ? 5.8 : 4.6);
  });

  // Page 2 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // Trigger download with sanitized filename
  const cleanName = (data.clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Catgorithm_Proposal_${cleanName}.pdf`;
  doc.save(filename);
  return doc;
}
