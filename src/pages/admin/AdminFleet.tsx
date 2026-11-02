import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getFleet, updateFleet, bookBusAdvertisement, releaseBusAdvertisement,
  bookFleetWideAdvertisements, getBusTimeMetrics, checkBusAvailabilityForPeriod,
  BusTimeMetrics, TOTAL_LOOP_DURATION, PHYSICAL_AD_CAPACITY,
  RESERVED_BUFFER, BOOKABLE_CAPACITY, SONG_ENTERTAINMENT_DURATION,
  PASSENGER_ANNOUNCEMENT_DURATION
} from '../../lib/dataStore'
import { calculatePricing } from '../../lib/pricingEngine'
import type { Fleet, BusRecord, AdvertisementBooking } from '../../types'
import {
  Bus, RefreshCw, Plus, Edit2, Trash2, MapPin,
  CheckCircle, AlertCircle, X, Save, ArrowRight, Route as RouteIcon,
  Users, FileText, ArrowLeft, Eye, Clock, Calendar, Zap,
  Check, ChevronRight, Layers, Sparkles, AlertTriangle, ShieldAlert
} from 'lucide-react'
import { LoadingSpinner } from '../../components/ui'
import toast from 'react-hot-toast'
import { format, addDays, differenceInDays } from 'date-fns'

const MONTH_PRESETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const DURATION_PRESETS = [10, 15, 30, 45, 60]

