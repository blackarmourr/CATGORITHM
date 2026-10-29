import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getCampaigns, createCampaign, updateCampaign, duplicateCampaign,
  archiveCampaign, getCampaignQuotationsCount
} from '../../lib/dataStore'
import { useCalculatorStore } from '../../stores/calculatorStore'
import type { Campaign, CampaignStatus, CampaignTheme, CampaignMessaging } from '../../types'
import {
  Sparkles, Plus, CheckCircle2, Calendar, Edit3, Copy, Archive,
  FileText, ExternalLink, ArrowLeft, Clock, Tag, X, Check,
  Layers, Palette, MessageSquare, ShieldCheck
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
  const [activeFormTab, setActiveFormTab] = useState<'identity' | 'branding' | 'messaging' | 'quotation'>('identity')

  // Form Fields
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formTagline, setFormTagline] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formStartDate, setFormStartDate] = useState('2026-11-20')
  const [formEndDate, setFormEndDate] = useState('2027-01-20')
  const [formDefaultMonths, setFormDefaultMonths] = useState(2)

  // Branding Fields
  const [formPrimaryColor, setFormPrimaryColor] = useState('#070B14')
  const [formSecondaryColor, setFormSecondaryColor] = useState('#0F172A')
  const [formAccentColor, setFormAccentColor] = useState('#D4AF37')
  const [formGoldColor, setFormGoldColor] = useState('#F3C669')
  const [formThemeStyle, setFormThemeStyle] = useState<'standard' | 'winter-spotlight' | 'custom'>('winter-spotlight')

  // Messaging Fields
  const [formHeadline, setFormHeadline] = useState('')
  const [formSubheadline, setFormSubheadline] = useState('CATGORITHM PRESENTS')
  const [formOfferTitle, setFormOfferTitle] = useState('Winter Spotlight Special Package')
  const [formSupportingCopy, setFormSupportingCopy] = useState("Make your brand part of the season with Catgorithm's bus-screen advertising packages.")
  const [formSeasonalThemes, setFormSeasonalThemes] = useState('Black Friday, Christmas, New Year, End-of-Season Sales')

  // Quotation Settings
  const [formEnableCover, setFormEnableCover] = useState(true)
  const [formValidityDays, setFormValidityDays] = useState(30)

  async function loadData() {
    setLoading(true)
    const list = await getCampaigns()
    setCampaigns(list)

    // Load quote counts for each campaign
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
    setFormSlug('')
    setFormTagline('')
    setFormDescription('')
    setFormStartDate('2026-11-20')
    setFormEndDate('2027-01-20')
    setFormDefaultMonths(2)
    setFormPrimaryColor('#070B14')
    setFormSecondaryColor('#0F172A')
    setFormAccentColor('#D4AF37')
    setFormGoldColor('#F3C669')
    setFormThemeStyle('winter-spotlight')
    setFormHeadline('')
    setFormSubheadline('CATGORITHM PRESENTS')
    setFormOfferTitle('Special Campaign Package')
    setFormSupportingCopy("Make your brand part of the season with Catgorithm's bus-screen advertising packages.")
    setFormSeasonalThemes('Black Friday, Christmas, New Year, End-of-Season Sales')
    setFormEnableCover(true)
    setFormValidityDays(30)
    setActiveFormTab('identity')
    setModalOpen(true)
  }

  function openEditModal(c: Campaign) {
    setEditingCampaign(c)
    setFormName(c.name)
    setFormSlug(c.slug)
    setFormTagline(c.tagline)
    setFormDescription(c.description)
    setFormStartDate(c.startDate)
    setFormEndDate(c.endDate)
    setFormDefaultMonths(c.defaultBilledMonths || 2)
    setFormPrimaryColor(c.theme.primaryColor || '#070B14')
    setFormSecondaryColor(c.theme.secondaryColor || '#0F172A')
    setFormAccentColor(c.theme.accentColor || '#D4AF37')
    setFormGoldColor(c.theme.goldColor || '#F3C669')
    setFormThemeStyle(c.theme.style || 'winter-spotlight')
    setFormHeadline(c.messaging.headline || c.name)
    setFormSubheadline(c.messaging.subheadline || 'CATGORITHM PRESENTS')
    setFormOfferTitle(c.messaging.offerTitle || 'Special Package')
    setFormSupportingCopy(c.messaging.supportingCopy || '')
    setFormSeasonalThemes((c.messaging.seasonalThemes || []).join(', '))
    setFormEnableCover(c.quotationSettings.enableSeasonalCover)
    setFormValidityDays(c.quotationSettings.quotationValidityDays || 30)
    setActiveFormTab('identity')
    setModalOpen(true)
  }

  async function handleSaveCampaign(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error('Campaign name is required')
      return
    }

    if (formEndDate < formStartDate) {
      toast.error('End date cannot be earlier than start date')
      return
    }

    const theme: CampaignTheme = {
      primaryColor: formPrimaryColor,
      secondaryColor: formSecondaryColor,
      accentColor: formAccentColor,
      goldColor: formGoldColor,
      textColor: '#F8FAFC',
      coverBadge: formThemeStyle === 'winter-spotlight' ? 'SEASONAL SPOTLIGHT' : 'OFFICIAL CAMPAIGN',
      style: formThemeStyle,
    }

    const messaging: CampaignMessaging = {
      headline: formHeadline.trim() || formName.trim().toUpperCase(),
      subheadline: formSubheadline.trim() || 'CATGORITHM PRESENTS',
      tagline: formTagline.trim() || 'Your Brand. The Season. The Spotlight.',
      seasonalThemes: formSeasonalThemes.split(',').map((s) => s.trim()).filter(Boolean),
      supportingCopy: formSupportingCopy.trim(),
      offerTitle: formOfferTitle.trim() || `${formName} Special Package`,
    }

    try {
      if (editingCampaign) {
        // Update
        const updated = await updateCampaign(editingCampaign.id, {
          name: formName.trim(),
          slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tagline: formTagline.trim(),
          description: formDescription.trim(),
          startDate: formStartDate,
          endDate: formEndDate,
          defaultBilledMonths: formDefaultMonths,
          theme,
          messaging,
          quotationSettings: {
            enableSeasonalCover: formEnableCover,
            coverTitle: formName.trim(),
            quotationValidityDays: formValidityDays,
          },
        })
        toast.success(`Updated "${updated.name}"`)
        if (selectedCampaign.id === updated.id) {
          setCampaign(updated)
        }
      } else {
        // Create new
        const created = await createCampaign({
          name: formName.trim(),
          slug: formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tagline: formTagline.trim(),
          description: formDescription.trim(),
          startDate: formStartDate,
          endDate: formEndDate,
          defaultBilledMonths: formDefaultMonths,
          theme,
          messaging,
          quotationSettings: {
            enableSeasonalCover: formEnableCover,
            coverTitle: formName.trim(),
            quotationValidityDays: formValidityDays,
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

  async function handleArchive(id: string) {
    if (confirm('Archive this campaign? Historical quotations and bookings will be preserved, and the campaign will be hidden from new selections.')) {
      try {
        await archiveCampaign(id)
        toast.success('Campaign archived')
        loadData()
      } catch {
        toast.error('Failed to archive')
      }
    }
  }

  function handleSelectForPitch(c: Campaign) {
    setCampaign(c)
    toast.success(`Selected "${c.name}" as active pitch campaign`)
    navigate('/')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── Page Header ── */}
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
            <h1 className="text-xl sm:text-2xl font-black text-primary-text tracking-tight flex items-center gap-2">
              <Sparkles size={20} className="text-[#D4AF37]" />
              Campaign Management
            </h1>
          </div>
          <p className="text-secondary-text text-xs sm:text-sm mt-0.5">
            Configure seasonal themes, messaging, and date ranges without altering core approved pricing tariffs.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
            <Layers size={15} className="text-accent" />
            Select a Campaign
          </h2>
          <span className="text-xs text-gray-400">
            {campaigns.filter((c) => !c.isArchived).length} Active Campaigns
          </span>
        </div>

        {loading ? (
          <div className="card p-12 text-center text-secondary-text text-sm">
            Loading campaigns…
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.filter((c) => !c.isArchived).map((c) => {
              const isSelected = selectedCampaign?.id === c.id
              const isWinter = c.theme?.style === 'winter-spotlight'
              const quoteCount = quoteCounts[c.id] ?? 0
              const days = differenceInDays(new Date(c.endDate), new Date(c.startDate)) + 1

              return (
                <div
                  key={c.id}
                  className={`card p-5 transition-all relative overflow-hidden flex flex-col justify-between border ${
                    isSelected
                      ? isWinter
                        ? 'bg-[#070B14] text-white border-[#D4AF37] ring-1 ring-[#D4AF37] shadow-xl shadow-[#D4AF37]/15'
                        : 'bg-white text-gray-900 border-accent ring-1 ring-accent shadow-xl shadow-accent/10'
                      : isWinter
                      ? 'bg-gradient-to-br from-[#070B14] to-[#0F172A] text-white border-gray-800 hover:border-[#D4AF37]/50'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Subtle festive background glow for Winter Spotlight */}
                  {isWinter && (
                    <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />
                  )}

                  <div className="space-y-3 relative z-10">
                    {/* Header: Title + Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className={`text-base font-bold ${isWinter ? 'text-[#F3C669]' : 'text-primary-text'}`}>
                            {c.name}
                          </h3>
                          {isWinter && (
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-[#D4AF37]/25 text-[#F3C669] px-2 py-0.5 rounded-full border border-[#D4AF37]/40">
                              Seasonal Spotlight
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 font-medium ${isWinter ? 'text-gray-300' : 'text-secondary-text'}`}>
                          {c.tagline}
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          c.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : c.status === 'Scheduled'
                            ? isWinter
                              ? 'bg-[#D4AF37]/20 text-[#F3C669] border-[#D4AF37]/30'
                              : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    {/* Campaign Description */}
                    <p className={`text-xs line-clamp-2 leading-relaxed ${isWinter ? 'text-gray-400' : 'text-gray-600'}`}>
                      {c.description}
                    </p>

                    {/* Dates & Billed Duration */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs pt-2 border-t border-white/10">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className={isWinter ? 'text-[#D4AF37]' : 'text-accent'} />
                        <span className={isWinter ? 'text-gray-300' : 'text-gray-700 font-medium'}>
                          {format(new Date(c.startDate), 'dd MMM yyyy')} – {format(new Date(c.endDate), 'dd MMM yyyy')}
                        </span>
                      </div>
                      <span className={`text-[11px] px-1.5 py-0.2 rounded ${isWinter ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                        {days} Days · Billed as {c.defaultBilledMonths || 2} Months
                      </span>
                    </div>

                    {/* Quotation Association Counter */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <FileText size={12} className={isWinter ? 'text-gray-400' : 'text-secondary-text'} />
                      <span className={`text-[11px] ${isWinter ? 'text-gray-400' : 'text-secondary-text'}`}>
                        {quoteCount} {quoteCount === 1 ? 'quotation generated' : 'quotations generated'} under this campaign
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isWinter
                            ? 'text-gray-300 hover:text-white hover:bg-white/10'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Edit Campaign Details & Theme"
                      >
                        <Edit3 size={13} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(c.id)}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                          isWinter
                            ? 'text-gray-300 hover:text-white hover:bg-white/10'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Duplicate Campaign"
                      >
                        <Copy size={13} />
                        <span className="hidden sm:inline">Copy</span>
                      </button>

                      {!c.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleArchive(c.id)}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                            isWinter
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                              : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                          }`}
                          title="Archive Campaign"
                        >
                          <Archive size={13} />
                          <span className="hidden sm:inline">Archive</span>
                        </button>
                      )}
                    </div>

                    {/* Primary Select Action */}
                    <button
                      type="button"
                      onClick={() => handleSelectForPitch(c)}
                      className={`py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        isSelected
                          ? isWinter
                            ? 'bg-[#D4AF37] text-black font-extrabold'
                            : 'bg-accent text-white'
                          : isWinter
                          ? 'bg-[#D4AF37]/20 text-[#F3C669] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Active in Pitch</span>
                        </>
                      ) : (
                        <span>Select Campaign</span>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT CAMPAIGN MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-black text-primary-text text-base sm:text-lg flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                  {editingCampaign ? 'Edit Campaign Configuration' : 'Create New Campaign'}
                </h2>
                <p className="text-secondary-text text-xs">
                  Seasonal branding, messaging, and period settings. Pricing engine remains unchanged.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-4 sm:px-5 pt-3 border-b border-border flex gap-2 overflow-x-auto text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveFormTab('identity')}
                className={`pb-2.5 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeFormTab === 'identity' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                1. Campaign Identity
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('branding')}
                className={`pb-2.5 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeFormTab === 'branding' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                2. Visual Branding
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('messaging')}
                className={`pb-2.5 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeFormTab === 'messaging' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                3. Promotional Copy
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('quotation')}
                className={`pb-2.5 px-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeFormTab === 'quotation' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                4. Quotation PDF
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveCampaign} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
              {/* TAB 1: IDENTITY */}
              {activeFormTab === 'identity' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Campaign Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Winter Spotlight 2026–27"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Tagline</label>
                      <input
                        type="text"
                        placeholder="e.g. Your Brand. The Season. The Spotlight."
                        value={formTagline}
                        onChange={(e) => setFormTagline(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Default Billed Months</label>
                      <select
                        value={formDefaultMonths}
                        onChange={(e) => setFormDefaultMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 9, 12].map((m) => (
                          <option key={m} value={m}>{m} {m === 1 ? 'Month' : 'Months'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={formStartDate}
                        onChange={(e) => setFormStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">End Date *</label>
                      <input
                        type="date"
                        required
                        min={formStartDate}
                        value={formEndDate}
                        onChange={(e) => setFormEndDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Campaign Description</label>
                    <textarea
                      rows={3}
                      placeholder="Brief overview of the campaign purpose and target clients..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: BRANDING */}
              {activeFormTab === 'branding' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">Visual Theme Template</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormThemeStyle('winter-spotlight')
                          setFormPrimaryColor('#070B14')
                          setFormAccentColor('#D4AF37')
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          formThemeStyle === 'winter-spotlight'
                            ? 'bg-[#070B14] text-white border-[#D4AF37] ring-1 ring-[#D4AF37]'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        <p className="font-bold text-xs flex items-center gap-1">
                          <Sparkles size={13} className="text-[#D4AF37]" />
                          Winter Festive Spotlight
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Midnight navy, champagne gold accents, cinematic lighting.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormThemeStyle('standard')
                          setFormPrimaryColor('#111827')
                          setFormAccentColor('#A0354E')
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          formThemeStyle === 'standard'
                            ? 'bg-white text-gray-900 border-accent ring-1 ring-accent'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        <p className="font-bold text-xs flex items-center gap-1">
                          <Palette size={13} className="text-accent" />
                          Classic Minimalist
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Clean off-white & charcoal with maroon branding accents.
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formPrimaryColor}
                          onChange={(e) => setFormPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300"
                        />
                        <input
                          type="text"
                          value={formPrimaryColor}
                          onChange={(e) => setFormPrimaryColor(e.target.value)}
                          className="flex-1 px-3 py-1.5 font-mono text-xs rounded-xl border border-gray-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Accent / Gold Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formAccentColor}
                          onChange={(e) => setFormAccentColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300"
                        />
                        <input
                          type="text"
                          value={formAccentColor}
                          onChange={(e) => setFormAccentColor(e.target.value)}
                          className="flex-1 px-3 py-1.5 font-mono text-xs rounded-xl border border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MESSAGING */}
              {activeFormTab === 'messaging' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Main Headline</label>
                    <input
                      type="text"
                      placeholder="e.g. WINTER SPOTLIGHT 2026–27"
                      value={formHeadline}
                      onChange={(e) => setFormHeadline(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Offer Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Winter Spotlight Special Package"
                      value={formOfferTitle}
                      onChange={(e) => setFormOfferTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Supporting Promotional Text</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Make your brand part of the season with Catgorithm's bus-screen advertising packages."
                      value={formSupportingCopy}
                      onChange={(e) => setFormSupportingCopy(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Seasonal Sub-themes (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Black Friday, Christmas, New Year, End-of-Season Sales"
                      value={formSeasonalThemes}
                      onChange={(e) => setFormSeasonalThemes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: QUOTATION PDF */}
              {activeFormTab === 'quotation' && (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="enableCover"
                        type="checkbox"
                        checked={formEnableCover}
                        onChange={(e) => setFormEnableCover(e.target.checked)}
                        className="w-4 h-4 accent-accent rounded"
                      />
                      <label htmlFor="enableCover" className="font-bold text-gray-800 text-xs">
                        Enable Seasonal PDF Cover Page (Cinematic Presentation)
                      </label>
                    </div>
                    <p className="text-[11px] text-gray-500 pl-6">
                      When enabled, the quotation generates a two-page document: Page 1 is an elegant campaign cover with champagne gold highlights, and Page 2 presents the detailed commercial tariff.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Quotation Validity (Days)</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={formValidityDays}
                      onChange={(e) => setFormValidityDays(Number(e.target.value))}
                      className="w-32 px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                    <p className="font-semibold mb-0.5">Tariff Integrity Notice:</p>
                    All campaign themes strictly use the approved Catgorithm pricing engine (₹75/sec, approved 1-mo/2-mo tariffs, long-term duration discounts). Campaign themes customize branding and messaging without introducing unapproved discounts.
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-accent hover:bg-blue-600 text-white rounded-xl shadow-xs active:scale-95 transition-all"
                >
                  {editingCampaign ? 'Save Campaign Changes' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
