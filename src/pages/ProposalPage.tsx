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
  const [activePreviewPage, setActivePreviewPage] = useState<1 | 2>(1);
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
  const [singleBuses, setSingleBuses] = useState(5);
  const [singleDays, setSingleDays] = useState(30);
  const [singleSeconds, setSingleSeconds] = useState(30);
  const [singleCustomPrice, setSingleCustomPrice] = useState<string>('');
  const [singleRoutes, setSingleRoutes] = useState('Selected High-Traffic Corridors');

  // ── Multiple Packages State (3 Comparative Options) ──
  const [opt1Name, setOpt1Name] = useState('Option 1 (Starter)');
  const [opt1Buses, setOpt1Buses] = useState(2);
  const [opt1Days, setOpt1Days] = useState(30);
  const [opt1Seconds, setOpt1Seconds] = useState(20);
  const [opt1PriceOverride, setOpt1PriceOverride] = useState<string>('');

  const [opt2Name, setOpt2Name] = useState('Option 2 (Growth)');
  const [opt2Buses, setOpt2Buses] = useState(5);
  const [opt2Days, setOpt2Days] = useState(30);
  const [opt2Seconds, setOpt2Seconds] = useState(30);
  const [opt2PriceOverride, setOpt2PriceOverride] = useState<string>('');

  const [opt3Name, setOpt3Name] = useState('Option 3 (Dominance)');
  const [opt3Buses, setOpt3Buses] = useState(10);
  const [opt3Days, setOpt3Days] = useState(30);
  const [opt3Seconds, setOpt3Seconds] = useState(30);
  const [opt3PriceOverride, setOpt3PriceOverride] = useState<string>('');

  const [recommendedOption, setRecommendedOption] = useState<1 | 2 | 3>(2);

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
  const singleCalc = useMemo(() => {
    return calculateCustomPrice(singleBuses, singleDays, singleSeconds);
  }, [singleBuses, singleDays, singleSeconds]);

  const opt1Calc = useMemo(() => {
    return calculateCustomPrice(opt1Buses, opt1Days, opt1Seconds);
  }, [opt1Buses, opt1Days, opt1Seconds]);

  const opt2Calc = useMemo(() => {
    return calculateCustomPrice(opt2Buses, opt2Days, opt2Seconds);
  }, [opt2Buses, opt2Days, opt2Seconds]);

  const opt3Calc = useMemo(() => {
    return calculateCustomPrice(opt3Buses, opt3Days, opt3Seconds);
  }, [opt3Buses, opt3Days, opt3Seconds]);

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
      singlePkg = {
        id: 'single',
        name: 'Selected Campaign Package',
        buses: singleBuses,
        videoDurationSeconds: singleSeconds,
        days: singleDays,
        durationLabel: singleDays === 30 ? '1 Month (30 Days)' : `${singleDays} Days`,
        routesLabel: singleRoutes,
        monthlyPlaysEstimate: `~${(singleBuses * 45 * singleDays).toLocaleString('en-IN')} Total Verified Plays`,
        dashboardAccess: 'Full 24/7 Access',
        calculatedPrice: singleCalc.totalPrice,
        customPriceOverride: isNaN(overrideVal as number) ? undefined : overrideVal,
      };
    }

    let multPkgs: ProposalPackageOption[] | undefined = undefined;
    if (packageMode === 'multiple') {
      const o1Ov = opt1PriceOverride ? parseInt(opt1PriceOverride, 10) : undefined;
      const o2Ov = opt2PriceOverride ? parseInt(opt2PriceOverride, 10) : undefined;
      const o3Ov = opt3PriceOverride ? parseInt(opt3PriceOverride, 10) : undefined;

      multPkgs = [
        {
          id: 'opt1',
          name: opt1Name,
          buses: opt1Buses,
          videoDurationSeconds: opt1Seconds,
          days: opt1Days,
          durationLabel: opt1Days === 30 ? '1 Month (30 Days)' : `${opt1Days} Days`,
          routesLabel: 'Selected High-Traffic Corridors',
          monthlyPlaysEstimate: `~${(opt1Buses * 45 * opt1Days).toLocaleString('en-IN')} Plays`,
          dashboardAccess: 'Full Access',
          calculatedPrice: opt1Calc.totalPrice,
          customPriceOverride: isNaN(o1Ov as number) ? undefined : o1Ov,
          isRecommended: recommendedOption === 1,
        },
        {
          id: 'opt2',
          name: opt2Name,
          buses: opt2Buses,
          videoDurationSeconds: opt2Seconds,
          days: opt2Days,
          durationLabel: opt2Days === 30 ? '1 Month (30 Days)' : `${opt2Days} Days`,
          routesLabel: 'Prime Commercial Corridors',
          monthlyPlaysEstimate: `~${(opt2Buses * 45 * opt2Days).toLocaleString('en-IN')} Plays`,
          dashboardAccess: 'Full Access',
          calculatedPrice: opt2Calc.totalPrice,
          customPriceOverride: isNaN(o2Ov as number) ? undefined : o2Ov,
          isRecommended: recommendedOption === 2,
        },
        {
          id: 'opt3',
          name: opt3Name,
          buses: opt3Buses,
          videoDurationSeconds: opt3Seconds,
          days: opt3Days,
          durationLabel: opt3Days === 30 ? '1 Month (30 Days)' : `${opt3Days} Days`,
          routesLabel: 'All 7 Prime Corridors (Full Network)',
          monthlyPlaysEstimate: `~${(opt3Buses * 45 * opt3Days).toLocaleString('en-IN')} Plays`,
          dashboardAccess: 'Full Access',
          calculatedPrice: opt3Calc.totalPrice,
          customPriceOverride: isNaN(o3Ov as number) ? undefined : o3Ov,
          isRecommended: recommendedOption === 3,
        },
      ];
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
    packageMode, singleBuses, singleDays, singleSeconds, singleRoutes, singleCustomPrice, singleCalc.totalPrice,
    opt1Name, opt1Buses, opt1Days, opt1Seconds, opt1PriceOverride, opt1Calc.totalPrice,
    opt2Name, opt2Buses, opt2Days, opt2Seconds, opt2PriceOverride, opt2Calc.totalPrice,
    opt3Name, opt3Buses, opt3Days, opt3Seconds, opt3PriceOverride, opt3Calc.totalPrice,
    recommendedOption
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#a0354e]" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Package Showcase Mode</h2>
              </div>
              <span className="text-xs text-gray-400">Choose how packages appear</span>
            </div>

            {/* 3 Mode Switcher */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setPackageMode('none')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition-all ${
                  packageMode === 'none'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                1. No Package
                <span className="block text-[10px] font-normal text-gray-400">Intro / Strategy Only</span>
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
                2. Single Package
                <span className="block text-[10px] font-normal text-gray-400">Confirmed Requirement</span>
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
                3. Multiple Options
                <span className="block text-[10px] font-normal text-gray-400">Compare 3 Packages</span>
              </button>
            </div>

            {/* Mode A Description */}
            {packageMode === 'none' && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                <p className="font-semibold mb-1">Informational Strategy Mode Active</p>
                <p>
                  No pricing table will be included in the PDF. The proposal will thoroughly present your 7 routes, 32-inch screens, daily plays, deliverables, and advertiser monitoring dashboard, concluding with a custom flight planning invitation.
                </p>
              </div>
            )}

            {/* Mode B: Single Package Configurator */}
            {packageMode === 'single' && (
              <div className="mt-4 space-y-3.5 pt-1">
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Number of Buses</label>
                    <select
                      value={singleBuses}
                      onChange={(e) => setSingleBuses(parseInt(e.target.value, 10))}
                      className="w-full h-9 px-2 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((b) => (
                        <option key={b} value={b}>{b} {b === 1 ? 'Bus' : 'Buses'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Video Duration</label>
                    <select
                      value={singleSeconds}
                      onChange={(e) => setSingleSeconds(parseInt(e.target.value, 10))}
                      className="w-full h-9 px-2 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white"
                    >
                      {[10, 15, 20, 25, 30, 40, 50, 60].map((s) => (
                        <option key={s} value={s}>{s} Seconds</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Duration Days</label>
                    <select
                      value={singleDays}
                      onChange={(e) => setSingleDays(parseInt(e.target.value, 10))}
                      className="w-full h-9 px-2 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white"
                    >
                      <option value={7}>7 Days (1 Week)</option>
                      <option value={14}>14 Days (2 Weeks)</option>
                      <option value={21}>21 Days (3 Weeks)</option>
                      <option value={30}>30 Days (1 Month)</option>
                      <option value={45}>45 Days</option>
                      <option value={60}>60 Days (2 Months)</option>
                      <option value={90}>90 Days (3 Months)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 items-center pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Route Allocation Label</label>
                    <input
                      type="text"
                      value={singleRoutes}
                      onChange={(e) => setSingleRoutes(e.target.value)}
                      className="w-full h-9 px-2.5 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">
                      Campaign Investment (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={singleCustomPrice}
                        onChange={(e) => setSingleCustomPrice(e.target.value)}
                        placeholder={`Auto: ${formatINR(singleCalc.totalPrice)}`}
                        className="w-full h-9 px-2.5 text-xs font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white text-emerald-700"
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
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-600">Calculated Investment:</span>
                  <span className="font-extrabold text-sm text-gray-900">
                    {singleCustomPrice ? `₹${parseInt(singleCustomPrice, 10).toLocaleString('en-IN')}` : formatINR(singleCalc.totalPrice)}
                    <span className="text-[10px] font-normal text-gray-400 ml-1">(+18% GST)</span>
                  </span>
                </div>
              </div>
            )}

            {/* Mode C: Multiple Comparative Options Configurator */}
            {packageMode === 'multiple' && (
              <div className="mt-4 space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="font-semibold text-gray-700">3 Comparative Campaign Tiers</span>
                  <span className="text-gray-400 text-[11px]">Click radio to set ⭐ Recommended</span>
                </div>

                {/* Option 1 */}
                <div className={`p-3 rounded-xl border transition-all ${
                  recommendedOption === 1 ? 'border-amber-400 bg-amber-50/30' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="rec-1"
                        checked={recommendedOption === 1}
                        onChange={() => setRecommendedOption(1)}
                        className="text-amber-500 focus:ring-amber-400"
                      />
                      <input
                        type="text"
                        value={opt1Name}
                        onChange={(e) => setOpt1Name(e.target.value)}
                        className="h-7 px-2 text-xs font-bold rounded-md border border-gray-200 bg-white"
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {opt1PriceOverride ? `₹${parseInt(opt1PriceOverride, 10).toLocaleString('en-IN')}` : formatINR(opt1Calc.totalPrice)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Buses:</span>
                      <select
                        value={opt1Buses}
                        onChange={(e) => setOpt1Buses(parseInt(e.target.value, 10))}
                        className="w-full h-7 px-1.5 text-xs rounded-md border border-gray-200"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(b => (
                          <option key={b} value={b}>{b} Buses</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">Duration:</span>
                      <select
                        value={opt1Seconds}
                        onChange={(e) => setOpt1Seconds(parseInt(e.target.value, 10))}
                        className="w-full h-7 px-1.5 text-xs rounded-md border border-gray-200"
                      >
                        {[10, 15, 20, 25, 30, 40, 50, 60].map(s => (
                          <option key={s} value={s}>{s}s Video</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">Period:</span>
                      <select
                        value={opt1Days}
                        onChange={(e) => setOpt1Days(parseInt(e.target.value, 10))}
                        className="w-full h-7 px-1.5 text-xs rounded-md border border-gray-200"
                      >
                        <option value={14}>14 Days</option>
                        <option value={30}>30 Days (1 Mo)</option>
                        <option value={60}>60 Days (2 Mo)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Option 2 (Growth - Default Recommended) */}
                <div className={`p-3 rounded-xl border transition-all ${
                  recommendedOption === 2 ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-300' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="rec-2"
                        checked={recommendedOption === 2}
                        onChange={() => setRecommendedOption(2)}
                        className="text-amber-500 focus:ring-amber-400"
                      />
                      <input
                        type="text"
                        value={opt2Name}
                        onChange={(e) => setOpt2Name(e.target.value)}
                        className="h-7 px-2 text-xs font-bold rounded-md border border-gray-200 bg-white"
                      />
                      {recommendedOption === 2 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded-sm">
                          ⭐ Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {opt2PriceOverride ? `₹${parseInt(opt2PriceOverride, 10).toLocaleString('en-IN')}` : formatINR(opt2Calc.totalPrice)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Buses:</span>
                      <select
                        value={opt2Buses}
                        onChange={(e) => setOpt2Buses(parseInt(e.target.value, 10))}
                        className="w-full h-7 px-1.5 text-xs rounded-md border border-gray-200"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(b => (
                          <option key={b} value={b}>{b} Buses</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">Duration:</span>
                      <select
                        value={opt2Seconds}
                        onChange={(e) => setOpt2Seconds(parseInt(e.target.value, 10))}
                        className="w-full h-7 px-1.5 text-xs rounded-md border border-gray-200"
                      >
                        {[10, 15, 20, 25, 30, 40, 50, 60].map(s => (
                          <option key={s} value={s}>{s}s Video</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">Period:</span>
                      <select
                        value={opt2Days}
                        onChange={(e) => setOpt2Days(parseInt(e.target.value, 10))}
                        className="w-full h-7 px-1.5 text-xs rounded-md border border-gray-200"
                      >
                        <option value={30}>30 Days (1 Mo)</option>
                        <option value={45}>45 Days</option>
                        <option value={60}>60 Days (2 Mo)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Option 3 (Dominance) */}
                <div className={`p-3 rounded-xl border transition-all ${
                  recommendedOption === 3 ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-300' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="rec-3"
                        checked={recommendedOption === 3}
                        onChange={() => setRecommendedOption(3)}
                        className="text-amber-500 focus:ring-amber-400"
                      />
                      <input
                        type="text"
                        value={opt3Name}
                        onChange={(e) => setOpt3Name(e.target.value)}
                        className="h-7 px-2 text-xs font-bold rounded-md border border-gray-200 bg-white"
                      />
                      {recommendedOption === 3 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded-sm">
                          ⭐ Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      {opt3PriceOverride ? `₹${parseInt(opt3PriceOverride, 10).toLocaleString('en-IN')}` : formatINR(opt3Calc.totalPrice)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Buses:</span>
                      <select
                        value={opt3Buses}
                        onChange={(e) => setOpt3Buses(parseInt(e.target.value, 10))}
                        className="w-full h-7 px-1.5 text-xs rounded-md border border-gray-200"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(b => (
                          <option key={b} value={b}>{b} Buses</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">Duration:</span>
                      <select
                        value={opt3Seconds}
                        onChange={(e) => setOpt3Seconds(parseInt(e.target.value, 10))}
                        className="w-full h-7 px-1.5 text-xs rounded-md border border-gray-200"
                      >
                        {[10, 15, 20, 25, 30, 40, 50, 60].map(s => (
                          <option key={s} value={s}>{s}s Video</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">Period:</span>
                      <select
                        value={opt3Days}
                        onChange={(e) => setOpt3Days(parseInt(e.target.value, 10))}
                        className="w-full h-7 px-1.5 text-xs rounded-md border border-gray-200"
                      >
                        <option value={30}>30 Days (1 Mo)</option>
                        <option value={60}>60 Days (2 Mo)</option>
                        <option value={90}>90 Days (3 Mo)</option>
                      </select>
                    </div>
                  </div>
                </div>
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

            {/* Page 1 / Page 2 Switcher */}
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
                        <span><strong>Flexible Advertisement Duration :</strong> Video advertisements of up to 60 seconds.</span>
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

                  {/* Optional Proposed Investment Section (Single or Multiple only) */}
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
                            <span className="font-semibold">{singleBuses} Private Buses (Commercial Displays)</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span>Video Ad Duration:</span>
                            <span className="font-semibold">{singleSeconds}s Video with Audio</span>
                          </div>
                          <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span>Campaign Period:</span>
                            <span className="font-semibold">{singleDays} Days</span>
                          </div>
                          <div className="flex justify-between text-slate-900 font-extrabold pt-1">
                            <span>Total Campaign Investment:</span>
                            <span className="text-slate-900 text-xs">
                              {singleCustomPrice ? `₹${parseInt(singleCustomPrice, 10).toLocaleString('en-IN')}` : formatINR(singleCalc.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {packageMode === 'multiple' && (
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">
                        Proposed Campaign Investment Options
                      </h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden text-[8.5px]">
                        <div className="bg-slate-900 text-white font-bold px-2 py-1.5 grid grid-cols-4 text-center">
                          <span className="text-left">Particulars</span>
                          <span>{opt1Name.replace(/\s*\(.*\)/, '') || 'Option 1'}</span>
                          <span>{opt2Name.replace(/\s*\(.*\)/, '') || 'Option 2'}</span>
                          <span>{opt3Name.replace(/\s*\(.*\)/, '') || 'Option 3'}</span>
                        </div>
                        <div className="p-1.5 space-y-1 text-gray-700 bg-white">
                          <div className="grid grid-cols-4 text-center border-b border-gray-100 pb-1">
                            <span className="text-left font-semibold">Fleet:</span>
                            <span>{opt1Buses} Buses</span>
                            <span>{opt2Buses} Buses</span>
                            <span>{opt3Buses} Buses</span>
                          </div>
                          <div className="grid grid-cols-4 text-center border-b border-gray-100 pb-1">
                            <span className="text-left font-semibold">Duration:</span>
                            <span>{opt1Seconds}s</span>
                            <span>{opt2Seconds}s</span>
                            <span>{opt3Seconds}s</span>
                          </div>
                          <div className="grid grid-cols-4 text-center border-b border-gray-100 pb-1">
                            <span className="text-left font-semibold">Period:</span>
                            <span>{opt1Days} Days</span>
                            <span>{opt2Days} Days</span>
                            <span>{opt3Days} Days</span>
                          </div>
                          <div className="grid grid-cols-4 text-center pt-1 font-bold text-slate-900">
                            <span className="text-left">Investment:</span>
                            <span>{opt1PriceOverride ? `₹${parseInt(opt1PriceOverride, 10).toLocaleString('en-IN')}` : formatINR(opt1Calc.totalPrice)}</span>
                            <span>{opt2PriceOverride ? `₹${parseInt(opt2PriceOverride, 10).toLocaleString('en-IN')}` : formatINR(opt2Calc.totalPrice)}</span>
                            <span>{opt3PriceOverride ? `₹${parseInt(opt3PriceOverride, 10).toLocaleString('en-IN')}` : formatINR(opt3Calc.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Commitment */}
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

                {/* Page 2 Footer */}
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
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Full 2-Page Proposal PDF'}</span>
          </button>
        </div>

      </main>
    </div>
  );
}
