import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { formatINR } from '../lib/pricingEngine'

interface AnimatedPriceProps {
  value: number
  className?: string
  decimals?: number
  prefix?: string
}

export function AnimatedPrice({ value, className = '', decimals = 0, prefix = '₹' }: AnimatedPriceProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const prevRef = useRef(value)

  useEffect(() => {
    const start = prevRef.current
    const end = value
    if (start === end) return

    const duration = 400
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * eased
      setDisplayValue(current)
      if (progress < 1) requestAnimationFrame(animate)
      else {
        setDisplayValue(end)
        prevRef.current = end
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  const formatted = decimals > 0
    ? `${prefix}${Math.abs(displayValue).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
    : `${prefix}${Math.round(displayValue).toLocaleString('en-IN')}`

  return <span className={`tabular-nums ${className}`}>{formatted}</span>
}

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export function FadeIn({ children, delay = 0, className = '', direction = 'up' }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const initial = {
    opacity: 0,
    y: direction === 'up' ? 24 : direction === 'down' ? -24 : 0,
    x: direction === 'left' ? 24 : direction === 'right' ? -24 : 0,
  }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  accent?: boolean
  currency?: boolean
}

export function StatCard({ label, value, subtext, accent, currency }: StatCardProps) {
  return (
    <div className={`card p-5 ${accent ? 'border-accent/30 bg-blue-50/50' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-secondary-text mb-1.5">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${accent ? 'text-accent' : 'text-primary-text'}`}>
        {currency ? formatINR(Number(value)) : value}
      </p>
      {subtext && <p className="text-xs text-secondary-text mt-1">{subtext}</p>}
    </div>
  )
}

export function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-accent"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'accent'
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-50 text-success',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
    accent: 'bg-blue-50 text-accent',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  centered = false,
}: {
  badge?: string
  title: string
  subtitle?: string
  centered?: boolean
}) {
  return (
    <div className={centered ? 'text-center' : ''}>
      {badge && (
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-accent border border-blue-100">
            {badge}
          </span>
        </div>
      )}
      <h2 className="section-heading mb-4">{title}</h2>
      {subtitle && <p className="section-subheading max-w-2xl">{centered && 'mx-auto '}{subtitle}</p>}
    </div>
  )
}

export function EmptyState({ title, description, icon: Icon }: {
  title: string
  description?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: React.ComponentType<any>
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={40} className="text-secondary-text/40 mb-4" />}
      <p className="text-primary-text font-semibold text-lg mb-1">{title}</p>
      {description && <p className="text-secondary-text text-sm max-w-sm">{description}</p>}
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 z-10"
      >
        <h3 className="text-lg font-bold text-primary-text mb-2">{title}</h3>
        <p className="text-secondary-text text-sm mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary text-sm px-4 py-2">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-accent hover:bg-blue-600'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
