import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCustomCalculatorStore } from '../../stores/customCalculatorStore'
import { formatINR } from '../../lib/customPricingEngine'
import { createEnquiry, createQuotation } from '../../lib/dataStore'
import { generateQuotationPDF } from '../../lib/pdfGenerator'
import type { EnquiryStatus } from '../../types'
import {
  Share2, FileDown, BookmarkCheck, Copy, Check,
  User, Phone, ExternalLink, CalendarRange
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'

export default function CustomQuotationForm() {
  const pricing = useCustomCalculatorStore((s) => s.pricing)
  const config = useCustomCalculatorStore((s) => s.config)

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [dealStatus, setDealStatus] = useState<EnquiryStatus>('Quotation Sent')
  const [copied, setCopied] = useState(false)
  const [savingLead, setSavingLead] = useState(false)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isUndecided, setIsUndecided] = useState(false)

  // Construct crisp, professional WhatsApp quote text for custom campaign
  const quoteMessage = `*Catgorithm Bus Screen Advertising Quotation*
📍 *Kollam Bus Fleet, Kerala*
${clientName ? `Prepared for: *${clientName}*\n` : ''}*Campaign Package:* Custom Daily Campaign
• Campaign Period: ${config.startDate ? format(new Date(config.startDate), 'dd MMM yyyy') : ''} – ${config.endDate ? format(new Date(config.endDate), 'dd MMM yyyy') : ''} (${config.days} Days)
• Fleet Size: ${config.buses} ${config.buses === 1 ? 'Bus' : 'Buses'}
• Video Ad Duration: ${config.videoDurationSeconds} Seconds
• Campaign Duration: ${config.days} ${config.days === 1 ? 'Day' : 'Days'}

*Commercials:*
• Standard Tariff: ${formatINR(pricing.standardPrice)}
• *Special Custom Campaign Price: ${formatINR(pricing.totalPrice)}*
${pricing.savings > 0 ? `• *Direct Client Savings: ${formatINR(pricing.savings)} (${pricing.savingsPercentage.toFixed(0)}% OFF)*\n` : ''}
*Effective Unit Economics:*
• Rate per Bus: ${formatINR(pricing.finalPerBusPrice)} (${config.days} Days)
• Daily Cost per Bus: *Only ₹${pricing.pricePerBusDay.toFixed(2)} / day!*

_Offer valid for 30 days. Contact us to reserve your screen slots._
*Catgorithm Digital Growth*
📍 Parayathumukku, Umayanalloor, Kollam 691020
📞 +91 97463 36175 | ✉️ teamcatgorithm@gmail.com`

  // WhatsApp launcher
  function handleWhatsAppShare() {
    const encoded = encodeURIComponent(quoteMessage)
    const cleanPhone = clientPhone.replace(/\D/g, '')
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`
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
          notes: '',
        },
        pricingSnapshot: {
          buses: pricing.buses,
          months: Math.max(1, Math.round(config.days / 30)),
          campaignDays: config.days,
          dailyBasePrice: pricing.dailyBasePricePerBus,
          videoDurationSeconds: pricing.videoDurationSeconds,
          standardPrice: pricing.standardPrice,
          packagePrice: pricing.totalPrice,
          savings: pricing.savings,
          savingsPercentage: pricing.savingsPercentage,
          durationMultiplier: pricing.durationMultiplier,
          durationDiscountRate: 0,
          pricingMethod: 'custom-daily',
          pricePerBusCampaign: pricing.finalPerBusPrice,
          pricePerBusMonth: Math.round(pricing.pricePerBusDay * 30),
          pricePerBusDay: pricing.pricePerBusDay,
          pricePerSecondBusMonth: (pricing.pricePerBusDay * 30) / pricing.videoDurationSeconds,
          pricePerSecondBusCampaign: pricing.pricePerSecondBusDay,
        },
        campaignId: 'custom-daily',
        campaignName: `Custom Campaign (${config.days} Days)`,
        campaignStartDate: config.startDate,
        campaignEndDate: config.endDate,
        billedMonths: Math.max(1, Math.round(config.days / 30)),
        campaignDays: config.days,
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

  // Save deal into pipeline
  async function handleSaveDeal(e: React.FormEvent) {
    e.preventDefault()
    if (!clientName.trim()) {
      toast.error('Please enter client or business name')
      return
    }
    setSavingLead(true)
    try {
      let quotationId: string | undefined = undefined

      if (!isUndecided) {
        const validUntil = format(addDays(new Date(), 30), 'yyyy-MM-dd')
        const quotation = await createQuotation({
          customerDetails: {
            businessName: clientName.trim() || 'Field Prospect',
            contactName: clientName.trim() || 'Prospect',
            phone: clientPhone.trim() || 'Not specified',
            email: '',
            businessCategory: 'Bus Screen Advertising',
            campaignStartDate: config.startDate,
            campaignEndDate: config.endDate,
            notes: '',
          },
          pricingSnapshot: {
            buses: pricing.buses,
            months: Math.max(1, Math.round(config.days / 30)),
            campaignDays: config.days,
            dailyBasePrice: pricing.dailyBasePricePerBus,
            videoDurationSeconds: pricing.videoDurationSeconds,
            standardPrice: pricing.standardPrice,
            packagePrice: pricing.totalPrice,
            savings: pricing.savings,
            savingsPercentage: pricing.savingsPercentage,
            durationMultiplier: pricing.durationMultiplier,
            durationDiscountRate: 0,
            pricingMethod: 'custom-daily',
            pricePerBusCampaign: pricing.finalPerBusPrice,
            pricePerBusMonth: Math.round(pricing.pricePerBusDay * 30),
            pricePerBusDay: pricing.pricePerBusDay,
            pricePerSecondBusMonth: (pricing.pricePerBusDay * 30) / pricing.videoDurationSeconds,
            pricePerSecondBusCampaign: pricing.pricePerSecondBusDay,
          },
          campaignId: 'custom-daily',
          campaignName: `Custom Campaign (${config.days} Days)`,
          campaignStartDate: config.startDate,
          campaignEndDate: config.endDate,
          billedMonths: Math.max(1, Math.round(config.days / 30)),
          campaignDays: config.days,
          validUntil,
        })
        quotationId = quotation.id
      }

      await createEnquiry({
        status: dealStatus,
        quotationId,
        customerDetails: {
          businessName: clientName.trim() || 'Field Prospect',
          contactName: clientName.trim() || 'Prospect',
          phone: clientPhone.trim() || 'Not specified',
          campaignStartDate: isUndecided ? undefined : config.startDate,
          campaignEndDate: isUndecided ? undefined : config.endDate,
          notes: isUndecided
            ? `Early stage discovery prospect (Custom Campaign). Fleet size & pricing not decided yet.`
            : `Logged via Custom Campaign App. ${config.buses} buses, ${config.videoDurationSeconds}s ad, ${config.days} days. Quotation Ref: ${quotationId}.`,
        },
        pricingSnapshot: isUndecided
          ? {
              buses: 0,
              months: 0,
              campaignDays: 0,
              videoDurationSeconds: 0,
              standardPrice: 0,
              packagePrice: 0,
              savings: 0,
              savingsPercentage: 0,
              durationMultiplier: 0,
              durationDiscountRate: 0,
              pricingMethod: 'undecided',
              pricePerBusCampaign: 0,
              pricePerBusMonth: 0,
              pricePerBusDay: 0,
            }
          : {
              buses: pricing.buses,
              months: Math.max(1, Math.round(config.days / 30)),
              campaignDays: config.days,
              dailyBasePrice: pricing.dailyBasePricePerBus,
              videoDurationSeconds: pricing.videoDurationSeconds,
              standardPrice: pricing.standardPrice,
              packagePrice: pricing.totalPrice,
              savings: pricing.savings,
              savingsPercentage: pricing.savingsPercentage,
              durationMultiplier: pricing.durationMultiplier,
              durationDiscountRate: 0,
              pricingMethod: 'custom-daily',
              pricePerBusCampaign: pricing.finalPerBusPrice,
              pricePerBusMonth: Math.round(pricing.pricePerBusDay * 30),
              pricePerBusDay: pricing.pricePerBusDay,
              pricePerSecondBusMonth: (pricing.pricePerBusDay * 30) / pricing.videoDurationSeconds,
              pricePerSecondBusCampaign: pricing.pricePerSecondBusDay,
            },
        campaignId: 'custom-daily',
        campaignName: isUndecided ? 'Custom Campaign (TBD)' : `Custom Campaign (${config.days} Days)`,
      })

      toast.success(isUndecided ? 'Deal logged to Pipeline (Fleet & Price TBD)!' : `Deal logged as "${dealStatus}" to Pipeline!`)
      setShowSaveModal(false)
      setIsUndecided(false)
    } catch {
      toast.error('Failed to save lead')
    } finally {
      setSavingLead(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Client Details Inputs ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <User size={13} className="text-accent" />
            Client & Contact Details
          </span>
          <span className="text-[11px] text-gray-400">Optional for quick quote</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Business / Client Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-accent bg-gray-50/50 focus:bg-white"
            />
          </div>

          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              placeholder="Phone Number (optional)"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 focus:outline-none focus:border-accent bg-gray-50/50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── Action Buttons: WhatsApp Share & Download PDF ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* WhatsApp Pitch */}
        <button
          type="button"
          onClick={handleWhatsAppShare}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20 transition-all"
        >
          <Share2 size={15} />
          <span>Share Quote on WhatsApp</span>
        </button>

        {/* Download PDF Quote */}
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={generatingPDF}
          className="w-full py-3 px-4 rounded-xl bg-accent hover:bg-blue-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-accent/20 transition-all"
        >
          <FileDown size={15} className={generatingPDF ? 'animate-bounce' : ''} />
          <span>{generatingPDF ? 'Generating PDF…' : 'Download PDF Quote'}</span>
        </button>
      </div>

      {/* Secondary Actions: Copy Message & Save to Pipeline */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          onClick={handleCopy}
          className="py-2.5 px-3 rounded-xl border border-gray-200 hover:border-gray-400 text-gray-700 font-semibold bg-white flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Quote Text'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-accent font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          <BookmarkCheck size={14} />
          <span>Save to Pipeline</span>
        </button>
      </div>

      {/* ── Save to Pipeline Modal ── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-scaleUp">
            <div>
              <h3 className="font-black text-base text-gray-900">Log Deal to Pipeline</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isUndecided
                  ? 'Record an open prospect with fleet and pricing to be decided later.'
                  : `Save ${formatINR(pricing.totalPrice)} custom campaign deal to track follow-ups.`}
              </p>
            </div>

            <form onSubmit={handleSaveDeal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Client / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Bakers Kollam"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9746336175 (Optional)"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Initial Lead Status</label>
                <select
                  value={dealStatus}
                  onChange={(e) => setDealStatus(e.target.value as EnquiryStatus)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold bg-white focus:outline-none focus:border-accent"
                >
                  <option value="New">New Lead</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Quotation Sent">Quotation Sent</option>
                  <option value="Negotiation">In Negotiation</option>
                  <option value="Confirmed">Confirmed Deal</option>
                </select>
              </div>

              {/* Optional: Fleet & Price Not Decided Yet */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isUndecided}
                    onChange={(e) => setIsUndecided(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <div className="flex-1">
                    <span className="font-bold text-xs text-amber-950 block">
                      Buses & Price Not Decided Yet
                    </span>
                    <span className="text-[11px] text-amber-800/80 block mt-0.5 leading-normal">
                      Client hasn't confirmed fleet size or budget yet. Log as an open deal with pricing TBD; finalize details later once approved.
                    </span>
                  </div>
                </label>
              </div>

              {isUndecided ? (
                <div className="bg-gray-100 p-2.5 rounded-xl text-xs space-y-1 border border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Fleet Specification:</span>
                    <span className="font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded text-[11px]">Undecided / TBD</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Deal Value:</span>
                    <span className="font-bold text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded text-[11px]">TBD (To Be Finalized)</span>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-2.5 rounded-xl text-xs space-y-1 border border-blue-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Configuration:</span>
                    <span className="font-semibold text-gray-900">{config.buses} Buses · {config.days} Days</span>
                  </div>
                  <div className="flex justify-between text-accent font-bold">
                    <span>Quote Value:</span>
                    <span className="tabular-nums">{formatINR(pricing.totalPrice)}</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="flex-1 py-2.5 rounded-xl bg-accent text-white font-bold hover:bg-blue-600 disabled:opacity-50"
                >
                  {savingLead ? 'Saving…' : 'Save Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
