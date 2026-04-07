import type { MoodKey } from '../app/types'

function HeartEye(props: { x: number; y: number }) {
  return (
    <path
      d={`M ${props.x} ${props.y} c -6 -7 -18 -2 -18 8 c 0 9 11 15 18 21 c 7 -6 18 -12 18 -21 c 0 -10 -12 -15 -18 -8 Z`}
      fill="rgba(20,7,15,0.9)"
    />
  )
}

export function BlobFace(props: { mood: MoodKey }) {
  const ink = 'rgba(20,7,15,0.9)'

  const eyes = (() => {
    switch (props.mood) {
      case 'loved':
        return (
          <>
            <HeartEye x={88} y={92} />
            <HeartEye x={160} y={92} />
          </>
        )
      case 'sleepy':
        return (
          <>
            <path d="M72 92 q 22 -12 44 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M132 92 q 22 -12 44 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
          </>
        )
      case 'sad':
      case 'missing':
        return (
          <>
            <path d="M78 88 q 18 10 36 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M138 88 q 18 10 36 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
          </>
        )
      case 'excited':
        return (
          <>
            <circle cx="94" cy="90" r="14" fill={ink} />
            <circle cx="166" cy="90" r="14" fill={ink} />
          </>
        )
      case 'silly':
        return (
          <>
            <path d="M76 90 q 18 -18 36 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
            <circle cx="166" cy="92" r="10" fill={ink} />
          </>
        )
      case 'proud':
        return (
          <>
            <path d="M74 88 q 22 -20 46 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M136 88 q 22 -20 46 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
          </>
        )
      case 'happy':
      default:
        return (
          <>
            <path d="M76 90 q 18 -18 36 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
            <path d="M136 90 q 18 -18 36 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
          </>
        )
    }
  })()

  const mouth = (() => {
    switch (props.mood) {
      case 'sad':
        return <path d="M100 160 q 28 -20 56 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
      case 'missing':
        return <path d="M104 160 q 24 -10 48 0 q -24 14 -48 0" stroke={ink} strokeWidth="10" strokeLinecap="round" fill="none" />
      case 'sleepy':
        return <path d="M112 156 q 16 20 32 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
      case 'excited':
        return <path d="M110 152 q 18 26 36 0" stroke={ink} strokeWidth="14" strokeLinecap="round" fill="none" />
      case 'silly':
        return <path d="M108 156 q 20 20 48 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
      case 'proud':
        return <path d="M112 160 q 16 14 32 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
      case 'loved':
      case 'happy':
      default:
        return <path d="M104 154 q 24 30 48 0" stroke={ink} strokeWidth="12" strokeLinecap="round" fill="none" />
    }
  })()

  const extras = (() => {
    switch (props.mood) {
      case 'sad':
        return <circle cx="186" cy="132" r="6" fill="rgba(255,255,255,0.82)" />
      case 'loved':
        return (
          <>
            <circle cx="82" cy="136" r="10" fill="rgba(212,83,126,0.25)" />
            <circle cx="178" cy="136" r="10" fill="rgba(212,83,126,0.25)" />
          </>
        )
      default:
        return null
    }
  })()

  return (
    <svg viewBox="0 0 256 256" width="168" height="168" aria-hidden="true" style={{ filter: 'drop-shadow(0 12px 30px rgba(20,7,15,0.12))' }}>
      {eyes}
      {mouth}
      {extras}
    </svg>
  )
}
