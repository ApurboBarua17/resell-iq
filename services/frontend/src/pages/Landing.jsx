import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ChevronDown,
  Footprints,
  Gem,
  Layers,
  MonitorSmartphone,
  Search,
  Sparkles,
  Tag,
} from 'lucide-react'

const MODE_CARDS = [
  {
    id: 'electronics',
    icon: MonitorSmartphone,
    title: 'Electronics & General',
    description: 'Phones, consoles, gear — priced against live eBay comps with a new-vs-used retention gauge.',
    sample: 'iPhone 12 · $275 recommended · retains 55% of new',
  },
  {
    id: 'sneakers',
    icon: Footprints,
    title: 'Sneakers & Streetwear',
    description: 'Size-aware pricing on the sneaker resale market, graded Deadstock to Used.',
    sample: 'Jordan 4 Black Cat (10.5) · $405 recommended',
  },
  {
    id: 'vintage',
    icon: Gem,
    title: 'Vintage & Collectibles',
    description: 'eBay marketplace prices side-by-side with curated vintage shops on Etsy.',
    sample: "90s Levi's trucker · marketplace $65 vs curated $122",
  },
]

const STEPS = [
  {
    icon: Search,
    title: 'Search',
    text: 'Describe your item — we query live marketplace listings in parallel.',
  },
  {
    icon: Layers,
    title: 'Aggregate',
    text: 'Comparable prices are normalized and crunched into medians and ranges.',
  },
  {
    icon: Sparkles,
    title: 'Recommend',
    text: 'An LLM factors in condition and drafts your listing, ready to paste.',
  },
]

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${className} ${shown ? 'animate-fade-up' : 'opacity-0'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div>
      <nav className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-neutral-900 p-1.5">
              <Tag className="h-4 w-4 text-white" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-neutral-900">
              Resell<span className="text-azure">IQ</span>
            </span>
          </div>
          <Link
            to="/app"
            className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition-all duration-300 hover:bg-azure"
          >
            Open the app <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex min-h-[78vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <p className="animate-fade-up font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400">
          Resale price intelligence
        </p>
        <h1 className="mt-4 animate-fade-up text-4xl font-semibold tracking-tight text-neutral-900 [animation-delay:80ms] sm:text-6xl">
          Price it right.
          <br />
          Sell it fast.
        </h1>
        <p className="mt-5 max-w-xl animate-fade-up text-base text-neutral-500 [animation-delay:160ms] sm:text-lg">
          ResellIQ reads the live resale market — eBay comps, curated vintage
          shops, sneaker-size premiums — and recommends the price your item will
          actually sell at, with a ready-to-paste listing.
        </p>
        <button
          onClick={() => navigate('/app')}
          className="mt-8 flex animate-fade-up items-center gap-2 rounded-full bg-neutral-900 px-7 py-3 font-medium text-white shadow-sm transition-all duration-300 [animation-delay:240ms] hover:bg-azure hover:shadow-lg hover:shadow-azure/20"
        >
          <Sparkles className="h-5 w-5" /> Get a price estimate
        </button>
        <ChevronDown className="mt-14 h-5 w-5 animate-bounce text-neutral-300" />
      </section>

      {/* Mode cards */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <Reveal>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
            Three markets, three models
          </p>
          <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Pick your market
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {MODE_CARDS.map(({ id, icon: Icon, title, description, sample }, index) => (
            <Reveal key={id} delay={index * 120}>
              <button
                onClick={() => navigate(`/app?mode=${id}`)}
                className="group flex h-full w-full flex-col rounded-3xl border border-black/[0.06] bg-white p-6 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-azure/30 hover:shadow-lg hover:shadow-azure/10"
              >
                <span className="w-fit rounded-xl bg-neutral-100 p-2.5 transition-colors duration-300 group-hover:bg-azure/10">
                  <Icon className="h-5 w-5 text-neutral-700 transition-colors duration-300 group-hover:text-azure" />
                </span>
                <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500">
                  {description}
                </p>
                <p className="mt-4 font-mono text-[11px] text-azure opacity-0 transition-all duration-300 group-hover:opacity-100">
                  {sample}
                </p>
                <span className="mt-3 flex items-center gap-1 text-sm font-medium text-neutral-400 transition-colors duration-300 group-hover:text-neutral-900">
                  Start pricing <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <Reveal>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
            How it works
          </p>
          <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Search. Aggregate. Recommend.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <Reveal key={title} delay={index * 120} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-azure/10">
                <Icon className="h-5 w-5 text-azure" />
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                Step {index + 1}
              </p>
              <h3 className="mt-1 font-semibold text-neutral-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <Reveal>
          <div className="rounded-3xl border border-black/[0.06] bg-white p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Ready to price your first item?
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Free, instant, and cached — repeat searches come back in milliseconds.
            </p>
            <button
              onClick={() => navigate('/app')}
              className="mx-auto mt-6 flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3 font-medium text-white shadow-sm transition-all duration-300 hover:bg-azure hover:shadow-lg hover:shadow-azure/20"
            >
              <Sparkles className="h-5 w-5" /> Open ResellIQ
            </button>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
