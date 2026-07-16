"use client"

import { useLinkStatus } from "next/link"

/** Fixed-size, always-rendered dot next to a nav Link — toggles visible the
 * instant a click is registered, so navigation never feels unresponsive
 * even before loading.tsx's Suspense fallback has a chance to mount. */
export function LoadingIndicator() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={`inline-block w-1.5 h-1.5 rounded-full bg-current transition-opacity ${
        pending ? "opacity-60 animate-pulse" : "opacity-0"
      }`}
    />
  )
}
