'use client'
import { useEffect, useRef } from 'react'

interface TurnstileProps {
  onVerify: (token: string) => void
}

declare global {
  interface Window {
    turnstile: any
    onTurnstileLoad: () => void
  }
}

export default function Turnstile({ onVerify }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendered = useRef(false)

  useEffect(() => {
    const siteKey = '0x4AAAAAACFIsthfSk0kpja6'

    const renderWidget = () => {
      if (containerRef.current && window.turnstile && rendered.current === false) {
        rendered.current = true
        window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          theme: 'auto'
        })
      }
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      window.onTurnstileLoad = renderWidget
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
      script.async = true
      document.head.appendChild(script)
    }
  }, [onVerify])

  return <div ref={containerRef} className="my-4" />
}
