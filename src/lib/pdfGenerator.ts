// PDF Quotation Generator using jsPDF
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Quotation } from '../types'
import { formatINR, formatINR2 } from './pricingEngine'
import { format } from 'date-fns'

export async function generateQuotationPDF(quotation: Quotation): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const { customerDetails: c, pricingSnapshot: p, validUntil, id, createdAt } = quotation

  const PAGE_W = 210
  const MARGIN = 20
  const CONTENT_W = PAGE_W - MARGIN * 2

  // ── Colour palette ──────────────────────────────────────
  const DARK = [8, 11, 18] as [number, number, number]
  const ACCENT = [91, 124, 250] as [number, number, number]
  const LIGHT_BG = [245, 247, 250] as [number, number, number]
  const TEXT = [17, 24, 39] as [number, number, number]
  const MUTED = [100, 116, 139] as [number, number, number]
  const SUCCESS = [22, 163, 74] as [number, number, number]
  const WHITE = [255, 255, 255] as [number, number, number]

  // ── Header banner ───────────────────────────────────────
  doc.setFillColor(...DARK)
  doc.rect(0, 0, PAGE_W, 40, 'F')

  // Brand name
  doc.setTextColor(...WHITE)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('CATGORITHM', MARGIN, 18)

  // Tagline
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255)
  doc.setTextColor(180, 180, 200)
  doc.text('Bus Screen Advertising · Kollam, Kerala, India', MARGIN, 24)

  // Quotation label (right)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text('QUOTATION', PAGE_W - MARGIN, 15, { align: 'right' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 180, 200)
  doc.text(id, PAGE_W - MARGIN, 21, { align: 'right' })
  doc.text(`Issued: ${format(new Date(createdAt), 'dd MMM yyyy')}`, PAGE_W - MARGIN, 27, { align: 'right' })
  doc.text(`Valid until: ${format(new Date(validUntil), 'dd MMM yyyy')}`, PAGE_W - MARGIN, 33, { align: 'right' })

  let y = 50

  // ── Customer + Campaign info ────────────────────────────
  doc.setFillColor(...LIGHT_BG)
  doc.roundedRect(MARGIN, y, CONTENT_W, 42, 3, 3, 'F')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...MUTED)
  doc.text('BILL TO', MARGIN + 5, y + 7)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TEXT)
  doc.text(c.businessName, MARGIN + 5, y + 14)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...MUTED)
  doc.text(c.contactName, MARGIN + 5, y + 20)
  doc.text(c.phone, MARGIN + 5, y + 26)
  if (c.email) doc.text(c.email, MARGIN + 5, y + 32)

  // Campaign quick-ref (right side of this box)
  const rightX = MARGIN + CONTENT_W / 2 + 5
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...MUTED)
  doc.text('CAMPAIGN CONFIGURATION', rightX, y + 7)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT)
  doc.text(`Buses: ${p.buses}`, rightX, y + 14)
  doc.text(`Ad Duration: ${p.videoDurationSeconds} seconds`, rightX, y + 20)
  doc.text(`Campaign Duration: ${p.months} month${p.months > 1 ? 's' : ''}`, rightX, y + 26)
  if (c.campaignStartDate) doc.text(`Start Date: ${format(new Date(c.campaignStartDate), 'dd MMM yyyy')}`, rightX, y + 32)
  if (c.businessCategory) doc.text(`Category: ${c.businessCategory}`, rightX, y + 38)

  y += 50

  // ── Pricing breakdown table ─────────────────────────────
  const breakdownRows: [string, string][] = [
    ['Standard advertising price (undiscounted)', formatINR(p.standardPrice)],
    [`Buses selected`, `${p.buses}`],
    [`Ad duration`, `${p.videoDurationSeconds} seconds (×${p.durationMultiplier.toFixed(4)} multiplier)`],
    [`Campaign duration`, `${p.months} month${p.months > 1 ? 's' : ''}`],
    ['Campaign package adjustment', p.savings > 0 ? `−${formatINR(p.savings)}` : '—'],
    ['—', '—'],
    ['FINAL CAMPAIGN PRICE', formatINR(p.packagePrice)],
    ['Total savings', `${formatINR(p.savings)} (${p.savingsPercentage.toFixed(1)}%)`],
  ]

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Description', 'Amount']],
    body: breakdownRows,
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
      textColor: TEXT,
    },
    headStyles: {
      fillColor: DARK,
      textColor: WHITE,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fillColor: WHITE },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.65 },
      1: { cellWidth: CONTENT_W * 0.35, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.row.index === 6) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 11
        data.cell.styles.fillColor = [235, 242, 255]
        data.cell.styles.textColor = [44, 82, 200]
      }
      if (data.row.index === 7) {
        data.cell.styles.textColor = SUCCESS
      }
    },
  })

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 8

  // ── Unit economics ──────────────────────────────────────
  const unitRows: [string, string][] = [
    ['Effective price per bus (entire campaign)', formatINR2(p.pricePerBusCampaign)],
    ['Effective price per bus per month', formatINR2(p.pricePerBusMonth)],
    ['Effective price per bus per day (30 days/month)', formatINR2(p.pricePerBusDay)],
  ]

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Effective Unit Pricing', 'Amount']],
    body: unitRows,
    styles: { font: 'helvetica', fontSize: 9, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 } },
    headStyles: { fillColor: ACCENT, textColor: WHITE, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fillColor: WHITE },
    alternateRowStyles: { fillColor: LIGHT_BG },
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.65 },
      1: { cellWidth: CONTENT_W * 0.35, halign: 'right', fontStyle: 'bold' },
    },
  })

  // @ts-ignore
  y = (doc as any).lastAutoTable.finalY + 10

  // ── Notes ───────────────────────────────────────────────
  if (c.notes) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...MUTED)
    doc.text('CUSTOMER NOTES', MARGIN, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT)
    const lines = doc.splitTextToSize(c.notes, CONTENT_W)
    doc.text(lines, MARGIN, y + 5)
    y += 5 + lines.length * 5 + 5
  }

  // ── Terms ───────────────────────────────────────────────
  doc.setFillColor(...LIGHT_BG)
  const termsY = Math.max(y, 220)
  doc.rect(MARGIN, termsY, CONTENT_W, 28, 'F')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...MUTED)
  doc.text('TERMS & CONDITIONS', MARGIN + 4, termsY + 6)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT)
  const terms = [
    `• This quotation is valid until ${format(new Date(validUntil), 'dd MMM yyyy')}.`,
    '• This document is a quotation/estimate only and does not constitute a confirmed booking.',
    '• Campaign availability is subject to bus fleet availability at time of booking.',
    '• Applicable taxes, if any, will be stated separately in the final invoice.',
    '• Prices are in Indian Rupees (INR).',
  ]
  doc.text(terms.join('\n'), MARGIN + 4, termsY + 12, { lineHeightFactor: 1.5 })

  // ── Footer ──────────────────────────────────────────────
  doc.setFillColor(...DARK)
  doc.rect(0, 277, PAGE_W, 20, 'F')
  doc.setFontSize(7)
  doc.setTextColor(180, 180, 200)
  doc.setFont('helvetica', 'normal')
  doc.text('Catgorithm · hello@catgorithm.com · +91 98765 43210 · Kollam, Kerala, India', PAGE_W / 2, 285, { align: 'center' })
  doc.text('www.catgorithm.com', PAGE_W / 2, 290, { align: 'center' })

  // ── Save ───────────────────────────────────────────────
  doc.save(`Catgorithm-Quotation-${id}.pdf`)
}
