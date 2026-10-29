// PDF Quotation Generator using jsPDF
// Formats all currency in clean ASCII (Rs.) to avoid jsPDF Helvetica font-encoding bugs.
// Supports 2-Page Festive Luxury Theme for "Winter Spotlight 2026-27"
// and 1-Page Clean Brand Layout for Standard Campaigns.
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Quotation } from '../types'
import { CATGORITHM_LOGO_BASE64 } from './logoBase64'
import { COMPANY_DETAILS } from './dataStore'
import { format } from 'date-fns'

function formatPDFINR(amount: number, decimals: number = 0): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `Rs. ${formatted}`
}

function formatDateSafe(dateStr?: string, fallback: string = '2026-11-20'): string {
  if (!dateStr) return fallback
  try {
    return format(new Date(dateStr), 'dd MMMM yyyy')
  } catch {
    return dateStr
  }
}

// Draw a decorative 4-point diamond starburst
function drawSparkle(
  doc: jsPDF,
  cx: number,
  cy: number,
  size: number,
  color: [number, number, number] = [212, 175, 55]
) {
  doc.setFillColor(...color)
  doc.setDrawColor(...color)
  // Vertical diamond
  doc.triangle(cx, cy - size, cx - size * 0.35, cy, cx + size * 0.35, cy, 'F')
  doc.triangle(cx, cy + size, cx - size * 0.35, cy, cx + size * 0.35, cy, 'F')
  // Horizontal diamond
  doc.triangle(cx - size, cy, cx, cy - size * 0.35, cx, cy + size * 0.35, 'F')
  doc.triangle(cx + size, cy, cx, cy - size * 0.35, cx, cy + size * 0.35, 'F')
}

