import { useState } from 'react'
import { useCalculatorStore } from '../../stores/calculatorStore'
import { formatINR } from '../../lib/pricingEngine'
import {
  Sparkles, Sliders, Check, AlertCircle, X, Percent, ArrowDownRight, Tag
} from 'lucide-react'

export default function FestivalAndManualPricingControls() {
  const pricing = useCalculatorStore((s) => s.pricing)
  const config = useCalculatorStore((s) => s.config)
  const isFestivalPricing = useCalculatorStore((s) => s.isFestivalPricing)
  const manualPriceOverride = useCalculatorStore((s) => s.manualPriceOverride)
  const manualDiscount = useCalculatorStore((s) => s.manualDiscount)

  const setFestivalPricing = useCalculatorStore((s) => s.setFestivalPricing)
  const setManualPriceOverride = useCalculatorStore((s) => s.setManualPriceOverride)
  const setManualDiscount = useCalculatorStore((s) => s.setManualDiscount)

  const [showManualSection, setShowManualSection] = useState(
    Boolean(manualPriceOverride || manualDiscount > 0)
  )

  const isEligible = config.videoDurationSeconds >= 20
  const autoPrice = isFestivalPricing && isEligible ? pricing.festivalPrice : pricing.normalPrice

  return (
    <div className="space-y-3">
      {/* ── 1. FESTIVAL SEASON PRICING TOGGLE ── */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isFestivalPricing
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-yellow-500/10 border-amber-300 shadow-xs'
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
              isFestivalPricing ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
            }`}>
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">Festival Season Pricing</span>
                {isFestivalPricing && isEligible && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white tracking-wide shadow-2xs">
                    Offer Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Special promotional discounts on 3, 6 & 12-month packages (20s+ ads).
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isFestivalPricing}
            onClick={() => setFestivalPricing(!isFestivalPricing)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isFestivalPricing ? 'bg-amber-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isFestivalPricing ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Dynamic Festival Offer Status Banner */}
        {isFestivalPricing && (
          <div className="mt-3 pt-3 border-t border-amber-200/60">
            {isEligible ? (
              <div className="flex items-center justify-between text-xs text-amber-950 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Tag size={13} className="text-amber-600" />
                  <span>
                    {config.months === 3 && 'Primary Offer: 3 Months (₹50,000 Ref / 10 Buses)'}
                    {config.months === 6 && 'Best Value Offer: 6 Months (₹1,00,000 Ref / 10 Buses)'}
                    {config.months === 12 && 'Maximum Savings Offer: 12 Months (₹2,00,000 Ref / 10 Buses)'}
                    {![3, 6, 12].includes(config.months) && `${config.months}-Month Seasonal Campaign Discount Applied`}
                  </span>
                </div>
                <span className="font-extrabold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Festival Rate: {formatINR(pricing.festivalPrice)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                <span>
                  Requires 20s or longer ad duration for festival discount (currently {config.videoDurationSeconds}s). Normal pricing is applied.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 2. MANUAL FINAL PRICE & ADDITIONAL DISCOUNT ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowManualSection(!showManualSection)}
            className="flex items-center gap-2 text-left w-full group"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              pricing.isManualPriceActive || pricing.isManualDiscountActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
            }`}>
              <Sliders size={14} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-900">
                  Manual Price Override & Negotiation
                </span>
                {(pricing.isManualPriceActive || pricing.isManualDiscountActive) && (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-700">
                    Active
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">
                Enter negotiated total campaign price or additional manual discount.
              </p>
            </div>
            <span className="text-xs font-semibold text-accent group-hover:underline">
              {showManualSection ? 'Hide' : 'Configure'}
            </span>
          </button>
        </div>

        {showManualSection && (
          <div className="mt-3.5 pt-3.5 border-t border-gray-100 space-y-3.5 animate-fadeIn">
            {/* Control A: Manual Final Price */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <span>Manual Final Price (₹)</span>
                  {pricing.isManualPriceActive && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      Overrides Automatic Rate
                    </span>
                  )}
                </label>
                {pricing.isManualPriceActive && (
                  <button
                    type="button"
                    onClick={() => setManualPriceOverride(null)}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 active:scale-95"
                  >
                    <X size={12} /> Clear Manual Price
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="5"
                  value={manualPriceOverride ?? ''}
                  onChange={(e) => {
                    const val = e.target.value.trim()
                    if (val === '') {
                      setManualPriceOverride(null)
                    } else {
                      const num = Number(val)
                      if (!isNaN(num) && num >= 0) {
                        setManualPriceOverride(num)
                      }
                    }
                  }}
                  placeholder={`Auto: ${autoPrice.toLocaleString('en-IN')}`}
                  className={`w-full h-10 pl-7 pr-3 rounded-xl border text-sm font-semibold transition-all focus:outline-none ${
                    pricing.isManualPriceActive
                      ? 'border-blue-500 bg-blue-50/20 focus:ring-2 focus:ring-blue-500/20'
                      : 'border-gray-200 bg-gray-50/50 focus:border-accent focus:bg-white'
                  }`}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Enter any negotiated total campaign price. When entered, automatic calculations are overridden.
              </p>
            </div>

            {/* Control B: Additional Manual Discount (₹) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <span>Additional Manual Discount (₹)</span>
                  {pricing.isManualDiscountActive && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      -{formatINR(pricing.manualDiscount)}
                    </span>
                  )}
                </label>
                {pricing.isManualDiscountActive && (
                  <button
                    type="button"
                    onClick={() => setManualDiscount(0)}
                    className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 active:scale-95"
                  >
                    <X size={12} /> Remove Discount
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={manualDiscount || ''}
                  onChange={(e) => {
                    const val = e.target.value.trim()
                    if (val === '') {
                      setManualDiscount(0)
                    } else {
                      const num = Number(val)
                      if (!isNaN(num) && num >= 0) {
                        setManualDiscount(num)
                      }
                    }
                  }}
                  placeholder="0 (Optional discount)"
                  className={`w-full h-10 pl-7 pr-3 rounded-xl border text-sm font-semibold transition-all focus:outline-none ${
                    pricing.isManualDiscountActive
                      ? 'border-emerald-500 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-gray-200 bg-gray-50/50 focus:border-accent focus:bg-white'
                  }`}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Subtracted from the final payable amount. If a manual price is also entered, this discount is applied to the manual price.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