export default function AdminFleet() {
  const [fleet, setFleet] = useState<Fleet | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modals state
  const [editingBus, setEditingBus] = useState<BusRecord | null>(null)
  const [isAddMode, setIsAddMode] = useState(false)
  const [viewingRouteBus, setViewingRouteBus] = useState<BusRecord | null>(null)
  const [managingBus, setManagingBus] = useState<BusRecord | null>(null)
  const [fleetBookingOpen, setFleetBookingOpen] = useState(false)

  // Edit / Add bus form fields
  const [formBusName, setFormBusName] = useState('')
  const [formBusNumber, setFormBusNumber] = useState('')
  const [formRouteStart, setFormRouteStart] = useState('')
  const [formRouteEnd, setFormRouteEnd] = useState('')
  const [formIntermediateStops, setFormIntermediateStops] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [formAvailable, setFormAvailable] = useState(true)

  // Single-bus Advertisement booking form fields
  const [adClientName, setAdClientName] = useState('')
  const [adDurationSeconds, setAdDurationSeconds] = useState<number>(30)
  const [adMonths, setAdMonths] = useState<number>(1)
  const [adStartDate, setAdStartDate] = useState(new Date().toISOString().split('T')[0])
  const [adEndDate, setAdEndDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
  const [adCampaignName, setAdCampaignName] = useState('')
  const [adNotes, setAdNotes] = useState('')

  // Multi-bus / Fleet-wide booking form fields
  const [fleetClientName, setFleetClientName] = useState('')
  const [fleetDurationSeconds, setFleetDurationSeconds] = useState<number>(30)
  const [fleetMonths, setFleetMonths] = useState<number>(1)
  const [fleetSelectedBusIds, setFleetSelectedBusIds] = useState<string[]>([])
  const [fleetStartDate, setFleetStartDate] = useState(new Date().toISOString().split('T')[0])
  const [fleetEndDate, setFleetEndDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
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
      routeStart: 'Kollam KSRTC',
      routeEnd: '',
      intermediateStops: '',
      available: true,
      physicalAdCapacity: 450,
      normalAdCapacity: 420,
      bufferAdCapacity: 30,
      advertisements: [],
      notes: '',
    })
    setFormBusName('')
    setFormBusNumber(`KL-02-XX-${Math.floor(1000 + Math.random() * 9000)}`)
    setFormRouteStart('Kollam KSRTC')
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
      toast.error('Please enter the bus registration number')
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
        physicalAdCapacity: editingBus.physicalAdCapacity || 450,
        normalAdCapacity: editingBus.normalAdCapacity || 420,
        bufferAdCapacity: editingBus.bufferAdCapacity || 30,
        advertisements: editingBus.advertisements || [],
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
    toast.success(`${bus.busName || bus.id} marked as ${!bus.available ? 'Active' : 'Maintenance'}`)
  }

  // ── Single Bus Advertisement Booking Handlers ──
  function openCapacityModal(bus: BusRecord) {
    setManagingBus(bus)
    setAdClientName('')
    setAdDurationSeconds(30)
    setAdMonths(1)
    const today = new Date().toISOString().split('T')[0]
    setAdStartDate(today)
    setAdEndDate(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
    setAdCampaignName('')
    setAdNotes('')
  }

  function handleSingleBusMonthsPreset(months: number) {
    setAdMonths(months)
    try {
      const start = adStartDate ? new Date(adStartDate) : new Date()
      setAdEndDate(format(addDays(start, months * 30), 'yyyy-MM-dd'))
    } catch {
      setAdEndDate(format(addDays(new Date(), months * 30), 'yyyy-MM-dd'))
    }
  }

  function handleSingleBusStartDateChange(dateStr: string) {
    setAdStartDate(dateStr)
    try {
      const start = dateStr ? new Date(dateStr) : new Date()
      setAdEndDate(format(addDays(start, adMonths * 30), 'yyyy-MM-dd'))
    } catch {
      // ignore
    }
  }

  async function handleBookAdvertisementForBus(e: React.FormEvent) {
    e.preventDefault()
    if (!managingBus) return

    if (!adClientName.trim()) {
      toast.error('Please enter the client / advertiser name')
      return
    }

    if (!adDurationSeconds || adDurationSeconds <= 0) {
      toast.error('Please enter a valid advertisement duration in seconds')
      return
    }

    const check = checkBusAvailabilityForPeriod(
      managingBus,
      adStartDate,
      adEndDate,
      Number(adDurationSeconds)
    )

    if (!check.isAvailable) {
      toast.error(check.reason || 'Requested duration exceeds maximum 450-second loop capacity!')
      return
    }

    setSaving(true)
    try {
      const pricing = calculatePricing({
        buses: 1,
        months: adMonths,
        videoDurationSeconds: adDurationSeconds,
      })

      const result = await bookBusAdvertisement(managingBus.id, {
        clientName: adClientName.trim(),
        durationSeconds: Number(adDurationSeconds),
        startDate: adStartDate,
        endDate: adEndDate,
        months: adMonths,
        campaignName: adCampaignName.trim() || undefined,
        calculatedPrice: pricing.packagePrice,
        pricingRate: `₹${pricing.packagePrice.toLocaleString('en-IN')} (${adMonths} Mo, ${adDurationSeconds}s)`,
        notes: adNotes.trim() || undefined,
      })

      setFleet(result.fleet)
      const refreshedBus = result.fleet.buses.find((b) => b.id === managingBus.id) || null
      setManagingBus(refreshedBus)

      if (result.usesBuffer) {
        toast.success(
          `Booked ${adDurationSeconds}s ad for ${adClientName.trim()}! (⚠️ Used ${result.bufferSecondsUsed}s of 30s buffer)`,
          { duration: 5000 }
        )
      } else {
        toast.success(`Booked ${adDurationSeconds}s advertisement for ${adClientName.trim()}!`)
      }

      setAdClientName('')
      setAdCampaignName('')
      setAdNotes('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to book advertisement')
    } finally {
      setSaving(false)
    }
  }

  async function handleReleaseAdvertisement(bookingId: string) {
    if (!managingBus) return
    if (!window.confirm('Release and free up this advertising time?')) return

    try {
      const updatedFleet = await releaseBusAdvertisement(managingBus.id, bookingId)
      setFleet(updatedFleet)
      const refreshedBus = updatedFleet.buses.find((b) => b.id === managingBus.id) || null
      setManagingBus(refreshedBus)
      toast.success('Advertising time freed up successfully!')
    } catch {
      toast.error('Failed to release advertisement')
    }
  }

  // ── Multi-Bus / Fleet-Wide Booking Handlers ──
  function openFleetWideModal() {
    if (!fleet) return
    setFleetClientName('')
    setFleetDurationSeconds(30)
    setFleetMonths(1)
    setFleetSelectedBusIds(fleet.buses.filter((b) => b.available).map((b) => b.id))
    const today = new Date().toISOString().split('T')[0]
    setFleetStartDate(today)
    setFleetEndDate(format(addDays(new Date(), 30), 'yyyy-MM-dd'))
    setFleetCampaignName('')
    setFleetNotes('')
    setFleetBookingOpen(true)
  }

  function handleFleetMonthsPreset(months: number) {
    setFleetMonths(months)
    try {
      const start = fleetStartDate ? new Date(fleetStartDate) : new Date()
      setFleetEndDate(format(addDays(start, months * 30), 'yyyy-MM-dd'))
    } catch {
      setFleetEndDate(format(addDays(new Date(), months * 30), 'yyyy-MM-dd'))
    }
  }

  function handleFleetStartDateChange(dateStr: string) {
    setFleetStartDate(dateStr)
    try {
      const start = dateStr ? new Date(dateStr) : new Date()
      setFleetEndDate(format(addDays(start, fleetMonths * 30), 'yyyy-MM-dd'))
    } catch {
      // ignore
    }
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
      const pricing = calculatePricing({
        buses: fleetSelectedBusIds.length,
        months: fleetMonths,
        videoDurationSeconds: fleetDurationSeconds,
      })

      const perBusPrice = Math.round(pricing.packagePrice / fleetSelectedBusIds.length)

      const updatedFleet = await bookFleetWideAdvertisements(fleetSelectedBusIds, {
        clientName: fleetClientName.trim(),
        durationSeconds: Number(fleetDurationSeconds),
        startDate: fleetStartDate,
        endDate: fleetEndDate,
        months: fleetMonths,
        campaignName: fleetCampaignName.trim() || undefined,
        calculatedPrice: perBusPrice,
        pricingRate: `₹${pricing.packagePrice.toLocaleString('en-IN')} total (${fleetSelectedBusIds.length} buses, ${fleetMonths} Mo, ${fleetDurationSeconds}s)`,
        notes: fleetNotes.trim() || undefined,
      })

      setFleet(updatedFleet)
      setFleetBookingOpen(false)
      toast.success(
        `Successfully booked ${fleetDurationSeconds}s ad across ${fleetSelectedBusIds.length} buses for ${fleetClientName}!`
      )
    } catch (err: any) {
      toast.error(err.message || 'Failed to book fleet advertisements')
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

  // ── Dynamic Fleet-Wide Capacity Calculations ──
  const activeBuses = fleet.buses.filter((b) => b.available)
  const activeBusesCount = activeBuses.length

  const fleetBookableCapacity = activeBusesCount * BOOKABLE_CAPACITY // 420s * activeBuses
  const fleetPhysicalCapacity = activeBusesCount * PHYSICAL_AD_CAPACITY // 450s * activeBuses
  const fleetBufferCapacity = activeBusesCount * RESERVED_BUFFER // 30s * activeBuses

  const totalBookedSeconds = activeBuses.reduce((sum, bus) => {
    const metrics = getBusTimeMetrics(bus)
    return sum + metrics.bookedAdTime
  }, 0)

  const totalAvailableSeconds = Math.max(0, fleetBookableCapacity - totalBookedSeconds)
  const fleetOccupancyPercent = fleetBookableCapacity > 0
    ? Math.min(100, Math.round((totalBookedSeconds / fleetBookableCapacity) * 100))
    : 0

  const busesUsingBuffer = activeBuses.filter((b) => getBusTimeMetrics(b).isBufferInUse)

  return (
    <div className="space-y-4 w-full max-w-full min-w-0 pb-16 overflow-x-hidden">
      {/* ── Mobile-First Quick Nav Bar ── */}
      <div className="w-full max-w-full overflow-x-auto no-scrollbar pb-1 border-b border-gray-200 text-xs flex-shrink-0">
        <div className="inline-flex items-center gap-1.5 whitespace-nowrap min-w-max">
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
            Time-Based Advertising Inventory
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text mt-0.5">
            12-minute loop (720s) · 420s Bookable Ad Time · 30s Emergency Buffer · Exact seconds allocation.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openFleetWideModal}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-accent to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <Zap size={14} className="text-amber-300" />
            <span>Multi-Bus Campaign Booking</span>
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

      {/* ── Loop Architecture Announcement Banner ── */}
      <div className="p-3 bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 rounded-2xl text-white shadow-xs border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0 text-amber-300">
            <Clock size={16} />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2 flex-wrap">
              <span>Standard 12-Minute Loop Configuration (720 Seconds)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                Dynamic Fleet Capacity Active
              </span>
            </div>
            <p className="text-[11px] text-gray-300 mt-0.5">
              450s Total Ad Capacity (420s Normal Bookable + 30s Buffer) · 180s Entertainment · 90s Announcements
            </p>
          </div>
        </div>
        {busesUsingBuffer.length > 0 && (
          <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap">
            <AlertTriangle size={13} />
            <span>{busesUsingBuffer.length} Bus utilizing Emergency Buffer</span>
          </div>
        )}
      </div>

      {/* ── Fleet KPI Summary (4-Col Grid, Dynamic Seconds Meter) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="card p-3 sm:p-4 bg-white border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">Bookable Ad Time</span>
            <Clock size={14} className="text-gray-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-primary-text mt-1">
            {fleetBookableCapacity}s
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {activeBusesCount} Buses × 420s/loop ({fleetPhysicalCapacity}s physical)
          </p>
        </div>

        <div className="card p-3 sm:p-4 bg-white border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">Booked Ad Time</span>
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-accent mt-1">
            {totalBookedSeconds}s
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${fleetOccupancyPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-accent">{fleetOccupancyPercent}%</span>
          </div>
        </div>

        <div className="card p-3 sm:p-4 bg-white border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Available Time</span>
            <CheckCircle size={14} className="text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {totalAvailableSeconds}s
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
            +{fleetBufferCapacity}s Reserved Buffer
          </p>
        </div>

        <div className="card p-3 sm:p-4 bg-white border border-border shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Active Fleet</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-primary-text mt-1">
            {activeBusesCount} / {fleet.totalBuses}
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">Active Screen Routes</p>
        </div>
      </div>

      {/* ── Bus Fleet Cards with Dual-Segment Progress Bar (0-420s Normal + 420-450s Buffer) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {fleet.buses.map((bus) => {
          const stopsArray = bus.intermediateStops
            ? bus.intermediateStops.split(',').map((s) => s.trim()).filter(Boolean)
            : []
          const metrics = getBusTimeMetrics(bus)

          // Normal progress % (capped at 100% of 420s)
          const normalFilledPercent = Math.min(100, Math.round((metrics.bookedAdTime / 420) * 100))
          // Buffer progress % (of 30s)
          const bufferFilledPercent = metrics.isBufferInUse
            ? Math.min(100, Math.round((metrics.bufferTimeUsed / 30) * 100))
            : 0

          return (
            <div
              key={bus.id}
              className={`card p-4 bg-white border transition-all space-y-3 ${
                bus.available
                  ? metrics.isBufferInUse
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-gray-200 hover:border-accent/40'
                  : 'border-rose-200 bg-rose-50/20'
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

                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {metrics.isBufferInUse && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-xs animate-pulse">
                      <AlertTriangle size={10} />
                      <span>BUFFER IN USE ({metrics.bufferTimeUsed}s)</span>
                    </span>
                  )}
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

              {/* ── TIME-BASED ADVERTISING INVENTORY METER ── */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Clock size={13} className="text-accent" />
                    Loop Advertising Capacity
                  </span>
                  <span className="font-extrabold text-xs">
                    <span className={metrics.bookedAdTime > 0 ? 'text-accent' : 'text-gray-500'}>
                      {metrics.bookedAdTime}s Booked
                    </span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-emerald-700">{metrics.availableAdTime}s Available</span>
                  </span>
                </div>

                {/* Dual-Segment Progress Bar: 420s Normal (93.3%) + 30s Buffer (6.7%) */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 h-3 rounded-md bg-gray-200 p-0.5 overflow-hidden">
                    {/* Normal 420s segment (width 93.3% of 450s) */}
                    <div className="h-full rounded-xs bg-gray-100 flex-1 relative overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-xs transition-all duration-500"
                        style={{ width: `${normalFilledPercent}%` }}
                      />
                    </div>
                    {/* 30s Buffer segment (width 6.7% of 450s) */}
                    <div
                      className={`h-full w-7 rounded-xs flex items-center justify-center transition-all ${
                        metrics.isBufferInUse
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-amber-100 border border-amber-300'
                      }`}
                      title={metrics.isBufferInUse ? `Buffer In Use: ${metrics.bufferTimeUsed}s of 30s` : 'Emergency 30s Buffer (Reserved)'}
                    />
                  </div>

                  {/* Dual bar sub-labels */}
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
                    <span>0s</span>
                    <span className="font-bold text-gray-700">420s Normal Bookable</span>
                    <span className="text-amber-700 font-bold">450s Max (+30s Buffer)</span>
                  </div>
                </div>

                {/* Expiry Notification */}
                <div className="pt-1.5 border-t border-slate-200 text-[11px] flex items-center justify-between gap-1 flex-wrap">
                  {metrics.nextFreesUpDate ? (
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <span className="text-amber-600 font-bold">Slot Frees Up:</span>
                      <span className="font-extrabold text-gray-900">
                        {format(new Date(metrics.nextFreesUpDate), 'dd MMM yyyy')}
                      </span>
                      {metrics.nextFreesUpClient && (
                        <span className="text-gray-500 truncate max-w-[130px]">
                          ({metrics.nextFreesUpClient} · {metrics.nextFreesUpDuration}s)
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check size={12} /> Full 420s loop available for booking
                    </span>
                  )}

                  <span className="text-[10px] font-mono font-bold text-gray-600">
                    {metrics.occupancyPercent}% Occupancy
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openCapacityModal(bus)}
                    className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
                  >
                    <Clock size={13} />
                    <span>Advertising Capacity ({metrics.bookedAdTime}s / 420s)</span>
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

      {/* ── MODAL 1: ADVERTISING CAPACITY & BOOKING FOR INDIVIDUAL BUS ── */}
      {managingBus && (() => {
        const busMetrics = getBusTimeMetrics(managingBus)
        const check = checkBusAvailabilityForPeriod(
          managingBus,
          adStartDate,
          adEndDate,
          Number(adDurationSeconds) || 0
        )
        const singleBusPricing = calculatePricing({
          buses: 1,
          months: adMonths,
          videoDurationSeconds: Number(adDurationSeconds) || 30,
        })

        const activeAds = managingBus.advertisements || []

        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-border overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock size={20} className="text-accent" />
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base">
                      Advertising Capacity — {managingBus.busName}
                    </h3>
                    <p className="text-[11px] text-gray-300 font-mono">
                      {managingBus.busNumber} · 12-Min Loop (720s) · 450s Ad Capacity (420s Normal + 30s Buffer)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setManagingBus(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-4 max-h-[78vh] overflow-y-auto">
                {/* 12-Minute Loop Architecture Summary */}
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700">Loop Distribution Breakdown (720s Total)</span>
                    <span className="font-extrabold text-accent">
                      {busMetrics.bookedAdTime}s / 420s Booked
                    </span>
                  </div>

                  {/* 12-Min Loop Proportional Bar */}
                  <div className="h-4 rounded-lg bg-gray-200 overflow-hidden flex text-[10px] font-bold text-white shadow-inner">
                    {/* Normal Booked Ads */}
                    <div
                      className="bg-accent h-full flex items-center justify-center truncate px-1 transition-all"
                      style={{ width: `${(Math.min(busMetrics.bookedAdTime, 420) / 720) * 100}%` }}
                      title={`Booked Ads: ${Math.min(busMetrics.bookedAdTime, 420)}s`}
                    >
                      {busMetrics.bookedAdTime > 30 ? `${busMetrics.bookedAdTime}s Ads` : ''}
                    </div>
                    {/* Free Bookable Space */}
                    <div
                      className="bg-emerald-100 text-emerald-800 h-full flex items-center justify-center truncate px-1 transition-all"
                      style={{ width: `${(busMetrics.availableAdTime / 720) * 100}%` }}
                      title={`Available Bookable Space: ${busMetrics.availableAdTime}s`}
                    >
                      {busMetrics.availableAdTime > 40 ? `${busMetrics.availableAdTime}s Free` : ''}
                    </div>
                    {/* 30s Emergency Buffer */}
                    <div
                      className={`h-full flex items-center justify-center truncate px-1 ${
                        busMetrics.isBufferInUse ? 'bg-amber-500 text-white animate-pulse' : 'bg-amber-200 text-amber-900'
                      }`}
                      style={{ width: `${(30 / 720) * 100}%` }}
                      title={`Emergency Buffer: ${busMetrics.bufferTimeUsed}/30s in use`}
                    >
                      30s
                    </div>
                    {/* Song / Entertainment 180s */}
                    <div
                      className="bg-slate-400 text-white h-full flex items-center justify-center truncate px-1"
                      style={{ width: `${(180 / 720) * 100}%` }}
                      title="Song / Entertainment Segment (180s)"
                    >
                      Song 180s
                    </div>
                    {/* Passenger Announcements 90s */}
                    <div
                      className="bg-purple-300 text-purple-900 h-full flex items-center justify-center truncate px-1"
                      style={{ width: `${(90 / 720) * 100}%` }}
                      title="Passenger Announcements (90s)"
                    >
                      PAS 90s
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 flex-wrap gap-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                      Booked Ads: {busMetrics.bookedAdTime}s
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Available: {busMetrics.availableAdTime}s
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-amber-700">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      Buffer: {busMetrics.bufferTimeUsed}/30s
                    </span>
                  </div>
                </div>

                {/* ── Active Advertisements on this Bus ── */}
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Active Advertisements ({activeAds.length})</span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      Sum: {busMetrics.bookedAdTime}s
                    </span>
                  </h4>

                  {activeAds.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                      No advertisements active on this bus loop. Full 420s available for booking.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeAds.map((ad) => {
                        const daysLeft = differenceInDays(new Date(ad.endDate), new Date())
                        const isExpired = daysLeft < 0

                        return (
                          <div
                            key={ad.id}
                            className={`p-3 rounded-xl bg-white border shadow-xs space-y-1.5 transition-all ${
                              ad.usesBuffer ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-extrabold text-xs text-gray-900">{ad.clientName}</p>
                                  {ad.usesBuffer && (
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                                      BUFFER ({ad.bufferSecondsUsed}s)
                                    </span>
                                  )}
                                </div>
                                {ad.campaignName && (
                                  <p className="text-[11px] text-accent font-medium">{ad.campaignName}</p>
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
                                <span className="font-bold text-gray-900">{ad.durationSeconds} Seconds</span>
                                <span className="text-gray-400 mx-1">·</span>
                                <span>{format(new Date(ad.startDate), 'dd MMM')} to {format(new Date(ad.endDate), 'dd MMM yyyy')}</span>
                              </div>
                              {ad.calculatedPrice && (
                                <span className="font-mono font-bold text-gray-800">
                                  ₹{ad.calculatedPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => handleReleaseAdvertisement(ad.id)}
                                className="px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Trash2 size={11} />
                                <span>Release Time</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ── Book New Advertisement on this Bus ── */}
                <form
                  onSubmit={handleBookAdvertisementForBus}
                  className="bg-blue-50/40 rounded-xl p-3.5 sm:p-4 border border-blue-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Plus size={14} className="text-accent" />
                      Book Advertisement on this Bus
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {busMetrics.availableAdTime}s Free in Loop
                    </span>
                  </div>

                  {/* Client Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Client / Advertiser Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Malabar Gold & Diamonds"
                      value={adClientName}
                      onChange={(e) => setAdClientName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Advertisement Duration (Seconds) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-gray-700">
                        Advertisement Duration (Seconds) *
                      </label>
                      <span className="text-[10px] text-gray-500 font-medium">Exact video length</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {DURATION_PRESETS.map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setAdDurationSeconds(dur)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            adDurationSeconds === dur
                              ? 'bg-accent text-white border-accent shadow-xs'
                              : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          {dur}s
                        </button>
                      ))}

                      <div className="flex items-center gap-1 min-w-[100px] flex-1">
                        <input
                          type="number"
                          min={5}
                          max={450}
                          value={adDurationSeconds}
                          onChange={(e) => setAdDurationSeconds(Number(e.target.value))}
                          placeholder="Custom"
                          className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-900 focus:outline-none focus:border-accent text-center"
                        />
                        <span className="text-xs font-bold text-gray-600">sec</span>
                      </div>
                    </div>
                  </div>

                  {/* Campaign Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Campaign Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Festival Spotlight"
                      value={adCampaignName}
                      onChange={(e) => setAdCampaignName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Duration in Months (1–12 selector) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-gray-700">
                        Duration in Months (1–12) *
                      </label>
                      <span className="text-[11px] font-extrabold text-accent">
                        {adMonths} Month{adMonths > 1 ? 's' : ''} ({adMonths * 30} Days)
                      </span>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                      {MONTH_PRESETS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleSingleBusMonthsPreset(m)}
                          className={`py-1.5 text-xs font-extrabold rounded-lg border transition-all text-center ${
                            adMonths === m
                              ? 'bg-accent text-white border-accent shadow-xs'
                              : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          {m}M
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Date & Auto-calculated End Date */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={adStartDate}
                        onChange={(e) => handleSingleBusStartDateChange(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        Expiry Date (Auto-computed)
                      </label>
                      <input
                        type="date"
                        value={adEndDate}
                        onChange={(e) => setAdEndDate(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* ── Real-Time Commercial Price & Capacity Preview ── */}
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-semibold">Commercial Campaign Tariff:</span>
                      <div className="text-right">
                        <span className="text-base font-black text-gray-900">
                          ₹{singleBusPricing.packagePrice.toLocaleString('en-IN')}
                        </span>
                        {singleBusPricing.savings > 0 && (
                          <span className="text-[10px] text-emerald-700 font-bold ml-1.5">
                            (Save ₹{singleBusPricing.savings.toLocaleString('en-IN')})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-gray-100 text-[11px] flex items-center justify-between">
                      <span className="text-gray-500">Effective Rate:</span>
                      <span className="font-mono font-bold text-gray-700">
                        ₹{singleBusPricing.pricePerSecondBusMonth.toFixed(2)}/sec/month ({adDurationSeconds}s loop display)
                      </span>
                    </div>

                    {/* Capacity Check Preview Banner */}
                    <div className="pt-1">
                      {check.isAvailable ? (
                        check.canUseBuffer ? (
                          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-start gap-1.5">
                            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p>⚠️ AUTOMATIC BUFFER ALLOCATION</p>
                              <p className="font-normal text-[11px] text-amber-800 mt-0.5">
                                This booking requires {check.bufferRequired}s of the 30-second emergency buffer. The system will automatically allocate it and display BUFFER IN USE.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                            <span>Fits normally within bookable capacity ({busMetrics.availableAdTime}s free)</span>
                          </div>
                        )
                      ) : (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-start gap-1.5">
                          <ShieldAlert size={15} className="text-rose-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p>❌ CAPACITY REJECTED (Max 450s Loop Limit)</p>
                            <p className="font-normal text-[11px] text-rose-800 mt-0.5">
                              Shortage by {check.shortageSeconds} seconds. Please reduce ad duration or choose another date.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !check.isAvailable}
                    className="w-full py-2.5 rounded-xl bg-accent hover:bg-blue-600 text-white font-bold text-xs shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={14} />
                    <span>
                      {saving
                        ? 'Booking Advertisement…'
                        : check.canUseBuffer
                        ? `Confirm ${adDurationSeconds}s Ad (With Buffer Usage)`
                        : `Confirm ${adDurationSeconds}s Advertisement Booking`}
                    </span>
                  </button>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setManagingBus(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-gray-900 text-white hover:bg-black transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── MODAL 2: MULTI-BUS / FLEET-WIDE CAMPAIGN ALLOCATION ── */}
      {fleetBookingOpen && (() => {
        const fleetPricing = calculatePricing({
          buses: fleetSelectedBusIds.length,
          months: fleetMonths,
          videoDurationSeconds: fleetDurationSeconds,
        })

        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-border overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-amber-400" />
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base">Multi-Bus Campaign Booking</h3>
                    <p className="text-[11px] text-gray-300">
                      Book time-based advertisements across multiple buses or the entire fleet
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
              <form onSubmit={handleBookFleetWide} className="p-4 sm:p-5 space-y-3.5 max-h-[78vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Client / Advertiser Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kalyan Silks"
                    value={fleetClientName}
                    onChange={(e) => setFleetClientName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Duration in Seconds */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Ad Duration (Seconds) *
                    </label>
                    <div className="flex items-center gap-1">
                      {DURATION_PRESETS.map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setFleetDurationSeconds(dur)}
                          className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all ${
                            fleetDurationSeconds === dur
                              ? 'bg-accent text-white border-accent'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {dur}s
                        </button>
                      ))}
                      <input
                        type="number"
                        min={5}
                        max={450}
                        value={fleetDurationSeconds}
                        onChange={(e) => setFleetDurationSeconds(Number(e.target.value))}
                        className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-bold text-gray-900 text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Campaign Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Winter Network Blast"
                      value={fleetCampaignName}
                      onChange={(e) => setFleetCampaignName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Duration in Months (1–12 selector) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Duration in Months (1–12) *
                    </label>
                    <span className="text-[11px] font-extrabold text-accent">
                      {fleetMonths} Month{fleetMonths > 1 ? 's' : ''} ({fleetMonths * 30} Days)
                    </span>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                    {MONTH_PRESETS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleFleetMonthsPreset(m)}
                        className={`py-1.5 text-xs font-extrabold rounded-lg border transition-all text-center ${
                          fleetMonths === m
                            ? 'bg-accent text-white border-accent shadow-xs'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        {m}M
                      </button>
                    ))}
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
                      onChange={(e) => handleFleetStartDateChange(e.target.value)}
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
                      {fleetSelectedBusIds.length === fleet.buses.length ? 'Deselect All' : `Select All ${fleet.buses.length} Buses`}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
                    {fleet.buses.map((bus) => {
                      const metrics = getBusTimeMetrics(bus)
                      const isChecked = fleetSelectedBusIds.includes(bus.id)
                      const check = checkBusAvailabilityForPeriod(bus, fleetStartDate, fleetEndDate, fleetDurationSeconds)

                      return (
                        <label
                          key={bus.id}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-blue-50 border-accent/60 text-accent font-bold'
                              : 'bg-white border-gray-200 text-gray-700'
                          } ${!check.isAvailable ? 'opacity-60 bg-rose-50/40' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFleetBusSelection(bus.id)}
                            className="rounded text-accent focus:ring-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-gray-900">{bus.busName}</p>
                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                              <span>{metrics.availableAdTime}s free</span>
                              {check.canUseBuffer && (
                                <span className="text-amber-600 font-bold">⚠️ Uses Buffer</span>
                              )}
                              {!check.isAvailable && (
                                <span className="text-rose-600 font-bold">❌ Loop Full</span>
                              )}
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Summary & Live Price Calculation */}
                <div className="bg-accent/10 rounded-xl p-3 border border-accent/20 text-xs text-gray-800 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700">Total Campaign Tariff:</span>
                    <span className="text-base font-black text-accent">
                      ₹{fleetPricing.packagePrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>Buses Targeted:</span>
                    <span className="font-bold">{fleetSelectedBusIds.length} Buses ({fleetDurationSeconds}s each)</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-[11px]">
                    <span>Standard Reference:</span>
                    <span>₹{fleetPricing.standardPrice.toLocaleString('en-IN')} (Save ₹{fleetPricing.savings.toLocaleString('en-IN')})</span>
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
                    <span>{saving ? 'Allocating…' : `Confirm ${fleetSelectedBusIds.length}-Bus Booking`}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      })()}

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