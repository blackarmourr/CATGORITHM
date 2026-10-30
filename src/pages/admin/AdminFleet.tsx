import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFleet, updateFleet } from '../../lib/dataStore'
import type { Fleet, BusRecord } from '../../types'
import {
  Bus, RefreshCw, Plus, Edit2, Trash2, MapPin, Navigation,
  CheckCircle, AlertCircle, X, Save, ArrowRight, Route as RouteIcon,
  Users, FileText, ArrowLeft, Eye
} from 'lucide-react'
import { LoadingSpinner, Badge } from '../../components/ui'
import toast from 'react-hot-toast'

export default function AdminFleet() {
  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modals
  const [editingBus, setEditingBus] = useState<BusRecord | null>(null)
  const [isAddMode, setIsAddMode] = useState(false)
  const [viewingRouteBus, setViewingRouteBus] = useState<BusRecord | null>(null)

  // Edit / Add form fields
  const [formBusName, setFormBusName] = useState('')
  const [formBusNumber, setFormBusNumber] = useState('')
  const [formRouteStart, setFormRouteStart] = useState('')
  const [formRouteEnd, setFormRouteEnd] = useState('')
  const [formIntermediateStops, setFormIntermediateStops] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formAvailable, setFormAvailable] = useState(true)

  async function load() {
    setLoading(true)
    const f = await getFleet()
    setFleet(f)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openEditModal(bus: BusRecord) {
    setIsAddMode(false)
    setEditingBus(bus)
    setFormBusName(bus.busName || bus.internalName || '')
    setFormBusNumber(bus.busNumber || '')
    setFormRouteStart(bus.routeStart || '')
    setFormRouteEnd(bus.routeEnd || '')
    setFormIntermediateStops(bus.intermediateStops || '')
    setFormNotes(bus.notes || '')
    setFormAvailable(bus.available ?? true)
  }

  function openAddModal() {
    setIsAddMode(true)
    const nextNum = (fleet?.buses.length ?? 0) + 1
    const newId = `BUS-${String(nextNum).padStart(3, '0')}`
    setEditingBus({
      id: newId,
      busNumber: `KL-02-XX-${Math.floor(1000 + Math.random() * 9000)}`,
      busName: '',
      routeStart: 'Kollam',
      routeEnd: '',
      intermediateStops: '',
      available: true,
      notes: '',
    })
    setFormBusName('')
    setFormBusNumber(`KL-02-XX-${Math.floor(1000 + Math.random() * 9000)}`)
    setFormRouteStart('Kollam')
    setFormRouteEnd('')
    setFormIntermediateStops('')
    setFormNotes('')
    setFormAvailable(true)
  }

  async function handleSaveBus(e: React.FormEvent) {
    e.preventDefault()
    if (!fleet || !editingBus) return

    if (!formBusName.trim()) {
      toast.error('Please enter the bus name')
      return
    }
    if (!formBusNumber.trim()) {
      toast.error('Please enter the bus number / registration')
      return
    }

    setSaving(true)
    try {
      const summaryRoute = formRouteStart && formRouteEnd
        ? `${formRouteStart.trim()} ➔ ${formRouteEnd.trim()}`
        : formRouteStart || formRouteEnd || 'Kollam Network'

      const updatedRecord: BusRecord = {
        ...editingBus,
        busName: formBusName.trim(),
        busNumber: formBusNumber.trim(),
        routeStart: formRouteStart.trim(),
        routeEnd: formRouteEnd.trim(),
        intermediateStops: formIntermediateStops.trim(),
        route: summaryRoute,
        internalName: formBusName.trim(),
        available: formAvailable,
        notes: formNotes.trim(),
      }

      let newBuses: BusRecord[]
      if (isAddMode) {
        newBuses = [...fleet.buses, updatedRecord]
      } else {
        newBuses = fleet.buses.map((b) => (b.id === editingBus.id ? updatedRecord : b))
      }

      const newFleet: Fleet = {
        totalBuses: newBuses.length,
        buses: newBuses,
      }

      await updateFleet(newFleet)
      setFleet(newFleet)
      setEditingBus(null)
      toast.success(isAddMode ? 'New bus added to fleet' : 'Bus details updated successfully')
    } catch {
      toast.error('Failed to save bus details')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteBus(busId: string) {
    if (!fleet) return
    if (!window.confirm('Are you sure you want to remove this bus from the fleet?')) return

    const newBuses = fleet.buses.filter((b) => b.id !== busId)
    const newFleet: Fleet = {
      totalBuses: newBuses.length,
      buses: newBuses,
    }

    try {
      await updateFleet(newFleet)
      setFleet(newFleet)
      toast.success('Bus removed from fleet')
    } catch {
      toast.error('Failed to delete bus')
    }
  }

  async function toggleAvailability(bus: BusRecord) {
    if (!fleet) return
    const updated = fleet.buses.map((b) =>
      b.id === bus.id ? { ...b, available: !b.available } : b
    )
    const newFleet: Fleet = { ...fleet, buses: updated }
    setFleet(newFleet)
    await updateFleet(newFleet)
    toast.success(`${bus.busName || bus.id} marked as ${!bus.available ? 'Available' : 'Unavailable'}`)
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
    <div className="space-y-4 max-w-6xl mx-auto pb-16">
      {/* ── Mobile-First Quick Nav Bar ── */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-gray-200 text-xs">
        <div className="flex items-center gap-1.5 flex-nowrap">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <ArrowLeft size={13} />
            <span>Calculator</span>
          </Link>
          <Link
            to="/admin/enquiries?tab=enquiries"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Users size={13} className="text-accent" />
            <span>Pipeline</span>
          </Link>
          <Link
            to="/admin/enquiries?tab=quotations"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <FileText size={13} className="text-amber-500" />
            <span>Quotes</span>
          </Link>
          <span className="px-3 py-1.5 rounded-lg bg-accent text-white font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs">
            <Bus size={13} />
            <span>Fleet Inventory</span>
          </span>
          <Link
            to="/admin/campaigns"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <RouteIcon size={13} className="text-purple-600" />
            <span>Campaigns</span>
          </Link>
        </div>
      </div>

      {/* ── Page Header & Actions ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary-text flex items-center gap-2">
            <Bus className="text-accent" size={24} />
            Fleet Inventory & Routes
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text mt-0.5">
            Manage your advertising bus fleet, vehicle numbers, route start & end points, and intermediate stops.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={load}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-accent hover:bg-blue-600 text-white flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus size={14} /> Add New Bus
          </button>
        </div>
      </div>

      {/* ── Fleet KPI Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="card p-3 text-center bg-white border border-border">
          <p className="text-xl sm:text-2xl font-black text-primary-text">{fleet.totalBuses}</p>
          <p className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider mt-0.5">Total Buses</p>
        </div>
        <div className="card p-3 text-center bg-white border border-border">
          <p className="text-xl sm:text-2xl font-black text-emerald-600">{availableCount}</p>
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-0.5">Available for Ads</p>
        </div>
        <div className="card p-3 text-center bg-white border border-border">
          <p className="text-xl sm:text-2xl font-black text-rose-600">{fleet.totalBuses - availableCount}</p>
          <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider mt-0.5">Under Maintenance</p>
        </div>
        <div className="card p-3 text-center bg-white border border-border">
          <p className="text-xl sm:text-2xl font-black text-accent">100%</p>
          <p className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider mt-0.5">Kollam Coverage</p>
        </div>
      </div>

      {/* ── Bus Fleet Cards (Mobile-Stacked, Responsive) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {fleet.buses.map((bus) => {
          const stopsArray = bus.intermediateStops
            ? bus.intermediateStops.split(',').map((s) => s.trim()).filter(Boolean)
            : []

          return (
            <div
              key={bus.id}
              className={`card p-4 bg-white border transition-all space-y-3 ${
                bus.available ? 'border-gray-200 hover:border-accent/40' : 'border-rose-200 bg-rose-50/20'
              }`}
            >
              {/* Header: Name, Plate, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      bus.available ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    <Bus size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 leading-tight">
                      {bus.busName || bus.internalName || 'Unnamed Bus'}
                    </h3>
                    <p className="text-xs font-mono font-bold text-accent mt-0.5">
                      {bus.busNumber || bus.id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAvailability(bus)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                    bus.available
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                  title="Click to toggle availability"
                >
                  {bus.available ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                  <span>{bus.available ? 'Available' : 'Unavailable'}</span>
                </button>
              </div>

              {/* Route: Start & End Points */}
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={13} className="text-emerald-600 flex-shrink-0" />
                    <span className="font-bold text-gray-800 truncate">
                      {bus.routeStart || 'Start Point'}
                    </span>
                  </div>
                  <ArrowRight size={13} className="text-gray-400 flex-shrink-0 mx-2" />
                  <div className="flex items-center gap-1.5 min-w-0 justify-end">
                    <MapPin size={13} className="text-rose-600 flex-shrink-0" />
                    <span className="font-bold text-gray-800 truncate">
                      {bus.routeEnd || 'End Point'}
                    </span>
                  </div>
                </div>

                {/* Intermediate Stops pill or summary */}
                {stopsArray.length > 0 && (
                  <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-600 flex items-baseline gap-1">
                    <span className="font-semibold text-gray-500 whitespace-nowrap">Stops ({stopsArray.length}):</span>
                    <span className="truncate text-gray-700">
                      {stopsArray.join(' · ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Notes (if any) */}
              {bus.notes && (
                <p className="text-[11px] text-gray-500 italic">
                  Note: {bus.notes}
                </p>
              )}

              {/* Actions Footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                {/* Show Route Button */}
                <button
                  type="button"
                  onClick={() => setViewingRouteBus(bus)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Eye size={13} className="text-accent" />
                  <span>View Route & Stops</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(bus)}
                    className="p-1.5 rounded-lg bg-blue-50 text-accent hover:bg-blue-100 transition-colors"
                    title="Edit Bus & Routes"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBus(bus.id)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    title="Delete Bus"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── MODAL 1: VIEW ROUTE & INTERMEDIATE STOPS ── */}
      {viewingRouteBus && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-border overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus size={18} className="text-accent" />
                <div>
                  <h3 className="font-extrabold text-sm">{viewingRouteBus.busName}</h3>
                  <p className="text-[11px] text-gray-400 font-mono">{viewingRouteBus.busNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingRouteBus(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Visual Route Journey */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Complete Transit Route & Stops
                </p>

                {/* Timeline Visualization */}
                <div className="space-y-3 relative pl-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {/* Origin / Start */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        Start Point (Origin)
                      </span>
                      <p className="font-black text-sm text-gray-900">
                        {viewingRouteBus.routeStart || 'Kollam Origin'}
                      </p>
                    </div>
                  </div>

                  {/* Intermediate Stops */}
                  {viewingRouteBus.intermediateStops ? (
                    viewingRouteBus.intermediateStops
                      .split(',')
                      .map((stop, idx) => (
                        <div key={idx} className="relative py-0.5">
                          <div className="absolute -left-[21px] top-2 w-2 h-2 rounded-full bg-accent" />
                          <div className="bg-gray-50 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-800 border border-gray-100 inline-block">
                            <span className="text-[10px] text-gray-400 mr-1.5">Stop {idx + 1}:</span>
                            {stop.trim()}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-xs text-gray-400 italic">No intermediate stops specified.</div>
                  )}

                  {/* Destination / End */}
                  <div className="relative pt-1">
                    <div className="absolute -left-6 top-2 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-xs" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                        End Point (Destination)
                      </span>
                      <p className="font-black text-sm text-gray-900">
                        {viewingRouteBus.routeEnd || 'Final Stop'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bus Specs Info Box */}
              <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 text-xs text-gray-700 space-y-1">
                <p>
                  <strong>Internal ID:</strong> {viewingRouteBus.id}
                </p>
                <p>
                  <strong>Current Status:</strong>{' '}
                  <span className={viewingRouteBus.available ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {viewingRouteBus.available ? 'Active & Available for Screen Advertising' : 'Currently Unavailable / Maintenance'}
                  </span>
                </p>
                {viewingRouteBus.notes && (
                  <p>
                    <strong>Commuter Notes:</strong> {viewingRouteBus.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingRouteBus(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-900 text-white hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ADD / EDIT BUS & ROUTE DETAILS ── */}
      {editingBus && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-border overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus size={18} className="text-accent" />
                <h3 className="font-extrabold text-sm">
                  {isAddMode ? 'Add New Bus to Fleet' : `Edit Bus: ${editingBus.busName || editingBus.id}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBus(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBus} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {/* Bus Name & Bus Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Bus Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBusName}
                    onChange={(e) => setFormBusName(e.target.value)}
                    placeholder="e.g. St. Antony Travels"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Bus Number / Plate *
                  </label>
                  <input
                    type="text"
                    required
                    value={formBusNumber}
                    onChange={(e) => setFormBusNumber(e.target.value)}
                    placeholder="e.g. KL-02-AB-1011"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold font-mono text-gray-900 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Route Start Point & Route End Point */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-600" />
                    Route Start Point *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRouteStart}
                    onChange={(e) => setFormRouteStart(e.target.value)}
                    placeholder="e.g. Kollam KSRTC / Chinnakada"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={12} className="text-rose-600" />
                    Route End Point *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRouteEnd}
                    onChange={(e) => setFormRouteEnd(e.target.value)}
                    placeholder="e.g. Karunagappally / Kottarakkara"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Intermediate Stops */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Intermediate Stops (Comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={formIntermediateStops}
                  onChange={(e) => setFormIntermediateStops(e.target.value)}
                  placeholder="e.g. Chinnakada, Ramankulangara, Neendakara, Chavara, Titanium, Sankaramangalam"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-accent"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Separate each stop with a comma. These will be displayed sequentially when advertisers view routes.
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Internal Notes / Commuter Profile
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Dense student & IT commuter belt"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-accent"
                />
              </div>

              {/* Availability Toggle */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-800">Inventory Status</p>
                  <p className="text-[11px] text-gray-500">Enable screen advertising slot booking for this bus</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBus(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold bg-accent hover:bg-blue-600 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>{saving ? 'Saving…' : isAddMode ? 'Create Bus' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
