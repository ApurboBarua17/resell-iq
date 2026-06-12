import { Footprints, Gem, MonitorSmartphone } from 'lucide-react'

export const MODES = [
  { id: 'electronics', label: 'Electronics & General', icon: MonitorSmartphone },
  { id: 'sneakers', label: 'Sneakers & Streetwear', icon: Footprints },
  { id: 'vintage', label: 'Vintage & Collectibles', icon: Gem },
]

export default function ModeSwitcher({ mode, onChange }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-black/[0.08] bg-neutral-100 p-1 sm:flex-row sm:rounded-full">
      {MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 ${
            mode === id
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Icon className={`h-4 w-4 ${mode === id ? 'text-azure' : ''}`} />
          {label}
        </button>
      ))}
    </div>
  )
}
