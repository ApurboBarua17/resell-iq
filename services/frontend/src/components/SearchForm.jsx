import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

const ELECTRONICS_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor']
const SNEAKER_CONDITIONS = ['Deadstock/New', 'New with Defects', 'Used']
const ERAS = ['Any era', '2000s', '1990s', '1980s', '1970s', '1960s', '1950s or earlier']

const HEADLINES = {
  electronics: 'What are you selling?',
  sneakers: 'Which pair are you pricing?',
  vintage: 'What treasure did you find?',
}

const SUBTITLES = {
  electronics: "Describe your item and we'll price it against live eBay listings.",
  sneakers: 'Brand, model, and size — priced against the live sneaker resale market.',
  vintage: 'Priced across eBay and curated vintage marketplaces like Etsy.',
}

const inputClass =
  'rounded-full border border-black/[0.08] bg-white px-4 py-2 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition focus:border-azure'

function ConditionControl({ conditions, value, onChange }) {
  return (
    <div className="flex flex-1 rounded-full border border-black/[0.08] bg-neutral-100 p-1">
      {conditions.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`flex-1 rounded-full px-2 py-1.5 text-xs font-medium transition-all duration-300 sm:text-sm ${
            value === option
              ? 'bg-azure text-white shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export default function SearchForm({ mode, onSubmit, loading }) {
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState('Good')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [size, setSize] = useState('')
  const [sneakerCondition, setSneakerCondition] = useState('Used')
  const [era, setEra] = useState('Any era')

  const canSubmit =
    !loading &&
    (mode === 'sneakers'
      ? brand.trim().length >= 2 && model.trim().length >= 2
      : description.trim().length >= 3)

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return
    if (mode === 'sneakers') {
      onSubmit({
        brand: brand.trim(),
        model: model.trim(),
        size: size.trim() || null,
        condition: sneakerCondition,
      })
    } else if (mode === 'vintage') {
      onSubmit({
        item_description: description.trim(),
        era: era === 'Any era' ? null : era,
      })
    } else {
      onSubmit({
        item_description: description.trim(),
        condition,
        category: category.trim() || null,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-up space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
          Price intelligence
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
          {HEADLINES[mode]}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">{SUBTITLES[mode]}</p>
      </div>

      {mode === 'sneakers' ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Brand — e.g. Nike"
              className={`${inputClass} flex-1`}
            />
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Model — e.g. Air Jordan 4 Black Cat"
              className={`${inputClass} flex-[2]`}
            />
            <input
              value={size}
              onChange={(event) => setSize(event.target.value)}
              placeholder="US size (optional)"
              className={`${inputClass} sm:w-40`}
            />
          </div>
          <ConditionControl
            conditions={SNEAKER_CONDITIONS}
            value={sneakerCondition}
            onChange={setSneakerCondition}
          />
        </>
      ) : (
        <>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            placeholder={
              mode === 'vintage'
                ? "e.g. vintage Levi's denim trucker jacket, 1990s, medium wash"
                : 'e.g. iPhone 12, 64GB, space gray — light scratches on the back, screen flawless'
            }
            className="w-full resize-none rounded-2xl border border-black/[0.08] bg-white p-4 text-neutral-900 placeholder-neutral-400 shadow-sm outline-none transition focus:border-azure focus:ring-2 focus:ring-azure/15"
          />
          {mode === 'electronics' ? (
            <div className="flex flex-col gap-4 sm:flex-row">
              <ConditionControl
                conditions={ELECTRONICS_CONDITIONS}
                value={condition}
                onChange={setCondition}
              />
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Category (optional)"
                className={`${inputClass} sm:w-52`}
              />
            </div>
          ) : (
            <select
              value={era}
              onChange={(event) => setEra(event.target.value)}
              className={`${inputClass} w-full appearance-none sm:w-60`}
            >
              {ERAS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          )}
        </>
      )}

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
