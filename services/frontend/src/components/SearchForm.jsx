import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']

export default function SearchForm({ onSubmit, loading }) {
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState('Good')
  const [category, setCategory] = useState('')

  const canSubmit = description.trim().length >= 3 && !loading

  function handleSubmit(event) {
    event.preventDefault()
    if (canSubmit) onSubmit(description.trim(), condition, category.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
          Price intelligence
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          What are you selling?
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Describe your item and we&apos;ll price it against live eBay listings.
        </p>
      </div>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        placeholder="e.g. iPhone 12, 64GB, space gray — light scratches on the back, screen flawless"
        className="w-full resize-none rounded-2xl border border-black/[0.08] bg-white p-4 text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition focus:border-azure focus:ring-2 focus:ring-azure/15"
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 rounded-full border border-black/[0.08] bg-neutral-100 p-1">
          {CONDITIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCondition(value)}
              className={`flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition-all duration-300 sm:text-sm ${
                condition === value
                  ? 'bg-azure text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <input
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category (optional)"
          className="rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition focus:border-azure sm:w-52"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-7 py-3 font-medium text-white shadow-sm transition-all duration-300 hover:bg-azure hover:shadow-lg hover:shadow-azure/20 disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        {loading ? 'Estimating…' : 'Get Price Estimate'}
      </button>
    </form>
  )
}
