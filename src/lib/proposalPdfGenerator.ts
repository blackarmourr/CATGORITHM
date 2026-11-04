// ============================================================
// PROPOSAL PDF GENERATOR — CATGORITHM DIGITAL GROWTH
// Strictly 2-Page A4 Executive Proposal Document.
// Pixel-accurate replica of Catgorithm's official company template:
// - Untouched original logo aspect ratio (2.4976 : 1)
// - Exact consistent left-aligned section headings (14.5 pt bold, no underlines)
// - Centered title header block: both title & client in consistent 15.0 pt bold
// - Studio Shodwe gold (#d6c26e) & dark grey (#333132) divider lines
// - Spaced out typography (13.0 pt body) to uniformly fill Page 1 with no empty bottom space
// - 7 campaign deliverables & 7 monitoring points
// - Client name in "Our Commitment" in original entered case (not in all caps)
// - Official contact icons (solid handset, envelope outline, wireframe globe)
// - Optional clean single/multiple comparative investment tables
//   (NO Route Coverage, NO Estimated Airplay, NO GST mention anywhere)
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
const GRAY_TEXT: [number, number, number] = [75, 85, 99];      // #4b5563

// Consistent Typography Sizing
const TITLE_FONT_SIZE = 15.0;       // Entire centered heading: both "BUS SCREEN ADVERTISEMENT PROPOSAL FOR" and "[CLIENT NAME]"
const SUBHEADING_FONT_SIZE = 14.5;  // Consistent for ALL section subheadings on Page 1 and Page 2
const P1_BODY_FONT_SIZE = 13.0;     // Page 1 descriptions & paragraphs
const P1_BULLET_FONT_SIZE = 12.5;   // Page 1 network highlights

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
 * Exact contact icons matching user's official assets
 */
