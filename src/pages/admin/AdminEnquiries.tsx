import { useEffect, useState } from 'react'
import { getEnquiries, updateEnquiryStatus } from '../../lib/dataStore'
import type { Enquiry, EnquiryStatus } from '../../types'
import { formatINR } from '../../lib/pricingEngine'
import { Badge, EmptyState, ConfirmDialog } from '../../components/ui'
import { Users, Search, RefreshCw, ChevronDown, X } from 'lucide-react'
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
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | 'All'>('All')
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [newStatus, setNewStatus] = useState<EnquiryStatus>('New')
  const [statusNote, setStatusNote] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [negotiatedPrice, setNegotiatedPrice] = useState('')
  const [negotiationReason, setNegotiationReason] = useState('')

  async function load() {
    setLoading(true)
    const data = await getEnquiries()
    setEnquiries(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = enquiries.filter((e) => {
    const matchSearch =
      !search ||
      e.customerDetails.businessName.toLowerCase().includes(search.toLowerCase()) ||
      e.customerDetails.contactName.toLowerCase().includes(search.toLowerCase()) ||
      e.customerDetails.phone.includes(search) ||
      e.id.includes(search)
    const matchStatus = statusFilter === 'All' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleStatusUpdate() {
    if (!selected) return
    await updateEnquiryStatus(selected.id, newStatus, statusNote || undefined)
    toast.success(`Status updated to "${newStatus}"`)
    setSelected(null)
    setStatusNote('')
    setConfirmOpen(false)
    load()
  }

  function openDetail(enquiry: Enquiry) {
    setSelected(enquiry)
    setNewStatus(enquiry.status)
    setNegotiatedPrice(enquiry.negotiatedPrice ? String(enquiry.negotiatedPrice) : '')
    setNegotiationReason(enquiry.negotiationReason ?? '')
    setStatusNote('')
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary-text">Enquiries</h1>
          <p className="text-secondary-text text-sm">{enquiries.length} total enquiries</p>
        </div>
        <button onClick={load} className="btn-ghost text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
          <input
            type="text"
            placeholder="Search by name, phone or reference…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EnquiryStatus | 'All')}
            className="appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:border-accent bg-white w-full"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                {['Reference', 'Customer', 'Phone', 'Buses', 'Ad Duration', 'Campaign', 'Quoted Price', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-secondary-text whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-secondary-text">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState
                      title="No enquiries found"
                      description="No enquiries match your current filters."
                      icon={Users}
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
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
                    <td className="px-4 py-3 text-secondary-text">{e.customerDetails.phone}</td>
                    <td className="px-4 py-3 tabular-nums font-semibold">{e.pricingSnapshot?.buses ?? '—'}</td>
                    <td className="px-4 py-3 tabular-nums">{e.pricingSnapshot?.videoDurationSeconds ?? '—'}s</td>
                    <td className="px-4 py-3 tabular-nums">{e.pricingSnapshot?.months ?? '—'} mo</td>
                    <td className="px-4 py-3 font-bold tabular-nums text-accent">
                      {e.pricingSnapshot ? formatINR(e.negotiatedPrice ?? e.pricingSnapshot.packagePrice) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[e.status]}>{e.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary-text whitespace-nowrap text-xs">
                      {format(new Date(e.createdAt), 'dd MMM yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-black text-primary-text text-lg">{selected.id}</h2>
                <p className="text-secondary-text text-xs">{selected.customerDetails.businessName}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Customer details */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-text mb-3">Customer Details</h3>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  {[
                    ['Business', selected.customerDetails.businessName],
                    ['Contact', selected.customerDetails.contactName],
                    ['Phone', selected.customerDetails.phone],
                    ['Email', selected.customerDetails.email || '—'],
                    ['Category', selected.customerDetails.businessCategory || '—'],
                    ['Start Date', selected.customerDetails.campaignStartDate || '—'],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-secondary-text text-xs mb-0.5">{k}</p>
                      <p className="font-semibold text-primary-text">{v}</p>
                    </div>
                  ))}
                </div>
                {selected.customerDetails.notes && (
                  <div className="mt-2 bg-gray-50 rounded-xl p-3">
                    <p className="text-secondary-text text-xs mb-0.5">Notes</p>
                    <p className="text-sm text-primary-text">{selected.customerDetails.notes}</p>
                  </div>
                )}
              </div>

              {/* Pricing snapshot */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-text mb-3">Pricing Snapshot</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2 text-sm">
                  {selected.pricingSnapshot && (
                    <>
                      <div className="flex justify-between"><span className="text-secondary-text">Buses</span><span className="font-semibold">{selected.pricingSnapshot.buses}</span></div>
                      <div className="flex justify-between"><span className="text-secondary-text">Ad Duration</span><span className="font-semibold">{selected.pricingSnapshot.videoDurationSeconds}s</span></div>
                      <div className="flex justify-between"><span className="text-secondary-text">Campaign</span><span className="font-semibold">{selected.pricingSnapshot.months} months</span></div>
                      <div className="flex justify-between"><span className="text-secondary-text">Standard Price</span><span className="font-semibold tabular-nums line-through text-secondary-text">{formatINR(selected.pricingSnapshot.standardPrice)}</span></div>
                      <div className="flex justify-between"><span className="text-secondary-text">Package Price</span><span className="font-bold tabular-nums text-accent">{formatINR(selected.pricingSnapshot.packagePrice)}</span></div>
                      {selected.negotiatedPrice && (
                        <div className="flex justify-between border-t border-blue-200 pt-2"><span className="text-secondary-text">Negotiated Price</span><span className="font-bold tabular-nums text-accent-violet">{formatINR(selected.negotiatedPrice)}</span></div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Status update */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-text mb-3">Update Status</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as EnquiryStatus)}
                      className="w-full appearance-none input-field pr-9"
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none" />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Optional note for this status change…"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="input-field resize-none text-sm"
                  />
                </div>
              </div>

              {/* Negotiated pricing (admin only) */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-text mb-3">
                  Negotiated Price <span className="text-xs font-normal text-secondary-text normal-case">(Private — not visible to customer)</span>
                </h3>
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text font-semibold">₹</span>
                    <input
                      type="number"
                      placeholder="Leave blank to use package price"
                      value={negotiatedPrice}
                      onChange={(e) => setNegotiatedPrice(e.target.value)}
                      className="input-field pl-8"
                    />
                  </div>
                  {negotiatedPrice && Number(negotiatedPrice) < 30000 && selected.pricingSnapshot?.buses === 10 && selected.pricingSnapshot?.months === 2 && (
                    <p className="text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-lg p-2">
                      ⚠ This price is below the configured negotiation floor (₹30,000) for 10 buses / 2 months. Explicit authorisation required.
                    </p>
                  )}
                  <input
                    type="text"
                    placeholder="Reason for negotiation (internal note)…"
                    value={negotiationReason}
                    onChange={(e) => setNegotiationReason(e.target.value)}
                    className="input-field text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="btn-primary flex-1 text-sm"
                disabled={newStatus === selected.status && !negotiatedPrice && !statusNote}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Status Update"
        description={`Update enquiry ${selected?.id} status to "${newStatus}"?`}
        onConfirm={handleStatusUpdate}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
