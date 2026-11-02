// ============================================================
// CATGORITHM TARIFF CARD 2026 — SINGLE-PAGE EXECUTIVE RATE CARD
// Official Catgorithm Maroon & Neutral Charcoal brand identity.
// Clean single-page A4 transit media pricing & discount matrix.
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

  // Official Catgorithm Brochure Palette
  const BRAND_MAROON = [160, 53, 78] as [number, number, number];      // #A0354E
  const BRAND_DEEP = [122, 29, 51] as [number, number, number];        // #7A1D33
  const BRAND_DARK = [17, 24, 39] as [number, number, number];          // #111827
  const LIGHT_ROSE = [253, 242, 244] as [number, number, number];       // #FDF2F4
  const LIGHT_BG = [248, 249, 251] as [number, number, number];
  const BORDER_GRAY = [226, 232, 240] as [number, number, number];
  const TEXT_PRIMARY = [17, 24, 39] as [number, number, number];
  const TEXT_MUTED = [100, 116, 139] as [number, number, number];
  const SUCCESS_GREEN = [21, 128, 61] as [number, number, number];      // #15803D
  const WHITE = [255, 255, 255] as [number, number, number];

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...BRAND_MAROON);
  doc.rect(0, 0, PAGE_W, 3.5, 'F');
  doc.setFillColor(212, 175, 55); // Gold micro accent
  doc.rect(0, 3.5, PAGE_W, 0.6, 'F');

  // 2. Header: Logo & Title
  let y = 8;
  if (CATGORITHM_LOGO_BASE64) {
    try {
      doc.addImage(CATGORITHM_LOGO_BASE64, 'PNG', MARGIN, y, 46, 15.5);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(...BRAND_MAROON);
      doc.text('CATGORITHM', MARGIN, y + 10);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('DIGITAL TRANSIT MEDIA NETWORK • KOLLAM FLEET, KERALA', MARGIN, y + 19.5);

  // Right Header: Tariff Title & Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...BRAND_MAROON);
  doc.text('TARIFF CARD 2026', PAGE_W - MARGIN, y + 6.5, { align: 'right' });

  // Badge pill
  const badgeW = 75;
  const badgeH = 5.2;
  const badgeX = PAGE_W - MARGIN - badgeW;
  const badgeY = y + 8.5;
  doc.setFillColor(...LIGHT_ROSE);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'F');
  doc.setDrawColor(...BRAND_MAROON);
  doc.setLineWidth(0.2);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...BRAND_MAROON);
  doc.text('COMMERCIAL RATES & VOLUME BENEFITS', badgeX + badgeW / 2, badgeY + 3.7, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Bus Screen In-Transit Advertising Network', PAGE_W - MARGIN, y + 18, { align: 'right' });

  y += 24;

  // 3. Four Highlights / Metric Badges Row
  const cardW = (CONTENT_W - 9) / 4; // ~41.25mm
  const cardH = 12.5;

  const metricHighlights = [
    { label: 'BASE REFERENCE RATE', val: 'Rs. 2,500', sub: 'Per Bus/Mo (30s Base • Rs.83.3/s)', color: BRAND_DARK },
    { label: '1-MONTH PACKAGE', val: 'Save up to Rs. 5,000', sub: 'Full Fleet 10 Buses @ Rs.20k', color: BRAND_MAROON },
    { label: '2-MONTH SPECIAL', val: 'FLAT 30% OFF', sub: '10 Buses @ Rs.35k (Save Rs.15k)', color: SUCCESS_GREEN },
    { label: '1-YEAR RETAINER', val: 'Save Rs. 90,000', sub: 'Full Fleet @ Only Rs.58/day/bus', color: BRAND_DEEP },
  ];

  metricHighlights.forEach((m, idx) => {
    const cx = MARGIN + idx * (cardW + 3);
    doc.setFillColor(...WHITE);
    doc.roundedRect(cx, y, cardW, cardH, 1.5, 1.5, 'F');
    doc.setDrawColor(...BORDER_GRAY);
    doc.setLineWidth(0.2);
    doc.roundedRect(cx, y, cardW, cardH, 1.5, 1.5, 'S');

    doc.setFillColor(...m.color);
    doc.rect(cx, y, 1.8, cardH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(m.label, cx + 4, y + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(...m.color);
    doc.text(m.val, cx + 4, y + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.4);
    doc.setTextColor(...TEXT_PRIMARY);
    doc.text(m.sub, cx + 4, y + 10.8);
  });

  y += cardH + 4;

  // Helper to build table data
  function buildTableRows(busCount: number) {
    const durations = [10, 15, 20, 30, 45, 60];
    return durations.map((sec) => {
      const p1 = calculatePrice(busCount, 1, sec);
      const p2 = calculatePrice(busCount, 2, sec);
      const p3 = calculatePrice(busCount, 3, sec);
      const p6 = calculatePrice(busCount, 6, sec);
      const p12 = calculatePrice(busCount, 12, sec);

      const ratePerSecMo = (p1.packagePrice / (busCount * sec)).toFixed(1);
      const durationLabel = sec === 30 ? '30 Sec (Base Standard)' : `${sec} Seconds`;

      return [
        durationLabel,
        `Rs. ${ratePerSecMo}`,
        `${formatPDFINR(p1.packagePrice)}\n(Rs. ${p1.pricePerBusMonth.toFixed(0)}/bus)`,
        `${formatPDFINR(p2.packagePrice)}\n(Rs. ${p2.pricePerBusMonth.toFixed(0)}/bus)`,
        `${formatPDFINR(p3.packagePrice)}\n(Rs. ${p3.pricePerBusMonth.toFixed(0)}/bus)`,
        `${formatPDFINR(p6.packagePrice)}\n(Rs. ${p6.pricePerBusMonth.toFixed(0)}/bus)`,
        `${formatPDFINR(p12.packagePrice)}\n(Rs. ${p12.pricePerBusMonth.toFixed(0)}/bus)`,
      ];
    });
  }

  // 4. Section 1: 5-BUS CAMPAIGN PACKAGES
  doc.setFillColor(...BRAND_MAROON);
  doc.roundedRect(MARGIN, y, CONTENT_W, 5.2, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...WHITE);
  doc.text('5-BUS REGIONAL REACH NETWORK — TARIFF PACKAGES', MARGIN + 3.5, y + 3.7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.text('Key Route Corridors • 5 Screen Network Coverage', PAGE_W - MARGIN - 3.5, y + 3.7, { align: 'right' });

  y += 5.2;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [[
      'Ad Duration\n(Seconds)',
      'Rate/Sec\n(Per Bus/Mo)',
      '1 Month Package\n(5 Buses Total)',
      '2 Months Package\n(Save Extra • 2 Mo)',
      '3 Months Package\n(10% Off Base)',
      '6 Months Package\n(12.5% Off Base)',
      '1 Year Retainer\n(Annual Best Value)',
    ]],
    body: buildTableRows(5),
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 6.8,
      cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 },
      textColor: TEXT_PRIMARY,
      lineColor: BORDER_GRAY,
      lineWidth: 0.15,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: BRAND_DARK,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 6.4,
      halign: 'center',
      cellPadding: { top: 2.2, bottom: 2.2, left: 1.5, right: 1.5 },
    },
    columnStyles: {
      0: { cellWidth: 34, halign: 'left', fontStyle: 'bold' },
      1: { cellWidth: 22, textColor: TEXT_MUTED },
      2: { cellWidth: 27 },
      3: { cellWidth: 27, fontStyle: 'bold', textColor: BRAND_MAROON },
      4: { cellWidth: 27 },
      5: { cellWidth: 27 },
      6: { cellWidth: 28, fontStyle: 'bold', textColor: BRAND_DEEP },
    },
    didParseCell: (data) => {
      // Highlight the 30s Base Standard row
      if (data.section === 'body' && data.row.index === 3) {
        data.cell.styles.fillColor = [254, 245, 247]; // Soft rose tint
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 0) {
          data.cell.styles.textColor = BRAND_MAROON;
        }
      }
    },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 4;

  // 5. Section 2: 10-BUS FULL FLEET NETWORK PACKAGES
  doc.setFillColor(...BRAND_DARK);
  doc.roundedRect(MARGIN, y, CONTENT_W, 5.2, 1, 1, 'F');
  // Maroon accent edge
  doc.setFillColor(...BRAND_MAROON);
  doc.rect(MARGIN, y, 2, 5.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...WHITE);
  doc.text('10-BUS FULL FLEET NETWORK — MAXIMUM CITY-WIDE REACH', MARGIN + 4.5, y + 3.7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.2);
  doc.setTextColor(253, 224, 71); // Yellow accent
  doc.text('Complete 10 Buses • Highest Frequency & Brand Dominance', PAGE_W - MARGIN - 3.5, y + 3.7, { align: 'right' });

  y += 5.2;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [[
      'Ad Duration\n(Seconds)',
      'Rate/Sec\n(Per Bus/Mo)',
      '1 Month Package\n(Save Rs.5,000 • 20%)',
      '2 Months Package\n(FLAT 30% OFF!)',
      '3 Months Package\n(Save Rs.21k • 28%)',
      '6 Months Package\n(Save Rs.45k • 30%)',
      '1 Year Retainer\n(SAVE Rs.90,000!)',
    ]],
    body: buildTableRows(10),
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 6.8,
      cellPadding: { top: 1.8, bottom: 1.8, left: 2.5, right: 2.5 },
      textColor: TEXT_PRIMARY,
      lineColor: BORDER_GRAY,
      lineWidth: 0.15,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: BRAND_DEEP,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 6.4,
      halign: 'center',
      cellPadding: { top: 2.2, bottom: 2.2, left: 1.5, right: 1.5 },
    },
    columnStyles: {
      0: { cellWidth: 34, halign: 'left', fontStyle: 'bold' },
      1: { cellWidth: 22, textColor: TEXT_MUTED },
      2: { cellWidth: 27 },
      3: { cellWidth: 27, fontStyle: 'bold', textColor: SUCCESS_GREEN },
      4: { cellWidth: 27 },
      5: { cellWidth: 27 },
      6: { cellWidth: 28, fontStyle: 'bold', textColor: BRAND_MAROON },
    },
    didParseCell: (data) => {
      // Highlight the 30s Base Standard row
      if (data.section === 'body' && data.row.index === 3) {
        data.cell.styles.fillColor = [240, 253, 244]; // Light emerald tint
        data.cell.styles.fontStyle = 'bold';
        if (data.column.index === 0) {
          data.cell.styles.textColor = BRAND_DEEP;
        }
      }
    },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 4;

  // 6. Strategic Insights & Single-Bus Benchmark (3 Columns)
  const colW = (CONTENT_W - 6) / 3; // ~62mm each
  const boxH = 43;

  // Box 1: Single Bus Benchmark
  doc.setFillColor(...WHITE);
  doc.roundedRect(MARGIN, y, colW, boxH, 1.5, 1.5, 'F');
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, colW, boxH, 1.5, 1.5, 'S');

  doc.setFillColor(...BRAND_MAROON);
  doc.rect(MARGIN, y, colW, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...WHITE);
  doc.text('1-BUS BENCHMARK (TEST CAMPAIGNS)', MARGIN + colW / 2, y + 3.2, { align: 'center' });

  let by1 = y + 7.5;
  const singleBusRows = [
    { dur: '10s Micro Ad', m1: 'Rs. 750', m2: 'Rs. 1,400', yr: 'Rs. 7,900' },
    { dur: '15s Short Ad', m1: 'Rs. 1,150', m2: 'Rs. 2,150', yr: 'Rs. 11,800' },
    { dur: '20s Standard', m1: 'Rs. 1,500', m2: 'Rs. 2,800', yr: 'Rs. 15,750' },
    { dur: '30s Base Standard', m1: 'Rs. 2,250', m2: 'Rs. 4,250', yr: 'Rs. 23,500' },
    { dur: '45s Extended Ad', m1: 'Rs. 3,400', m2: 'Rs. 6,400', yr: 'Rs. 35,500' },
    { dur: '60s Feature Ad', m1: 'Rs. 4,500', m2: 'Rs. 8,500', yr: 'Rs. 47,250' },
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Duration', MARGIN + 3, by1);
  doc.text('1 Mo', MARGIN + 26, by1, { align: 'right' });
  doc.text('2 Mo', MARGIN + 42, by1, { align: 'right' });
  doc.text('1 Year', MARGIN + colW - 3, by1, { align: 'right' });
  by1 += 3;

  singleBusRows.forEach((r) => {
    doc.setFont('helvetica', r.dur.includes('30s') ? 'bold' : 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(r.dur.includes('30s') ? BRAND_MAROON[0] : TEXT_PRIMARY[0], r.dur.includes('30s') ? BRAND_MAROON[1] : TEXT_PRIMARY[1], r.dur.includes('30s') ? BRAND_MAROON[2] : TEXT_PRIMARY[2]);
    doc.text(r.dur, MARGIN + 3, by1);
    doc.text(r.m1, MARGIN + 26, by1, { align: 'right' });
    doc.text(r.m2, MARGIN + 42, by1, { align: 'right' });
    doc.text(r.yr, MARGIN + colW - 3, by1, { align: 'right' });
    by1 += 4.5;
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('• Daily Cost (30s): Only Rs. 75 / day for targeted tests', MARGIN + 3, y + boxH - 2);

  // Box 2: Multi-Month Duration Benefits
  const b2X = MARGIN + colW + 3;
  doc.setFillColor(...WHITE);
  doc.roundedRect(b2X, y, colW, boxH, 1.5, 1.5, 'F');
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(0.2);
  doc.roundedRect(b2X, y, colW, boxH, 1.5, 1.5, 'S');

  doc.setFillColor(...SUCCESS_GREEN);
  doc.rect(b2X, y, colW, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...WHITE);
  doc.text('MULTI-MONTH DURATION BENEFITS', b2X + colW / 2, y + 3.2, { align: 'center' });

  let by2 = y + 7.5;
  const multiMonthBenefits = [
    { title: 'Instant 30% Volume Leap (2 Months)', desc: 'Booking 2 months unlocks a flat 30% tariff discount across 10 buses (drops from Rs.50k to just Rs.35k).' },
    { title: 'Cumulative Brand Recall & Reach', desc: 'Over 60–90 days, commuter ad frequency reinforces top-of-mind brand conversion exponentially.' },
    { title: 'Inventory & Rate Lock', desc: 'Protects commercial rate card against holiday/seasonal surge pricing and guarantees locked screen loops.' },
    { title: 'Compounding Long-Term Savings', desc: '3M saves Rs.21,000, 6M saves Rs.45,000, and 12M saves a massive Rs.90,000 over standard booking!' },
  ];

  multiMonthBenefits.forEach((b) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(...BRAND_DEEP);
    doc.text(`• ${b.title}`, b2X + 3, by2);
    by2 += 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.2);
    doc.setTextColor(...TEXT_PRIMARY);
    const splitDesc = doc.splitTextToSize(b.desc, colW - 6);
    doc.text(splitDesc, b2X + 4.5, by2);
    by2 += splitDesc.length * 2.6 + 1.6;
  });

  // Box 3: Unit Economics & Campaign Highlights
  const b3X = MARGIN + (colW + 3) * 2;
  doc.setFillColor(...WHITE);
  doc.roundedRect(b3X, y, colW, boxH, 1.5, 1.5, 'F');
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(0.2);
  doc.roundedRect(b3X, y, colW, boxH, 1.5, 1.5, 'S');

  doc.setFillColor(...BRAND_DARK);
  doc.rect(b3X, y, colW, 4.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...WHITE);
  doc.text('UNIT ECONOMICS & HIGHLIGHTS', b3X + colW / 2, y + 3.2, { align: 'center' });

  let by3 = y + 7.5;
  const unitMetrics = [
    { label: 'Full Fleet Daily Cost', val: 'Rs. 58.30 / bus / day', note: '(10 Buses @ 2+ Months Package)' },
    { label: 'Unit Rate Per Second', val: 'Rs. 1.94 / sec / bus / mo', note: '(Lowest cost transit reach in Kerala)' },
    { label: 'Screen Visibility Loop', val: '100% Unskippable HD Video', note: 'Continuous audio+video playback loop' },
    { label: 'Micro-Branding Option', val: 'Rs. 6,700 / mo (10 Buses)', note: '10s high-frequency brand stingers' },
    { label: 'Live Campaign Tracking', val: '24/7 Monitoring Dashboard', note: 'Transparent logs of running campaigns' },
  ];

  unitMetrics.forEach((u) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(u.label, b3X + 3, by3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.4);
    doc.setTextColor(...BRAND_MAROON);
    doc.text(u.val, b3X + colW - 3, by3, { align: 'right' });
    by3 += 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5);
    doc.setTextColor(...TEXT_PRIMARY);
    doc.text(u.note, b3X + 3, by3);
    by3 += 4;
  });

  y += boxH + 3.5;

  // 7. Commercial Notes & Booking Guidelines
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(MARGIN, y, CONTENT_W, 11, 1.5, 1.5, 'F');
  doc.setDrawColor(...BORDER_GRAY);
  doc.setLineWidth(0.15);
  doc.roundedRect(MARGIN, y, CONTENT_W, 11, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...BRAND_MAROON);
  doc.text('COMMERCIAL TERMS & TECHNICAL SPECIFICATIONS:', MARGIN + 3, y + 3.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(...TEXT_PRIMARY);
  const termsText = [
    '• All commercial rates are in Indian Rupees (INR) and exclusive of statutory GST (18%). Approved package tariffs are applicable for advance bookings.',
    '• Technical Creative Specs: MP4 / Full HD 1080p (16:9 Landscape format). Stereo audio enabled playback. Creative review completed within 24 hours of submission.',
    '• Screen inventory is dynamically allocated across operational private bus routes in Kollam district; reservations confirmed upon receipt of work order and advance.',
  ];
  doc.text(termsText.join('\n'), MARGIN + 3, y + 6.2, { lineHeightFactor: 1.25 });

  // 8. Footer Bar
  doc.setFillColor(...BRAND_MAROON);
  doc.rect(0, PAGE_H - 12, PAGE_W, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...WHITE);
  doc.text('CATGORITHM DIGITAL GROWTH', MARGIN, PAGE_H - 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(255, 230, 235);
  doc.text('Parayathumukku, Umayanalloor, Kollam 691020, Kerala', MARGIN, PAGE_H - 3.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text('Phone / WhatsApp: +91 97463 36175   •   Email: teamcatgorithm@gmail.com   •   Web: www.catgorithm.in', PAGE_W - MARGIN, PAGE_H - 5, { align: 'right' });

  return doc;
}

export async function downloadTariffCardPDF(): Promise<void> {
  const doc = await generateTariffCardPDF();
  doc.save('Catgorithm_Tariff_Card_2026.pdf');
}
