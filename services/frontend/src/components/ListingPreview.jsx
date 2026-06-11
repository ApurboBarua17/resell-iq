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
      className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
        copied
          ? 'border-emerald-800 bg-emerald-950/60 text-emerald-300'
          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:text-white'
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
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-slate-400">
        <FileText className="h-4 w-4" />
        Generated listing draft
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug text-slate-100">
            {advice.listing_title}
          </h3>
          <CopyButton text={advice.listing_title} label="listing title" />
        </div>

        <div className="mt-4 flex items-start justify-between gap-3 border-t border-slate-800 pt-4">
          <ul className="space-y-1.5 text-sm text-slate-300">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="text-indigo-400">•</span>
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
