import { ExternalLink } from 'lucide-react'

export default function ComparableListings({ listings }) {
  if (!listings?.length) return null

  return (
    <section className="animate-fade-up rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] [animation-delay:240ms]">
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        Comparable active listings
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.08] font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
              <th className="pb-2 pr-4 font-normal">Listing</th>
              <th className="pb-2 pr-4 font-normal">Condition</th>
              <th className="pb-2 text-right font-normal">Price</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing, index) => (
              <tr
                key={`${listing.url}-${index}`}
                className="border-b border-black/[0.04] transition-colors duration-200 last:border-0 hover:bg-neutral-50"
              >
                <td className="max-w-md py-2.5 pr-4">
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-1.5 text-neutral-700 transition hover:text-azure"
                  >
                    <span className="line-clamp-2">{listing.title}</span>
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-300 transition group-hover:text-azure" />
                  </a>
                </td>
                <td className="py-2.5 pr-4">
                  <span className="rounded-full border border-black/[0.08] bg-neutral-50 px-2 py-0.5 text-xs text-neutral-500">
                    {listing.condition}
                  </span>
                </td>
                <td className="py-2.5 text-right font-medium text-neutral-900">
                  ${Number(listing.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
