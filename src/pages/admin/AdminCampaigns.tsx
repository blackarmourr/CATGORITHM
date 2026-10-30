import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getCampaigns, createCampaign, updateCampaign, duplicateCampaign,
  deleteCampaign, getCampaignQuotationsCount, getDefaultCampaigns
} from '../../lib/dataStore'
import { useCalculatorStore } from '../../stores/calculatorStore'
import type { Campaign, CampaignStatus } from '../../types'
import {
  Plus, CheckCircle2, Calendar, Edit3, Copy, Trash2,
  FileText, ArrowLeft, Layers, Save, X, Bus, Users
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdminCampaigns() {
  const navigate = useNavigate()
  const selectedCampaign = useCalculatorStore((s) => s.selectedCampaign)
  const setCampaign = useCalculatorStore((s) => s.setCampaign)

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [quoteCounts, setQuoteCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  // Modal state for Add/Edit
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  // Form Fields
  const [formName, setFormName] = useState('')
  const [formTagline, setFormTagline] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0])
  const [formEndDate, setFormEndDate] = useState('')
  const [formDefaultMonths, setFormDefaultMonths] = useState(1)

  async function loadData() {
    setLoading(true)
    const list = await getCampaigns()
    setCampaigns(list)

    const counts: Record<string, number> = {}
    for (const c of list) {
      counts[c.id] = await getCampaignQuotationsCount(c.id)
    }
    setQuoteCounts(counts)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  function openCreateModal() {
    setEditingCampaign(null)
    setFormName('')
    setFormTagline('')
    setFormDescription('')
    const today = new Date().toISOString().split('T')[0]
    setFormStartDate(today)
    setFormEndDate('')
    setFormDefaultMonths(1)
    setModalOpen(true)
  }

  function openEditModal(c: Campaign) {
    setEditingCampaign(c)
    setFormName(c.name)
    setFormTagline(c.tagline)
    setFormDescription(c.description)
    setFormStartDate(c.startDate)
    setFormEndDate(c.endDate)
    setFormDefaultMonths(c.defaultBilledMonths || 1)
    setModalOpen(true)
  }

  async function handleSaveCampaign(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error('Campaign name is required')
      return
    }

    const calculatedEnd = formEndDate || formStartDate

    const theme = {
      primaryColor: '#111827',
      secondaryColor: '#1F2937',
      accentColor: '#A0354E',
      textColor: '#111827',
      coverBadge: 'CAMPAIGN PACKAGE',
      style: 'standard' as const,
    }

    const messaging = {
      headline: formName.trim().toUpperCase(),
      subheadline: 'OFFICIAL ADVERTISING PROPOSAL',
      tagline: formTagline.trim() || 'Bus Screen Advertising Package',
      supportingCopy: formDescription.trim(),
      offerTitle: `${formName} Package`,
    }

    try {
      if (editingCampaign) {
        const updated = await updateCampaign(editingCampaign.id, {
          name: formName.trim(),
          slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tagline: formTagline.trim(),
          description: formDescription.trim(),
          startDate: formStartDate,
          endDate: calculatedEnd,
          defaultBilledMonths: formDefaultMonths,
          theme,
          messaging,
          quotationSettings: {
            enableSeasonalCover: false,
            coverTitle: formName.trim(),
            quotationValidityDays: 30,
          },
        })
        toast.success(`Updated "${updated.name}"`)
        if (selectedCampaign.id === updated.id) {
          setCampaign(updated)
        }
      } else {
        const created = await createCampaign({
          name: formName.trim(),
          slug: formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tagline: formTagline.trim(),
          description: formDescription.trim(),
          startDate: formStartDate,
          endDate: calculatedEnd,
          defaultBilledMonths: formDefaultMonths,
          theme,
          messaging,
          quotationSettings: {
            enableSeasonalCover: false,
            coverTitle: formName.trim(),
            quotationValidityDays: 30,
          },
          isDefault: false,
          isArchived: false,
        })
        toast.success(`Created campaign "${created.name}"`)
      }
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save campaign')
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const copy = await duplicateCampaign(id)
      toast.success(`Duplicated as "${copy.name}"`)
      loadData()
    } catch {
      toast.error('Failed to duplicate campaign')
    }
  }

  async function handleDelete(id: string, name: string) {
    if (confirm(`Are you sure you want to delete the campaign "${name}"? This cannot be undone.`)) {
      try {
        await deleteCampaign(id)
        toast.success(`Campaign "${name}" deleted`)
        if (selectedCampaign.id === id) {
          const defaults = getDefaultCampaigns()
          setCampaign(defaults[0])
        }
        loadData()
      } catch {
        toast.error('Failed to delete campaign')
      }
    }
  }

  function handleSelectForPitch(c: Campaign) {
    setCampaign(c)
    toast.success(`Selected "${c.name}" as active pitch campaign`)
    navigate('/')
  }

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
          <Link
            to="/admin/fleet"
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Bus size={13} className="text-emerald-600" />
            <span>Fleet Inventory</span>
          </Link>
          <span className="px-3 py-1.5 rounded-lg bg-accent text-white font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs">
            <Layers size={13} />
            <span>Campaigns</span>
          </span>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-primary-text flex items-center gap-2">
            <Layers size={22} className="text-accent" />
            Campaign Management
          </h1>
          <p className="text-xs sm:text-sm text-secondary-text mt-0.5">
            Create and organize advertising packages. Delete, edit, or copy packages with clean, transparent tariffs.
          </p>
        </div>

        <div>
          <button
            onClick={openCreateModal}
            className="h-10 px-4 bg-accent hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Add New Campaign</span>
          </button>
        </div>
      </div>

      {/* ── Section: Select a Campaign ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
            Available Campaigns ({campaigns.length})
          </h2>
        </div>

        {loading ? (
          <div className="card p-12 text-center text-secondary-text text-sm">
            Loading campaigns…
          </div>
        ) : campaigns.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 text-sm">
            No campaigns found. Click "Add New Campaign" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {campaigns.map((c) => {
              const isSelected = selectedCampaign?.id === c.id
              const quoteCount = quoteCounts[c.id] ?? 0
              let days = 30
              try {
                if (c.startDate && c.endDate) {
                  days = Math.max(1, differenceInDays(new Date(c.endDate), new Date(c.startDate)) + 1)
                }
              } catch {
                days = 30
              }

              return (
                <div
                  key={c.id}
                  className={`card p-4 sm:p-5 transition-all flex flex-col justify-between border bg-white ${
                    isSelected
                      ? 'border-accent ring-2 ring-accent/20 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header: Title + Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                          {c.name}
                        </h3>
                        {c.tagline && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {c.tagline}
                          </p>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.status === 'Scheduled'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    {/* Campaign Description */}
                    {c.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>
                    )}

                    {/* Dates & Billed Duration */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-gray-700 font-medium">
                        <Calendar size={12} className="text-accent" />
                        <span>
                          {c.startDate} {c.endDate && c.endDate !== c.startDate ? `➔ ${c.endDate}` : ''}
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold">
                        {c.defaultBilledMonths || 1} {c.defaultBilledMonths === 1 ? 'Month' : 'Months'} Billed
                      </span>
                    </div>

                    {/* Quotation Association Counter */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <FileText size={12} className="text-gray-400" />
                      <span className="text-[11px]">
                        {quoteCount} {quoteCount === 1 ? 'quotation generated' : 'quotations generated'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1 transition-colors"
                        title="Edit Campaign"
                      >
                        <Edit3 size={13} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(c.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1 transition-colors"
                        title="Duplicate Campaign"
                      >
                        <Copy size={13} />
                        <span className="hidden sm:inline">Copy</span>
                      </button>

                      {/* Delete button (with confirmation) */}
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1 transition-colors"
                        title="Delete Campaign"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>

                    {/* Primary Select Action */}
                    <button
                      type="button"
                      onClick={() => handleSelectForPitch(c)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-accent hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Active in Pitch</span>
                        </>
                      ) : (
                        <span>Use in Pitch</span>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── MODAL: ADD / EDIT CAMPAIGN ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-accent" />
                <h3 className="font-extrabold text-sm">
                  {editingCampaign ? `Edit Campaign: ${editingCampaign.name}` : 'Create New Campaign'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCampaign} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Festival Special / Monsoon Blast"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. Maximum Brand Reach Across Kollam"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Default Months
                  </label>
                  <select
                    value={formDefaultMonths}
                    onChange={(e) => setFormDefaultMonths(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-accent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        {m} {m === 1 ? 'Month' : 'Months'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Campaign Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief details about what this campaign offers to clients..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-accent"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-accent hover:bg-blue-600 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save size={13} />
                  <span>{editingCampaign ? 'Save Changes' : 'Create Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
