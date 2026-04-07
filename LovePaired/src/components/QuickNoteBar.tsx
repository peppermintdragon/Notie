import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MoodKey } from '../app/types'

const MOODS: Array<{ key: MoodKey; emoji: string }> = [
  { key: 'loved', emoji: '💗' },
  { key: 'happy', emoji: '😊' },
  { key: 'missing', emoji: '🥺' },
  { key: 'excited', emoji: '✨' },
  { key: 'sleepy', emoji: '😴' },
  { key: 'silly', emoji: '😜' },
  { key: 'sad', emoji: '😔' },
  { key: 'proud', emoji: '😌' },
]

export function QuickNoteBar(props: {
  selectedMood: MoodKey
  onSelectMood: (mood: MoodKey) => void
  onSend: (payload: { emotionKey: MoodKey; content: string }) => void
}) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')

  const canSend = content.trim().length > 0

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {MOODS.map((m) => (
          <button
            key={m.key}
            className="flex size-13 items-center justify-center rounded-full border text-[22px] transition-all duration-200"
            onClick={() => props.onSelectMood(m.key)}
            style={{
              borderColor:
                props.selectedMood === m.key ? 'rgba(239, 123, 170, 0.9)' : 'rgba(255,255,255,0.85)',
              background:
                props.selectedMood === m.key
                  ? 'linear-gradient(180deg, rgba(255,236,243,0.96), rgba(255,225,236,0.8))'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.38))',
              boxShadow:
                props.selectedMood === m.key
                  ? '0 14px 30px rgba(239,123,170,0.20)'
                  : '0 8px 20px rgba(20,7,15,0.06)',
            }}
            aria-label={t(`mood.${m.key}`)}
            title={t(`mood.${m.key}`)}
          >
            {m.emoji}
          </button>
        ))}
      </div>

      <div className="lp-glass rounded-[28px] border border-white/70 px-4 py-4 shadow-[0_18px_48px_rgba(20,7,15,0.06)]">
        <div className="mb-2 text-[13px] font-[500] text-[color:rgba(149,114,170,0.95)]">
          {t('home.saySomething')} <span className="opacity-60">💬</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 100))}
            placeholder="Say something..."
            className="h-12 flex-1 rounded-[16px] border border-[rgba(116,84,150,0.28)] bg-[rgba(29,21,42,0.88)] px-4 text-[15px] font-[500] text-[rgba(238,212,255,0.95)] outline-none placeholder:text-[rgba(171,129,199,0.65)]"
          />
          <button
            disabled={!canSend}
            onClick={() => {
              const value = content.trim()
              if (!value) return
              props.onSend({ emotionKey: props.selectedMood, content: value })
              setContent('')
            }}
            className="h-12 min-w-[92px] rounded-[16px] border border-white/50 bg-white/28 px-4 text-[15px] font-[500] text-[rgba(255,255,255,0.95)] disabled:opacity-35"
          >
            {t('home.send')} ♡
          </button>
        </div>
      </div>
    </div>
  )
}
