import { useEffect, useState } from 'react'
import { getAdminStats } from '../../lib/dataStore'
import { formatINR } from '../../lib/pricingEngine'
import { StatCard } from '../../components/ui'
import {
  Users, FileText, CheckCircle, TrendingUp,
  Target, BarChart3, RefreshCw
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface Stats {
  totalEnquiries: number
  newEnquiries: number
  quotationsGenerated: number
  confirmedCampaigns: number
  completedCampaigns: number
  confirmedRevenue: number
  averageCampaignValue: number
  popularBusCount: string
  popularCampaignDuration: string
  revenueTarget: number
  revenueTargetLabel: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const s = await getAdminStats()
    setStats(s as Stats)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const revenueProgress = stats
    ? Math.min((stats.confirmedRevenue / stats.revenueTarget) * 100, 100)
    : 0

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary-text">Dashboard</h1>
          <p className="text-secondary-text text-sm mt-0.5">Overview of all campaign activity.</p>
        </div>
        <button onClick={load} className="btn-ghost text-sm" aria-label="Refresh">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Total Enquiries" value={stats?.totalEnquiries ?? 0} subtext="All time" />
        <StatCard label="New Enquiries" value={stats?.newEnquiries ?? 0} accent subtext="Awaiting contact" />
        <StatCard label="Quotations Generated" value={stats?.quotationsGenerated ?? 0} />
        <StatCard label="Confirmed Campaigns" value={stats?.confirmedCampaigns ?? 0} subtext="Revenue counted" />
        <StatCard label="Completed Campaigns" value={stats?.completedCampaigns ?? 0} />
        <StatCard label="Confirmed Revenue" value={stats?.confirmedRevenue ?? 0} currency accent subtext="From confirmed campaigns" />
        <StatCard label="Avg. Campaign Value" value={stats?.averageCampaignValue ?? 0} currency subtext="Confirmed + completed" />
        <StatCard label="Popular Bus Count" value={stats?.popularBusCount ?? '—'} subtext="Most selected" />
      </div>

      {/* Revenue target widget */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-accent" />
            <h2 className="font-bold text-primary-text">Revenue Target</h2>
          </div>
          <span className="text-xs text-secondary-text">{stats?.revenueTargetLabel ?? ''}</span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          <div>
            <p className="text-xs text-secondary-text mb-1">Target</p>
            <p className="text-xl font-black text-primary-text tabular-nums">{formatINR(stats?.revenueTarget ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-secondary-text mb-1">Confirmed Revenue</p>
            <p className="text-xl font-black text-accent tabular-nums">{formatINR(stats?.confirmedRevenue ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-secondary-text mb-1">Remaining Target</p>
            <p className="text-xl font-black text-primary-text tabular-nums">
              {formatINR(Math.max(0, (stats?.revenueTarget ?? 0) - (stats?.confirmedRevenue ?? 0)))}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-secondary-text mb-1.5">
            <span>Progress</span>
            <span className="font-semibold text-primary-text">{revenueProgress.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-violet rounded-full transition-all duration-700"
              style={{ width: `${revenueProgress}%` }}
            />
          </div>
          <p className="text-xs text-secondary-text/70 mt-2">
            Revenue projection is based on confirmed campaign values only. Uncollected amounts are not included.
          </p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/admin/enquiries', label: 'Manage Enquiries', desc: 'View, filter and update enquiry statuses.', icon: Users },
          { to: '/admin/fleet', label: 'Fleet Management', desc: 'Configure bus availability and routes.', icon: BarChart3 },
          { to: '/admin/pricing', label: 'Pricing Settings', desc: 'Manage package prices and discount rules.', icon: TrendingUp },
        ].map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to} className="card p-5 flex gap-4 hover:border-accent/30 transition-colors duration-200 group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/10 transition-colors">
              <Icon size={18} className="text-accent" />
            </div>
            <div>
              <p className="font-semibold text-primary-text text-sm mb-0.5">{label}</p>
              <p className="text-secondary-text text-xs leading-relaxed">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Dev mode notice */}
      <div className="card p-4 border-amber-200 bg-amber-50/50">
        <p className="text-amber-700 text-xs font-semibold mb-0.5">Development Mode — Data Not Persisted</p>
        <p className="text-amber-600 text-xs">
          The application is running with an in-memory data store. Enquiries, quotations and settings will reset on page refresh.
          Configure Supabase credentials and update <code className="font-mono bg-amber-100 px-1 rounded">src/lib/dataStore.ts</code> to enable persistent storage.
        </p>
      </div>
    </div>
  )
}
