import { useEffect, useState } from 'react'

/** Cronómetro mm:ss desde que contestaron. */
export function CallTimer({ since }: { since: number | null }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const seconds = since ? Math.max(0, Math.floor((now - since) / 1000)) : 0
  return (
    <span className="font-mono tabular-nums">
      {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
    </span>
  )
}
