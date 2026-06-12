export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/[0.06] bg-white/60 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
        <p>ResellIQ — resale price intelligence. Portfolio project.</p>
        <p className="sm:max-w-md sm:text-right">
          The term &lsquo;Etsy&rsquo; is a trademark of Etsy, Inc. This application
          uses the Etsy API but is not endorsed or certified by Etsy, Inc.
        </p>
      </div>
    </footer>
  )
}
