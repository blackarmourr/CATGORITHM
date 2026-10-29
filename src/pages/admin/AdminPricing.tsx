import { useEffect, useState } from 'react'
import { getPricingSettings, updatePricingSettings } from '../../lib/dataStore'
import {
  ONE_MONTH_PACKAGE_PRICES, TWO_MONTH_PACKAGE_PRICES,
  DURATION_DISCOUNT_RULES, formatINR, validatePricingMonotonicity,
  STANDARD_RATE_PER_SECOND, STANDARD_PRICE_PER_BUS_PER_MONTH_30S
} from '../../lib/pricingEngine'
import type { PricingSettings } from '../../types'
import { LoadingSpinner, ConfirmDialog } from '../../components/ui'
import { Tag, Save, AlertTriangle, Info, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPricing() {
  const [settings, setSettings] = useState<PricingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])

  async function load() {
    setLoading(true)
    const s = await getPricingSettings()
    setSettings(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function update(field: keyof PricingSettings, value: string | number | boolean) {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
    checkWarnings()
  }

  function checkWarnings() {
    const w: string[] = []
    const mono = validatePricingMonotonicity(10, 30)
    if (!mono.valid) {
      w.push(`Effective monthly price increases for campaign lengths: ${mono.violatingMonths.join(', ')} months. This creates inconsistent pricing.`)
    }
    setWarnings(w)
  }

  async function handleSave() {
    if (!settings) return
    setSaving(true)
    await updatePricingSettings(settings)
    setSaving(false)
    setConfirmOpen(false)
    toast.success('Pricing settings saved.')
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={28} />
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary-text">Pricing Settings</h1>
          <p className="text-secondary-text text-sm">Manage package prices, discount rules and platform configuration.</p>
        </div>
        <button onClick={load} className="btn-ghost text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Dev notice */}
      <div className="card p-4 border-amber-200 bg-amber-50/50">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-700 text-xs">
            Settings changes are currently stored in memory only and will reset on page refresh. Package price tables (one-month, two-month) are defined in the pricing engine source and must be updated in code for now. Supabase integration will enable persistent database-backed settings.
          </p>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="card p-4 border-red-200 bg-red-50/50">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm font-semibold">Pricing Consistency Warning</p>
          </div>
          {warnings.map((w, i) => (
            <p key={i} className="text-red-600 text-xs ml-6">{w}</p>
          ))}
        </div>
      )}

      {/* General settings */}
      <div className="card p-6 space-y-5">
        <h2 className="font-bold text-primary-text text-base flex items-center gap-2">
          <Tag size={16} className="text-accent" /> General Settings
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Standard Rate per Second (₹ / sec / bus / month)</label>
            <input
              type="number"
              value={settings.standardRatePerSecond || 75}
              onChange={(e) => update('standardRatePerSecond', Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Standard 30s Ad Rate per Bus/Month — ₹</label>
            <input
              type="number"
              value={settings.standardRatePerBusPerMonth30s || 2250}
              onChange={(e) => update('standardRatePerBusPerMonth30s', Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Maximum Buses Selectable</label>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.maxBuses}
              onChange={(e) => update('maxBuses', Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Maximum Campaign Duration (months)</label>
            <input
              type="number"
              min={1}
              max={24}
              value={settings.maxMonths}
              onChange={(e) => update('maxMonths', Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Quotation Validity (days)</label>
            <input
              type="number"
              min={1}
              value={settings.quotationValidityDays}
              onChange={(e) => update('quotationValidityDays', Number(e.target.value))}
              className="input-field"
            />
          </div>
        </div>

        {/* Tax */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <input
              id="taxEnabled"
              type="checkbox"
              checked={settings.taxEnabled}
              onChange={(e) => update('taxEnabled', e.target.checked)}
              className="w-4 h-4 accent-accent rounded"
            />
            <label htmlFor="taxEnabled" className="font-semibold text-primary-text text-sm">Enable Tax</label>
          </div>
          {settings.taxEnabled && (
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Tax Label</label>
                <input
                  type="text"
                  value={settings.taxLabel}
                  onChange={(e) => update('taxLabel', e.target.value)}
                  className="input-field"
                  placeholder="e.g. GST"
                />
              </div>
              <div>
                <label className="label">Tax Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={settings.taxRate}
                  onChange={(e) => update('taxRate', Number(e.target.value))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Tax Type</label>
                <div className="flex gap-3 mt-2">
                  {['Exclusive', 'Inclusive'].map((t) => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="taxInclusive"
                        checked={(t === 'Inclusive') === settings.taxInclusive}
                        onChange={() => update('taxInclusive', t === 'Inclusive')}
                        className="accent-accent"
                      />
                      <span className="text-sm text-primary-text">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revenue target */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-primary-text text-base">Revenue Target</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Target Amount (₹)</label>
            <input
              type="number"
              value={settings.revenueTarget}
              onChange={(e) => update('revenueTarget', Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Target Period Label</label>
            <input
              type="text"
              value={settings.revenueTargetPeriodLabel}
              onChange={(e) => update('revenueTargetPeriodLabel', e.target.value)}
              className="input-field"
              placeholder="e.g. Oct–Nov 2026"
            />
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="card p-6 space-y-4">
        <h2 className="font-bold text-primary-text text-base">Contact Information</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input type="email" value={settings.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="tel" value={settings.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input type="text" value={settings.contactAddress} onChange={(e) => update('contactAddress', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      {/* Package price reference tables (read-only, sourced from engine) */}
      <div className="card p-6 space-y-5">
        <h2 className="font-bold text-primary-text text-base">Package Price Reference</h2>
        <p className="text-secondary-text text-xs">
          These are the current approved package prices as defined in the pricing engine. Prices are for 30-second advertisements.
          To update these values, edit <code className="font-mono bg-gray-100 px-1 rounded">src/lib/pricingEngine.ts</code>.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-text mb-3">One-Month Package</h3>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-secondary-text font-semibold">Buses</th>
                    <th className="px-3 py-2 text-right text-xs text-secondary-text font-semibold">Package Price</th>
                    <th className="px-3 py-2 text-right text-xs text-secondary-text font-semibold">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(ONE_MONTH_PACKAGE_PRICES).map(([b, price]) => {
                    const buses = Number(b)
                    const standard = STANDARD_PRICE_PER_BUS_PER_MONTH_30S * buses
                    const savings = standard - price
                    const pct = savings > 0 ? ((savings / standard) * 100).toFixed(1) : '0'
                    return (
                      <tr key={b} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-semibold">{b}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-accent">{formatINR(price)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-success text-xs">{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-text mb-3">Two-Month Package</h3>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-secondary-text font-semibold">Buses</th>
                    <th className="px-3 py-2 text-right text-xs text-secondary-text font-semibold">Package Price</th>
                    <th className="px-3 py-2 text-right text-xs text-secondary-text font-semibold">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {Object.entries(TWO_MONTH_PACKAGE_PRICES).map(([b, price]) => {
                    const buses = Number(b)
                    const standard = STANDARD_PRICE_PER_BUS_PER_MONTH_30S * buses * 2
                    const savings = standard - price
                    const pct = savings > 0 ? ((savings / standard) * 100).toFixed(1) : '0'
                    return (
                      <tr key={b} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-semibold">{b}</td>
                        <td className="px-3 py-2 text-right tabular-nums font-semibold text-accent">{formatINR(price)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-success text-xs">{pct}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-text mb-3">Duration Discount Rules (3–12 months)</h3>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs text-secondary-text font-semibold">Campaign Duration</th>
                  <th className="px-3 py-2 text-right text-xs text-secondary-text font-semibold">Discount Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DURATION_DISCOUNT_RULES.map((r) => (
                  <tr key={r.minMonths} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {r.minMonths === r.maxMonths
                        ? `${r.minMonths} months`
                        : `${r.minMonths}–${r.maxMonths} months`}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-success font-semibold">{(r.discountRate * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setConfirmOpen(true)} className="btn-primary" disabled={saving}>
          {saving ? <LoadingSpinner size={15} /> : <Save size={15} />}
          Save Settings
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Save Pricing Settings"
        description="Apply these changes to the platform settings? Package price tables require a code update."
        confirmLabel="Save Settings"
        onConfirm={handleSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
