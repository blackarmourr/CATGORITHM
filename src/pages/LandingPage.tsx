import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calculator, ChevronRight, Bus, Monitor, TrendingUp, Shield, Zap, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { FadeIn } from '../components/ui'

const BENEFITS = [
  {
    icon: Monitor,
    title: 'Digital Screens Inside Buses',
    description: 'Your advertisement plays on high-visibility digital screens installed inside private buses, reaching captive audiences during their commute.',
  },
  {
    icon: TrendingUp,
    title: 'Transparent, Instant Pricing',
    description: 'Configure your campaign and get an accurate price immediately. No hidden fees, no opaque quote requests — just clear, honest pricing.',
  },
  {
    icon: Zap,
    title: 'Flexible Campaign Options',
    description: 'Choose from 1 to 10 buses, any ad duration and 1 to 12 months. Custom durations and campaign lengths are fully supported.',
  },
  {
    icon: Shield,
    title: 'Professional Quotations',
    description: 'Generate and download a detailed professional quotation instantly. Share it with your team or finance department.',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Configure Your Campaign', desc: 'Select the number of buses, your ad duration and how long you want to run your campaign.' },
  { step: '02', title: 'Review Instant Pricing', desc: 'See your campaign price, package savings and detailed unit economics update live.' },
  { step: '03', title: 'Download Your Quotation', desc: 'Generate a professional PDF quotation to share or keep for reference.' },
  { step: '04', title: 'Submit Your Enquiry', desc: 'Send your details and our team will confirm availability and next steps.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative bg-[#080B12] min-h-screen flex items-center overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-violet/15 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[160px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 text-white/70 text-sm font-medium mb-8"
            >
              <MapPin size={13} className="text-cyan-hl" />
              Kollam, Kerala · Digital Bus Advertising
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] mb-6"
            >
              Your Brand.
              <br />
              <span className="bg-gradient-to-r from-accent via-cyan-hl to-accent-violet bg-clip-text text-transparent">
                On the Move.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/60 leading-relaxed mb-10 max-w-lg"
            >
              Reach audiences across Kollam with strategically placed digital advertisements inside private buses. Configure your campaign and get an instant, transparent price.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/calculator"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-accent text-white font-bold rounded-2xl hover:bg-blue-600 transition-all duration-200 text-base shadow-xl shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5"
              >
                <Calculator size={18} />
                Calculate Your Campaign
                <ChevronRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 border border-white/20 text-white/80 font-semibold rounded-2xl hover:border-white/40 hover:text-white hover:bg-white/5 transition-all duration-200 text-base"
              >
                Explore Advertising
              </a>
            </motion.div>
          </div>

          {/* Hero visual — digital bus screen mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Bus interior mockup */}
              <div className="bg-[#0D1117] border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="bg-[#111827] rounded-2xl p-4 mb-4">
                  {/* Screen */}
                  <div className="bg-gradient-to-br from-accent via-[#3B5BDB] to-accent-violet rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,.1) 25%, rgba(255,255,255,.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,.1) 75%)',
                      backgroundSize: '20px 20px',
                    }} />
                    <div className="relative text-center px-4">
                      <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-2">Your Advertisement</p>
                      <p className="text-white font-black text-2xl leading-tight mb-1">SUNSHINE</p>
                      <p className="text-white font-black text-2xl leading-tight text-cyan-300">ELECTRONICS</p>
                      <p className="text-white/60 text-xs mt-2">Kollam's #1 Electronics Store</p>
                    </div>
                  </div>
                </div>

                {/* Bus seats row */}
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`h-8 rounded-lg ${i % 3 === 1 ? 'bg-[#1E293B]' : 'bg-[#1A2332]'}`} />
                  ))}
                </div>
              </div>

              {/* Floating stats */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 min-w-36">
                <p className="text-xs text-secondary-text font-semibold uppercase tracking-wider mb-1">Campaign Price</p>
                <p className="text-2xl font-black text-accent tabular-nums">₹88,800</p>
                <p className="text-xs text-secondary-text">10 buses · 6 months</p>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4">
                <p className="text-xs text-secondary-text font-semibold uppercase tracking-wider mb-1">You Save</p>
                <p className="text-xl font-black text-success tabular-nums">₹46,200</p>
                <p className="text-xs text-secondary-text">34% off standard rate</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-white/30 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-accent border border-blue-100 mb-4">
              Simple Process
            </span>
            <h2 className="section-heading mb-4">Start Advertising in Minutes</h2>
            <p className="section-subheading max-w-xl mx-auto">
              From campaign configuration to quotation download — everything is instant and transparent.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <FadeIn key={step} delay={i * 0.1}>
                <div className="card p-6 h-full hover:border-accent/30 transition-colors duration-200">
                  <div className="text-4xl font-black text-accent/15 mb-4 tabular-nums">{step}</div>
                  <h3 className="font-bold text-primary-text mb-2">{title}</h3>
                  <p className="text-secondary-text text-sm leading-relaxed">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-accent border border-blue-100 mb-4">
              Why Bus Advertising
            </span>
            <h2 className="section-heading mb-4 max-w-xl">Advertising that travels with your audience</h2>
            <p className="section-subheading max-w-lg">
              Bus-screen advertising delivers your message during commutes, reaching engaged audiences in an environment with minimal distraction.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {BENEFITS.map(({ icon: Icon, title, description }, i) => (
              <FadeIn key={title} delay={i * 0.1}>
                <div className="card p-6 flex gap-5 h-full hover:border-accent/30 transition-colors duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={22} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-text mb-2">{title}</h3>
                    <p className="text-secondary-text text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING INTRO ─────────────────────────────── */}
      <section className="py-24 bg-[#080B12] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/15 mb-6">
              Transparent Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Know exactly what you'll pay.
              <br />
              <span className="text-accent">Before you commit.</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Our interactive pricing calculator gives you an accurate campaign price in real time. Package discounts, unit economics, savings — all calculated transparently.
            </p>
            <Link
              to="/calculator"
              className="inline-flex items-center gap-2.5 px-10 py-4 bg-accent text-white font-bold rounded-2xl hover:bg-blue-600 transition-all duration-200 text-lg shadow-xl shadow-accent/25"
            >
              <Calculator size={20} />
              Open Pricing Calculator
              <ChevronRight size={18} />
            </Link>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  )
}
