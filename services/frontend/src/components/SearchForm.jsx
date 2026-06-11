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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          What are you selling?
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Describe your item and we&apos;ll price it against live eBay listings.
        </p>
      </div>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        placeholder="e.g. iPhone 12, 64GB, space gray — light scratches on the back, screen flawless"
        className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20"
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          {CONDITIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setCondition(value)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition sm:text-sm ${
                condition === value
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
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
          className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500/70 sm:w-52"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
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
