// ============================================================
// PDF Quotation Generator using jsPDF
// Clean, minimalist, single-page A4 corporate quotation.
// Official Catgorithm Maroon & Neutral Charcoal brand identity.
// Currency formatted with ASCII 'Rs.' for reliable rendering.
// ============================================================
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

export async function generateQuotationPDF(quotation: Quotation): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const { customerDetails: c, pricingSnapshot: p, validUntil, id, createdAt } = quotation

  const PAGE_W = 210
  const PAGE_H = 297
  const MARGIN = 15
  const CONTENT_W = PAGE_W - MARGIN * 2 // 180mm

  // ── Palette (Official Catgorithm Maroon & Neutral Charcoal) ──
  const BRAND_MAROON = [160, 53, 78] as [number, number, number] // #A0354E
  const BRAND_DARK = [17, 24, 39] as [number, number, number]    // #111827
  const LIGHT_GRAY = [248, 249, 251] as [number, number, number]
  const BORDER_GRAY = [226, 232, 240] as [number, number, number]
  const TEXT_PRIMARY = [17, 24, 39] as [number, number, number]
  const TEXT_MUTED = [100, 116, 139] as [number, number, number]
  const SUCCESS_GREEN = [22, 163, 74] as [number, number, number]
  const WHITE = [255, 255, 255] as [number, number, number]

  // ── 1. Top Decorative Brand Bar ────────────────────────────
  doc.setFillColor(...BRAND_MAROON)
  doc.rect(0, 0, PAGE_W, 4, 'F')

  // ── 2. Header: Logo (Left) + Document Metadata (Right) ─────
  let y = 12

  // Logo (High resolution image)
  try {
    doc.addImage(CATGORITHM_LOGO_BASE64, 'PNG', MARGIN, y, 52, 17.5)
  } catch {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(...BRAND_MAROON)
    doc.text('CATGORITHM', MARGIN, y + 10)
  }

  // Quotation Metadata Block (Right aligned)
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

  // ── 3. Two-Column Information Cards ────────────────────────
  const cardW = (CONTENT_W - 6) / 2 // 87mm each
  const cardH = 34

  // Left Card: CLIENT DETAILS (BILL TO)
  doc.setFillColor(...WHITE)
  doc.roundedRect(MARGIN, y, cardW, cardH, 2, 2, 'F')
  doc.setDrawColor(...BORDER_GRAY)
  doc.roundedRect(MARGIN, y, cardW, cardH, 2, 2, 'S')

  doc.setFillColor(...BRAND_MAROON)
  doc.rect(MARGIN, y, 2.5, cardH, 'F') // Maroon accent bar

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
  doc.text(`Fleet Size:`, rightX + 6, y + 12)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.buses} ${p.buses === 1 ? 'Bus' : 'Buses'} (Screen Network)`, rightX + 38, y + 12)

  doc.setFont('helvetica', 'normal')
  doc.text(`Video Ad Duration:`, rightX + 6, y + 17.5)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.videoDurationSeconds} Seconds (${(p.videoDurationSeconds / 30).toFixed(2)}x base)`, rightX + 38, y + 17.5)

  doc.setFont('helvetica', 'normal')
  doc.text(`Campaign Period:`, rightX + 6, y + 23)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.months} ${p.months === 1 ? 'Month' : 'Months'}`, rightX + 38, y + 23)

  // Highlighted Campaign Package Name
  const campaignPackageName = quotation.campaignName || 'Standard Campaign'
  doc.setFont('helvetica', 'normal')
  doc.text(`Campaign Package:`, rightX + 6, y + 28.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRAND_MAROON)
  doc.text(`${campaignPackageName}`, rightX + 38, y + 28.5)

  y += cardH + 7

  // ── 4. Commercials & Financial Breakdown Table ─────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...BRAND_DARK)
  doc.text('COMMERCIAL TARIFF & PACKAGE PRICING', MARGIN, y)
  y += 3

  let discountLabel = 'Package Tariff Benefit'
  if (p.pricingMethod === '1month') {
    discountLabel = `Volume Package Benefit (${p.buses} Buses)`
  } else if (p.pricingMethod === '2month') {
    discountLabel = `Two-Month Volume Benefit (${p.buses} Buses)`
  } else {
    discountLabel = `Long-Term Duration Benefit (${p.months} Months)`
  }

  const commercialsData: [string, string, string][] = [
    [
      'Standard Advertising Tariff (Reference Price)',
      `Rs. 75/sec x ${p.videoDurationSeconds}s x ${p.buses} buses x ${p.months} mo`,
      formatPDFINR(p.standardPrice),
    ],
    [
      discountLabel,
      p.savings > 0 ? 'Package rate benefit applied' : 'Standard base applied',
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
        data.cell.styles.fillColor = [253, 242, 244] // Subtle maroon tint
        data.cell.styles.textColor = BRAND_MAROON
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 9
        data.cell.styles.lineWidth = 0.35
        data.cell.styles.lineColor = BRAND_MAROON
      }
      if (data.section === 'body' && data.row.index === 3) {
        data.cell.styles.fillColor = [240, 253, 244] // Light emerald tint
        data.cell.styles.textColor = SUCCESS_GREEN
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 6.5

  // ── 5. Effective Unit Economics Table ───────────────────────
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

  // ── 6. Customer Notes (if provided) ─────────────────────────
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

  // ── 7. Terms & Conditions Box (Without GST) ─────────────────
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

  // ── 8. Signature Block ──────────────────────────────────────
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

  // ── 9. Bottom Footer ────────────────────────────────────────
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

  // ── Save PDF ────────────────────────────────────────────────
  const sanitizedClient = (c.businessName || 'Client').replace(/[^a-zA-Z0-9]/g, '_')
  doc.save(`Catgorithm_Quotation_${sanitizedClient}_${id}.pdf`)
}
