import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BLOB_COLORS } from '../app/colors'
import type { BlobColorKey, MoodKey } from '../app/types'
import { BlobFace } from './BlobFace'

function moodEnergy(mood: MoodKey) {
  switch (mood) {
    case 'excited':
      return 1.0
    case 'silly':
      return 0.85
    case 'loved':
      return 0.75
    case 'happy':
      return 0.65
    case 'proud':
      return 0.6
    case 'missing':
      return 0.5
    case 'sad':
      return 0.4
    case 'sleepy':
      return 0.32
  }
}

function smoothPath(ctx: CanvasRenderingContext2D, points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return
  const p0 = points[0]!
  ctx.moveTo(p0.x, p0.y)
  for (let i = 0; i < points.length; i++) {
    const p1 = points[(i + 1) % points.length]!
    const midX = (points[i]!.x + p1.x) / 2
    const midY = (points[i]!.y + p1.y) / 2
    ctx.quadraticCurveTo(points[i]!.x, points[i]!.y, midX, midY)
  }
  ctx.closePath()
}

export function AirbrushBlob(props: {
  mood: MoodKey
  colorKey: BlobColorKey
  pulse: number
  size: number
}) {
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === 'visible')

  const seed = useMemo(() => {
    const bytes = new Uint8Array(6)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).reduce((acc, b) => acc * 131 + b, 17)
  }, [])

  useEffect(() => {
    const onVis = () => setIsVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis, { passive: true })
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!isVisible) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const size = props.size
    canvas.width = Math.floor(size * dpr)
    canvas.height = Math.floor(size * dpr)
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const center = size / 2
    const baseR = size * 0.33
    const energy = moodEnergy(props.mood)
    const pointsCount = 72
    const phaseA = (seed % 997) / 997
    const phaseB = ((seed * 7) % 997) / 997

    let frame = 0
    let raf = 0
    const pulseStartAt = performance.now()

    const draw = (tMs: number) => {
      frame++
      const t = tMs / 1000

      const pulseAge = (tMs - pulseStartAt) / 1000
      const pulseBoost = Math.exp(-pulseAge * 2.0)
      const pulseAmp = 0.055 * pulseBoost

      const wobbleSpeed = reducedMotion ? 0.25 : 0.55 + energy * 0.25
      const wobbleAmp = (reducedMotion ? 0.012 : 0.018 + energy * 0.012) + pulseAmp

      const outlineJitter = reducedMotion ? 0.0 : 0.006
      const pts: Array<{ x: number; y: number }> = []

      for (let i = 0; i < pointsCount; i++) {
        const theta = (i / pointsCount) * Math.PI * 2

        const n1 = Math.sin(theta * (2.2 + energy) + t * wobbleSpeed + phaseA * Math.PI * 2)
        const n2 = Math.sin(theta * (3.7 + energy * 0.6) - t * (wobbleSpeed * 0.82) + phaseB * Math.PI * 2)
        const n3 = Math.sin(theta * 1.0 + t * (wobbleSpeed * 0.4) + phaseA)

        const r =
          baseR *
          (1 +
            wobbleAmp * (n1 * 0.55 + n2 * 0.35 + n3 * 0.18) +
            outlineJitter * Math.sin(theta * 11 + t * 0.9))

        pts.push({
          x: center + Math.cos(theta) * r,
          y: center + Math.sin(theta) * r,
        })
      }

      const colors = BLOB_COLORS[props.colorKey]

      ctx.clearRect(0, 0, size, size)

      // Outer glow
      ctx.save()
      ctx.globalAlpha = reducedMotion ? 0.55 : 0.65
      ctx.shadowColor = colors.glow
      ctx.shadowBlur = reducedMotion ? 26 : 36
      ctx.beginPath()
      smoothPath(ctx, pts)
      ctx.fillStyle = colors.rim
      ctx.fill()
      ctx.restore()

      // Core gradient
      ctx.save()
      const grad = ctx.createRadialGradient(center * 0.88, center * 0.76, size * 0.08, center, center, baseR * 1.25)
      grad.addColorStop(0, colors.core)
      grad.addColorStop(0.55, 'rgba(255,255,255,0.66)')
      grad.addColorStop(1, colors.rim)

      ctx.beginPath()
      smoothPath(ctx, pts)
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()

      // Highlight
      ctx.save()
      ctx.globalAlpha = reducedMotion ? 0.35 : 0.42
      ctx.beginPath()
      ctx.ellipse(center * 0.82, center * 0.72, baseR * 0.52, baseR * 0.36, -0.18, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.65)'
      ctx.fill()
      ctx.restore()

      // Grain (kept very light)
      if (!reducedMotion && frame % 2 === 0) {
        ctx.save()
        ctx.globalAlpha = 0.07
        for (let i = 0; i < 90; i++) {
          const rx = (Math.sin(i * 999 + t * 0.7) * 0.5 + 0.5) * size
          const ry = (Math.cos(i * 777 + t * 0.6) * 0.5 + 0.5) * size
          const r = (Math.sin(i * 13.1) * 0.5 + 0.5) * 1.6
          ctx.beginPath()
          ctx.arc(rx, ry, r, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,255,255,0.9)'
          ctx.fill()
        }
        ctx.restore()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [isVisible, props.size, props.mood, props.colorKey, props.pulse, reducedMotion, seed])

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ width: props.size, height: props.size }}
    >
      <canvas
        ref={canvasRef}
        className="block"
        aria-hidden="true"
        style={{ borderRadius: props.size }}
      />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <BlobFace mood={props.mood} />
      </div>
    </motion.div>
  )
}
