import { useState } from 'react'
import { useCalculatorStore } from '../../stores/calculatorStore'
import { formatINR } from '../../lib/pricingEngine'
import { Sliders, X } from 'lucide-react'

export default function ManualPricingControls() {
  const pricing = useCalculatorStore((s) => s.pricing)
  const manualPriceOverride = useCalculatorStore((s) => s.manualPriceOverride)
  const manualDiscount = useCalculatorStore((s) => s.manualDiscount)

  const setManualPriceOverride = useCalculatorStore((s) => s.setManualPriceOverride)
  const setManualDiscount = useCalculatorStore((s) => s.setManualDiscount)

  const [isOpen, setIsOpen] = useState(
    Boolean(manualPriceOverride || manualDiscount > 0)
  )

  const autoPrice = pricing.packagePrice

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
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
            {isOpen ? 'Hide' : 'Configure'}
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="mt-3.5 pt-3.5 border-t border-gray-100 space-y-3.5 animate-fadeIn">
          {/* Control A: Manual Final Price */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-gray-800">Manual Final Price (₹)</span>
                {pricing.isManualPriceActive && (
                  <span className="text-[9.5px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    Overrides Automatic Rate
                  </span>
                )}
              </div>
              {pricing.isManualPriceActive && (
                <button
                  type="button"
                  onClick={() => setManualPriceOverride(null)}
                  className="text-[10.5px] font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 active:scale-95"
                >
                  <X size={11} /> Clear Manual Price
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
          </div>

          {/* Control B: Additional Manual Discount (₹) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-gray-800">Additional Manual Discount (₹)</span>
                {pricing.isManualDiscountActive && (
                  <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    -{formatINR(pricing.manualDiscount)}
                  </span>
                )}
              </div>
              {pricing.isManualDiscountActive && (
                <button
                  type="button"
                  onClick={() => setManualDiscount(0)}
                  className="text-[10.5px] font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 active:scale-95"
                >
                  <X size={11} /> Remove Discount
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
          </div>
        </div>
      )}
    </div>
  )
}
