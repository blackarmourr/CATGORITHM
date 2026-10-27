import { Link } from 'react-router-dom'
import { Bus, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#080B12] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-violet flex items-center justify-center">
                <Bus size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">Catgorithm</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Digital growth and advertising company operating bus-screen advertising services in Kollam, Kerala.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white/80 font-semibold text-sm mb-4 uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/calculator', label: 'Pricing Calculator' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-white/50 hover:text-white/80 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white/80 font-semibold text-sm mb-4 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-white/50 text-sm">
                <Phone size={14} className="text-accent flex-shrink-0" />
                <a href="tel:+919876543210" className="hover:text-white/80 transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-2.5 text-white/50 text-sm">
                <Mail size={14} className="text-accent flex-shrink-0" />
                <a href="mailto:hello@catgorithm.com" className="hover:text-white/80 transition-colors">hello@catgorithm.com</a>
              </li>
              <li className="flex items-start gap-2.5 text-white/50 text-sm">
                <MapPin size={14} className="text-accent flex-shrink-0 mt-0.5" />
                <span>Kollam, Kerala, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © 2026 Catgorithm. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            All prices in Indian Rupees (INR) · Subject to availability
          </p>
        </div>
      </div>
    </footer>
  )
}
