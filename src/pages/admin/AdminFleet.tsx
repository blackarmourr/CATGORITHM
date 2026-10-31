import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getFleet, updateFleet, bookBusSlots, releaseBusSlot,
  bookFleetWideSlots, getBusSlotMetrics
} from '../../lib/dataStore'
import type { Fleet, BusRecord, SlotBooking } from '../../types'
import {
  Bus, RefreshCw, Plus, Edit2, Trash2, MapPin,
  CheckCircle, AlertCircle, X, Save, ArrowRight, Route as RouteIcon,
  Users, FileText, ArrowLeft, Eye, Clock, Calendar, Zap,
  Check, ChevronRight, Layers, Sparkles
} from 'lucide-react'
import { LoadingSpinner, Badge } from '../../components/ui'
import toast from 'react-hot-toast'
import { format, addMonths, addDays, differenceInDays } from 'date-fns'

export default function AdminFleet() {
  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modals state
  const [editingBus, setEditingBus] = useState<BusRecord | null>(null)
  const [isAddMode, setIsAddMode] = useState(false)
  const [viewingRouteBus, setViewingRouteBus] = useState<BusRecord | null>(null)
  const [managingSlotsBus, setManagingSlotsBus] = useState<BusRecord | null>(null)
  const [fleetBookingOpen, setFleetBookingOpen] = useState(false)

  // Edit / Add bus form fields
  const [formBusName, setFormBusName] = useState('')
  const [formBusNumber, setFormBusNumber] = useState('')
  const [formRouteStart, setFormRouteStart] = useState('')
  const [formRouteEnd, setFormRouteEnd] = useState('')
  const [formIntermediateStops, setFormIntermediateStops] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formAvailable, setFormAvailable] = useState(true)

  // Single-bus Slot booking form fields
  const [slotClientName, setSlotClientName] = useState('')
  const [slotCount, setSlotCount] = useState(1)
  const [slotStartDate, setSlotStartDate] = useState(new Date().toISOString().split('T')[0])
  const [slotEndDate, setSlotEndDate] = useState(
    format(addMonths(new Date(), 1), 'yyyy-MM-dd')
  )
  const [slotCampaignName, setSlotCampaignName] = useState('')
  const [slotNotes, setSlotNotes] = useState('')

  // Multi-bus / Fleet-wide slot booking form fields
  const [fleetClientName, setFleetClientName] = useState('')
  const [fleetSlotsPerBus, setFleetSlotsPerBus] = useState(1)
  const [fleetSelectedBusIds, setFleetSelectedBusIds] = useState<string[]>([])
  const [fleetStartDate, setFleetStartDate] = useState(new Date().toISOString().split('T')[0])
  const [fleetEndDate, setFleetEndDate] = useState(
    format(addMonths(new Date(), 1), 'yyyy-MM-dd')
  )
  const [fleetCampaignName, setFleetCampaignName] = useState('')
  const [fleetNotes, setFleetNotes] = useState('')

  async function load() {
    setLoading(true)
    const f = await getFleet()
    setFleet(f)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  // ── Bus Add / Edit Handlers ──
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
      totalSlots: 10,
      slotBookings: [],
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
        totalSlots: editingBus.totalSlots || 10,
        slotBookings: editingBus.slotBookings || [],
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

  // ── Single Bus Slot Booking Handlers ──
  function openSlotModal(bus: BusRecord) {
    setManagingSlotsBus(bus)
    const metrics = getBusSlotMetrics(bus)
    setSlotClientName('')
    setSlotCount(Math.min(metrics.availableSlots > 0 ? 1 : 0, metrics.availableSlots))
    setSlotStartDate(new Date().toISOString().split('T')[0])
    setSlotEndDate(format(addMonths(new Date(), 1), 'yyyy-MM-dd'))
    setSlotCampaignName('')
    setSlotNotes('')
  }

  async function handleBookSlotsForBus(e: React.FormEvent) {
    e.preventDefault()
    if (!managingSlotsBus) return

    if (!slotClientName.trim()) {
      toast.error('Please enter the client / advertiser name')
      return
    }

    const metrics = getBusSlotMetrics(managingSlotsBus)
    if (slotCount > metrics.availableSlots) {
      toast.error(`Only ${metrics.availableSlots} slot(s) available on this bus!`)
      return
    }

    setSaving(true)
    try {
      const updatedFleet = await bookBusSlots(managingSlotsBus.id, {
        clientName: slotClientName.trim(),
        slotsCount: Number(slotCount),
        videoDurationSeconds: 30,
        startDate: slotStartDate,
        endDate: slotEndDate,
        campaignName: slotCampaignName.trim() || undefined,
        notes: slotNotes.trim() || undefined,
      })

      setFleet(updatedFleet)
      const refreshedBus = updatedFleet.buses.find((b) => b.id === managingSlotsBus.id) || null
      setManagingSlotsBus(refreshedBus)
      toast.success(`Booked ${slotCount} slot(s) for ${slotClientName.trim()}!`)
      setSlotClientName('')
      setSlotCampaignName('')
      setSlotNotes('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to book slots')
    } finally {
      setSaving(false)
    }
  }

  async function handleReleaseSlot(bookingId: string) {
    if (!managingSlotsBus) return
    if (!window.confirm('Release and free up this advertising slot?')) return

    try {
      const updatedFleet = await releaseBusSlot(managingSlotsBus.id, bookingId)
      setFleet(updatedFleet)
      const refreshedBus = updatedFleet.buses.find((b) => b.id === managingSlotsBus.id) || null
      setManagingSlotsBus(refreshedBus)
      toast.success('Slot freed up successfully!')
    } catch {
      toast.error('Failed to release slot')
    }
  }

  // Quick End Date Presets
  function setQuickEndDate(months: number) {
    try {
      const start = slotStartDate ? new Date(slotStartDate) : new Date()
      setSlotEndDate(format(addMonths(start, months), 'yyyy-MM-dd'))
    } catch {
      setSlotEndDate(format(addMonths(new Date(), months), 'yyyy-MM-dd'))
    }
  }

  function setQuickFleetEndDate(months: number) {
    try {
      const start = fleetStartDate ? new Date(fleetStartDate) : new Date()
      setFleetEndDate(format(addMonths(start, months), 'yyyy-MM-dd'))
    } catch {
      setFleetEndDate(format(addMonths(new Date(), months), 'yyyy-MM-dd'))
    }
  }

  // ── Multi-Bus / Fleet-Wide Slot Booking Handlers ──
  function openFleetWideModal() {
    if (!fleet) return
    setFleetClientName('')
    setFleetSlotsPerBus(1)
    setFleetSelectedBusIds(fleet.buses.map((b) => b.id))
    setFleetStartDate(new Date().toISOString().split('T')[0])
    setFleetEndDate(format(addMonths(new Date(), 1), 'yyyy-MM-dd'))
    setFleetCampaignName('')
    setFleetNotes('')
    setFleetBookingOpen(true)
  }

  function toggleFleetBusSelection(id: string) {
    if (fleetSelectedBusIds.includes(id)) {
      setFleetSelectedBusIds(fleetSelectedBusIds.filter((bId) => bId !== id))
    } else {
      setFleetSelectedBusIds([...fleetSelectedBusIds, id])
    }
  }

  function selectAllFleetBuses() {
    if (!fleet) return
    if (fleetSelectedBusIds.length === fleet.buses.length) {
      setFleetSelectedBusIds([])
    } else {
      setFleetSelectedBusIds(fleet.buses.map((b) => b.id))
    }
  }

  async function handleBookFleetWide(e: React.FormEvent) {
    e.preventDefault()
    if (!fleet) return

    if (!fleetClientName.trim()) {
      toast.error('Please enter the client / advertiser name')
      return
    }
    if (fleetSelectedBusIds.length === 0) {
      toast.error('Please select at least 1 bus')
      return
    }

    setSaving(true)
    try {
      const updatedFleet = await bookFleetWideSlots(fleetSelectedBusIds, {
        clientName: fleetClientName.trim(),
        slotsCount: Number(fleetSlotsPerBus),
        videoDurationSeconds: 30,
        startDate: fleetStartDate,
        endDate: fleetEndDate,
        campaignName: fleetCampaignName.trim() || undefined,
        notes: fleetNotes.trim() || undefined,
      })

      setFleet(updatedFleet)
      setFleetBookingOpen(false)
      toast.success(
        `Successfully booked ${fleetSlotsPerBus} slot(s) across ${fleetSelectedBusIds.length} buses for ${fleetClientName}!`
      )
    } catch (err: any) {
      toast.error(err.message || 'Failed to book fleet slots')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size={28} />
      </div>
    )
  }

  if (!fleet) return null

  // ── Compute Fleet-Wide Slot Aggregate Metrics ──
  const totalFleetSlots = fleet.buses.reduce((sum, b) => sum + (b.totalSlots || 10), 0)
  const totalBookedSlots = fleet.buses.reduce(
    (sum, b) => sum + (b.slotBookings || []).reduce((s, x) => s + (x.slotsCount || 0), 0),
    0
  )
  const totalAvailableSlots = Math.max(0, totalFleetSlots - totalBookedSlots)
  const fleetUtilizationPercent = Math.min(100, Math.round((totalBookedSlots / totalFleetSlots) * 100))
  const availableBusesCount = fleet.buses.filter((b) => b.available).length

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
            <span>Fleet & Slots</span>
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
            Fleet Inventory & Slot Management
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text mt-0.5">
            100 Advertising Slots (10 buses × 10 slots of 30s each). Track filled slots, expiry dates, and real-time availability.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openFleetWideModal}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-accent to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Zap size={14} className="text-amber-300" />
            <span>Multi-Bus Slot Booking</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gray-900 hover:bg-black text-white flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus size={14} /> Add Bus
          </button>
          <button
            onClick={load}
            className="p-2 text-xs font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors"
            title="Refresh fleet data"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Fleet KPI Summary (4-Col Grid, 100-Slot Capacity Meter) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="card p-3 sm:p-4 bg-white border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">Fleet Capacity</span>
            <Bus size={14} className="text-gray-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-primary-text mt-1">{totalFleetSlots} Slots</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{fleet.totalBuses} Buses · 10 Slots / Bus</p>
        </div>

        <div className="card p-3 sm:p-4 bg-white border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">Booked Slots</span>
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-accent mt-1">{totalBookedSlots} Slots</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${fleetUtilizationPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-accent">{fleetUtilizationPercent}%</span>
          </div>
        </div>

        <div className="card p-3 sm:p-4 bg-white border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Available Slots</span>
            <CheckCircle size={14} className="text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{totalAvailableSlots} Slots</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Open for Instant Pitching</p>
        </div>

        <div className="card p-3 sm:p-4 bg-white border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Active Buses</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-primary-text mt-1">{availableBusesCount} / {fleet.totalBuses}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">100% Kollam Routes</p>
        </div>
      </div>

      {/* ── Bus Fleet Cards with Visual 10-Slot Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {fleet.buses.map((bus) => {
          const stopsArray = bus.intermediateStops
            ? bus.intermediateStops.split(',').map((s) => s.trim()).filter(Boolean)
            : []
          const metrics = getBusSlotMetrics(bus)

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
                  <span>{bus.available ? 'Active' : 'Maintenance'}</span>
                </button>
              </div>

              {/* Route: Start & End Points */}
              <div className="bg-gray-50 rounded-xl p-2.5 sm:p-3 border border-gray-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={13} className="text-emerald-600 flex-shrink-0" />
                    <span className="font-bold text-gray-800 truncate">
                      {bus.routeStart || 'Origin'}
                    </span>
                  </div>
                  <ArrowRight size={13} className="text-gray-400 flex-shrink-0 mx-2" />
                  <div className="flex items-center gap-1.5 min-w-0 justify-end">
                    <MapPin size={13} className="text-rose-600 flex-shrink-0" />
                    <span className="font-bold text-gray-800 truncate">
                      {bus.routeEnd || 'Destination'}
                    </span>
                  </div>
                </div>

                {stopsArray.length > 0 && (
                  <div className="pt-1.5 border-t border-gray-200 text-[11px] text-gray-600 flex items-baseline gap-1">
                    <span className="font-semibold text-gray-500 whitespace-nowrap">Stops ({stopsArray.length}):</span>
                    <span className="truncate text-gray-700">
                      {stopsArray.join(' · ')}
                    </span>
                  </div>
                )}
              </div>

              {/* ── 10-SLOT VISUAL INVENTORY & EXPIRY STATUS ── */}
              <div className="bg-blue-50/40 rounded-xl p-3 border border-blue-100/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Clock size={13} className="text-accent" />
                    Slot Status (10 × 30s)
                  </span>
                  <span className="font-extrabold text-xs">
                    <span className={metrics.bookedSlots > 0 ? 'text-accent' : 'text-gray-500'}>
                      {metrics.bookedSlots} Booked
                    </span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-emerald-700">{metrics.availableSlots} Available</span>
                  </span>
                </div>

                {/* 10-Slot Visual Grid (10 Pill Blocks) */}
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 10 }).map((_, slotIdx) => {
                    const isBooked = slotIdx < metrics.bookedSlots
                    return (
                      <div
                        key={slotIdx}
                        className={`h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
                          isBooked
                            ? 'bg-accent text-white shadow-xs'
                            : 'bg-emerald-100/70 text-emerald-800 border border-emerald-300/60'
                        }`}
                        title={
                          isBooked
                            ? `Slot ${slotIdx + 1}: Booked (30s)`
                            : `Slot ${slotIdx + 1}: Available (30s)`
                        }
                      >
                        {slotIdx + 1}
                      </div>
                    )
                  })}
                </div>

                {/* Expiry Notification */}
                <div className="pt-1.5 border-t border-blue-100/60 text-[11px] flex items-center justify-between gap-1 flex-wrap">
                  {metrics.nextFreesUpDate ? (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <span className="text-amber-600 font-bold">Slot Frees Up:</span>
                      <span className="font-extrabold text-gray-900">
                        {format(new Date(metrics.nextFreesUpDate), 'dd MMM yyyy')}
                      </span>
                      {metrics.nextFreesUpClient && (
                        <span className="text-gray-500 truncate max-w-[130px]">
                          ({metrics.nextFreesUpClient})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check size={12} /> All 10 slots currently free for pitching
                    </span>
                  )}

                  <span className="text-[10px] font-mono text-gray-500">
                    {metrics.occupancyPercent}% Occupancy
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openSlotModal(bus)}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  >
                    <Clock size={13} />
                    <span>Manage Slots ({metrics.bookedSlots}/10)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewingRouteBus(bus)}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Eye size={12} className="text-accent" />
                    <span>Route</span>
                  </button>
                </div>

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

      {/* ── MODAL 1: MANAGE SLOTS & BOOKINGS FOR INDIVIDUAL BUS ── */}
      {managingSlotsBus && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-border overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-accent" />
                <div>
                  <h3 className="font-extrabold text-sm">
                    Slot Management · {managingSlotsBus.busName}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-mono">
                    {managingSlotsBus.busNumber} · 10 Total Slots (30s each = 5 min loop)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManagingSlotsBus(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Bus Slot Capacity Overview */}
              {(() => {
                const metrics = getBusSlotMetrics(managingSlotsBus)
                return (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700">Capacity Meter</span>
                      <span className="font-extrabold text-gray-900">
                        {metrics.bookedSlots} / 10 Booked ·{' '}
                        <span className="text-emerald-700">{metrics.availableSlots} Slots Free</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-10 gap-1">
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const booked = idx < metrics.bookedSlots
                        return (
                          <div
                            key={idx}
                            className={`h-7 rounded flex items-center justify-center text-xs font-bold ${
                              booked ? 'bg-accent text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {idx + 1}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* ── Active Bookings on this Bus ── */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Current Slot Occupants</span>
                  <span className="text-[11px] text-gray-500 font-normal">
                    {managingSlotsBus.slotBookings?.length || 0} active client(s)
                  </span>
                </h4>

                {(!managingSlotsBus.slotBookings || managingSlotsBus.slotBookings.length === 0) ? (
                  <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                    No slots booked currently. All 10 slots are available for new campaigns.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {managingSlotsBus.slotBookings.map((b) => {
                      const daysLeft = differenceInDays(new Date(b.endDate), new Date())
                      const isExpired = daysLeft < 0

                      return (
                        <div
                          key={b.id}
                          className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-extrabold text-xs text-gray-900">{b.clientName}</p>
                              {b.campaignName && (
                                <p className="text-[11px] text-accent font-medium">{b.campaignName}</p>
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isExpired
                                  ? 'bg-rose-100 text-rose-700'
                                  : daysLeft <= 7
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isExpired ? 'Expired' : `${daysLeft} days left`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-gray-100">
                            <div>
                              <span className="font-bold text-gray-800">{b.slotsCount} Slot(s)</span>
                              <span className="text-gray-400 mx-1">·</span>
                              <span>{b.slotsCount * 30}s Loop Time</span>
                            </div>
                            <div className="text-right">
                              <span className="text-gray-500">Expires: </span>
                              <span className="font-bold text-gray-900">
                                {format(new Date(b.endDate), 'dd MMM yyyy')}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleReleaseSlot(b.id)}
                              className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={11} />
                              <span>Release Slot</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── Book New Slots on This Bus Form ── */}
              {(() => {
                const metrics = getBusSlotMetrics(managingSlotsBus)
                if (metrics.availableSlots === 0) {
                  return (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 font-semibold text-center">
                      All 10 slots on this bus are completely booked! Release a slot or wait for the next expiry ({format(new Date(metrics.nextFreesUpDate!), 'dd MMM yyyy')}).
                    </div>
                  )
                }

                return (
                  <form onSubmit={handleBookSlotsForBus} className="bg-blue-50/40 rounded-xl p-3 sm:p-4 border border-blue-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Plus size={14} className="text-accent" />
                      Book Slots on this Bus ({metrics.availableSlots} Available)
                    </h4>

                    {/* Client Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Client / Advertiser Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kalyan Silks"
                        value={slotClientName}
                        onChange={(e) => setSlotClientName(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                      />
                    </div>

                    {/* Slots Count & Campaign */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Slots Count (30s/slot) *
                        </label>
                        <select
                          value={slotCount}
                          onChange={(e) => setSlotCount(Number(e.target.value))}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-accent"
                        >
                          {Array.from({ length: metrics.availableSlots }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1} Slot{i > 0 ? 's' : ''} ({(i + 1) * 30}s)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Campaign Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Winter Fest"
                          value={slotCampaignName}
                          onChange={(e) => setSlotCampaignName(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    {/* Start Date & End Date */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={slotStartDate}
                          onChange={(e) => setSlotStartDate(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Expiry Date (End)
                        </label>
                        <input
                          type="date"
                          value={slotEndDate}
                          onChange={(e) => setSlotEndDate(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>

                    {/* Quick Presets for Duration */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase">Presets:</span>
                      {[1, 2, 3, 6, 12].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setQuickEndDate(m)}
                          className="px-2 py-0.5 rounded-md bg-white hover:bg-gray-100 text-[10px] font-bold border border-gray-300 text-gray-700 transition-colors"
                        >
                          +{m}Mo
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-2.5 rounded-xl bg-accent hover:bg-blue-600 text-white font-bold text-xs shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 mt-2"
                    >
                      <CheckCircle size={14} />
                      <span>{saving ? 'Booking Slots…' : `Confirm ${slotCount} Slot Booking`}</span>
                    </button>
                  </form>
                )
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setManagingSlotsBus(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-900 text-white hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: MULTI-BUS / FLEET-WIDE SLOT BOOKING ── */}
      {fleetBookingOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-border overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-sm">Multi-Bus Slot Allocation</h3>
                  <p className="text-[11px] text-gray-300">
                    Book slots across multiple buses or all 10 buses simultaneously
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFleetBookingOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleBookFleetWide} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Client / Advertiser Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malabar Gold & Diamonds"
                  value={fleetClientName}
                  onChange={(e) => setFleetClientName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Slots Per Bus *
                  </label>
                  <select
                    value={fleetSlotsPerBus}
                    onChange={(e) => setFleetSlotsPerBus(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-accent"
                  >
                    {[1, 2, 3, 4, 5, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} Slot{num > 1 ? 's' : ''} ({num * 30}s)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10-Bus Network Blast"
                    value={fleetCampaignName}
                    onChange={(e) => setFleetCampaignName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={fleetStartDate}
                    onChange={(e) => setFleetStartDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={fleetEndDate}
                    onChange={(e) => setFleetEndDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Presets:</span>
                {[1, 2, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setQuickFleetEndDate(m)}
                    className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-[10px] font-bold border border-gray-300 text-gray-700 transition-colors"
                  >
                    +{m}Mo
                  </button>
                ))}
              </div>

              {/* Select Buses List */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Target Buses ({fleetSelectedBusIds.length} Selected)
                  </label>
                  <button
                    type="button"
                    onClick={selectAllFleetBuses}
                    className="text-xs font-bold text-accent hover:underline"
                  >
                    {fleetSelectedBusIds.length === fleet.buses.length ? 'Deselect All' : 'Select All 10 Buses'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                  {fleet.buses.map((bus) => {
                    const metrics = getBusSlotMetrics(bus)
                    const isChecked = fleetSelectedBusIds.includes(bus.id)
                    return (
                      <label
                        key={bus.id}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-50 border-accent/60 text-accent font-bold'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFleetBusSelection(bus.id)}
                          className="rounded text-accent focus:ring-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-gray-900">{bus.busName}</p>
                          <p className="text-[10px] text-gray-500">
                            {metrics.availableSlots} free slots
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Summary of allocation */}
              <div className="bg-accent/10 rounded-xl p-3 border border-accent/20 text-xs text-gray-800 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Total Slots to Book:</span>
                  <span className="text-accent">{fleetSelectedBusIds.length * fleetSlotsPerBus} Slots</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[11px]">
                  <span>Buses Targeted:</span>
                  <span>{fleetSelectedBusIds.length} of {fleet.buses.length} Buses</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFleetBookingOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || fleetSelectedBusIds.length === 0}
                  className="px-4 py-2 text-xs font-bold bg-accent hover:bg-blue-600 text-white rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle size={14} />
                  <span>{saving ? 'Allocating…' : 'Confirm Fleet Booking'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: VIEW ROUTE & INTERMEDIATE STOPS ── */}
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

      {/* ── MODAL 4: ADD / EDIT BUS & ROUTE DETAILS ── */}
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
