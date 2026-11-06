// ============================================================
// PROPOSAL STUDIO PAGE — CATGORITHM DIGITAL GROWTH
// Generates professional 2-page A4 PDF proposals for bus advertising.
// Supports 3 modes: No Package, Single Package, Multiple Comparative Options.
// Includes tailored industry templates, live preview & WhatsApp pitch export.
// ============================================================

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, ArrowLeft, Download, Share2, Copy, Check, Sparkles,
  Building2, Calendar, Star, ChevronDown, ChevronUp, RefreshCw,
  Users, Bus, Layers, Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  ProposalData,
  ProposalIndustry,
  PackageMode,
  ProposalPackageOption,
  INDUSTRY_TEMPLATES
} from '../types/proposal';
import { calculateCustomPrice } from '../lib/customPricingEngine';
import { generateProposalPDF } from '../lib/proposalPdfGenerator';
import { PWAHeaderInstallButton } from '../components/PWAInstallPrompt';

function formatINR(val: number): string {
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

export default function ProposalPage() {
  // ── Form State ──
  const [clientName, setClientName] = useState('Travancore Medicity Hospital');
  const [industry, setIndustry] = useState<ProposalIndustry>('hospitals');
  const [proposalDate, setProposalDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [preparedBy, setPreparedBy] = useState('Catgorithm');
  const [packageMode, setPackageMode] = useState<PackageMode>('none');
  const [activePreviewPage, setActivePreviewPage] = useState<1 | 2 | 3>(1);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showObjectiveCustomizer, setShowObjectiveCustomizer] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Editable Objectives (initialized from official template)
  const [objectiveTitle, setObjectiveTitle] = useState('THE OPPORTUNITY');
  const [objectiveP1, setObjectiveP1] = useState(
    'Catgorithm offers digital bus screen advertising across Kollam, helping businesses reach local audiences through strategically placed displays inside private buses. Our platform builds brand visibility, recall and awareness through repeated exposure during everyday commutes.'
  );
  const [objectiveP2, setObjectiveP2] = useState('');

  // ── Single Package State ──
  const [singleBuses, setSingleBuses] = useState<number | ''>(5);
  const [singleDays, setSingleDays] = useState<number | ''>(30);
  const [singleSeconds, setSingleSeconds] = useState<number | ''>(30);
  const [singleCustomPrice, setSingleCustomPrice] = useState<string>('');

  // ── Multiple Packages Dynamic State ──
  interface CustomOptionItem {
    id: string;
    name: string;
    buses: number | '';
    seconds: number | '';
    days: number | '';
    priceOverride: string;
  }

  const [packageList, setPackageList] = useState<CustomOptionItem[]>([
    { id: '1', name: 'Option 1', buses: 2, seconds: 20, days: 30, priceOverride: '' },
    { id: '2', name: 'Option 2', buses: 5, seconds: 30, days: 30, priceOverride: '' },
    { id: '3', name: 'Option 3', buses: 10, seconds: 30, days: 30, priceOverride: '' },
  ]);

  // Duration label formatter
  function formatDurationLabel(days: number): string {
    if (days === 7) return '1 Week';
    if (days === 14) return '2 Weeks';
    if (days === 21) return '3 Weeks';
    if (days === 28) return '4 Weeks';
    if (days === 30) return '1 Month';
    if (days === 60) return '2 Months';
    if (days === 90) return '3 Months';
    if (days === 120) return '4 Months';
    if (days === 180) return '6 Months';
    if (days === 365) return '1 Year';
    return `${days} Days`;
  }

  function updatePackageOption(id: string, field: keyof CustomOptionItem, val: any) {
    setPackageList(prev => prev.map(p => (p.id === id ? { ...p, [field]: val } : p)));
  }

  function handleAddOption() {
    setPackageList(prev => [
      ...prev,
      {
        id: String(Date.now()),
        name: `Option ${prev.length + 1}`,
        buses: 5,
        seconds: 30,
        days: 30,
        priceOverride: ''
      }
    ]);
  }

  function handleRemoveOption(id: string) {
    if (packageList.length <= 1) return;
    setPackageList(prev => prev.filter(p => p.id !== id));
  }

  // ── Handlers ──
  function handleIndustryChange(newInd: ProposalIndustry) {
    setIndustry(newInd);
    const tmpl = INDUSTRY_TEMPLATES[newInd];
    if (tmpl) {
      setObjectiveP1(tmpl.defaultObjectiveP1);
      setObjectiveP2(tmpl.defaultObjectiveP2);
    }
  }

  function handleResetObjectives() {
    const tmpl = INDUSTRY_TEMPLATES[industry];
    if (tmpl) {
      setObjectiveP1(tmpl.defaultObjectiveP1);
      setObjectiveP2(tmpl.defaultObjectiveP2);
      toast.success('Objective reset to industry template');
    }
  }

  // ── Price Calculations ──
  const sBuses = typeof singleBuses === 'number' && singleBuses > 0 ? singleBuses : 1;
  const sSeconds = typeof singleSeconds === 'number' && singleSeconds > 0 ? singleSeconds : 30;
  const sDays = typeof singleDays === 'number' && singleDays > 0 ? singleDays : 30;

  const singleCalc = useMemo(() => {
    return calculateCustomPrice(sBuses, sDays, sSeconds);
  }, [sBuses, sDays, sSeconds]);

  const singleFinalPrice = useMemo(() => {
    const override = singleCustomPrice ? parseInt(singleCustomPrice, 10) : undefined;
    return !isNaN(override as any) && override !== undefined ? override : singleCalc.totalPrice;
  }, [singleCustomPrice, singleCalc]);

  const singleDiscountRate = useMemo(() => {
    const savings = Math.max(0, singleCalc.standardPrice - singleFinalPrice);
    return singleCalc.standardPrice > 0 ? Math.round((savings / singleCalc.standardPrice) * 100) : 0;
  }, [singleCalc, singleFinalPrice]);

  const computedPackages = useMemo(() => {
    return packageList.map(item => {
      const b = typeof item.buses === 'number' && item.buses > 0 ? item.buses : 1;
      const s = typeof item.seconds === 'number' && item.seconds > 0 ? item.seconds : 30;
      const d = typeof item.days === 'number' && item.days > 0 ? item.days : 30;
      const calc = calculateCustomPrice(b, d, s);
      const override = item.priceOverride ? parseInt(item.priceOverride, 10) : undefined;
      const finalPrice = !isNaN(override as any) && override !== undefined ? override : calc.totalPrice;
      const standardPrice = calc.standardPrice;
      const savings = Math.max(0, standardPrice - finalPrice);
      const discountRate = standardPrice > 0 ? Math.round((savings / standardPrice) * 100) : 0;
      return {
        ...item,
        buses: b,
        seconds: s,
        days: d,
        standardPrice,
        discountRate,
        savings,
        dailyPlaysPerBus: '40–50 Plays / Day',
        calculatedPrice: calc.totalPrice,
        customPriceOverride: isNaN(override as any) ? undefined : override,
        finalPrice,
        durationLabel: formatDurationLabel(d),
      };
    });
  }, [packageList]);

  // Formatted date string for PDF & display
  const formattedDate = useMemo(() => {
    try {
      return format(new Date(proposalDate), 'MMMM dd, yyyy');
    } catch {
      return proposalDate;
    }
  }, [proposalDate]);

  // Build full ProposalData payload
  const currentProposalData: ProposalData = useMemo(() => {
    let singlePkg: ProposalPackageOption | undefined = undefined;
    if (packageMode === 'single') {
      const overrideVal = singleCustomPrice ? parseInt(singleCustomPrice, 10) : undefined;
      const finalPrice = !isNaN(overrideVal as number) && overrideVal !== undefined ? overrideVal : singleCalc.totalPrice;
      const standardPrice = singleCalc.standardPrice;
      const savings = Math.max(0, standardPrice - finalPrice);
      const discountRate = standardPrice > 0 ? Math.round((savings / standardPrice) * 100) : 0;
      singlePkg = {
        id: 'single',
        name: 'Selected Campaign Package',
        buses: sBuses,
        videoDurationSeconds: sSeconds,
        days: sDays,
        durationLabel: formatDurationLabel(sDays),
        routesLabel: 'Selected High-Traffic Corridors',
        monthlyPlaysEstimate: `~${(sBuses * 45 * sDays).toLocaleString('en-IN')} Plays`,
        dashboardAccess: 'Full 24/7 Access',
        standardPrice,
        discountRate,
        savings,
        dailyPlaysPerBus: '40–50 Plays / Day',
        calculatedPrice: singleCalc.totalPrice,
        customPriceOverride: isNaN(overrideVal as number) ? undefined : overrideVal,
      };
    }

    let multPkgs: ProposalPackageOption[] | undefined = undefined;
    if (packageMode === 'multiple') {
      multPkgs = computedPackages.map(p => ({
        id: p.id,
        name: p.name,
        buses: p.buses,
        videoDurationSeconds: p.seconds,
        days: p.days,
        durationLabel: p.durationLabel,
        routesLabel: 'Selected High-Traffic Corridors',
        monthlyPlaysEstimate: `~${(p.buses * 45 * p.days).toLocaleString('en-IN')} Plays`,
        dashboardAccess: 'Full Access',
        standardPrice: p.standardPrice,
        discountRate: p.discountRate,
        savings: p.savings,
        dailyPlaysPerBus: '40–50 Plays / Day',
        calculatedPrice: p.calculatedPrice,
        customPriceOverride: p.customPriceOverride,
      }));
    }

    return {
      clientName: clientName || 'Valued Client',
      industry,
      proposalDate: formattedDate,
      preparedBy: preparedBy || 'Catgorithm',
      contactNumber: '+91 97463 36175',
      contactEmail: 'teamcatgorithm@gmail.com',
      website: 'www.catgorithm.in',
      objectiveTitle,
      objectiveP1,
      objectiveP2,
      packageMode,
      singlePackage: singlePkg,
      multiplePackages: multPkgs,
    };
  }, [
    clientName, industry, formattedDate, preparedBy, objectiveTitle, objectiveP1, objectiveP2,
    packageMode, sBuses, sDays, sSeconds, singleCustomPrice, singleCalc.totalPrice,
    computedPackages
  ]);

  async function handleDownloadPDF() {
    try {
      setIsGeneratingPdf(true);
      toast.loading('Generating 2-page A4 Proposal PDF...', { id: 'pdf-toast' });
      await generateProposalPDF(currentProposalData);
      toast.success('Proposal PDF downloaded successfully!', { id: 'pdf-toast' });
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to generate PDF. Check console.', { id: 'pdf-toast' });
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  function handleShareWhatsApp() {
    let pkgDetails = '';
    if (packageMode === 'single' && currentProposalData.singlePackage) {
      const p = currentProposalData.singlePackage;
      const price = p.customPriceOverride ?? p.calculatedPrice;
      pkgDetails = `\n📋 *Proposed Campaign Package:*
• Fleet: ${p.buses} Private Buses (32" Commercial Displays)
• Duration: ${p.videoDurationSeconds} Seconds Video Ad with Audio
• Period: ${p.durationLabel}
• Investment: *${formatINR(price)}*`;
    } else if (packageMode === 'multiple' && currentProposalData.multiplePackages) {
      pkgDetails = `\n📋 *Campaign Options Comparison:*`;
      currentProposalData.multiplePackages.forEach((p, idx) => {
        const price = p.customPriceOverride ?? p.calculatedPrice;
        pkgDetails += `\n*Option ${idx + 1}: ${p.name}*
• ${p.buses} Buses | ${p.videoDurationSeconds}s Ad | ${p.durationLabel}
• Investment: *${formatINR(price)}*`;
      });
    }

    const text = `*Catgorithm Bus Screen Advertisement Proposal*
🏢 *Client:* ${clientName}
📅 *Date:* ${formattedDate}
📍 *Transit Network:* Kollam Prime Corridors, Kerala
${pkgDetails}

✨ *Network Highlights:*
• 32-Inch HD Commercial Screens with Audio
• 7 Prime Transit Corridors
• 40–50 Daily Ad Plays per Bus (~15,000+ Daily Reach)
• 24/7 Dedicated Advertiser Monitoring Dashboard

📞 *Contact:* +91 97463 36175 | teamcatgorithm@gmail.com
🌐 *Website:* www.catgorithm.in`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  function handleCopySummary() {
    let pkgDetails = '';
    if (packageMode === 'single' && currentProposalData.singlePackage) {
      const p = currentProposalData.singlePackage;
      const price = p.customPriceOverride ?? p.calculatedPrice;
      pkgDetails = `\nPackage: ${p.buses} Buses, ${p.videoDurationSeconds}s Ad, ${p.durationLabel} — ${formatINR(price)}`;
    } else if (packageMode === 'multiple' && currentProposalData.multiplePackages) {
      currentProposalData.multiplePackages.forEach((p) => {
        const price = p.customPriceOverride ?? p.calculatedPrice;
        pkgDetails += `\n• ${p.name}: ${p.buses} Buses, ${p.videoDurationSeconds}s, ${p.durationLabel} — ${formatINR(price)}`;
      });
    }

    const summary = `Catgorithm Bus Advertising Proposal for ${clientName}\nDate: ${formattedDate}${pkgDetails}\nDashboard: Live Web Portal 24/7\nContact: +91 97463 36175 | teamcatgorithm@gmail.com`;
    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    toast.success('Proposal summary copied to clipboard!');
    setTimeout(() => setCopiedSummary(false), 2500);
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-900 pb-20">
      {/* ── PART 1: Top Navigation Header ── */}
      <header className="sticky top-0 z-40 bg-[#080B12]/95 backdrop-blur-md border-b border-gray-800 text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Back & Brand */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all flex-shrink-0"
              title="Back to Sales Calculator"
            >
              <ArrowLeft size={16} />
            </Link>

            <Link to="/" className="flex items-center gap-2">
              <img
                src="./app-icon.png"
                alt="Catgorithm"
                className="w-7 h-7 rounded-lg object-cover border border-white/10"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <span className="font-extrabold text-base tracking-tight text-white hidden sm:inline">Catgorithm</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#d6c26e]/20 text-[#d6c26e] font-semibold border border-[#d6c26e]/30">
                Proposal Studio
              </span>
            </Link>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <PWAHeaderInstallButton />

            <Link
              to="/admin/enquiries?tab=enquiries"
              className="h-9 px-2.5 sm:px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-all"
            >
              <Users size={13} className="text-accent" />
              <span className="hidden sm:inline">Pipeline</span>
            </Link>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="h-9 px-3.5 sm:px-4 text-xs font-bold rounded-xl bg-[#d6c26e] text-slate-900 hover:bg-[#e0cf87] active:scale-95 flex items-center gap-1.5 shadow-md shadow-[#d6c26e]/20 transition-all font-sans"
            >
              <Download size={14} className={isGeneratingPdf ? 'animate-bounce' : ''} />
              <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── PART 2: Main Workspace Grid ── */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left Column: Configuration Controls (lg:col-span-7) ── */}
        <div className="lg:col-span-7 space-y-4">

          {/* 1. Client & Industry Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Building2 size={17} className="text-[#a0354e]" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Client & Proposal Details</h2>
              </div>
              <span className="text-[11px] font-semibold text-gray-400">Strictly 2-Page A4</span>
            </div>

            <div className="space-y-3">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Client / Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Banaz Furniture, Kollam"
                  className="w-full h-10 px-3 text-sm font-semibold rounded-xl border border-gray-200 focus:border-[#d6c26e] focus:ring-2 focus:ring-[#d6c26e]/20 outline-hidden transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Industry Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Client Industry / Niche <span className="text-gray-400 font-normal">(Auto-adapts proposal pitch)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(INDUSTRY_TEMPLATES) as ProposalIndustry[]).map((indKey) => {
                    const tmpl = INDUSTRY_TEMPLATES[indKey];
                    const active = industry === indKey;
                    return (
                      <button
                        key={indKey}
                        type="button"
                        onClick={() => handleIndustryChange(indKey)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                          active
                            ? 'bg-[#1f2937] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tmpl.badge}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date & Prepared By Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Proposal Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={proposalDate}
                      onChange={(e) => setProposalDate(e.target.value)}
                      className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-hidden focus:border-[#d6c26e]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Prepared By
                  </label>
                  <input
                    type="text"
                    value={preparedBy}
                    onChange={(e) => setPreparedBy(e.target.value)}
                    className="w-full h-9 px-3 text-xs font-medium rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-hidden focus:border-[#d6c26e]"
                  />
                </div>
              </div>
            </div>

            {/* Collapsible Objective Customizer */}
            <div className="mt-3.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowObjectiveCustomizer(!showObjectiveCustomizer)}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#d6c26e]" />
                  Customize Pitch & Objective Text
                </span>
                {showObjectiveCustomizer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showObjectiveCustomizer && (
                <div className="mt-2.5 space-y-2.5 text-xs">
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Paragraph 1 (Opportunity / Problem):</label>
                    <textarea
                      rows={3}
                      value={objectiveP1}
                      onChange={(e) => setObjectiveP1(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 leading-relaxed outline-hidden focus:border-[#d6c26e]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-600 mb-1">Paragraph 2 (Catgorithm Solution):</label>
                    <textarea
                      rows={3}
                      value={objectiveP2}
                      onChange={(e) => setObjectiveP2(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 leading-relaxed outline-hidden focus:border-[#d6c26e]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleResetObjectives}
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1"
                    >
                      <RefreshCw size={11} /> Reset to {INDUSTRY_TEMPLATES[industry]?.badge} Default
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Package Mode Selector */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-[#a0354e]" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Package Mode</h2>
            </div>

            {/* 3 Simple Mode Buttons */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setPackageMode('none');
                  if (activePreviewPage === 3) setActivePreviewPage(2);
                }}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all ${
                  packageMode === 'none'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                No Package
              </button>

              <button
                type="button"
                onClick={() => setPackageMode('single')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all ${
                  packageMode === 'single'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Single Package
              </button>

              <button
                type="button"
                onClick={() => setPackageMode('multiple')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all ${
                  packageMode === 'multiple'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Multiple Packages
              </button>
            </div>

            {/* Mode B: Single Package Configurator (Keyboard Editable) */}
            {packageMode === 'single' && (
              <div className="mt-4 space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Number of Buses</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={singleBuses}
                      onChange={(e) => setSingleBuses(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      className="w-full h-9 px-2.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d6c26e] outline-hidden"
                      placeholder="e.g. 5"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Video Duration (Sec)</label>
                    <input
                      type="number"
                      min={5}
                      max={120}
                      step={5}
                      value={singleSeconds}
                      onChange={(e) => setSingleSeconds(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      className="w-full h-9 px-2.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d6c26e] outline-hidden"
                      placeholder="e.g. 30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Campaign Days</label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={singleDays}
                      onChange={(e) => setSingleDays(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      className="w-full h-9 px-2.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d6c26e] outline-hidden"
                      placeholder="e.g. 30"
                    />
                    <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">
                      {formatDurationLabel(typeof singleDays === 'number' && singleDays > 0 ? singleDays : 30)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    Custom Investment Override (₹)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={singleCustomPrice}
                      onChange={(e) => setSingleCustomPrice(e.target.value)}
                      placeholder={`Auto: ${formatINR(singleCalc.totalPrice)}`}
                      className="w-full h-9 px-2.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-emerald-700 focus:border-[#d6c26e] outline-hidden"
                    />
                    {singleCustomPrice && (
                      <button
                        type="button"
                        onClick={() => setSingleCustomPrice('')}
                        className="text-[10px] font-semibold text-gray-400 hover:text-gray-700 whitespace-nowrap"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Campaign Investment:</span>
                    <span className="font-extrabold text-sm text-gray-900">
                      {formatINR(singleFinalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
                    <span>Actual Tariff: <span className="line-through">{formatINR(singleCalc.standardPrice)}</span></span>
                    <span className="text-emerald-700 font-bold">
                      {singleDiscountRate > 0 ? `${singleDiscountRate}% Off` : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode C: Multiple Options Configurator (Keyboard Editable, Dynamic Add/Delete) */}
            {packageMode === 'multiple' && (
              <div className="mt-4 space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="font-bold text-gray-700">Package Options ({packageList.length})</span>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-2xs"
                  >
                    <span>+ Add Option</span>
                  </button>
                </div>

                {packageList.map((pkg, idx) => {
                  const computed = computedPackages.find(p => p.id === pkg.id) || {
                    buses: 1, seconds: 30, days: 30, calculatedPrice: 0, finalPrice: 0, durationLabel: '30 Days', standardPrice: 0, discountRate: 0, savings: 0, dailyPlaysPerBus: '40–50 Plays / Day'
                  };
                  return (
                    <div key={pkg.id} className="p-3 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => updatePackageOption(pkg.id, 'name', e.target.value)}
                          className="h-8 px-2.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white flex-1 focus:border-[#d6c26e] outline-hidden"
                          placeholder={`Option ${idx + 1}`}
                        />
                        <span className="text-xs font-extrabold text-slate-900">
                          {formatINR(computed.finalPrice)}
                        </span>
                        {packageList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(pkg.id)}
                            className="h-7 w-7 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center transition-colors"
                            title="Remove Option"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Buses:</span>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={pkg.buses}
                            onChange={(e) => updatePackageOption(pkg.id, 'buses', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            className="w-full h-8 px-2 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d6c26e] outline-hidden"
                            placeholder="e.g. 5"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Ad Seconds:</span>
                          <input
                            type="number"
                            min={5}
                            max={120}
                            step={5}
                            value={pkg.seconds}
                            onChange={(e) => updatePackageOption(pkg.id, 'seconds', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            className="w-full h-8 px-2 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d6c26e] outline-hidden"
                            placeholder="e.g. 30"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-gray-500 font-semibold block mb-0.5">Days:</span>
                          <input
                            type="number"
                            min={1}
                            max={365}
                            value={pkg.days}
                            onChange={(e) => updatePackageOption(pkg.id, 'days', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            className="w-full h-8 px-2 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#d6c26e] outline-hidden"
                            placeholder="e.g. 30"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-gray-100">
                        <div className="space-y-0.5">
                          <span className="text-emerald-700 font-semibold block">
                            {computed.durationLabel} • 40–50 Plays/Day
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            Actual: {formatINR(computed.standardPrice || 0)} {computed.discountRate ? `(${computed.discountRate}% Off)` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 text-[10px]">Price (₹):</span>
                          <input
                            type="number"
                            value={pkg.priceOverride}
                            onChange={(e) => updatePackageOption(pkg.id, 'priceOverride', e.target.value)}
                            placeholder={String(computed.calculatedPrice)}
                            className="w-24 h-7 px-1.5 text-xs font-bold rounded-md border border-gray-200 bg-gray-50 text-right focus:bg-white text-emerald-800 focus:border-[#d6c26e] outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions (WhatsApp & Copy) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Share2 size={15} />
              <span>Share Proposal via WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="h-11 px-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 active:scale-98 text-gray-700 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              {copiedSummary ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
              <span>{copiedSummary ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>
        </div>

        {/* ── Right Column: Live Document Preview (lg:col-span-5) ── */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Live A4 Preview</span>
              <span className="text-[10px] font-semibold text-gray-400">Studio Shodwe Template</span>
            </div>

            {/* Page Switcher */}
            <div className="flex items-center gap-1 bg-gray-200 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setActivePreviewPage(1)}
                className={`px-3 py-1 rounded-md transition-all ${
                  activePreviewPage === 1 ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Page 1
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewPage(2)}
                className={`px-3 py-1 rounded-md transition-all ${
                  activePreviewPage === 2 ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Page 2
              </button>
              {packageMode !== 'none' && (
                <button
                  type="button"
                  onClick={() => setActivePreviewPage(3)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    activePreviewPage === 3 ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Page 3
                </button>
              )}
            </div>
          </div>

          {/* A4 Sheet Container */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden relative aspect-[1/1.414] p-5 sm:p-6 text-[11px] flex flex-col justify-between select-none">

            {/* ── PREVIEW PAGE 1 ── */}
            {activePreviewPage === 1 && (
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Top Header with Logo & Gold Line */}
                  <div className="flex items-center justify-between pb-2">
                    <img
                      src="./catgorithm-logo.png"
                      alt="Catgorithm"
                      className="h-7 w-auto object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Signature Studio Shodwe Header Line (Gold #d6c26e left + Dark Grey #333132 continuation) */}
                  <div className="relative h-[2px] w-full mt-1 mb-4 flex items-center">
                    <div className="h-[2.5px] w-[35%] bg-[#d6c26e]" />
                    <div className="h-[0.8px] flex-1 bg-[#333132]" />
                  </div>

                  {/* Proposal Heading */}
                  <div className="text-center my-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Bus Screen Advertisement Proposal For
                    </p>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5 uppercase">
                      {clientName || 'Valued Client'}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Prepared by: {preparedBy || 'Catgorithm'} | {formattedDate}
                    </p>
                  </div>

                  {/* The Opportunity */}
                  <div className="mt-3.5 space-y-1.5">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                      {objectiveTitle}
                    </h4>
                    <p className="text-[10px] text-gray-700 leading-relaxed text-justify">
                      {objectiveP1}
                    </p>
                  </div>

                  {/* Our Advertising Network */}
                  <div className="mt-3.5 space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                      Our Advertising Network
                    </h4>
                    <p className="text-[10px] text-gray-700 leading-tight text-justify">
                      Our network consists of digital display screens installed inside selected private buses, operating along established routes throughout Kollam. Each screen provides a dedicated space for promotional content, with advertisements scheduled to run as part of a continuous digital display network. The highlight of our network are :
                    </p>
                    <ul className="space-y-1 mt-1 text-[10px] text-gray-700">
                      <li className="flex items-center gap-1.5 text-justify">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span><strong>7 Advertising Routes :</strong> Coverage across key corridors in Kollam.</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-justify">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span><strong>32-inch Commercial Displays :</strong> HD digital screens with audio.</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-justify">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span><strong>Flexible Duration :</strong> Video advertisements of up to 60 seconds.</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-justify">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span><strong>40-50 Daily Plays :</strong> Approximate daily advertisement plays per bus.</span>
                      </li>
                      <li className="flex items-center gap-1.5 text-justify">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span><strong>24/7 Campaign Monitoring :</strong> Dedicated advertiser dashboard access.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Why Catgorithm? */}
                  <div className="mt-3.5 space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                      Why Catgorithm?
                    </h4>
                    <p className="text-[10px] text-gray-700 leading-relaxed text-justify">
                      We bring together strategically placed digital displays, engaging video content and flexible advertising plans in one platform. With a focus on convenience, campaign adaptability and performance transparency, we offer businesses a practical alternative to conventional outdoor advertising.
                    </p>
                  </div>
                </div>

                {/* Page 1 Footer */}
                <div className="pt-3 border-t border-[#d6c26e]/80 flex items-center justify-between text-[9px] text-gray-600">
                  <span>teamcatgorithm@gmail.com</span>
                  <span>www.catgorithm.in</span>
                </div>
              </div>
            )}

            {/* ── PREVIEW PAGE 2 ── */}
            {activePreviewPage === 2 && (
              <div className="flex flex-col h-full justify-between pt-1">
                <div className="space-y-3.5">
                  {/* Deliverables */}
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                      Campaign Deliverables
                    </h4>
                    <p className="text-[9.5px] text-gray-600">Every campaign is supported by the following:</p>
                    <div className="grid grid-cols-1 gap-1 text-[9.2px] text-gray-700 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Advertisement playback on the selected bus screens.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Repeated advertisement exposure throughout operating hours.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Digital advertisement delivery with audio.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Campaign activation and scheduling.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Dedicated advertiser dashboard access.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Campaign activity monitoring.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Advertisement preview and campaign status tracking.</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Monitoring Dashboard */}
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                      Campaign Monitoring
                    </h4>
                    <p className="text-[9.5px] text-gray-600">Our advertiser dashboard provides campaign visibility through:</p>
                    <div className="grid grid-cols-1 gap-1 text-[9.2px] text-gray-700 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Active buses and screens.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Advertisement plays per screen.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Daily screen time.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Running advertisements.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Advertisement preview.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Campaign description and expiry date.</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1f2937] flex-shrink-0" />
                        <span>Number of days the advertisement has been played.</span>
                      </div>
                    </div>
                  </div>

                  {/* Our Commitment (Shown on Page 2 ONLY in No Package Mode) */}
                  {packageMode === 'none' && (
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                        Our Commitment
                      </h4>
                      <p className="text-[9.2px] text-gray-700 leading-relaxed text-justify">
                        At Catgorithm, we aim to make advertising more accessible, measurable and effective for businesses.
                      </p>
                      <p className="text-[9.2px] text-gray-700 leading-relaxed text-justify">
                        From campaign activation to ongoing monitoring, we are committed to providing a reliable advertising experience that helps your brand stay visible where your customers travel every day.
                      </p>
                      <p className="text-[9.2px] text-gray-700 leading-relaxed text-justify">
                        We look forward to building a successful advertising partnership with {clientName}. For any questions or further discussion, please feel free to contact us :
                      </p>
                      <div className="text-[9.2px] text-gray-800 space-y-0.5 pt-1">
                        <div>📞 WhatsApp / Call: +91 9746336175</div>
                        <div>✉ Email: teamcatgorithm@gmail.com</div>
                        <div>🌐 Website: www.catgorithm.in</div>
                      </div>
                    </div>
                  )}

                  {/* Proposed Investment Section (Single) on Page 2 */}
                  {packageMode === 'single' && (
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                        Proposed Campaign Investment
                      </h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden text-[9px]">
                        <div className="bg-slate-900 text-white font-bold px-2.5 py-1.5 flex justify-between">
                          <span>Campaign Particulars</span>
                          <span>Package Details</span>
                        </div>
                        <div className="p-2 space-y-1.5 text-gray-700 bg-white">
                          <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span>Fleet Allocation:</span>
                            <span className="font-semibold">{singleBuses} Private Buses</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span>Video Ad Duration:</span>
                            <span className="font-semibold">{singleSeconds} Seconds</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span>Campaign Period:</span>
                            <span className="font-semibold">{formatDurationLabel(typeof singleDays === 'number' && singleDays > 0 ? singleDays : 30)}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span>Daily Plays:</span>
                            <span className="font-semibold">40–50 Plays / Day</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1 text-gray-500">
                            <span>Actual Price:</span>
                            <span className="line-through">{formatINR(singleCalc.standardPrice)}</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1 text-emerald-700 font-bold">
                            <span>Discount Rate:</span>
                            <span>{singleDiscountRate > 0 ? `${singleDiscountRate}% Off` : '0%'}</span>
                          </div>
                          <div className="flex justify-between text-slate-900 font-extrabold pt-1">
                            <span>Total Campaign Investment:</span>
                            <span className="text-slate-900 text-xs font-black">
                              {formatINR(singleFinalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Proposed Investment Options (Multiple) on Page 2 */}
                  {packageMode === 'multiple' && (
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                        Proposed Campaign Options
                      </h4>
                      <div className="border border-gray-200 rounded-lg overflow-x-auto text-[8.5px]">
                        <table className="w-full min-w-[260px] border-collapse text-center">
                          <thead>
                            <tr className="bg-slate-900 text-white font-bold">
                              <th className="text-left px-2 py-1.5 font-bold">Particulars</th>
                              {computedPackages.map((pkg, idx) => (
                                <th key={pkg.id} className="px-2 py-1.5 font-bold whitespace-nowrap">
                                  {pkg.name || `Option ${idx + 1}`}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                            <tr>
                              <td className="text-left px-2 py-1 font-semibold text-gray-900">Fleet:</td>
                              {computedPackages.map((pkg) => (
                                <td key={pkg.id} className="px-2 py-1 whitespace-nowrap">
                                  {pkg.buses} Buses
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="text-left px-2 py-1 font-semibold text-gray-900">Duration:</td>
                              {computedPackages.map((pkg) => (
                                <td key={pkg.id} className="px-2 py-1 whitespace-nowrap">
                                  {pkg.seconds}s
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="text-left px-2 py-1 font-semibold text-gray-900">Period:</td>
                              {computedPackages.map((pkg) => (
                                <td key={pkg.id} className="px-2 py-1 whitespace-nowrap">
                                  {pkg.durationLabel}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="text-left px-2 py-1 font-semibold text-gray-900">Daily Plays:</td>
                              {computedPackages.map((pkg) => (
                                <td key={pkg.id} className="px-2 py-1 whitespace-nowrap">
                                  40–50 / Day
                                </td>
                              ))}
                            </tr>
                            <tr className="text-gray-500">
                              <td className="text-left px-2 py-1 font-semibold">Actual Price:</td>
                              {computedPackages.map((pkg) => (
                                <td key={pkg.id} className="px-2 py-1 whitespace-nowrap line-through text-gray-400">
                                  {formatINR(pkg.standardPrice)}
                                </td>
                              ))}
                            </tr>
                            <tr className="text-emerald-700 font-bold bg-emerald-50/40">
                              <td className="text-left px-2 py-1 font-bold">Discount Rate:</td>
                              {computedPackages.map((pkg) => (
                                <td key={pkg.id} className="px-2 py-1 whitespace-nowrap">
                                  {pkg.discountRate > 0 ? `${pkg.discountRate}% Off` : '0%'}
                                </td>
                              ))}
                            </tr>
                            <tr className="font-bold text-slate-900 bg-gray-50/60">
                              <td className="text-left px-2 py-1.5 font-extrabold">Investment:</td>
                              {computedPackages.map((pkg) => {
                                const price = pkg.customPriceOverride ?? pkg.calculatedPrice;
                                return (
                                  <td key={pkg.id} className="px-2 py-1.5 whitespace-nowrap text-[#a0354e] font-extrabold">
                                    {formatINR(price)}
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Page 2 Footer */}
                <div className="pt-3 border-t border-[#d6c26e]/80 flex items-center justify-between text-[9px] text-gray-600">
                  <span>teamcatgorithm@gmail.com</span>
                  <span>www.catgorithm.in</span>
                </div>
              </div>
            )}

            {/* ── PREVIEW PAGE 3 (Package Modes Only: Our Commitment) ── */}
            {activePreviewPage === 3 && packageMode !== 'none' && (
              <div className="flex flex-col h-full justify-between pt-1">
                <div className="space-y-3.5">
                  {/* Our Commitment on Page 3 */}
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                      Our Commitment
                    </h4>
                    <p className="text-[9.2px] text-gray-700 leading-relaxed text-justify">
                      At Catgorithm, we aim to make advertising more accessible, measurable and effective for businesses.
                    </p>
                    <p className="text-[9.2px] text-gray-700 leading-relaxed text-justify">
                      From campaign activation to ongoing monitoring, we are committed to providing a reliable advertising experience that helps your brand stay visible where your customers travel every day.
                    </p>
                    <p className="text-[9.2px] text-gray-700 leading-relaxed text-justify">
                      We look forward to building a successful advertising partnership with {clientName}. For any questions or further discussion, please feel free to contact us :
                    </p>
                    <div className="text-[9.2px] text-gray-800 space-y-0.5 pt-1">
                      <div>📞 WhatsApp / Call: +91 9746336175</div>
                      <div>✉ Email: teamcatgorithm@gmail.com</div>
                      <div>🌐 Website: www.catgorithm.in</div>
                    </div>
                  </div>
                </div>

                {/* Page 3 Footer */}
                <div className="pt-3 border-t border-[#d6c26e]/80 flex items-center justify-between text-[9px] text-gray-600">
                  <span>teamcatgorithm@gmail.com</span>
                  <span>www.catgorithm.in</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick PDF Action under Preview */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="w-full h-11 rounded-xl bg-[#d6c26e] text-slate-900 hover:bg-[#e0cf87] active:scale-98 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Download size={15} />
            <span>
              {isGeneratingPdf
                ? 'Generating PDF...'
                : packageMode === 'none'
                ? 'Download Full 2-Page Proposal PDF'
                : 'Download Full 3-Page Proposal PDF'}
            </span>
          </button>
        </div>

      </main>
    </div>
  );
}