// ─────────────────────────────────────────────────────────────
// 1. WINTER SPOTLIGHT 2026–27 (PREMIUM 2-PAGE SEASONAL PDF)
// ─────────────────────────────────────────────────────────────
function renderWinterSpotlightPDF(doc: jsPDF, quotation: Quotation) {
  const { customerDetails: c, pricingSnapshot: p, validUntil, id, createdAt } = quotation

  const PAGE_W = 210
  const PAGE_H = 297
  const MARGIN = 14
  const CONTENT_W = PAGE_W - MARGIN * 2 // 182mm

  // Palette: Winter Spotlight Midnight Navy & Champagne Gold
  const NAVY_BG: [number, number, number] = [7, 11, 20]       // #070B14
  const NAVY_CARD: [number, number, number] = [13, 21, 39]     // #0D1527
  const GOLD_PRIMARY: [number, number, number] = [212, 175, 55] // #D4AF37
  const GOLD_LIGHT: [number, number, number] = [243, 198, 105]  // #F3C669
  const GOLD_BORDER: [number, number, number] = [180, 142, 40]
  const WHITE: [number, number, number] = [255, 255, 255]
  const OFF_WHITE: [number, number, number] = [240, 243, 248]
  const TEXT_MUTED_GOLD: [number, number, number] = [200, 185, 140]
  const TEXT_GRAY: [number, number, number] = [100, 116, 139]
  const DARK_CHARCOAL: [number, number, number] = [17, 24, 39]
  const SUCCESS_GREEN: [number, number, number] = [22, 163, 74]
  const BORDER_LIGHT: [number, number, number] = [226, 232, 240]

  const startDateFormatted = formatDateSafe(quotation.campaignStartDate, '20 November 2026')
  const endDateFormatted = formatDateSafe(quotation.campaignEndDate, '20 January 2027')
  const dateRangeStr = `${startDateFormatted} – ${endDateFormatted}`

  // ═══════════════════════════════════════════════════════════
  // PAGE 1: FESTIVE CINEMATIC COVER PAGE
  // ═══════════════════════════════════════════════════════════
  // 1. Full-bleed midnight background
  doc.setFillColor(...NAVY_BG)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')

  // Top & bottom thick gold luxury bars
  doc.setFillColor(...GOLD_PRIMARY)
  doc.rect(0, 0, PAGE_W, 3.5, 'F')
  doc.rect(0, PAGE_H - 3.5, PAGE_W, 3.5, 'F')

  // Elegant inner gold frame
  doc.setDrawColor(...GOLD_BORDER)
  doc.setLineWidth(0.4)
  doc.rect(8, 8, PAGE_W - 16, PAGE_H - 16, 'S')
  doc.setLineWidth(0.15)
  doc.rect(9.5, 9.5, PAGE_W - 19, PAGE_H - 19, 'S')

  // Starburst accents scattered across cover
  drawSparkle(doc, 22, 24, 4.5, GOLD_LIGHT)
  drawSparkle(doc, PAGE_W - 22, 26, 3.8, GOLD_PRIMARY)
  drawSparkle(doc, 26, 88, 3.2, GOLD_LIGHT)
  drawSparkle(doc, PAGE_W - 24, 94, 4.2, GOLD_LIGHT)
  drawSparkle(doc, 20, 175, 3.5, GOLD_PRIMARY)
  drawSparkle(doc, PAGE_W - 20, 182, 3.8, GOLD_LIGHT)
  drawSparkle(doc, 28, 252, 4.0, GOLD_LIGHT)
  drawSparkle(doc, PAGE_W - 26, 256, 3.5, GOLD_PRIMARY)

  // Header Brand Typography
  let coverY = 28
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...WHITE)
  doc.text('CATGORITHM', PAGE_W / 2, coverY, { align: 'center' })

  coverY += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_MUTED_GOLD)
  doc.text('DIGITAL GROWTH & BUS-SCREEN ADVERTISING  •  KOLLAM, KERALA', PAGE_W / 2, coverY, { align: 'center' })

  // Decorative divider
  coverY += 9
  doc.setDrawColor(...GOLD_PRIMARY)
  doc.setLineWidth(0.5)
  doc.line(PAGE_W / 2 - 30, coverY, PAGE_W / 2 + 30, coverY)
  drawSparkle(doc, PAGE_W / 2, coverY, 2.5, GOLD_LIGHT)

  // Seasonal Announcement Pill
  coverY += 16
  const pillW = 86
  const pillH = 8
  doc.setFillColor(...NAVY_CARD)
  doc.roundedRect(PAGE_W / 2 - pillW / 2, coverY, pillW, pillH, 4, 4, 'F')
  doc.setDrawColor(...GOLD_PRIMARY)
  doc.setLineWidth(0.35)
  doc.roundedRect(PAGE_W / 2 - pillW / 2, coverY, pillW, pillH, 4, 4, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.2)
  doc.setTextColor(...GOLD_LIGHT)
  doc.text('EXCLUSIVE SEASONAL CAMPAIGN PRESENTATION', PAGE_W / 2, coverY + 5.2, { align: 'center' })

  // Hero Campaign Title
  coverY += 26
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...GOLD_LIGHT)
  doc.text('WINTER SPOTLIGHT', PAGE_W / 2, coverY, { align: 'center' })

  coverY += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...WHITE)
  doc.text('2026 – 27', PAGE_W / 2, coverY, { align: 'center' })

  // Campaign Tagline
  coverY += 9
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(11)
  doc.setTextColor(...GOLD_PRIMARY)
  doc.text('"Your Brand. The Season. The Spotlight."', PAGE_W / 2, coverY, { align: 'center' })

  // Target Occasions Pill
  coverY += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...WHITE)
  doc.text('Black Friday  •  Christmas  •  New Year  •  End-of-Season Sales', PAGE_W / 2, coverY, { align: 'center' })

  // Center Feature Box: Dates & Prime Audience Reach
  coverY += 12
  const featBoxW = 154
  const featBoxH = 36
  const featBoxX = (PAGE_W - featBoxW) / 2
  doc.setFillColor(...NAVY_CARD)
  doc.roundedRect(featBoxX, coverY, featBoxW, featBoxH, 3, 3, 'F')
  doc.setDrawColor(...GOLD_PRIMARY)
  doc.setLineWidth(0.4)
  doc.roundedRect(featBoxX, coverY, featBoxW, featBoxH, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_MUTED_GOLD)
  doc.text('OFFICIAL CAMPAIGN BROADCAST WINDOW', PAGE_W / 2, coverY + 7.5, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12.5)
  doc.setTextColor(...GOLD_LIGHT)
  doc.text(dateRangeStr, PAGE_W / 2, coverY + 16, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...WHITE)
  doc.text(
    `${p.months} Full Billed Months  •  61 Days of Peak Festive Passenger Footfall`,
    PAGE_W / 2,
    coverY + 23,
    { align: 'center' }
  )

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.2)
  doc.setTextColor(...TEXT_MUTED_GOLD)
  doc.text(
    'Captive daily commuter attention on premium Full HD screens across Kollam Private Fleet',
    PAGE_W / 2,
    coverY + 29.5,
    { align: 'center' }
  )

  // Proposal Prepared For Card
  coverY += featBoxH + 12
  const propCardW = 154
  const propCardH = 46
  const propCardX = (PAGE_W - propCardW) / 2
  doc.setFillColor(...NAVY_CARD)
  doc.roundedRect(propCardX, coverY, propCardW, propCardH, 3, 3, 'F')
  doc.setDrawColor(...GOLD_BORDER)
  doc.setLineWidth(0.3)
  doc.roundedRect(propCardX, coverY, propCardW, propCardH, 3, 3, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...GOLD_PRIMARY)
  doc.text('CONFIDENTIAL COMMERCIAL PROPOSAL PREPARED FOR', propCardX + 8, coverY + 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...WHITE)
  const clientName = c.businessName || 'Valued Brand Partner'
  doc.text(clientName.length > 34 ? clientName.substring(0, 34) + '…' : clientName, propCardX + 8, coverY + 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...OFF_WHITE)
  doc.text(`Attention: ${c.contactName || 'Marketing / Business Head'}`, propCardX + 8, coverY + 23)
  doc.text(`Contact: ${c.phone || 'Not Specified'}`, propCardX + 8, coverY + 29)
  doc.text(`Location: Kollam Screen Network, Kerala`, propCardX + 8, coverY + 35)

  // Right column inside proposal box
  const propRightX = propCardX + propCardW - 60
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_MUTED_GOLD)
  doc.text(`Quotation Ref:`, propRightX, coverY + 23)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text(`${id}`, propRightX + 22, coverY + 23)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_MUTED_GOLD)
  doc.text(`Date Issued:`, propRightX, coverY + 29)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text(format(new Date(createdAt), 'dd MMM yyyy'), propRightX + 22, coverY + 29)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT_MUTED_GOLD)
  doc.text(`Offer Valid Till:`, propRightX, coverY + 35)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GOLD_LIGHT)
  doc.text(format(new Date(validUntil), 'dd MMM yyyy'), propRightX + 22, coverY + 35)

  // Cover Page Bottom Navigation indicator
  coverY += propCardH + 14
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...GOLD_LIGHT)
  doc.text('Turn to Page 2 for Detailed Commercial Tariff & Unit Economics  →', PAGE_W / 2, coverY, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(...TEXT_MUTED_GOLD)
  doc.text('Page 1 of 2  •  Catgorithm Bus Advertising  •  Winter Spotlight 2026–27', PAGE_W / 2, PAGE_H - 12, { align: 'center' })


  // ═══════════════════════════════════════════════════════════
  // PAGE 2: COMMERCIALS, SPECIAL PRICING HERO & BREAKDOWN
  // ═══════════════════════════════════════════════════════════
  doc.addPage()

  // 1. Top Decorative Brand Bar (Midnight Navy with Gold edge)
  doc.setFillColor(...NAVY_BG)
  doc.rect(0, 0, PAGE_W, 4, 'F')
  doc.setFillColor(...GOLD_PRIMARY)
  doc.rect(0, 4, PAGE_W, 0.8, 'F')

  let y = 11

  // Header Left: Catgorithm & Winter Spotlight Campaign Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...NAVY_BG)
  doc.text('WINTER SPOTLIGHT 2026–27', MARGIN, y + 4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_GRAY)
  doc.text('CATGORITHM BUS-SCREEN ADVERTISING  •  OFFICIAL QUOTATION', MARGIN, y + 9)

  // Header Right: Document Metadata
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...NAVY_BG)
  doc.text(`Ref: ${id}`, PAGE_W - MARGIN, y + 2, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_GRAY)
  doc.text(`Issued: ${format(new Date(createdAt), 'dd MMMM yyyy')}`, PAGE_W - MARGIN, y + 6.5, { align: 'right' })
  doc.text(`Valid Until: ${format(new Date(validUntil), 'dd MMMM yyyy')}`, PAGE_W - MARGIN, y + 10.5, { align: 'right' })

  y += 15

  // ── 2. HERO SPECIAL PRICING BLOCK (Midnight Navy + Champagne Gold) ──
  const heroH = 34
  doc.setFillColor(...NAVY_BG)
  doc.roundedRect(MARGIN, y, CONTENT_W, heroH, 3, 3, 'F')
  doc.setDrawColor(...GOLD_PRIMARY)
  doc.setLineWidth(0.6)
  doc.roundedRect(MARGIN, y, CONTENT_W, heroH, 3, 3, 'S')

  // Sparkles in hero card corners
  drawSparkle(doc, MARGIN + 7, y + 7, 2.8, GOLD_LIGHT)
  drawSparkle(doc, PAGE_W - MARGIN - 7, y + 7, 2.8, GOLD_LIGHT)

  // Hero Title & Configuration
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...GOLD_LIGHT)
  doc.text('★ WINTER SPOTLIGHT 2026–27 SPECIAL PACKAGE TARIFF', MARGIN + 12, y + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(...WHITE)
  doc.text(
    `${p.buses} Buses  •  ${p.videoDurationSeconds}-Second Advertisement  •  ${p.months} Months Billed (${dateRangeStr})`,
    MARGIN + 12,
    y + 14
  )

  // Strikethrough Standard Price
  const stdPriceStr = `Standard Tariff: ${formatPDFINR(p.standardPrice)}`
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(175, 185, 205)
  doc.text(stdPriceStr, MARGIN + 12, y + 24)
  const stdTextWidth = doc.getTextWidth(stdPriceStr)
  doc.setDrawColor(239, 68, 68) // Red strikethrough line
  doc.setLineWidth(0.5)
  doc.line(MARGIN + 12, y + 23, MARGIN + 12 + stdTextWidth, y + 23)

  // Prominent Final Package Price
  const pkgPriceStr = formatPDFINR(p.packagePrice)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...GOLD_LIGHT)
  doc.text(pkgPriceStr, MARGIN + 12 + stdTextWidth + 8, y + 25)

  // Savings Pill on Right
  if (p.savings > 0) {
    const savingsPillW = 68
    const savingsPillH = 14
    const savingsPillX = PAGE_W - MARGIN - savingsPillW - 8
    const savingsPillY = y + 15

    doc.setFillColor(22, 101, 52) // Dark green
    doc.roundedRect(savingsPillX, savingsPillY, savingsPillW, savingsPillH, 2, 2, 'F')
    doc.setDrawColor(74, 222, 128)
    doc.setLineWidth(0.4)
    doc.roundedRect(savingsPillX, savingsPillY, savingsPillW, savingsPillH, 2, 2, 'S')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(240, 253, 244)
    doc.text(`YOU SAVE ${formatPDFINR(p.savings)}`, savingsPillX + savingsPillW / 2, savingsPillY + 5.5, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    doc.setTextColor(...GOLD_LIGHT)
    doc.text(`(${p.savingsPercentage.toFixed(1)}% Direct Benefit)`, savingsPillX + savingsPillW / 2, savingsPillY + 10.5, { align: 'center' })
  }

  y += heroH + 6

  // ── 3. Two-Column Information Cards ────────────────────────
  const cardW = (CONTENT_W - 5) / 2 // ~88.5mm
  const cardH = 29

  // Left Card: CLIENT DETAILS (BILL TO)
  doc.setFillColor(...WHITE)
  doc.roundedRect(MARGIN, y, cardW, cardH, 2, 2, 'F')
  doc.setDrawColor(...BORDER_LIGHT)
  doc.setLineWidth(0.2)
  doc.roundedRect(MARGIN, y, cardW, cardH, 2, 2, 'S')

  doc.setFillColor(...NAVY_BG)
  doc.rect(MARGIN, y, 2.5, cardH, 'F') // Navy accent stripe

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...GOLD_PRIMARY)
  doc.text('CLIENT DETAILS (PREPARED FOR)', MARGIN + 6, y + 5.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...DARK_CHARCOAL)
  const clientTitle = c.businessName || 'Valued Client'
  doc.text(clientTitle.length > 32 ? clientTitle.substring(0, 32) + '…' : clientTitle, MARGIN + 6, y + 11.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_GRAY)
  doc.text(`Contact: ${c.contactName || 'Representative'}`, MARGIN + 6, y + 17)
  doc.text(`Phone: ${c.phone || 'Not Specified'}`, MARGIN + 6, y + 21.5)
  doc.text(`Location: Kollam District, Kerala`, MARGIN + 6, y + 26)

  // Right Card: CAMPAIGN SPECIFICATIONS
  const rightX = MARGIN + cardW + 5
  doc.setFillColor(...WHITE)
  doc.roundedRect(rightX, y, cardW, cardH, 2, 2, 'F')
  doc.setDrawColor(...BORDER_LIGHT)
  doc.setLineWidth(0.2)
  doc.roundedRect(rightX, y, cardW, cardH, 2, 2, 'S')

  doc.setFillColor(...GOLD_PRIMARY)
  doc.rect(rightX, y, 2.5, cardH, 'F') // Gold accent stripe

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...NAVY_BG)
  doc.text('CAMPAIGN SPECIFICATIONS', rightX + 6, y + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...DARK_CHARCOAL)
  doc.text('Fleet Size:', rightX + 6, y + 11.5)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.buses} ${p.buses === 1 ? 'Bus' : 'Buses'} (Screen Network)`, rightX + 38, y + 11.5)

  doc.setFont('helvetica', 'normal')
  doc.text('Video Ad Duration:', rightX + 6, y + 16.5)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.videoDurationSeconds} Seconds (${(p.videoDurationSeconds / 30).toFixed(2)}x base)`, rightX + 38, y + 16.5)

  doc.setFont('helvetica', 'normal')
  doc.text('Billed Duration:', rightX + 6, y + 21.5)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.months} ${p.months === 1 ? 'Month' : 'Months'} (Full Period)`, rightX + 38, y + 21.5)

  doc.setFont('helvetica', 'normal')
  doc.text('Campaign Window:', rightX + 6, y + 26.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GOLD_PRIMARY)
  doc.text(dateRangeStr, rightX + 38, y + 26.5)

  y += cardH + 6

  // ── 4. Commercials & Financial Breakdown Table ─────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...NAVY_BG)
  doc.text('COMMERCIAL TARIFF & WINTER SPOTLIGHT PACKAGE BREAKDOWN', MARGIN, y)
  y += 2.5

  const commercialsData: [string, string, string][] = [
    [
      'Standard Advertising Tariff (Reference Price)',
      `Rs. 75/sec x ${p.videoDurationSeconds}s x ${p.buses} buses x ${p.months} mo`,
      formatPDFINR(p.standardPrice),
    ],
    [
      'Winter Spotlight Package Benefit',
      `${p.buses} Buses x ${p.months} Months Seasonal Tariff Adjustment`,
      p.savings > 0 ? `- ${formatPDFINR(p.savings)}` : 'Rs. 0',
    ],
    [
      'NET CAMPAIGN PACKAGE TOTAL',
      `Complete ${p.months}-Month Winter Campaign Across All ${p.buses} Buses`,
      formatPDFINR(p.packagePrice),
    ],
    [
      'TOTAL CLIENT DIRECT BENEFIT',
      `${p.savingsPercentage.toFixed(1)}% savings achieved`,
      `${formatPDFINR(p.savings)} (${p.savingsPercentage.toFixed(0)}% OFF)`,
    ],
  ]

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Commercial Item', 'Calculation Basis / Details', 'Amount (INR)']],
    body: commercialsData,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 3.0, bottom: 3.0, left: 4, right: 4 },
      textColor: DARK_CHARCOAL,
      lineColor: BORDER_LIGHT,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: NAVY_BG,
      textColor: GOLD_LIGHT,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 3.2, bottom: 3.2, left: 4, right: 4 },
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 62, textColor: TEXT_GRAY },
      2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index === 2) {
        data.cell.styles.halign = 'right'
      }
      // Net Total row styling (Champagne Gold / Dark Navy accent)
      if (data.section === 'body' && data.row.index === 2) {
        data.cell.styles.fillColor = [254, 252, 240] // Subtle warm gold tint
        data.cell.styles.textColor = NAVY_BG
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 8.8
        data.cell.styles.lineWidth = 0.35
        data.cell.styles.lineColor = GOLD_PRIMARY
      }
      // Direct Savings row styling (Emerald tint)
      if (data.section === 'body' && data.row.index === 3) {
        data.cell.styles.fillColor = [240, 253, 244]
        data.cell.styles.textColor = SUCCESS_GREEN
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 5.5

  // ── 5. Effective Unit Economics Table ───────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...NAVY_BG)
  doc.text('EFFECTIVE UNIT ECONOMICS', MARGIN, y)
  y += 2.5

  const unitEconomicsData: [string, string, string][] = [
    [
      'Effective Rate per Bus (Entire Campaign)',
      `${formatPDFINR(p.packagePrice)} / ${p.buses} Buses`,
      formatPDFINR(p.pricePerBusCampaign, 2),
    ],
    [
      'Effective Rate per Bus (Per Month)',
      `${formatPDFINR(p.packagePrice)} / (${p.buses} Buses x ${p.months} Months)`,
      formatPDFINR(p.pricePerBusMonth, 2),
    ],
    [
      'Effective Rate per Bus (Per Day - 30 Days Basis)',
      `${formatPDFINR(p.packagePrice)} / (${p.buses} x ${p.months} x 30 Days)`,
      `${formatPDFINR(p.pricePerBusDay, 2)} / day`,
    ],
    [
      'Effective Cost per Second per Bus (Per Month)',
      `Monthly Rate / ${p.videoDurationSeconds} Seconds`,
      `${formatPDFINR(p.pricePerSecondBusMonth ?? (p.packagePrice / (p.buses * p.months * p.videoDurationSeconds)), 2)} / sec`,
    ],
  ]

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Unit Metric', 'Denominator Basis', 'Effective Cost']],
    body: unitEconomicsData,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 7.8,
      cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
      textColor: DARK_CHARCOAL,
      lineColor: BORDER_LIGHT,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: GOLD_PRIMARY,
      textColor: NAVY_BG,
      fontStyle: 'bold',
      fontSize: 7.8,
      cellPadding: { top: 2.8, bottom: 2.8, left: 4, right: 4 },
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'normal' },
      1: { cellWidth: 62, textColor: TEXT_GRAY },
      2: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: DARK_CHARCOAL },
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index === 2) {
        data.cell.styles.halign = 'right'
      }
    },
  })

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 5

  // ── 6. Client Notes (if present) ───────────────────────────
  if (c.notes && c.notes.trim()) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...TEXT_GRAY)
    doc.text('CLIENT SPECIFICATIONS & NOTES:', MARGIN, y)
    y += 3.2

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)
    doc.setTextColor(...DARK_CHARCOAL)
    const splitNotes = doc.splitTextToSize(c.notes.trim(), CONTENT_W)
    doc.text(splitNotes, MARGIN, y)
    y += splitNotes.length * 3.5 + 2.5
  }

  // ── 7. Terms & Conditions Box (Without GST) ─────────────────
  const termsBoxY = Math.max(y, 224)
  const termsBoxH = 22

  doc.setFillColor(248, 249, 251)
  doc.roundedRect(MARGIN, termsBoxY, CONTENT_W, termsBoxH, 2, 2, 'F')
  doc.setDrawColor(...BORDER_LIGHT)
  doc.setLineWidth(0.2)
  doc.roundedRect(MARGIN, termsBoxY, CONTENT_W, termsBoxH, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...GOLD_PRIMARY)
  doc.text('WINTER SPOTLIGHT TERMS & CONDITIONS', MARGIN + 4, termsBoxY + 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(...DARK_CHARCOAL)
  const terms = [
    `1. Validity: This quotation is valid until ${format(new Date(validUntil), 'dd MMMM yyyy')}. Rates guaranteed for approved slot.`,
    '2. Slot Booking: Screen inventory confirmed upon advance payment and receipt of approved video creative.',
    '3. Commercials: 100% advance payment required prior to campaign broadcast unless otherwise agreed in writing.',
    '4. Creative Specs: MP4 format, 1080p Full HD resolution, 30fps. Verified playback across active private bus routes in Kollam.',
  ]
  doc.text(terms.join('\n'), MARGIN + 4, termsBoxY + 9, { lineHeightFactor: 1.35 })

  // ── 8. Signature Block ──────────────────────────────────────
  const sigY = termsBoxY + termsBoxH + 4.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY_BG)
  doc.text('For Catgorithm Digital Growth', MARGIN + 4, sigY + 4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_GRAY)
  doc.text('Authorized Signatory / Sales Head', MARGIN + 4, sigY + 8.5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...NAVY_BG)
  doc.text('Client Acceptance / Signature', PAGE_W - MARGIN - 48, sigY + 4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_GRAY)
  doc.text('Date: ____________________', PAGE_W - MARGIN - 48, sigY + 8.5)

  // ── 9. Bottom Footer ────────────────────────────────────────
  doc.setFillColor(...NAVY_BG)
  doc.rect(0, PAGE_H - 10.5, PAGE_W, 10.5, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(...TEXT_MUTED_GOLD)
  doc.text(
    `Catgorithm  •  ${COMPANY_DETAILS.address}  •  Phone: ${COMPANY_DETAILS.phone}  •  Email: ${COMPANY_DETAILS.email}  •  Page 2 of 2`,
    PAGE_W / 2,
    PAGE_H - 4.2,
    { align: 'center' }
  )
}

// ─────────────────────────────────────────────────────────────
// 2. STANDARD CAMPAIGN (CLEAN 1-PAGE MAROON BRAND PDF)
// ─────────────────────────────────────────────────────────────
function renderStandardQuotationPDF(doc: jsPDF, quotation: Quotation) {
  const { customerDetails: c, pricingSnapshot: p, validUntil, id, createdAt } = quotation

  const PAGE_W = 210
  const PAGE_H = 297
  const MARGIN = 15
  const CONTENT_W = PAGE_W - MARGIN * 2 // 180mm

  // Palette (Official Catgorithm Maroon & Neutral Charcoal)
  const BRAND_MAROON = [160, 53, 78] as [number, number, number] // #A0354E
  const BRAND_DARK = [17, 24, 39] as [number, number, number]    // #111827
  const LIGHT_GRAY = [248, 249, 251] as [number, number, number]
  const BORDER_GRAY = [226, 232, 240] as [number, number, number]
  const TEXT_PRIMARY = [17, 24, 39] as [number, number, number]
  const TEXT_MUTED = [100, 116, 139] as [number, number, number]
  const SUCCESS_GREEN = [22, 163, 74] as [number, number, number]
  const WHITE = [255, 255, 255] as [number, number, number]

  // Top Decorative Brand Bar
  doc.setFillColor(...BRAND_MAROON)
  doc.rect(0, 0, PAGE_W, 4, 'F')

  // Header: Logo (Left) + Document Metadata (Right)
  let y = 12

  try {
    doc.addImage(CATGORITHM_LOGO_BASE64, 'PNG', MARGIN, y, 52, 17.5)
  } catch {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(...BRAND_MAROON)
    doc.text('CATGORITHM', MARGIN, y + 10)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...BRAND_MAROON)
  doc.text('CAMPAIGN QUOTATION', PAGE_W - MARGIN, y + 4, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...BRAND_DARK)
  doc.text(`Ref: ${id}`, PAGE_W - MARGIN, y + 9.5, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(`Date: ${format(new Date(createdAt), 'dd MMMM yyyy')}`, PAGE_W - MARGIN, y + 14.5, { align: 'right' })
  doc.text(`Valid Until: ${format(new Date(validUntil), 'dd MMMM yyyy')}`, PAGE_W - MARGIN, y + 19.5, { align: 'right' })

  y += 24

  // Two-Column Information Cards
  const cardW = (CONTENT_W - 6) / 2
  const cardH = 32

  // Left Card: CLIENT DETAILS (BILL TO)
  doc.setFillColor(...WHITE)
  doc.roundedRect(MARGIN, y, cardW, cardH, 2, 2, 'F')
  doc.setDrawColor(...BORDER_GRAY)
  doc.roundedRect(MARGIN, y, cardW, cardH, 2, 2, 'S')

  doc.setFillColor(...BRAND_MAROON)
  doc.rect(MARGIN, y, 2.5, cardH, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...BRAND_MAROON)
  doc.text('PREPARED FOR / BILL TO', MARGIN + 6, y + 6)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...TEXT_PRIMARY)
  const clientTitle = c.businessName || 'Valued Client'
  doc.text(clientTitle.length > 32 ? clientTitle.substring(0, 32) + '…' : clientTitle, MARGIN + 6, y + 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(`Contact: ${c.contactName || 'Representative'}`, MARGIN + 6, y + 18)
  doc.text(`Phone: ${c.phone || 'Not Specified'}`, MARGIN + 6, y + 23)
  if (c.email) {
    doc.text(`Email: ${c.email}`, MARGIN + 6, y + 28)
  } else {
    doc.text(`Location: Kollam District, Kerala`, MARGIN + 6, y + 28)
  }

  // Right Card: CAMPAIGN SPECIFICATIONS
  const rightX = MARGIN + cardW + 6
  doc.setFillColor(...WHITE)
  doc.roundedRect(rightX, y, cardW, cardH, 2, 2, 'F')
  doc.setDrawColor(...BORDER_GRAY)
  doc.roundedRect(rightX, y, cardW, cardH, 2, 2, 'S')

  doc.setFillColor(...BRAND_DARK)
  doc.rect(rightX, y, 2.5, cardH, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...BRAND_DARK)
  doc.text('CAMPAIGN SPECIFICATIONS', rightX + 6, y + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(...TEXT_PRIMARY)
  doc.text(`Fleet Size:`, rightX + 6, y + 12.5)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.buses} ${p.buses === 1 ? 'Bus' : 'Buses'} (Screen Network)`, rightX + 38, y + 12.5)

  doc.setFont('helvetica', 'normal')
  doc.text(`Video Ad Duration:`, rightX + 6, y + 18)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.videoDurationSeconds} Seconds (${(p.videoDurationSeconds / 30).toFixed(2)}x base)`, rightX + 38, y + 18)

  doc.setFont('helvetica', 'normal')
  doc.text(`Campaign Period:`, rightX + 6, y + 23.5)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.months} ${p.months === 1 ? 'Month' : 'Months'}`, rightX + 38, y + 23.5)

  doc.setFont('helvetica', 'normal')
  doc.text(`Advertising Media:`, rightX + 6, y + 28.5)
  doc.setFont('helvetica', 'bold')
  doc.text(`Digital Screen Inside Buses`, rightX + 38, y + 28.5)

  y += cardH + 7

  // Commercials Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...BRAND_DARK)
  doc.text('COMMERCIAL TARIFF & PACKAGE PRICING', MARGIN, y)
  y += 3

  let discountLabel = 'Package Tariff Benefit'
  if (p.pricingMethod === '1month') {
    discountLabel = `One-Month Volume Package Benefit (${p.buses} Buses)`
  } else if (p.pricingMethod === '2month') {
    discountLabel = `Two-Month Package Benefit (${p.buses} Buses)`
  } else {
    discountLabel = `Long-Term Duration Discount (${Math.round(p.durationDiscountRate * 100)}% on 1-Mo Base)`
  }

  const commercialsData: [string, string, string][] = [
    [
      'Standard Advertising Tariff (Reference Price)',
      `Rs. 75/sec x ${p.videoDurationSeconds}s x ${p.buses} buses x ${p.months} mo`,
      formatPDFINR(p.standardPrice),
    ],
    [
      discountLabel,
      p.savings > 0 ? 'Package rate adjustment' : 'Standard base applied',
      p.savings > 0 ? `- ${formatPDFINR(p.savings)}` : 'Rs. 0',
    ],
    [
      'NET CAMPAIGN PACKAGE TOTAL',
      `Complete ${p.months}-Month Campaign Across All ${p.buses} Buses`,
      formatPDFINR(p.packagePrice),
    ],
    [
      'DIRECT CLIENT SAVINGS',
      `${p.savingsPercentage.toFixed(1)}% savings achieved`,
      `${formatPDFINR(p.savings)} (${p.savingsPercentage.toFixed(0)}% OFF)`,
    ],
  ]

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Item Description', 'Calculation Basis / Details', 'Amount (INR)']],
    body: commercialsData,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: { top: 3.2, bottom: 3.2, left: 4, right: 4 },
      textColor: TEXT_PRIMARY,
      lineColor: BORDER_GRAY,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BRAND_DARK,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold' },
      1: { cellWidth: 60, textColor: TEXT_MUTED },
      2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index === 2) {
        data.cell.styles.halign = 'right'
      }
      if (data.section === 'body' && data.row.index === 2) {
        data.cell.styles.fillColor = [253, 242, 244]
        data.cell.styles.textColor = BRAND_MAROON
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 9
        data.cell.styles.lineWidth = 0.35
        data.cell.styles.lineColor = BRAND_MAROON
      }
      if (data.section === 'body' && data.row.index === 3) {
        data.cell.styles.fillColor = [240, 253, 244]
        data.cell.styles.textColor = SUCCESS_GREEN
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 6.5

  // Effective Unit Economics Table
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...BRAND_DARK)
  doc.text('EFFECTIVE UNIT ECONOMICS', MARGIN, y)
  y += 3

  const unitEconomicsData: [string, string, string][] = [
    [
      'Effective Rate per Bus (Entire Campaign)',
      `${formatPDFINR(p.packagePrice)} / ${p.buses} Buses`,
      formatPDFINR(p.pricePerBusCampaign, 2),
    ],
    [
      'Effective Rate per Bus (Per Month)',
      `${formatPDFINR(p.packagePrice)} / (${p.buses} Buses x ${p.months} Months)`,
      formatPDFINR(p.pricePerBusMonth, 2),
    ],
    [
      'Effective Rate per Bus (Per Day - 30 Days Basis)',
      `${formatPDFINR(p.packagePrice)} / (${p.buses} x ${p.months} x 30 Days)`,
      `${formatPDFINR(p.pricePerBusDay, 2)} / day`,
    ],
    [
      'Effective Cost per Second per Bus (Per Month)',
      `Monthly Rate / ${p.videoDurationSeconds} Seconds`,
      `${formatPDFINR(p.pricePerSecondBusMonth ?? (p.packagePrice / (p.buses * p.months * p.videoDurationSeconds)), 2)} / sec`,
    ],
  ]

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Unit Metric', 'Denominator Breakdown', 'Effective Cost']],
    body: unitEconomicsData,
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 7.8,
      cellPadding: { top: 2.8, bottom: 2.8, left: 4, right: 4 },
      textColor: TEXT_PRIMARY,
      lineColor: BORDER_GRAY,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: BRAND_MAROON,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 7.8,
      cellPadding: { top: 3.2, bottom: 3.2, left: 4, right: 4 },
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'normal' },
      1: { cellWidth: 60, textColor: TEXT_MUTED },
      2: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: BRAND_DARK },
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index === 2) {
        data.cell.styles.halign = 'right'
      }
    },
  })

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 5

  if (c.notes && c.notes.trim()) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...TEXT_MUTED)
    doc.text('CLIENT REQUIREMENTS & NOTES:', MARGIN, y)
    y += 3.5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...TEXT_PRIMARY)
    const splitNotes = doc.splitTextToSize(c.notes.trim(), CONTENT_W)
    doc.text(splitNotes, MARGIN, y)
    y += splitNotes.length * 3.8 + 3
  }

  // Terms & Conditions (Without GST)
  const termsBoxY = Math.max(y, 222)
  const termsBoxH = 22

  doc.setFillColor(...LIGHT_GRAY)
  doc.roundedRect(MARGIN, termsBoxY, CONTENT_W, termsBoxH, 2, 2, 'F')
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.2)
  doc.roundedRect(MARGIN, termsBoxY, CONTENT_W, termsBoxH, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...BRAND_MAROON)
  doc.text('TERMS & CONDITIONS', MARGIN + 4, termsBoxY + 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(...TEXT_PRIMARY)
  const terms = [
    `1. Validity: This quotation is valid until ${format(new Date(validUntil), 'dd MMMM yyyy')}.`,
    '2. Inventory: Screen slots are confirmed on receipt of campaign confirmation and video creative approval.',
    '3. Commercials: 100% advance payment required prior to campaign broadcast unless otherwise agreed in writing.',
    '4. Video Specs: MP4 / Full HD 1080p creative format. Playback schedules verified across active bus routes in Kollam.',
  ]
  doc.text(terms.join('\n'), MARGIN + 4, termsBoxY + 9, { lineHeightFactor: 1.35 })

  // Signature Block
  const sigY = termsBoxY + termsBoxH + 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...BRAND_DARK)
  doc.text('For Catgorithm Digital Growth', MARGIN + 4, sigY + 4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('Authorized Signatory / Sales Head', MARGIN + 4, sigY + 9)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...BRAND_DARK)
  doc.text('Client Acceptance / Signature', PAGE_W - MARGIN - 48, sigY + 4)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('Date: ____________________', PAGE_W - MARGIN - 48, sigY + 9)

  // Bottom Footer
  doc.setFillColor(...BRAND_DARK)
  doc.rect(0, PAGE_H - 11, PAGE_W, 11, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(200, 210, 225)
  doc.text(
    `Catgorithm  •  ${COMPANY_DETAILS.address}  •  Phone: ${COMPANY_DETAILS.phone}  •  Email: ${COMPANY_DETAILS.email}`,
    PAGE_W / 2,
    PAGE_H - 4.5,
    { align: 'center' }
  )
}

// ─────────────────────────────────────────────────────────────
// 3. MAIN EXPORT FUNCTION
// ─────────────────────────────────────────────────────────────
export async function generateQuotationPDF(quotation: Quotation): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const isWinterSpotlight =
    quotation.campaignThemeSnapshot?.style === 'winter-spotlight' ||
    quotation.campaignId === 'winter-spotlight-2026' ||
    Boolean(quotation.campaignName && quotation.campaignName.toLowerCase().includes('winter'))

  if (isWinterSpotlight) {
    renderWinterSpotlightPDF(doc, quotation)
  } else {
    renderStandardQuotationPDF(doc, quotation)
  }

  // Save PDF with clear naming
  const c = quotation.customerDetails
  const sanitizedClient = (c.businessName || 'Client').replace(/[^a-zA-Z0-9]/g, '_')
  const campaignTag = isWinterSpotlight ? 'WinterSpotlight_' : ''
  doc.save(`Catgorithm_${campaignTag}Quotation_${sanitizedClient}_${quotation.id}.pdf`)
}
