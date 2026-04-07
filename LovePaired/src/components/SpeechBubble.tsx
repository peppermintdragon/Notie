import { motion } from 'framer-motion'

export function SpeechBubble(props: { title: string; content: string; hint: string; onClick: () => void }) {
  return (
    <motion.button
      className="absolute left-1/2 top-0 z-10 max-w-[220px] -translate-x-1/2 -translate-y-[82%] text-left"
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      onClick={props.onClick}
    >
      <div
        className="lp-glass lp-shadow-soft relative rounded-[22px] border border-white/65 px-4 py-3"
        style={{ backdropFilter: 'blur(16px)' }}
      >
        <div className="text-[11px] font-[500] text-[color:var(--muted)]">{props.title}</div>
        <div
          className="mt-1 text-[14px] font-[500] text-[color:rgba(117,84,157,0.96)]"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {props.content}
        </div>
        <div className="mt-1 text-[10px] font-[500] text-[color:var(--muted)]">{props.hint}</div>
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-full size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-b border-white/65"
          style={{ background: 'rgba(255,255,255,0.35)' }}
        />
      </div>
    </motion.button>
  )
}
