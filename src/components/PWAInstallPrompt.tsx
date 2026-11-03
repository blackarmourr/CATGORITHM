import { useState, useEffect } from 'react'
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// Global reference for deferred prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null

export function usePWAInstall() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // 1. Detect if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // 2. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(ua)
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua)

    if (isIOSDevice) {
      setIsIOS(true)
      if (isSafari && !isStandalone) {
        setIsInstallable(true)
      }
    }

    // 3. Listen for Chromium beforeinstallprompt event (Android / Desktop Chrome / Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e as BeforeInstallPromptEvent
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      deferredPrompt = null
      toast.success('Catgorithm Bus Ads installed on your device!', {
        icon: '📱',
        duration: 4000,
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function triggerInstall(): Promise<boolean> {
    if (isInstalled) {
      toast('App is already installed on your device', { icon: '✅' })
      return false
    }

    // iOS Safari: show instruction modal
    if (isIOS) {
      setShowIOSGuide(true)
      return true
    }

    // Android / Desktop Chrome / Edge
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === 'accepted') {
          setIsInstalled(true)
          setIsInstallable(false)
          deferredPrompt = null
          return true
        }
      } catch (err) {
        console.warn('Install prompt error:', err)
      }
    } else {
      // If prompt is not available yet, guide user
      toast('To install: tap your browser menu (⋮) and select "Install App" or "Add to Home screen"', {
        duration: 5000,
        icon: '📱',
      })
    }

    return false
  }

  return {
    isInstallable,
    isInstalled,
    isIOS,
    showIOSGuide,
    setShowIOSGuide,
    triggerInstall,
  }
}

/**
 * Bottom Floating Banner for Mobile Install Promotion
 */
export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, showIOSGuide, setShowIOSGuide, triggerInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)

  // Don't show if already installed or dismissed this session
  if (isInstalled || dismissed || !isInstallable) {
    return (
      <IOSInstallGuideModal
        isOpen={showIOSGuide}
        onClose={() => setShowIOSGuide(false)}
      />
    )
  }

  return (
    <>
      {/* Floating PWA Install Bar */}
      <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-slideUp">
        <div className="bg-[#0b0f19]/95 backdrop-blur-xl border border-white/15 p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-white">
          {/* App Icon */}
          <img
            src="./app-icon.png"
            alt="Catgorithm Bus Ads"
            className="w-11 h-11 rounded-xl shadow-md flex-shrink-0 object-cover border border-white/10"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none'
            }}
          />

          {/* Text Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs text-white truncate">Install Catgorithm App</h4>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                Fast
              </span>
            </div>
            <p className="text-[11px] text-gray-300 mt-0.5 truncate">
              {isIOS ? 'Add to iPhone Home Screen' : 'Install on mobile for 1-tap access'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={triggerInstall}
              className="px-3 py-1.5 bg-accent hover:bg-blue-600 active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm shadow-blue-500/20"
            >
              <Download size={13} />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
              aria-label="Dismiss banner"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      <IOSInstallGuideModal
        isOpen={showIOSGuide}
        onClose={() => setShowIOSGuide(false)}
      />
    </>
  )
}

/**
 * iOS Safari Step-by-Step Installation Modal
 */
export function IOSInstallGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#111827] text-white w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="./app-icon.png"
              alt="Catgorithm"
              className="w-10 h-10 rounded-xl object-cover border border-white/10"
            />
            <div>
              <h3 className="font-bold text-sm text-white">Install on iPhone / iPad</h3>
              <p className="text-[11px] text-gray-400">Add Catgorithm to Home Screen</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3 pt-2 text-xs text-gray-300">
          <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="w-6 h-6 rounded-lg bg-accent/20 text-accent font-bold flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-white flex items-center gap-1.5">
                Tap the <Share size={13} className="text-accent" /> Share button
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Found at the bottom menu bar in Safari.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="w-6 h-6 rounded-lg bg-accent/20 text-accent font-bold flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-white flex items-center gap-1.5">
                Tap <PlusSquare size={13} className="text-emerald-400" /> "Add to Home Screen"
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Scroll down the share options list to find it.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            <div className="w-6 h-6 rounded-lg bg-accent/20 text-accent font-bold flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-white flex items-center gap-1.5">
                Tap <CheckCircle2 size={13} className="text-accent" /> "Add" in top-right
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                The Catgorithm icon will appear right on your home screen!
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-accent hover:bg-blue-600 text-white font-bold text-xs active:scale-98 transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  )
}

/**
 * Compact Install App Button for Navbars / Headers
 */
export function PWAHeaderInstallButton() {
  const { isInstallable, isInstalled, triggerInstall } = usePWAInstall()

  if (isInstalled || !isInstallable) return null

  return (
    <button
      type="button"
      onClick={triggerInstall}
      className="h-9 px-2.5 sm:px-3 text-xs font-bold rounded-xl bg-gradient-to-r from-accent to-blue-600 hover:from-blue-600 hover:to-blue-700 active:scale-95 text-white flex items-center gap-1.5 transition-all shadow-xs"
      title="Install Catgorithm App on Mobile"
    >
      <Smartphone size={13} className="animate-pulse" />
      <span>Install App</span>
    </button>
  )
}
