// PDF Quotation Generator using jsPDF with Catgorithm Maroon Brand Identity
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Quotation } from '../types'
import { formatINR, formatINR2 } from './pricingEngine'
import { CATGORITHM_LOGO_BASE64 } from './logoBase64'
import { COMPANY_DETAILS } from './dataStore'
import { format } from 'date-fns'

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

  // ── 2. Header: Logo & Company Info (Left) + Document Metadata (Right) ──
  let y = 14

  // Logo (High resolution image)
  try {
    // 52mm width, 18mm height matches the logo aspect ratio
    doc.addImage(CATGORITHM_LOGO_BASE64, 'PNG', MARGIN, y, 52, 17.5)
  } catch (err) {
    // Fallback if image rendering fails
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(...BRAND_MAROON)
    doc.text('CATGORITHM', MARGIN, y + 10)
  }

  // Quotation Metadata Block (Right aligned)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...BRAND_MAROON)
  doc.text('CAMPAIGN QUOTATION', PAGE_W - MARGIN, y + 5, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BRAND_DARK)
  doc.text(`Ref: ${id}`, PAGE_W - MARGIN, y + 11, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(`Date: ${format(new Date(createdAt), 'dd MMMM yyyy')}`, PAGE_W - MARGIN, y + 16, { align: 'right' })
  doc.text(`Valid Until: ${format(new Date(validUntil), 'dd MMMM yyyy')}`, PAGE_W - MARGIN, y + 21, { align: 'right' })

  y += 28

  // ── 3. Company Contact Subheader ────────────────────────────
  doc.setFillColor(...LIGHT_GRAY)
  doc.roundedRect(MARGIN, y, CONTENT_W, 11, 2, 2, 'F')
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.2)
  doc.roundedRect(MARGIN, y, CONTENT_W, 11, 2, 2, 'S')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TEXT_MUTED)
  doc.text(
    `Catgorithm Bus Advertising  •  ${COMPANY_DETAILS.address}  •  ${COMPANY_DETAILS.phone}  •  ${COMPANY_DETAILS.email}`,
    PAGE_W / 2,
    y + 7,
    { align: 'center' }
  )

  y += 16

  // ── 4. Two-Column Information Cards ────────────────────────
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
  doc.setFontSize(10)
  doc.setTextColor(...TEXT_PRIMARY)
  const clientTitle = c.businessName || 'Valued Client'
  doc.text(clientTitle.length > 32 ? clientTitle.substring(0, 32) + '…' : clientTitle, MARGIN + 6, y + 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
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
  doc.setFontSize(8)
  doc.setTextColor(...TEXT_PRIMARY)
  doc.text(`Fleet Size:`, rightX + 6, y + 13)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.buses} ${p.buses === 1 ? 'Bus' : 'Buses'} (Screen Network)`, rightX + 42, y + 13)

  doc.setFont('helvetica', 'normal')
  doc.text(`Video Ad Duration:`, rightX + 6, y + 19)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.videoDurationSeconds} Seconds (${(p.videoDurationSeconds / 30).toFixed(2)}x base)`, rightX + 42, y + 19)

  doc.setFont('helvetica', 'normal')
  doc.text(`Campaign Period:`, rightX + 6, y + 25)
  doc.setFont('helvetica', 'bold')
  doc.text(`${p.months} ${p.months === 1 ? 'Month' : 'Months'}`, rightX + 42, y + 25)

  doc.setFont('helvetica', 'normal')
  doc.text(`Advertising Media:`, rightX + 6, y + 30)
  doc.setFont('helvetica', 'bold')
  doc.text(`Digital Screen Inside Buses`, rightX + 42, y + 30)

  y += cardH + 7

  // ── 5. Commercials & Financial Breakdown Table ─────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BRAND_DARK)
  doc.text('COMMERCIAL TARIFF & PACKAGE PRICING', MARGIN, y)
  y += 3

  let discountLabel = 'Package Tariff Benefit'
  if (p.pricingMethod === '1month') {
    discountLabel = `One-Month Volume Package Benefit (${p.buses} Buses)`
  } else if (p.pricingMethod === '2month') {
    discountLabel = `Two-Month Long-Term Package Benefit (${p.buses} Buses)`
  } else {
    discountLabel = `Long-Term Duration Discount (${Math.round(p.durationDiscountRate * 100)}% on 1-Mo Base)`
  }

  const commercialsData: [string, string, string][] = [
    [
      'Standard Advertising Tariff (Reference Price)',
      `₹75/sec × ${p.videoDurationSeconds}s × ${p.buses} buses × ${p.months} mo`,
      formatINR(p.standardPrice),
    ],
    [
      discountLabel,
      p.savings > 0 ? `Package rate adjustment` : 'Standard base applied',
      p.savings > 0 ? `- ${formatINR(p.savings)}` : '₹0',
    ],
    [
      'NET CAMPAIGN PACKAGE TOTAL',
      `Complete ${p.months}-Month Campaign Across All ${p.buses} Buses`,
      formatINR(p.packagePrice),
    ],
    [
      'DIRECT CLIENT SAVINGS',
      `${p.savingsPercentage.toFixed(1)}% savings achieved`,
      `${formatINR(p.savings)} (${p.savingsPercentage.toFixed(0)}% OFF)`,
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
      fontSize: 8.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
      textColor: TEXT_PRIMARY,
      lineColor: BORDER_GRAY,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BRAND_DARK,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
    },
    columnStyles: {
      0: { cellWidth: 85, fontStyle: 'bold' },
      1: { cellWidth: 55, textColor: TEXT_MUTED },
      2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      // Header right align
      if (data.section === 'head' && data.column.index === 2) {
        data.cell.styles.halign = 'right'
      }

      // Net Total row styling
      if (data.section === 'body' && data.row.index === 2) {
        data.cell.styles.fillColor = [253, 242, 244] // Very subtle maroon tint
        data.cell.styles.textColor = BRAND_MAROON
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 9.5
        data.cell.styles.lineWidth = 0.4
        data.cell.styles.lineColor = BRAND_MAROON
      }

      // Direct Client Savings row
      if (data.section === 'body' && data.row.index === 3) {
        data.cell.styles.fillColor = [240, 253, 244] // Light emerald tint
        data.cell.styles.textColor = SUCCESS_GREEN
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 7

  // ── 6. Effective Unit Economics Table ───────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BRAND_DARK)
  doc.text('EFFECTIVE UNIT ECONOMICS', MARGIN, y)
  y += 3

  const unitEconomicsData: [string, string, string][] = [
    [
      'Effective Rate per Bus (Entire Campaign)',
      `₹${formatINR(p.packagePrice).replace('₹', '')} ÷ ${p.buses} Buses`,
      formatINR2(p.pricePerBusCampaign),
    ],
    [
      'Effective Rate per Bus (Per Month)',
      `₹${formatINR(p.packagePrice).replace('₹', '')} ÷ (${p.buses} Buses × ${p.months} Months)`,
      formatINR2(p.pricePerBusMonth),
    ],
    [
      'Effective Rate per Bus (Per Day - 30 Days Basis)',
      `₹${formatINR(p.packagePrice).replace('₹', '')} ÷ (${p.buses} × ${p.months} × 30 Days)`,
      `${formatINR2(p.pricePerBusDay)} / day`,
    ],
    [
      'Effective Cost per Second per Bus (Per Month)',
      `Monthly Rate ÷ ${p.videoDurationSeconds} Seconds`,
      `₹${(p.pricePerSecondBusMonth ?? (p.packagePrice / (p.buses * p.months * p.videoDurationSeconds))).toFixed(2)} / sec`,
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
      fontSize: 8,
      cellPadding: { top: 2.8, bottom: 2.8, left: 4, right: 4 },
      textColor: TEXT_PRIMARY,
      lineColor: BORDER_GRAY,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: BRAND_MAROON,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    columnStyles: {
      0: { cellWidth: 85, fontStyle: 'normal' },
      1: { cellWidth: 55, textColor: TEXT_MUTED },
      2: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: BRAND_DARK },
    },
    didParseCell: (data) => {
      if (data.section === 'head' && data.column.index === 2) {
        data.cell.styles.halign = 'right'
      }
    },
  })

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 6

  // ── 7. Customer Notes (if provided) ─────────────────────────
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
    y += splitNotes.length * 4 + 3
  }

  // ── 8. Terms & Conditions Box ───────────────────────────────
  const termsBoxY = Math.max(y, 226)
  const termsBoxH = 26

  doc.setFillColor(...LIGHT_GRAY)
  doc.roundedRect(MARGIN, termsBoxY, CONTENT_W, termsBoxH, 2, 2, 'F')
  doc.setDrawColor(...BORDER_GRAY)
  doc.setLineWidth(0.2)
  doc.roundedRect(MARGIN, termsBoxY, CONTENT_W, termsBoxH, 2, 2, 'S')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...BRAND_MAROON)
  doc.text('TERMS & CONDITIONS', MARGIN + 4, termsBoxY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.8)
  doc.setTextColor(...TEXT_PRIMARY)
  const terms = [
    `1. Validity: This quotation is valid until ${format(new Date(validUntil), 'dd MMMM yyyy')}.`,
    '2. Inventory: Screen slots are confirmed on receipt of campaign confirmation and video creative approval.',
    '3. Taxes: Applicable Goods & Services Tax (GST) will be charged as per statutory norms upon invoicing.',
    '4. Commercials: 100% advance payment required prior to campaign broadcast unless otherwise agreed in writing.',
    '5. Video Specs: MP4 / Full HD 1080p creative format. Playback schedules verified across active bus routes in Kollam.',
  ]
  doc.text(terms.join('\n'), MARGIN + 4, termsBoxY + 10, { lineHeightFactor: 1.35 })

  // ── 9. Signature Block ──────────────────────────────────────
  const sigY = termsBoxY + termsBoxH + 6
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...BRAND_DARK)
  doc.text('For Catgorithm Digital Growth', MARGIN + 4, sigY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('Authorized Signatory / Sales Head', MARGIN + 4, sigY + 10)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...BRAND_DARK)
  doc.text('Client Acceptance / Signature', PAGE_W - MARGIN - 45, sigY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TEXT_MUTED)
  doc.text('Date: ____________________', PAGE_W - MARGIN - 45, sigY + 10)

  // ── 10. Bottom Footer ───────────────────────────────────────
  doc.setFillColor(...BRAND_DARK)
  doc.rect(0, PAGE_H - 12, PAGE_W, 12, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(200, 210, 225)
  doc.text(
    `Catgorithm  •  ${COMPANY_DETAILS.address}  •  Phone: ${COMPANY_DETAILS.phone}  •  Email: ${COMPANY_DETAILS.email}`,
    PAGE_W / 2,
    PAGE_H - 5,
    { align: 'center' }
  )

  // ── Save PDF ────────────────────────────────────────────────
  const sanitizedClient = (c.businessName || 'Client').replace(/[^a-zA-Z0-9]/g, '_')
  doc.save(`Catgorithm_Quotation_${sanitizedClient}_${id}.pdf`)
}
