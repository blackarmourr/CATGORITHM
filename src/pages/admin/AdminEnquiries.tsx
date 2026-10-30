import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getEnquiries, getQuotations, updateEnquiryStatus, deleteQuotation, deleteEnquiry } from '../../lib/dataStore'
import { generateQuotationPDF } from '../../lib/pdfGenerator'
import type { Enquiry, EnquiryStatus, Quotation } from '../../types'
import { formatINR } from '../../lib/pricingEngine'
import { Badge, EmptyState } from '../../components/ui'
import {
  Users, Search, RefreshCw, ChevronDown, X, FileText, Download,
  Phone, MessageSquare, ArrowLeft, Filter, Sparkles, Calendar,
  TrendingUp, CheckCircle, Clock, Tag, Trash2, Bus
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_OPTIONS: EnquiryStatus[] = [
  'New', 'Contacted', 'Quotation Sent', 'Negotiation', 'Confirmed', 'Rejected', 'Completed'
]

const STATUS_VARIANT: Record<EnquiryStatus, 'default' | 'success' | 'warning' | 'error' | 'accent'> = {
  New: 'accent',
  Contacted: 'default',
  'Quotation Sent': 'default',
  Negotiation: 'warning',
  Confirmed: 'success',
  Rejected: 'error',
  Completed: 'success',
}

export default function AdminEnquiries() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'quotations' ? 'quotations' : 'enquiries'

  const [activeTab, setActiveTab] = useState<'enquiries' | 'quotations'>(initialTab)
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'All'>('All')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date')
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [newStatus, setNewStatus] = useState<EnquiryStatus>('New')
  const [statusNote, setStatusNote] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const [eData, qData] = await Promise.all([getEnquiries(), getQuotations()])
    setEnquiries(eData)
    setQuotations(qData)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  // Sync tab with URL
  function handleTabChange(tab: 'enquiries' | 'quotations') {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  // Filter & Sort Enquiries
  const filteredEnquiries = enquiries
    .filter((e) => {
      const q = search.toLowerCase()
      const matchSearch =
        !search ||
        e.customerDetails.businessName?.toLowerCase().includes(q) ||
        e.customerDetails.contactName?.toLowerCase().includes(q) ||
        e.customerDetails.phone?.includes(search) ||
        e.id?.toLowerCase().includes(q) ||
        e.campaignName?.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || e.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      if (sortBy === 'amount') {
        const valA = a.negotiatedPrice ?? a.pricingSnapshot?.packagePrice ?? 0
        const valB = b.negotiatedPrice ?? b.pricingSnapshot?.packagePrice ?? 0
        return valB - valA
      }
      if (sortBy === 'name') {
        return (a.customerDetails.businessName || '').localeCompare(b.customerDetails.businessName || '')
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  // Filter & Sort Quotations
  const filteredQuotations = quotations
    .filter((q) => {
      const query = search.toLowerCase()
      return (
        !search ||
        q.customerDetails.businessName?.toLowerCase().includes(query) ||
        q.customerDetails.contactName?.toLowerCase().includes(query) ||
        q.customerDetails.phone?.includes(search) ||
        q.id?.toLowerCase().includes(query) ||
        q.campaignName?.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === 'amount') {
        return (b.pricingSnapshot?.packagePrice ?? 0) - (a.pricingSnapshot?.packagePrice ?? 0)
      }
      if (sortBy === 'name') {
        return (a.customerDetails.businessName || '').localeCompare(b.customerDetails.businessName || '')
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  // Metrics
  const totalPipelineValue = enquiries.reduce(
    (sum, e) => sum + (e.negotiatedPrice ?? e.pricingSnapshot?.packagePrice ?? 0),
    0
  )
  const activeDealsCount = enquiries.filter(
    (e) => e.status === 'New' || e.status === 'Contacted' || e.status === 'Negotiation' || e.status === 'Quotation Sent'
  ).length
  const confirmedCount = enquiries.filter((e) => e.status === 'Confirmed' || e.status === 'Completed').length

  async function handleStatusUpdate() {
    if (!selected) return
    setSavingStatus(true)
    try {
      await updateEnquiryStatus(selected.id, newStatus, statusNote || undefined)
      toast.success(`Status updated to "${newStatus}"`)
      setSelected(null)
      setStatusNote('')
      load()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setSavingStatus(false)
    }
  }

  function openDetail(enquiry: Enquiry) {
    setSelected(enquiry)
    setNewStatus(enquiry.status)
    setStatusNote('')
  }

  async function handleDownloadSavedQuote(q: Quotation) {
    setDownloadingId(q.id)
    try {
      await generateQuotationPDF(q)
      toast.success(`Downloaded Quotation ${q.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate PDF')
    } finally {
      setDownloadingId(null)
    }
  }

  async function handleDeleteQuote(id: string, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (!window.confirm(`Delete quotation ${id}? This cannot be undone.`)) return
    try {
      await deleteQuotation(id)
      toast.success(`Quotation ${id} deleted`)
      load()
    } catch {
      toast.error('Failed to delete quotation')
    }
  }

  async function handleDeleteEnquiry(id: string, e?: React.MouseEvent) {
    e?.stopPropagation()
    if (!window.confirm(`Delete enquiry ${id}? This cannot be undone.`)) return
    try {
      await deleteEnquiry(id)
      toast.success(`Enquiry ${id} deleted`)
      if (selected?.id === id) setSelected(null)
      load()
    } catch {
      toast.error('Failed to delete enquiry')
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
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
          <button
            type="button"
            onClick={() => handleTabChange('enquiries')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'enquiries'
                ? 'bg-accent text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold'
            }`}
          >
            <Users size={13} />
            <span>Pipeline ({enquiries.length})</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('quotations')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'quotations'
                ? 'bg-accent text-white shadow-xs'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold'
            }`}
          >
            <FileText size={13} />
            <span>Quotes ({quotations.length})</span>
          </button>
          <Link
            to="/admin/fleet"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Bus size={13} className="text-emerald-600" />
            <span>Fleet Inventory</span>
          </Link>
          <Link
            to="/admin/campaigns"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Tag size={13} className="text-purple-600" />
            <span>Campaigns</span>
          </Link>
        </div>
      </div>

      {/* ── Page Header (Mobile-Optimized) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="p-1.5 -ml-1 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              title="Return to Sales Calculator"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight">
              {activeTab === 'enquiries' ? 'Enquiries Pipeline' : 'Sent Quotations'}
            </h1>
          </div>
          <p className="text-secondary-text text-xs sm:text-sm mt-0.5">
            {activeTab === 'enquiries'
              ? 'Track leads, follow-ups, and negotiation progress in real time.'
              : 'Review and re-download all prepared campaign proposals.'}
          </p>
        </div>

        {/* Tab Switcher & Refresh Button (Equal Heights, Touch-Friendly) */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => handleTabChange('enquiries')}
              className={`flex-1 sm:flex-initial h-8 px-3.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'enquiries'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={13} />
              <span>Pipeline ({enquiries.length})</span>
            </button>
            <button
              onClick={() => handleTabChange('quotations')}
              className={`flex-1 sm:flex-initial h-8 px-3.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'quotations'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={13} />
              <span>Quotes ({quotations.length})</span>
            </button>
          </div>

          <button
            onClick={load}
            className="h-10 w-10 flex items-center justify-center text-gray-600 hover:text-gray-900 bg-white border border-border rounded-xl active:scale-95 transition-all flex-shrink-0"
            aria-label="Refresh data"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Summary Metrics Bar (2x2 Grid on Mobile, 4-Col on Desktop) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="card p-3 sm:p-4 bg-white border-border shadow-xs">
          <p className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider flex items-center gap-1">
            <Users size={12} className="text-accent" /> Total Deals
          </p>
          <p className="text-xl sm:text-2xl font-black text-primary-text mt-1">{enquiries.length}</p>
        </div>

        <div className="card p-3 sm:p-4 bg-white border-border shadow-xs">
          <p className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} className="text-amber-500" /> Active Deals
          </p>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{activeDealsCount}</p>
        </div>

        <div className="card p-3 sm:p-4 bg-white border-border shadow-xs">
          <p className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider flex items-center gap-1">
            <CheckCircle size={12} className="text-emerald-500" /> Won Deals
          </p>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{confirmedCount}</p>
        </div>

        <div className="card p-3 sm:p-4 bg-white border-border shadow-xs">
          <p className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider flex items-center gap-1">
            <TrendingUp size={12} className="text-accent" /> Pipeline Value
          </p>
          <p className="text-xl sm:text-2xl font-black text-accent mt-1 tabular-nums truncate">
            {formatINR(totalPipelineValue)}
          </p>
        </div>
      </div>

      {/* ── Filters & Search Controls ── */}
      <div className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <input
            type="text"
            placeholder="Search customer, phone, quote ID, campaign…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-border focus:outline-none focus:border-accent bg-gray-50/50 focus:bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'enquiries' && (
            <div className="relative flex-1 sm:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as EnquiryStatus | 'All')}
                className="appearance-none w-full pl-3 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-border focus:outline-none focus:border-accent bg-white"
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none" />
            </div>
          )}

          <div className="relative flex-1 sm:w-36">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none w-full pl-3 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-border focus:outline-none focus:border-accent bg-white"
            >
              <option value="date">Sort: Newest</option>
              <option value="amount">Sort: Amount</option>
              <option value="name">Sort: Name</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── TAB 1: ENQUIRIES PIPELINE ── */}
      {activeTab === 'enquiries' && (
        <>
          {loading ? (
            <div className="card p-12 text-center text-secondary-text text-sm">
              <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-accent" />
              Loading pipeline data…
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                title="No enquiries found"
                description={search || statusFilter !== 'All' ? 'Try adjusting your search or filters.' : 'Log your first deal from the sales calculator.'}
                icon={Users}
              />
            </div>
          ) : (
            <>
              {/* Mobile Card Layout (block on mobile/tablet, hidden on desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
                {filteredEnquiries.map((e) => {
                  const isWinter = e.campaignId === 'winter-spotlight-2026' || e.campaignName?.includes('Winter')
                  const price = e.negotiatedPrice ?? e.pricingSnapshot?.packagePrice ?? 0

                  return (
                    <div
                      key={e.id}
                      onClick={() => openDetail(e)}
                      className="card p-4 hover:border-accent/40 active:scale-99 transition-all cursor-pointer space-y-3 bg-white border border-border"
                    >
                      {/* Card Header: Client & Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-sm text-primary-text leading-tight">
                            {e.customerDetails.businessName || 'Unnamed Prospect'}
                          </p>
                          <p className="text-xs text-secondary-text mt-0.5">
                            {e.customerDetails.contactName}
                          </p>
                        </div>
                        <Badge variant={STATUS_VARIANT[e.status]}>{e.status}</Badge>
                      </div>

                      {/* Campaign Badge (if seasonal) */}
                      {e.campaignName && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D4AF37]/15 text-[#B8860B] border border-[#D4AF37]/30">
                          <Sparkles size={10} />
                          <span>{e.campaignName}</span>
                        </div>
                      )}

                      {/* Specs & Pricing */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <span className="text-secondary-text">
                          {e.pricingSnapshot?.buses} Buses · {e.pricingSnapshot?.videoDurationSeconds}s · {e.pricingSnapshot?.months} Mo
                        </span>
                        <span className="font-extrabold text-sm text-accent tabular-nums">
                          {formatINR(price)}
                        </span>
                      </div>

                      {/* Contact Actions (Call & WhatsApp) */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs gap-2">
                        <span className="text-[11px] text-gray-400">
                          {format(new Date(e.createdAt), 'dd MMM yyyy')}
                        </span>
                        <div className="flex items-center gap-1.5" onClick={(ev) => ev.stopPropagation()}>
                          {e.customerDetails.phone && e.customerDetails.phone !== 'Not specified' && (
                            <>
                              <a
                                href={`tel:${e.customerDetails.phone}`}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                                title="Call Client"
                              >
                                <Phone size={13} />
                              </a>
                              <a
                                href={`https://wa.me/${e.customerDetails.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                                title="WhatsApp Client"
                              >
                                <MessageSquare size={13} />
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => openDetail(e)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-accent bg-accent/10 hover:bg-accent/20 rounded-lg"
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop Table View (hidden on mobile, visible on lg) */}
              <div className="hidden lg:block card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-border">
                      <tr>
                        {['Reference', 'Customer / Business', 'Phone', 'Campaign', 'Buses', 'Duration', 'Price', 'Status', 'Date'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary-text whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredEnquiries.map((e) => (
                        <tr
                          key={e.id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => openDetail(e)}
                        >
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-accent">{e.id}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-primary-text">{e.customerDetails.businessName}</p>
                            <p className="text-secondary-text text-xs">{e.customerDetails.contactName}</p>
                          </td>
                          <td className="px-4 py-3 text-secondary-text text-xs">{e.customerDetails.phone}</td>
                          <td className="px-4 py-3 text-xs">
                            <span className="font-medium text-gray-800">{e.campaignName || 'Standard'}</span>
                          </td>
                          <td className="px-4 py-3 tabular-nums font-semibold">{e.pricingSnapshot?.buses ?? '—'}</td>
                          <td className="px-4 py-3 tabular-nums text-xs">{e.pricingSnapshot?.videoDurationSeconds}s · {e.pricingSnapshot?.months} Mo</td>
                          <td className="px-4 py-3 font-bold tabular-nums text-accent">
                            {formatINR(e.negotiatedPrice ?? e.pricingSnapshot?.packagePrice ?? 0)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={STATUS_VARIANT[e.status]}>{e.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-secondary-text whitespace-nowrap text-xs">
                            {format(new Date(e.createdAt), 'dd MMM yyyy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── TAB 2: SENT QUOTATIONS ── */}
      {activeTab === 'quotations' && (
        <>
          {loading ? (
            <div className="card p-12 text-center text-secondary-text text-sm">
              <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-accent" />
              Loading quotations…
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="card p-8">
              <EmptyState
                title="No quotations saved yet"
                description="Generate a PDF quote from the sales calculator to view and track it here."
                icon={FileText}
              />
            </div>
          ) : (
            <>
              {/* Mobile Card Layout for Quotations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
                {filteredQuotations.map((q) => {
                  const isWinter = q.campaignThemeSnapshot?.style === 'winter-spotlight' || q.campaignName?.includes('Winter')
                  const isDownloading = downloadingId === q.id

                  return (
                    <div
                      key={q.id}
                      className="card p-4 hover:border-accent/40 transition-all space-y-3 bg-white border border-border"
                    >
                      {/* Header: Ref & Validity */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono font-bold text-xs text-accent">{q.id}</p>
                          <p className="font-bold text-sm text-primary-text mt-0.5">
                            {q.customerDetails.businessName || 'Valued Client'}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Valid: {format(new Date(q.validUntil), 'dd MMM')}
                        </span>
                      </div>

                      {/* Campaign Tag */}
                      <div className="flex items-center gap-1.5 flex-wrap text-xs">
                        {q.campaignName && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              isWinter
                                ? 'bg-[#D4AF37]/15 text-[#B8860B] border-[#D4AF37]/30'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}
                          >
                            <Sparkles size={10} />
                            {q.campaignName}
                          </span>
                        )}
                        <span className="text-secondary-text text-[11px]">
                          {q.pricingSnapshot?.buses} Buses · {q.pricingSnapshot?.videoDurationSeconds}s · {q.pricingSnapshot?.months} Mo
                        </span>
                      </div>

                      {/* Price & Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                        <span className="text-gray-400 text-[11px]">
                          Created: {format(new Date(q.createdAt), 'dd MMM yyyy')}
                        </span>
                        <span className="font-extrabold text-base text-accent tabular-nums">
                          {formatINR(q.pricingSnapshot?.packagePrice ?? 0)}
                        </span>
                      </div>

                      {/* Actions: Download PDF & Delete Quotation */}
                      <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadSavedQuote(q)}
                          disabled={isDownloading}
                          className="flex-1 py-2 px-3 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent font-bold text-xs flex items-center justify-center gap-1.5 border border-accent/25 active:scale-98 transition-all"
                        >
                          <Download size={13} className={isDownloading ? 'animate-bounce' : ''} />
                          {isDownloading ? 'Downloading…' : 'PDF Quotation'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteQuote(q.id, e)}
                          className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-200 active:scale-98 transition-all"
                          title="Delete Quotation"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop Table View for Quotations */}
              <div className="hidden lg:block card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-border">
                      <tr>
                        {['Quotation Ref', 'Client / Business', 'Campaign', 'Campaign Spec', 'Total Quote', 'Valid Until', 'Created', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary-text whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredQuotations.map((q) => {
                        const isDownloading = downloadingId === q.id
                        return (
                          <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-accent">{q.id}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-primary-text">{q.customerDetails.businessName}</p>
                              <p className="text-secondary-text text-xs">{q.customerDetails.phone}</p>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className="font-medium text-gray-800">{q.campaignName || 'Standard'}</span>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className="font-semibold text-gray-900">{q.pricingSnapshot?.buses} Buses</span> · {q.pricingSnapshot?.videoDurationSeconds}s · {q.pricingSnapshot?.months} Mo
                            </td>
                            <td className="px-4 py-3 font-bold tabular-nums text-accent">
                              {formatINR(q.pricingSnapshot?.packagePrice ?? 0)}
                            </td>
                            <td className="px-4 py-3 text-secondary-text text-xs whitespace-nowrap">
                              {format(new Date(q.validUntil), 'dd MMM yyyy')}
                            </td>
                            <td className="px-4 py-3 text-secondary-text text-xs whitespace-nowrap">
                              {format(new Date(q.createdAt), 'dd MMM yyyy')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSavedQuote(q)}
                                  disabled={isDownloading}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-accent/40 text-accent hover:bg-blue-50 text-xs font-bold transition-colors"
                                  title="Download PDF"
                                >
                                  <Download size={12} className={isDownloading ? 'animate-bounce' : ''} />
                                  PDF
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteQuote(q.id, e)}
                                  className="inline-flex items-center gap-1 p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                                  title="Delete Quotation"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── RESPONSIVE LEAD DETAIL & EDIT MODAL (Mobile Keyboard-Safe) ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-bold text-accent">{selected.id}</p>
                <h2 className="font-black text-primary-text text-base sm:text-lg">
                  {selected.customerDetails.businessName || 'Prospect Details'}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Client Info */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-secondary-text block text-[10px] uppercase font-bold">Contact</span>
                  <span className="font-semibold text-gray-900">{selected.customerDetails.contactName || '—'}</span>
                </div>
                <div>
                  <span className="text-secondary-text block text-[10px] uppercase font-bold">Phone</span>
                  <span className="font-semibold text-gray-900">{selected.customerDetails.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-secondary-text block text-[10px] uppercase font-bold">Campaign</span>
                  <span className="font-semibold text-gray-900">{selected.campaignName || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-secondary-text block text-[10px] uppercase font-bold">Quoted Price</span>
                  <span className="font-bold text-accent tabular-nums">
                    {formatINR(selected.negotiatedPrice ?? selected.pricingSnapshot?.packagePrice ?? 0)}
                  </span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Lead Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                        newStatus === st
                          ? 'bg-accent text-white border-accent shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Follow-up Note */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Add Follow-up Note</label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Called client; interested in 10-bus festive package. Meeting scheduled for Friday."
                  className="w-full p-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                />
              </div>

              {/* Past Notes */}
              {selected.adminNotes && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
                    Previous Activity Logs
                  </span>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px] text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {selected.adminNotes}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-gray-50 border-t border-border flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => handleDeleteEnquiry(selected.id, e)}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-1.5 border border-rose-200 transition-colors"
                title="Delete this lead"
              >
                <Trash2 size={13} />
                <span>Delete Deal</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={savingStatus}
                  className="px-4 py-2 text-xs font-bold bg-accent hover:bg-blue-600 text-white rounded-xl shadow-xs active:scale-95 transition-all"
                >
                  {savingStatus ? 'Saving…' : 'Save Status Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
