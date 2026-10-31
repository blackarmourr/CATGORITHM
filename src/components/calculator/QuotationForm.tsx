import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCalculatorStore } from '../../stores/calculatorStore'
import { formatINR, formatINR2 } from '../../lib/pricingEngine'
import { createEnquiry, createQuotation } from '../../lib/dataStore'
import { generateQuotationPDF } from '../../lib/pdfGenerator'
import type { EnquiryStatus } from '../../types'
import {
  Share2, FileDown, BookmarkCheck, Copy, Check,
  User, Phone, Building2, ExternalLink, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'

export default function QuotationForm() {
  const pricing = useCalculatorStore((s) => s.pricing)
  const config = useCalculatorStore((s) => s.config)
  const selectedCampaign = useCalculatorStore((s) => s.selectedCampaign)

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [dealStatus, setDealStatus] = useState<EnquiryStatus>('Quotation Sent')
  const [copied, setCopied] = useState(false)
  const [savingLead, setSavingLead] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  // Construct crisp, professional WhatsApp quote text
  const quoteMessage = `*Catgorithm Bus Screen Advertising Quotation*
📍 *Kollam Bus Fleet, Kerala*
${clientName ? `Prepared for: *${clientName}*\n` : ''}*Campaign:* ${selectedCampaign?.name || 'Bus Advertising'}
• Campaign Period: ${config.startDate ? format(new Date(config.startDate), 'dd MMM yyyy') : ''} – ${config.endDate ? format(new Date(config.endDate), 'dd MMM yyyy') : ''}
• Fleet Size: ${config.buses} ${config.buses === 1 ? 'Bus' : 'Buses'}
• Video Ad Duration: ${config.videoDurationSeconds} Seconds
• Billed Duration: ${config.months} ${config.months === 1 ? 'Month' : 'Months'}

*Commercials:*
• Standard Rate: ${formatINR(pricing.standardPrice)}
• *Special Package Price: ${formatINR(pricing.packagePrice)}*
${pricing.savings > 0 ? `• *Direct Client Savings: ${formatINR(pricing.savings)} (${pricing.savingsPercentage.toFixed(0)}% OFF)*\n` : ''}
*Effective Unit Economics:*
• Rate per Bus: ${formatINR(pricing.pricePerBusMonth)} / month
• Daily Cost per Bus: *Only ${formatINR(pricing.pricePerBusDay, { decimals: 2 })} / day!*

_Offer valid for 30 days. Contact us to reserve your screen inventory._
*Catgorithm Digital Growth*
📍 Parayathumukku, Umayanalloor, Kollam 691020
📞 +91 97463 36175 | ✉️ teamcatgorithm@gmail.com`

  // WhatsApp launcher
  function handleWhatsAppShare() {
    const encoded = encodeURIComponent(quoteMessage)
    const cleanPhone = clientPhone.replace(/\D/g, '')
    const url = cleanPhone ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
    window.open(url, '_blank')
  }

  // Copy text to clipboard
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(quoteMessage)
      setCopied(true)
      toast.success('Quote message copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Unable to copy to clipboard')
    }
  }

  // Instant PDF generation
  async function handleDownloadPDF() {
    setGeneratingPDF(true)
    try {
      const validUntil = format(addDays(new Date(), 30), 'yyyy-MM-dd')
      const quotation = await createQuotation({
        customerDetails: {
          businessName: clientName.trim() || 'Valued Client',
          contactName: clientName.trim() || 'Client Representative',
          phone: clientPhone.trim() || '+91 -',
          email: '',
          businessCategory: 'Bus Screen Advertising',
          campaignStartDate: config.startDate,
          campaignEndDate: config.endDate,
          notes: `Quote generated in field: ${config.buses} buses, ${config.videoDurationSeconds}s ad, ${config.months} months. Campaign: ${selectedCampaign?.name}.`,
        },
        pricingSnapshot: {
          buses: pricing.buses,
          months: pricing.months,
          videoDurationSeconds: pricing.videoDurationSeconds,
          standardPrice: pricing.standardPrice,
          packagePrice: pricing.packagePrice,
          savings: pricing.savings,
          savingsPercentage: pricing.savingsPercentage,
          durationMultiplier: pricing.durationMultiplier,
          durationDiscountRate: pricing.durationDiscountRate,
          pricingMethod: pricing.pricingMethod,
          pricePerBusCampaign: pricing.pricePerBusCampaign,
          pricePerBusMonth: pricing.pricePerBusMonth,
          pricePerBusDay: pricing.pricePerBusDay,
        },
        campaignId: selectedCampaign?.id,
        campaignName: selectedCampaign?.name,
        campaignStartDate: config.startDate,
        campaignEndDate: config.endDate,
        billedMonths: config.months,
        campaignThemeSnapshot: selectedCampaign?.theme,
        campaignMessagingSnapshot: selectedCampaign?.messaging,
        validUntil,
      })
      await generateQuotationPDF(quotation)
      toast.success('Official PDF Quotation downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF')
    } finally {
      setGeneratingPDF(false)
    }
  }

  // Save enquiry into internal dashboard
  async function handleSaveDeal(e: React.FormEvent) {
    e.preventDefault()
    if (!clientName.trim() && !clientPhone.trim()) {
      toast.error('Please enter at least client name or phone number')
      return
    }
    setSavingLead(true)
    try {
      await createEnquiry({
        status: dealStatus,
        customerDetails: {
          businessName: clientName.trim() || 'Field Prospect',
          contactName: clientName.trim() || 'Prospect',
          phone: clientPhone.trim() || 'Not specified',
          campaignStartDate: config.startDate,
          campaignEndDate: config.endDate,
          notes: `Logged via Sales App. Campaign: ${selectedCampaign?.name}.`,
        },
        pricingSnapshot: {
          buses: pricing.buses,
          months: pricing.months,
          videoDurationSeconds: pricing.videoDurationSeconds,
          standardPrice: pricing.standardPrice,
          packagePrice: pricing.packagePrice,
          savings: pricing.savings,
          savingsPercentage: pricing.savingsPercentage,
          durationMultiplier: pricing.durationMultiplier,
          durationDiscountRate: pricing.durationDiscountRate,
          pricingMethod: pricing.pricingMethod,
          pricePerBusCampaign: pricing.pricePerBusCampaign,
          pricePerBusMonth: pricing.pricePerBusMonth,
          pricePerBusDay: pricing.pricePerBusDay,
        },
        campaignId: selectedCampaign?.id,
        campaignName: selectedCampaign?.name,
      })
      toast.success(`Deal logged as "${dealStatus}" to Pipeline!`)
      setShowSaveModal(false)
    } catch {
      toast.error('Failed to save lead')
    } finally {
      setSavingLead(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
      {/* Client Quick Details (Optional, inline for speed) */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={13} className="text-accent" />
          Client Quick Share
        </span>
        <span className="text-[11px] text-gray-400">Optional Client Info</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Client / Business"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full pl-8 pr-2 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-accent"
          />
        </div>
        <div className="relative">
          <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="tel"
            placeholder="Client Phone (optional)"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full pl-8 pr-2 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* ── Primary Action Buttons for Field Pitch ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
        {/* WhatsApp Share Button */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/25 active:scale-98 transition-all"
        >
          <Share2 size={15} />
          Send Quote on WhatsApp
        </button>

        {/* Copy Message */}
        <button
          type="button"
          onClick={handleCopy}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-gray-200 active:scale-98 transition-all"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          {copied ? 'Copied to Clipboard!' : 'Copy Quote Text'}
        </button>
      </div>

      {/* Secondary Actions: Download Official PDF & Log Deal */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={generatingPDF}
          className="py-2.5 px-3 bg-white hover:bg-blue-50 text-accent font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-accent/40 active:scale-98 transition-all"
        >
          <FileDown size={14} />
          {generatingPDF ? 'Generating PDF…' : 'Download PDF Quote'}
        </button>

        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="py-2.5 px-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-gray-200 active:scale-98 transition-all"
        >
          <BookmarkCheck size={14} />
          Log as Pipeline Deal
        </button>
      </div>

      {/* Direct Link to View Pipeline & Past Sent Quotations */}
      <div className="pt-2 text-center border-t border-gray-100">
        <Link
          to="/admin/enquiries"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-blue-700 transition-colors"
        >
          <span>View Pipeline & Past Sent Quotations</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Save Lead Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-scaleUp">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <BookmarkCheck size={16} className="text-accent" />
              Save to Pipeline Enquiries
            </h3>
            <p className="text-xs text-gray-500">
              Record this enquiry in your Admin Dashboard to track follow-ups and negotiations.
            </p>
            <form onSubmit={handleSaveDeal} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Customer / Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Jewelers"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                />
              </div>

              {/* Deal Status Selection */}
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                  Pipeline Deal Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(['New', 'Contacted', 'Quotation Sent', 'Negotiation', 'Confirmed'] as EnquiryStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDealStatus(st)}
                      className={`px-2 py-1.5 text-[11px] font-bold rounded-xl border text-center transition-all ${
                        dealStatus === st
                          ? 'bg-accent text-white border-accent shadow-xs'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Configuration:</span>
                  <span className="font-semibold text-gray-900">{config.buses} Buses · {config.months} Mo</span>
                </div>
                <div className="flex justify-between text-accent font-bold">
                  <span>Quote Value:</span>
                  <span className="tabular-nums">{formatINR(pricing.packagePrice)}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="flex-1 py-2 text-xs font-bold text-white bg-accent rounded-xl disabled:opacity-50"
                >
                  {savingLead ? 'Saving…' : 'Save Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
