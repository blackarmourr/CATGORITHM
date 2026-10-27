import { useCalculatorStore } from '../../stores/calculatorStore'
import { formatINR, formatINR2 } from '../../lib/pricingEngine'

export default function CampaignSummaryPanel() {
  const pricing = useCalculatorStore((s) => s.pricing)
  const config = useCalculatorStore((s) => s.config)

  const {
    standardPrice, packagePrice, savings, savingsPercentage,
    pricePerBusCampaign, pricePerBusMonth, pricePerBusDay,
    pricePerSecondBusMonth,
  } = pricing

  return (
    <div className="card p-6">
      <h2 className="text-xs font-bold uppercase tracking-wider text-secondary-text mb-5">
        Campaign Summary
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {[
          { label: 'Ad Duration', value: `${config.videoDurationSeconds} seconds` },
          { label: 'Selected Buses', value: `${config.buses} of 10` },
          { label: 'Campaign Duration', value: `${config.months} month${config.months > 1 ? 's' : ''}` },
          { label: 'Duration Multiplier', value: `${(config.videoDurationSeconds / 30).toFixed(4)}×` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-primary-light rounded-xl p-3">
            <p className="text-xs text-secondary-text mb-0.5">{label}</p>
            <p className="font-semibold text-primary-text text-sm tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2.5 mb-5">
        <div className="flex justify-between items-center py-2 border-b border-border/60">
          <span className="text-secondary-text text-sm">Standard Price</span>
          <span className="font-semibold text-secondary-text tabular-nums line-through text-sm">{formatINR(standardPrice)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/60">
          <span className="text-primary-text font-semibold text-sm">Package Price</span>
          <span className="font-black text-accent tabular-nums text-lg">{formatINR(packagePrice)}</span>
        </div>
        {savings > 0 && (
          <>
            <div className="flex justify-between items-center py-2 border-b border-border/60">
              <span className="text-secondary-text text-sm">Total Savings</span>
              <span className="font-bold text-success tabular-nums">{formatINR(savings)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-secondary-text text-sm">Discount</span>
              <span className="font-bold text-success tabular-nums">{savingsPercentage.toFixed(1)}%</span>
            </div>
          </>
        )}
      </div>

      <div className="bg-primary-light rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-secondary-text mb-3">Effective Pricing</p>
        <ul className="space-y-2">
          {[
            { label: 'Per bus · entire campaign', value: formatINR2(pricePerBusCampaign) },
            { label: 'Per bus · per month', value: formatINR2(pricePerBusMonth) },
            { label: 'Per bus · per day', value: formatINR2(pricePerBusDay) },
            { label: 'Per second · per bus · per month', value: `₹${pricePerSecondBusMonth.toFixed(4)}` },
          ].map(({ label, value }) => (
            <li key={label} className="flex justify-between items-center text-sm gap-4">
              <span className="text-secondary-text">{label}</span>
              <span className="font-semibold text-primary-text tabular-nums flex-shrink-0">{value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
