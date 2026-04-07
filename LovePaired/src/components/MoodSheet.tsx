import { AnimatePresence, motion } from 'framer-motion'
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

export function MoodSheet(props: { open: boolean; onClose: () => void; onSetMood: (mood: MoodKey) => void }) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {props.open ? (
        <>
          <motion.button
            className="fixed inset-0 z-40 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={props.onClose}
            aria-label="Close"
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[420px] px-5 pb-[calc(env(safe-area-inset-bottom)+18px)]"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div
              className="lp-glass lp-shadow-soft rounded-[28px] border border-white/60 px-5 py-5"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[16px] font-[500] text-[color:var(--ink)]">{t('home.moodTitle')}</div>
                  <div className="mt-1 text-[12px] font-[500] text-[color:var(--muted)]">{t('home.moodHint')}</div>
                </div>
                <button
                  className="rounded-full px-3 py-2 text-[12px] font-[500] text-[color:var(--muted)]"
                  onClick={props.onClose}
                >
                  {t('common.cancel')}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-3">
                {MOODS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      props.onSetMood(m.key)
                      props.onClose()
                    }}
                    className="rounded-[20px] border border-white/55 bg-white/25 px-2 py-3 text-center"
                  >
                    <div className="text-[18px] leading-none">{m.emoji}</div>
                    <div className="mt-2 text-[12px] font-[500] text-[color:var(--ink)]">{t(`mood.${m.key}`)}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
