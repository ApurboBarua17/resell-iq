import { useState } from 'react'
import { Check, Copy, FileText } from 'lucide-react'

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        copied
          ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
          : 'border-black/[0.1] bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900'
      }`}
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function ListingPreview({ advice }) {
  if (!advice?.listing_title) return null

  const bullets = Array.isArray(advice.listing_description)
    ? advice.listing_description
    : [String(advice.listing_description || '')].filter(Boolean)
  const descriptionText = bullets.map((bullet) => `• ${bullet}`).join('\n')

  return (
    <section className="animate-fade-up rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] [animation-delay:120ms]">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        <FileText className="h-4 w-4" />
        Generated listing draft
      </div>

      <div className="mt-4 rounded-2xl border border-black/[0.06] bg-neutral-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug text-neutral-900">
            {advice.listing_title}
          </h3>
          <CopyButton text={advice.listing_title} label="listing title" />
        </div>

        <div className="mt-4 flex items-start justify-between gap-3 border-t border-black/[0.06] pt-4">
          <ul className="space-y-1.5 text-sm text-neutral-600">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="text-azure">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <CopyButton text={descriptionText} label="listing description" />
        </div>
      </div>
    </section>
  )
}
