import { ExternalLink } from 'lucide-react'

export default function ComparableListings({ listings }) {
  if (!listings?.length) return null

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
        Comparable active listings
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <th className="pb-2 pr-4 font-medium">Listing</th>
              <th className="pb-2 pr-4 font-medium">Condition</th>
              <th className="pb-2 text-right font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing, index) => (
              <tr
                key={`${listing.itemWebUrl}-${index}`}
                className="border-b border-slate-800/60 last:border-0"
              >
                <td className="max-w-md py-2.5 pr-4">
                  <a
                    href={listing.itemWebUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-1.5 text-slate-200 transition hover:text-indigo-300"
                  >
                    <span className="line-clamp-2">{listing.title}</span>
                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600 transition group-hover:text-indigo-400" />
                  </a>
                </td>
                <td className="py-2.5 pr-4">
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-slate-400">
                    {listing.condition}
                  </span>
                </td>
                <td className="py-2.5 text-right font-medium text-slate-100">
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