function drawContactIcons(doc: jsPDF, x: number, y: number, type: 'phone' | 'email' | 'website'): void {
  try {
    if (type === 'phone') {
      doc.addImage(ICON_PHONE_BASE64, 'PNG', x, y - 3.4, 3.6, 3.8);
    } else if (type === 'email') {
      doc.addImage(ICON_MAIL_BASE64, 'PNG', x - 0.2, y - 3.0, 4.2, 3.2);
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

  // 3. Document Title Block (Centered) - ENTIRE HEADING CONSISTENT FONT SIZE (15.0 pt)
  let y = 37.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(TITLE_FONT_SIZE);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('BUS SCREEN ADVERTISEMENT PROPOSAL FOR', PAGE_W / 2, y, { align: 'center' });

  y += 7.0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(TITLE_FONT_SIZE); // Exact same font size 15.0!
  doc.text(clientNameTitle, PAGE_W / 2, y, { align: 'center' });

  y += 6.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
  doc.text(`Prepared by: ${preparedBy} | ${proposalDate}`, PAGE_W / 2, y, { align: 'center' });

  // 4. Section 1: THE OPPORTUNITY (Spaced out to eliminate bottom blank space)
  y = 68.0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(data.objectiveTitle || 'THE OPPORTUNITY', MARGIN_LEFT, y);

  y += 8.0;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(P1_BODY_FONT_SIZE);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const oppText = data.objectiveP1 || "Catgorithm offers digital bus screen advertising across Kollam, helping businesses reach local audiences through strategically placed displays inside private buses. Our platform builds brand visibility, recall and awareness through repeated exposure during everyday commutes.";
  doc.text(oppText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.42 });

  // 5. Section 2: OUR ADVERTISING NETWORK
  y = 110.0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('OUR ADVERTISING NETWORK', MARGIN_LEFT, y);

  y += 8.0;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(P1_BODY_FONT_SIZE);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const netIntro = "Our network consists of digital display screens installed inside selected private buses, operating along established routes throughout Kollam. Each screen provides a dedicated space for promotional content, with advertisements scheduled to run as part of a continuous digital display network.";
  doc.text(netIntro, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.42 });

  y += 24.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(P1_BODY_FONT_SIZE);
  doc.text('The higlight of our network are :', MARGIN_LEFT, y);

  y += 8.5;
  const networkBullets: [string, string][] = [
    ['7 Advertising Routes', 'Coverage across key corridors in Kollam.'],
    ['32-inch Commercial Displays', 'HD digital screens with audio.'],
    ['Flexible Advertisement Duration', 'Video advertisements of up to 60 seconds.'],
    ['40–50 Daily Plays', 'Approximate daily advertisement plays per bus.'],
    ['24/7 Campaign Monitoring', 'Dedicated advertiser dashboard access.']
  ];

  networkBullets.forEach(([title, desc]) => {
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
    doc.text(desc, MARGIN_LEFT + 6.0 + tw + 1.2, y);

    y += 8.2;
  });

  // 6. Section 3: WHY CATGORITHM?
  y = 212.0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(SUBHEADING_FONT_SIZE);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('WHY CATGORITHM?', MARGIN_LEFT, y);

  y += 8.0;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(P1_BODY_FONT_SIZE);
  doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
  const whyText = "We bring together strategically placed digital displays, engaging video content and flexible advertising plans in one platform. With a focus on convenience, campaign adaptability and performance transparency, we offer businesses a practical alternative to conventional outdoor advertising.";
  doc.text(whyText, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.42 });

  // Page 1 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // ==========================================
  // PAGE 2: EXACT REPLICA OF USER TEMPLATE
  // ==========================================
  doc.addPage();

  const isNoPackage = mode === 'none';

  if (isNoPackage) {
    // Spaced out uniformly to match Page 1
    y = 22.0;

    // Deliverables
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SUBHEADING_FONT_SIZE);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('CAMPAIGN DELIVERABLES', MARGIN_LEFT, y);

    y += 8.0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(P1_BODY_FONT_SIZE);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text('Every campaign is supported by the following:', MARGIN_LEFT, y);
    y += 7.5;

    const deliverables = [
      'Advertisement playback on the selected bus screens.',
      'Repeated advertisement exposure throughout operating hours.',
      'Digital advertisement delivery with audio.',
      'Campaign activation and scheduling.',
      'Dedicated advertiser dashboard access.',
      'Campaign activity monitoring.',
      'Advertisement preview and campaign status tracking.'
    ];

    deliverables.forEach(d => {
      doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.circle(MARGIN_LEFT + 2.0, y - 1.2, 0.95, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12.2);
      doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.text(d, MARGIN_LEFT + 6.0, y);
      y += 6.8;
    });

    // Campaign Monitoring
    y = 96.0;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SUBHEADING_FONT_SIZE);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('CAMPAIGN MONITORING', MARGIN_LEFT, y);

    y += 8.0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(P1_BODY_FONT_SIZE);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text('Our advertiser dashboard provides campaign visibility through:', MARGIN_LEFT, y);
    y += 7.5;

    const monitoringItems = [
      'Active buses and screens.',
      'Advertisement plays per screen.',
      'Daily screen time.',
      'Running advertisements.',
      'Advertisement preview.',
      'Campaign description and expiry date.',
      'Number of days the advertisement has been played.'
    ];

    monitoringItems.forEach(m => {
      doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.circle(MARGIN_LEFT + 2.0, y - 1.2, 0.95, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12.2);
      doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.text(m, MARGIN_LEFT + 6.0, y);
      y += 6.8;
    });

    // Our Commitment
    y = 170.0;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SUBHEADING_FONT_SIZE);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('OUR COMMITMENT', MARGIN_LEFT, y);

    y += 8.0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12.2);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

    const cP1 = "At Catgorithm, we aim to make advertising more accessible, measurable and effective for businesses.";
    const cP2 = "From campaign activation to ongoing monitoring, we are committed to providing a reliable advertising experience that helps your brand stay visible where your customers travel every day.";
    const cP3 = `We look forward to building a successful advertising partnership with ${clientNameEntered}. For any questions or further discussion, please feel free to contact us:`;

    doc.text(cP1, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.4 });
    y += 14.5;

    doc.text(cP2, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.4 });
    y += 19.5;

    doc.text(cP3, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.4 });
    y += 18.0;

    // Contact items with new user icons
    const contactItems: { type: 'phone' | 'email' | 'website'; text: string }[] = [
      { type: 'phone', text: 'WhatsApp / Call: +91 9746336175' },
      { type: 'email', text: 'Email: teamcatgorithm@gmail.com' },
      { type: 'website', text: 'Website: www.catgorithm.in' }
    ];

    contactItems.forEach(item => {
      drawContactIcons(doc, MARGIN_LEFT + 0.5, y, item.type);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12.0);
      doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.text(item.text, MARGIN_LEFT + 6.2, y);
      y += 7.2;
    });

  } else {
    // Single or Multiple Package mode (Compact to fit strictly on 2 pages)
    y = 18.0;

    // Deliverables
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SUBHEADING_FONT_SIZE);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('CAMPAIGN DELIVERABLES', MARGIN_LEFT, y);

    y += 6.0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.2);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text('Every campaign is supported by the following:', MARGIN_LEFT, y);
    y += 5.2;

    const deliverables = [
      'Advertisement playback on the selected bus screens.',
      'Repeated advertisement exposure throughout operating hours.',
      'Digital advertisement delivery with audio.',
      'Campaign activation and scheduling.',
      'Dedicated advertiser dashboard access.',
      'Campaign activity monitoring.',
      'Advertisement preview and campaign status tracking.'
    ];

    deliverables.forEach(d => {
      doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.circle(MARGIN_LEFT + 2.0, y - 1.1, 0.85, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.text(d, MARGIN_LEFT + 6.0, y);
      y += 4.5;
    });

    y += 3.5;

    // Campaign Monitoring
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SUBHEADING_FONT_SIZE);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('CAMPAIGN MONITORING', MARGIN_LEFT, y);

    y += 6.0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11.2);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
    doc.text('Our advertiser dashboard provides campaign visibility through:', MARGIN_LEFT, y);
    y += 5.2;

    const monitoringItems = [
      'Active buses and screens.',
      'Advertisement plays per screen.',
      'Daily screen time.',
      'Running advertisements.',
      'Advertisement preview.',
      'Campaign description and expiry date.',
      'Number of days the advertisement has been played.'
    ];

    monitoringItems.forEach(m => {
      doc.setFillColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.circle(MARGIN_LEFT + 2.0, y - 1.1, 0.85, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);
      doc.text(m, MARGIN_LEFT + 6.0, y);
      y += 4.5;
    });

    y += 3.5;

    // Package Table
    if (mode === 'single' && data.singlePackage) {
      const pkg = data.singlePackage;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(SUBHEADING_FONT_SIZE);
      doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
      doc.text('PROPOSED CAMPAIGN INVESTMENT', MARGIN_LEFT, y);
      y += 4.2;

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
          cellPadding: 2.8,
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
      y = (finalY || y + 26) + 5.0;

    } else if (mode === 'multiple' && data.multiplePackages && data.multiplePackages.length > 0) {
      const pkgs = data.multiplePackages;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(SUBHEADING_FONT_SIZE);
      doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
      doc.text('PROPOSED CAMPAIGN OPTIONS', MARGIN_LEFT, y);
      y += 4.2;

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
      const cellPad = pkgs.length >= 5 ? 1.6 : (pkgs.length === 4 ? 2.0 : 2.6);

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
      y = (finalY || y + 26) + 5.0;
    }

    // Our Commitment
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(SUBHEADING_FONT_SIZE);
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text('OUR COMMITMENT', MARGIN_LEFT, y);

    y += 6.0;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(CHARCOAL[0], CHARCOAL[1], CHARCOAL[2]);

    const cP1 = "At Catgorithm, we aim to make advertising more accessible, measurable and effective for businesses.";
    const cP2 = "From campaign activation to ongoing monitoring, we are committed to providing a reliable advertising experience that helps your brand stay visible where your customers travel every day.";
    const cP3 = `We look forward to building a successful advertising partnership with ${clientNameEntered}. For any questions or further discussion, please feel free to contact us:`;

    doc.text(cP1, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.3 });
    const p1l = doc.splitTextToSize(cP1, PRINTABLE_W);
    y += p1l.length * 4.6 + 2.5;

    doc.text(cP2, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.3 });
    const p2l = doc.splitTextToSize(cP2, PRINTABLE_W);
    y += p2l.length * 4.6 + 2.5;

    doc.text(cP3, MARGIN_LEFT, y, { align: 'justify', maxWidth: PRINTABLE_W, lineHeightFactor: 1.3 });
    const p3l = doc.splitTextToSize(cP3, PRINTABLE_W);
    y += p3l.length * 4.6 + 3.0;

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
      doc.text(item.text, MARGIN_LEFT + 6.2, y);
      y += 4.5;
    });
  }

  // Page 2 Footer
  drawFooter(doc, data.contactEmail, data.website);

  // Trigger download with sanitized filename
  const cleanName = (data.clientName || 'Client').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `Catgorithm_Proposal_${cleanName}.pdf`;
  doc.save(filename);
  return doc;
}
