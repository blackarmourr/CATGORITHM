import { useEffect, useState } from 'react'
import { getFleet, updateFleet } from '../../lib/dataStore'
import type { Fleet, BusRecord } from '../../types'
import { Bus, RefreshCw, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { LoadingSpinner } from '../../components/ui'
import toast from 'react-hot-toast'

export default function AdminFleet() {
  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  async function load() {
    setLoading(true)
    const f = await getFleet()
    setFleet(f)
    setDirty(false)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function updateBus(busNumber: number, updates: Partial<BusRecord>) {
    if (!fleet) return
    const buses = fleet.buses.map((b) =>
      b.busNumber === busNumber ? { ...b, ...updates } : b
    )
    setFleet({ ...fleet, buses })
    setDirty(true)
  }

  async function handleSave() {
    if (!fleet) return
    setSaving(true)
    await updateFleet(fleet)
    setDirty(false)
    setSaving(false)
    toast.success('Fleet configuration saved.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={28} />
      </div>
    )
  }

  if (!fleet) return null

  const availableCount = fleet.buses.filter((b) => b.available).length

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary-text">Fleet Management</h1>
          <p className="text-secondary-text text-sm">
            {availableCount} of {fleet.totalBuses} buses available for booking.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          {dirty && (
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
              {saving ? <LoadingSpinner size={15} /> : <Save size={15} />}
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-primary-text">{fleet.totalBuses}</p>
          <p className="text-xs text-secondary-text mt-1">Total Fleet</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-success">{availableCount}</p>
          <p className="text-xs text-secondary-text mt-1">Available</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-black text-red-500">{fleet.totalBuses - availableCount}</p>
          <p className="text-xs text-secondary-text mt-1">Unavailable</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Bus size={16} className="text-accent" />
          <h2 className="font-bold text-primary-text text-sm">Bus Inventory</h2>
        </div>
        <div className="divide-y divide-border">
          {fleet.buses.map((bus) => (
            <div key={bus.id} className={`p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${!bus.available ? 'bg-red-50/30' : ''}`}>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bus.available ? 'bg-green-50' : 'bg-red-50'}`}>
                  <Bus size={16} className={bus.available ? 'text-success' : 'text-red-500'} />
                </div>
                <div>
                  <p className="font-bold text-primary-text text-sm">{bus.id}</p>
                  <p className="text-xs text-secondary-text">Bus #{bus.busNumber}</p>
                </div>
              </div>

              <div className="flex-1 grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Display name"
                  value={bus.internalName}
                  onChange={(e) => updateBus(bus.busNumber, { internalName: e.target.value })}
                  className="input-field text-sm py-2"
                />
                <input
                  type="text"
                  placeholder="Route (optional)"
                  value={bus.route}
                  onChange={(e) => updateBus(bus.busNumber, { route: e.target.value })}
                  className="input-field text-sm py-2"
                />
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={bus.notes}
                  onChange={(e) => updateBus(bus.busNumber, { notes: e.target.value })}
                  className="input-field text-sm py-2"
                />
              </div>

              {/* Available toggle */}
              <button
                onClick={() => updateBus(bus.busNumber, { available: !bus.available })}
                aria-label={bus.available ? 'Mark as unavailable' : 'Mark as available'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                  bus.available
                    ? 'bg-green-50 text-success border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-red-50 text-red-600 border border-red-200 hover:bg-green-50 hover:text-success hover:border-green-200'
                }`}
              >
                {bus.available ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                {bus.available ? 'Available' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {dirty && (
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <LoadingSpinner size={15} /> : <Save size={15} />}
            Save Fleet Changes
          </button>
        </div>
      )}
    </div>
  )
}
