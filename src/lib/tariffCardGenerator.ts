// ============================================================
// CATGORITHM TARIFF CARD 2026 — SINGLE-PAGE EXECUTIVE RATE CARD
// Competitor-inspired clean, high-contrast, ultra-readable layout.
// Strict single-page A4 transit media pricing & volume packages.
// ============================================================
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CATGORITHM_LOGO_BASE64 } from './logoBase64';
import { calculatePrice } from './pricingEngine';

function formatPDFINR(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN');
  return `Rs. ${formatted}`;
}

export async function generateTariffCardPDF(): Promise<jsPDF> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 9;
  const CONTENT_W = PAGE_W - MARGIN * 2; // 192mm

  // Competitor-inspired clean, high-contrast corporate palette
  const NAVY_BLUE: [number, number, number] = [27, 54, 93];          // #1B365D - Deep authoritative navy
  const ORANGE_ACCENT: [number, number, number] = [217, 83, 30];     // #D9531E - Vibrant warm highlight
  const DARK_CHARCOAL: [number, number, number] = [15, 23, 42];      // #0F172A - High readability text
  const LIGHT_ROW_BG: [number, number, number] = [248, 250, 252];    // #F8FAFC - Soft zebra row
  const BORDER_COLOR: [number, number, number] = [203, 213, 225];    // #CBD5E1 - Crisp clean borders
  const WHITE: [number, number, number] = [255, 255, 255];
  const SUCCESS_GREEN: [number, number, number] = [21, 128, 61];     // #15803D
  const SUBTLE_TEXT: [number, number, number] = [100, 116, 139];     // #64748B
  const ROYAL_PURPLE: [number, number, number] = [74, 35, 90];       // #4A235A

  // Distinct column header colors (matching competitor's visual hierarchy)
  const COL_HEADER_COLORS: [number, number, number][] = [
    [59, 40, 76],   // Col 0: Deep Plum / Purple
    [27, 79, 114],  // Col 1: Deep Teal Blue
    [194, 65, 12],  // Col 2: Vibrant Coral / Orange (Highlights 2-Month Flat 30% deal)
    [30, 58, 138],  // Col 3: Royal Navy Blue
    [180, 83, 9],   // Col 4: Rich Amber / Bronze
    [21, 128, 61],  // Col 5: Emerald Green (Highlights 1-Year Max Savings)
  ];

  // Top Accent Bar
  doc.setFillColor(...NAVY_BLUE);
  doc.rect(0, 0, PAGE_W, 3.2, 'F');
  doc.setFillColor(...ORANGE_ACCENT);
  doc.rect(0, 3.2, PAGE_W, 0.8, 'F');

  // ==================== HEADER SECTION ====================
  let y = 7.0;

  // Left: Brand Logo & Title
  if (CATGORITHM_LOGO_BASE64) {
    try {
      doc.addImage(CATGORITHM_LOGO_BASE64, 'PNG', MARGIN, y, 44, 15.5);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...NAVY_BLUE);
      doc.text('CATGORITHM', MARGIN, y + 10);
    }
  }

  // Tagline under logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...SUBTLE_TEXT);
  doc.text('— Building Brands Through In-Transit Mobility —', MARGIN, y + 19.5);

  // Large TARIFF CARD 2026 title (competitor style: TARIFF CARD in navy, 2026 in orange)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(23);
  doc.setTextColor(...NAVY_BLUE);
  const tcText = 'TARIFF CARD ';
  doc.text(tcText, MARGIN, y + 27.5);
  const tcWidth = doc.getTextWidth(tcText);
  doc.setTextColor(...ORANGE_ACCENT);
  doc.text('2026', MARGIN + tcWidth, y + 27.5);

  // Pill Subtitle beneath TARIFF CARD 2026
  const pillW = 82;
  const pillH = 5.2;
  const pillX = MARGIN;
  const pillY = y + 29.5;
  doc.setFillColor(...NAVY_BLUE);
  doc.roundedRect(pillX, pillY, pillW, pillH, 1.2, 1.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...WHITE);
  doc.text('TRANSIT MEDIA ADVERTISING SOLUTIONS', pillX + pillW / 2, pillY + 3.7, { align: 'center' });

  // Main required header line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...DARK_CHARCOAL);
  doc.text('Catgorithm Digital Transit Media Offer Tariff Card, Commercial Rates & Volume Benefits', MARGIN, y + 38.5);

  // Right Side Graphic: Digital Bus Screen Mockup & Kerala Transit Media Badge
  const screenW = 68;
  const screenH = 26;
  const screenX = PAGE_W - MARGIN - screenW;
  const screenY = y + 1;

  // Screen Outer Casing (Dark frame with rounded corners)
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(screenX, screenY, screenW, screenH, 2.5, 2.5, 'F');
  doc.setDrawColor(71, 85, 105);
  doc.setLineWidth(0.3);
  doc.roundedRect(screenX, screenY, screenW, screenH, 2.5, 2.5, 'S');

  // Screen Inner Display (Vibrant Navy/Blue In-Bus Screen)
  const scrPad = 1.8;
  doc.setFillColor(...NAVY_BLUE);
  doc.roundedRect(screenX + scrPad, screenY + scrPad, screenW - scrPad * 2, screenH - scrPad * 2, 1.5, 1.5, 'F');

  // Inner Screen Content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(253, 224, 71); // Gold yellow
  doc.text('YOUR BRAND', screenX + (screenW - 14) / 2, screenY + 6.8, { align: 'center' });
  doc.setTextColor(...WHITE);
  doc.text('SEEN. HEARD. REMEMBERED.', screenX + (screenW - 14) / 2, screenY + 11.2, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.0);
  doc.setTextColor(203, 213, 225);
  doc.text('— ADS IN PRIVATE BUSES • KOLLAM —', screenX + (screenW - 14) / 2, screenY + 15.5, { align: 'center' });

  // Screen status bar
  doc.setFillColor(15, 23, 42);
  doc.rect(screenX + scrPad, screenY + screenH - scrPad - 4.5, screenW - scrPad * 2, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.6);
  doc.setTextColor(52, 211, 153); // Emerald green status
  doc.text('FULL HD 1080p AUDIO-VIDEO SCREEN', screenX + (screenW - 12) / 2, screenY + screenH - scrPad - 1.4, { align: 'center' });

  // Circular Badge overlay on bottom-right of screen
  const badgeRadius = 11;
  const badgeCenterX = screenX + screenW - 8;
  const badgeCenterY = screenY + screenH - 2;
  doc.setFillColor(...WHITE);
  doc.circle(badgeCenterX, badgeCenterY, badgeRadius, 'F');
  doc.setDrawColor(...NAVY_BLUE);
  doc.setLineWidth(0.7);
  doc.circle(badgeCenterX, badgeCenterY, badgeRadius, 'S');
  doc.setDrawColor(...ORANGE_ACCENT);
  doc.setLineWidth(0.2);
  doc.circle(badgeCenterX, badgeCenterY, badgeRadius - 0.9, 'S');

  // 5 gold dots for stars
  doc.setFillColor(234, 179, 8); // Gold
  for (let s = -2; s <= 2; s++) {
    doc.circle(badgeCenterX + s * 2.8, badgeCenterY - 5.5, 0.7, 'F');
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.6);
  doc.setTextColor(...NAVY_BLUE);
  doc.text("KERALA'S", badgeCenterX, badgeCenterY - 2.0, { align: 'center' });
  doc.text('SMART TRANSIT', badgeCenterX, badgeCenterY + 1.2, { align: 'center' });
  doc.text('MEDIA NETWORK', badgeCenterX, badgeCenterY + 4.5, { align: 'center' });

  y = y + 42;

  // Durations requested: 10s, 20s, 30s, 40s, 50s, 60s
  const durations = [10, 20, 30, 40, 50, 60];

  // Helper function to build clean rows for any bus count
  function getTableBody(busesCount: number, isPerBusOnly: boolean = false) {
    return durations.map((sec) => {
      const p1 = calculatePrice(busesCount, 1, sec);
      const p2 = calculatePrice(busesCount, 2, sec);
      const p3 = calculatePrice(busesCount, 3, sec);
      const p6 = calculatePrice(busesCount, 6, sec);
      const p12 = calculatePrice(busesCount, 12, sec);

      const secLabel = sec === 30 ? '30 SEC (STANDARD BASE)' : `${sec} SECONDS`;

      if (isPerBusOnly) {
        return [
          secLabel,
          formatPDFINR(p1.packagePrice),
          formatPDFINR(p2.packagePrice),
          formatPDFINR(p3.packagePrice),
          formatPDFINR(p6.packagePrice),
          formatPDFINR(p12.packagePrice),
        ];
      }

      return [
        secLabel,
        `${formatPDFINR(p1.packagePrice)}\n(Rs. ${Math.round(p1.pricePerBusMonth)}/bus)`,
        `${formatPDFINR(p2.packagePrice)}\n(Rs. ${Math.round(p2.pricePerBusMonth)}/bus)`,
        `${formatPDFINR(p3.packagePrice)}\n(Rs. ${Math.round(p3.pricePerBusMonth)}/bus)`,
        `${formatPDFINR(p6.packagePrice)}\n(Rs. ${Math.round(p6.pricePerBusMonth)}/bus)`,
        `${formatPDFINR(p12.packagePrice)}\n(Rs. ${Math.round(p12.pricePerBusMonth)}/bus)`,
      ];
    });
  }

  // --- TABLE 1: SINGLE BUS BASE TARIFF ---
  const t1TitleH = 5.2;
  doc.setFillColor(...NAVY_BLUE);
  doc.roundedRect(MARGIN, y, CONTENT_W, t1TitleH, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(...WHITE);
  doc.text('TARIFF CARD FOR ADVERTISING MEDIA — 1 BUS (BASE TARIFF)', MARGIN + 4, y + 3.7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...WHITE);
  doc.text('Individual Screen Rate • Flexible Monthly Commitments', PAGE_W - MARGIN - 4, y + 3.7, { align: 'right' });

  y += t1TitleH;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [[
      'DURATION OF\nADVERTISEMENT (IN SEC)',
      'RATE PER MONTH\nPER BUS (1 MO)',
      '2 MONTHS PACKAGE\nPER BUS (2 MO)',
      '3 MONTHS PACKAGE\nPER BUS (3 MO)',
      '6 MONTHS PACKAGE\nPER BUS (6 MO)',
      '1 YEAR PACKAGE\nPER BUS (12 MO)',
    ]],
    body: getTableBody(1, true),
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 7.0,
      cellPadding: { top: 1.5, bottom: 1.5, left: 3, right: 3 },
      textColor: DARK_CHARCOAL,
      lineColor: BORDER_COLOR,
      lineWidth: 0.15,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: NAVY_BLUE,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'center',
      cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
    },
    alternateRowStyles: {
      fillColor: LIGHT_ROW_BG,
    },
    columnStyles: {
      0: { cellWidth: 42, halign: 'left', fontStyle: 'bold' },
      1: { cellWidth: 30, fontStyle: 'bold' },
      2: { cellWidth: 30, textColor: ORANGE_ACCENT, fontStyle: 'bold' },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30, textColor: SUCCESS_GREEN, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'head') {
        if (COL_HEADER_COLORS[data.column.index]) {
          data.cell.styles.fillColor = COL_HEADER_COLORS[data.column.index];
        }
      }
      // Highlight 30s Base Standard row
      if (data.section === 'body' && data.row.index === 2) {
        data.cell.styles.fillColor = [254, 243, 199];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const table1FinalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  y = table1FinalY + 1.0;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.5);
  doc.setTextColor(...SUBTLE_TEXT);
  doc.text('*All the above rates are exclusive of GST @18%', PAGE_W / 2, y + 2.2, { align: 'center' });

  y += 4.0;

  // --- TABLE 2: 5 BUSES PACKAGE (REGIONAL REACH) ---
  const t2TitleH = 5.2;
  doc.setFillColor(...NAVY_BLUE);
  doc.roundedRect(MARGIN, y, CONTENT_W, t2TitleH, 1, 1, 'F');
  // Left orange accent bar
  doc.setFillColor(...ORANGE_ACCENT);
  doc.rect(MARGIN, y, 2.5, t2TitleH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(...WHITE);
  doc.text('TARIFF CARD FOR 5 BUSES PACKAGE — REGIONAL CORRIDOR COVERAGE', MARGIN + 5, y + 3.7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.3);
  doc.setTextColor(...WHITE);
  doc.text('5 Active Buses • Multi-Route Visibility', PAGE_W - MARGIN - 4, y + 3.7, { align: 'right' });

  y += t2TitleH;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [[
      'DURATION OF\nADVERTISEMENT (IN SEC)',
      '1 MONTH PACKAGE\n(5 BUSES TOTAL)',
      '2 MONTHS PACKAGE\n(5 BUSES TOTAL)',
      '3 MONTHS PACKAGE\n(5 BUSES TOTAL)',
      '6 MONTHS PACKAGE\n(5 BUSES TOTAL)',
      '1 YEAR PACKAGE\n(5 BUSES TOTAL)',
    ]],
    body: getTableBody(5, false),
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 6.8,
      cellPadding: { top: 1.4, bottom: 1.4, left: 3, right: 3 },
      textColor: DARK_CHARCOAL,
      lineColor: BORDER_COLOR,
      lineWidth: 0.15,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: NAVY_BLUE,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'center',
      cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
    },
    alternateRowStyles: {
      fillColor: LIGHT_ROW_BG,
    },
    columnStyles: {
      0: { cellWidth: 42, halign: 'left', fontStyle: 'bold' },
      1: { cellWidth: 30, fontStyle: 'bold' },
      2: { cellWidth: 30, textColor: ORANGE_ACCENT, fontStyle: 'bold' },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30, textColor: SUCCESS_GREEN, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'head') {
        if (COL_HEADER_COLORS[data.column.index]) {
          data.cell.styles.fillColor = COL_HEADER_COLORS[data.column.index];
        }
      }
      if (data.section === 'body' && data.row.index === 2) {
        data.cell.styles.fillColor = [254, 243, 199];
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const table2FinalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  y = table2FinalY + 1.0;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.5);
  doc.setTextColor(...SUBTLE_TEXT);
  doc.text('*All the above rates are exclusive of GST @18%', PAGE_W / 2, y + 2.2, { align: 'center' });

  y += 4.0;

  // --- TABLE 3: 10 BUSES PACKAGE (FULL FLEET CITY NETWORK) ---
  const t3TitleH = 5.2;
  doc.setFillColor(...DARK_CHARCOAL);
  doc.roundedRect(MARGIN, y, CONTENT_W, t3TitleH, 1, 1, 'F');
  // Left orange accent bar
  doc.setFillColor(...ORANGE_ACCENT);
  doc.rect(MARGIN, y, 2.5, t3TitleH, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(...WHITE);
  doc.text('TARIFF CARD FOR 10 BUSES (FULL FLEET) — MAXIMUM CITY REACH', MARGIN + 5, y + 3.7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.3);
  doc.setTextColor(253, 224, 71); // Gold yellow accent
  doc.text('10 Buses Network • Maximum Commuter Frequency & Impact', PAGE_W - MARGIN - 4, y + 3.7, { align: 'right' });

  y += t3TitleH;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [[
      'DURATION OF\nADVERTISEMENT (IN SEC)',
      '1 MONTH PACKAGE\n(SAVE RS. 5,000)',
      '2 MONTHS PACKAGE\n(FLAT 30% OFF!)',
      '3 MONTHS PACKAGE\n(SAVE RS. 21,000)',
      '6 MONTHS PACKAGE\n(SAVE RS. 45,000)',
      '1 YEAR PACKAGE\n(SAVE RS. 90,000!)',
    ]],
    body: getTableBody(10, false),
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 6.8,
      cellPadding: { top: 1.4, bottom: 1.4, left: 3, right: 3 },
      textColor: DARK_CHARCOAL,
      lineColor: BORDER_COLOR,
      lineWidth: 0.15,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: DARK_CHARCOAL,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 6.5,
      halign: 'center',
      cellPadding: { top: 2, bottom: 2, left: 2, right: 2 },
    },
    alternateRowStyles: {
      fillColor: LIGHT_ROW_BG,
    },
    columnStyles: {
      0: { cellWidth: 42, halign: 'left', fontStyle: 'bold' },
      1: { cellWidth: 30, fontStyle: 'bold' },
      2: { cellWidth: 30, textColor: ORANGE_ACCENT, fontStyle: 'bold' },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30, textColor: SUCCESS_GREEN, fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'head') {
        if (COL_HEADER_COLORS[data.column.index]) {
          data.cell.styles.fillColor = COL_HEADER_COLORS[data.column.index];
        }
      }
      if (data.section === 'body' && data.row.index === 2) {
        data.cell.styles.fillColor = [240, 253, 244]; // Soft emerald tint
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  const table3FinalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  y = table3FinalY + 1.0;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(5.5);
  doc.setTextColor(...SUBTLE_TEXT);
  doc.text('*All the above rates are exclusive of GST @18%', PAGE_W / 2, y + 2.2, { align: 'center' });

  y += 4.5;

  // --- THREE BOTTOM CARDS (MATCHING COMPETITOR'S INFORMATIVE STRUCTURE) ---
  const cardW = (CONTENT_W - 6) / 3; // ~62mm each
  const cardH = 26;

  // Card 1: ADVERTISEMENT BENEFITS (Purple Header)
  doc.setFillColor(...WHITE);
  doc.roundedRect(MARGIN, y, cardW, cardH, 1.2, 1.2, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.15);
  doc.roundedRect(MARGIN, y, cardW, cardH, 1.2, 1.2, 'S');

  doc.setFillColor(...ROYAL_PURPLE);
  doc.rect(MARGIN, y, cardW, 4.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(...WHITE);
  doc.text('ADVERTISEMENT BENEFITS', MARGIN + cardW / 2, y + 3, { align: 'center' });

  const benefits = [
    '• 30+ Ad Repetitions Daily Per Bus',
    '• 900+ Ad Plays Monthly Per Screen',
    '• 100% Unskippable Video Display',
    '• Synchronized High-Impact Audio',
    '• Daily Captive Commuter Recall',
  ];
  let by1 = y + 7.2;
  benefits.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.4);
    doc.setTextColor(...DARK_CHARCOAL);
    doc.text(item, MARGIN + 3.5, by1);
    by1 += 3.7;
  });

  // Card 2: REACH HIGHLIGHT (10 BUSES FULL FLEET CAMPAIGN)
  const c2X = MARGIN + cardW + 3;
  doc.setFillColor(...WHITE);
  doc.roundedRect(c2X, y, cardW, cardH, 1.2, 1.2, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.15);
  doc.roundedRect(c2X, y, cardW, cardH, 1.2, 1.2, 'S');

  doc.setFillColor(...NAVY_BLUE);
  doc.rect(c2X, y, cardW, 4.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(...WHITE);
  doc.text('REACH EXAMPLE', c2X + cardW / 2, y + 3, { align: 'center' });

  // Little vector bus icon in circle
  doc.setFillColor(238, 242, 255);
  doc.circle(c2X + 7, y + 7.5, 2.5, 'F');
  doc.setFillColor(...NAVY_BLUE);
  doc.roundedRect(c2X + 5.5, y + 6.2, 3, 2.4, 0.4, 0.4, 'F');
  doc.setFillColor(...WHITE);
  doc.rect(c2X + 6, y + 6.6, 2, 0.8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...NAVY_BLUE);
  doc.text('10 BUSES FULL FLEET CAMPAIGN', c2X + cardW / 2 + 2, y + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.3);
  doc.setTextColor(...DARK_CHARCOAL);
  doc.text('• Daily Commuter Footfall: 15,000+ Passengers', c2X + 3.5, y + 11.8);
  doc.text('• Monthly Campaign Views: 4,50,000+ Ad Plays', c2X + 3.5, y + 15.2);

  // Cost per reach chip (Competitor style)
  doc.setFillColor(...LIGHT_ROW_BG);
  doc.roundedRect(c2X + 4, y + 17.2, cardW - 8, 6.8, 1, 1, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.15);
  doc.roundedRect(c2X + 4, y + 17.2, cardW - 8, 6.8, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.0);
  doc.setTextColor(...SUBTLE_TEXT);
  doc.text('COST PER AD PLAY: RS. 0.044 ONLY', c2X + cardW / 2, y + 19.8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...ORANGE_ACCENT);
  doc.text('RS. 58.30 ONLY / DAY PER BUS', c2X + cardW / 2, y + 22.8, { align: 'center' });

  // Card 3: OUR SOLUTIONS & HARDWARE
  const c3X = MARGIN + (cardW + 3) * 2;
  doc.setFillColor(...WHITE);
  doc.roundedRect(c3X, y, cardW, cardH, 1.2, 1.2, 'F');
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.15);
  doc.roundedRect(c3X, y, cardW, cardH, 1.2, 1.2, 'S');

  doc.setFillColor(...ORANGE_ACCENT);
  doc.rect(c3X, y, cardW, 4.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.4);
  doc.setTextColor(...WHITE);
  doc.text('OUR SOLUTIONS', c3X + cardW / 2, y + 3, { align: 'center' });

  const solutions = [
    '• Digital Screens Inside Private Buses',
    '• High-Definition Video & Audio Output',
    '• Cloud-Based Content Management',
    '• Real-time Monitoring & Reporting',
    '• Route & Location Targeting in Kollam',
  ];
  let by3 = y + 7.2;
  solutions.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.4);
    doc.setTextColor(...DARK_CHARCOAL);
    doc.text(item, c3X + 3.5, by3);
    by3 += 3.7;
  });

  y += cardH + 3.2;

  // Note Bar (Exact matching competitor style with subtle document badge)
  doc.setFillColor(...NAVY_BLUE);
  doc.roundedRect(MARGIN, y, CONTENT_W, 5.0, 1, 1, 'F');
  // Little white doc icon
  doc.setFillColor(...WHITE);
  doc.roundedRect(MARGIN + 2, y + 1.2, 2.2, 2.6, 0.3, 0.3, 'F');
  doc.setFillColor(...NAVY_BLUE);
  doc.rect(MARGIN + 2.5, y + 1.7, 1.2, 0.4, 'F');
  doc.rect(MARGIN + 2.5, y + 2.4, 1.2, 0.4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.3);
  doc.setTextColor(...WHITE);
  doc.text('Note: All rates mentioned are indicative and exclusive of GST @18%. Video creative format: MP4 Full HD (16:9).', PAGE_W / 2 + 1, y + 3.4, { align: 'center' });

  // Bottom Footer Bar (Exact competitor style)
  const footY = PAGE_H - 12;
  doc.setFillColor(...DARK_CHARCOAL);
  doc.rect(0, footY, PAGE_W, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...WHITE);
  doc.text('CATGORITHM DIGITAL GROWTH', MARGIN, footY + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.6);
  doc.setTextColor(203, 213, 225);
  doc.text('Parayathumukku, Umayanalloor, Kollam 691020, Kerala', MARGIN, footY + 8.8);

  // WhatsApp bubble icon + phone
  doc.setFillColor(37, 211, 102); // WhatsApp green
  doc.circle(PAGE_W / 2 - 13, footY + 4.5, 1.4, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...WHITE);
  doc.text('+91 97463 36175', PAGE_W / 2 + 6, footY + 4.8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.6);
  doc.setTextColor(203, 213, 225);
  doc.text('teamcatgorithm@gmail.com   •   www.catgorithm.in', PAGE_W / 2 + 6, footY + 8.8, { align: 'center' });

  // Right Tagline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(253, 224, 71); // Gold yellow
  doc.text('THE FUTURE OF PUBLIC', PAGE_W - MARGIN, footY + 4.8, { align: 'right' });
  doc.text('TRANSPORT ADVERTISING', PAGE_W - MARGIN, footY + 8.8, { align: 'right' });

  return doc;
}

export async function downloadTariffCardPDF(): Promise<void> {
  const doc = await generateTariffCardPDF();
  doc.save('CATGORITHM_TARIFF_CARD_2026.pdf');
}

