import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BLOB_COLORS } from './app/colors'
import { connectSocket } from './app/socket'
import { clearProfile, loadProfile, saveProfile } from './app/storage'
import type { BlobColorKey, MoodKey, PartnerState, Profile } from './app/types'
import i18n from './app/i18n'
import { AirbrushBlob } from './components/AirbrushBlob'
import { QuickNoteBar } from './components/QuickNoteBar'
import { SpeechBubble } from './components/SpeechBubble'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function randomId(prefix: string) {
  const bytes = new Uint8Array(10)
  crypto.getRandomValues(bytes)
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `${prefix}_${token}`
}

function daysTogether(startISO: string) {
  const [y, m, d] = startISO.split('-').map((v) => Number(v))
  const start = new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const ms = today.getTime() - start.getTime()
  return Math.max(1, Math.floor(ms / 86_400_000) + 1)
}

function HeartStat(props: { top: string; bottom: string; tone?: 'left' | 'right' }) {
  const tone = props.tone ?? 'left'
  return (
    <div
      className={
        'relative isolate h-[88px] flex-1 overflow-hidden rounded-[28px] px-5 py-3 text-left ' +
        'lp-glass shadow-[0_14px_38px_rgba(20,7,15,0.05)]'
      }
      style={{
        borderRadius: 26,
        background:
          tone === 'left'
            ? 'linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,255,255,0.34))'
            : 'linear-gradient(180deg, rgba(255,255,255,0.64), rgba(255,255,255,0.30))',
      }}
    >
      <div className="text-[24px] leading-[1.05] tracking-[-0.03em] font-[500] text-[rgba(98,61,130,0.98)]">
        {props.top}
      </div>
      <div className="mt-1.5 text-[13px] font-[500] text-[rgba(160,124,183,0.9)]">{props.bottom}</div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl"
        style={{
          background:
            tone === 'left'
              ? 'radial-gradient(circle at 30% 30%, rgba(255,170,210,0.60), transparent 64%)'
              : 'radial-gradient(circle at 30% 30%, rgba(230,190,255,0.55), transparent 66%)',
        }}
      />
    </div>
  )
}

function PrimaryButton(props: { label: string; onClick: () => void }) {
  return (
    <button
      className="active:scale-[0.99] transition-transform"
      onClick={props.onClick}
      style={{
        borderRadius: 999,
        padding: '10px 18px',
        border: '1px solid rgba(255,255,255,0.82)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,246,252,0.82))',
        color: 'rgba(146,96,192,0.96)',
        letterSpacing: '0.02em',
        fontWeight: 500,
        minWidth: 118,
        boxShadow: '0 10px 28px rgba(215,145,191,0.18)',
      }}
    >
      {props.label} ♡
    </button>
  )
}

function Onboarding(props: { onCreate: (profile: Profile) => void }) {
  const { t } = useTranslation()
  const [language, setLanguage] = useState<'en' | 'zh-Hans'>(() => (i18n.language.startsWith('zh') ? 'zh-Hans' : 'en'))
  const [serverUrl, setServerUrl] = useState('http://localhost:5174')
  const [relationshipStartISO, setRelationshipStartISO] = useState(todayISO())
  const [myName, setMyName] = useState('Me')
  const [partnerName, setPartnerName] = useState('You')
  const [blobColorKey, setBlobColorKey] = useState<BlobColorKey>('rose')
  const [coupleId, setCoupleId] = useState(() => randomId('cpl').slice(0, 12))

  useEffect(() => {
    void i18n.changeLanguage(language)
  }, [language])

  return (
    <div className="mx-auto flex min-h-[100svh] max-w-[420px] flex-col px-5 pb-10 pt-10">
      <div className="lp-glass lp-shadow-soft rounded-[var(--radius-phone)] px-6 py-6">
        <div className="text-[28px] font-[500] tracking-[-0.03em] text-[color:var(--ink)]">{t('onboarding.title')}</div>
        <div className="mt-2 text-[14px] font-[500] text-[color:var(--muted)]">{t('onboarding.subtitle')}</div>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-left">
            <span className="text-[13px] font-[500] text-[color:var(--muted)]">{t('onboarding.language')}</span>
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-[18px] px-3 py-2 text-[14px] font-[500] lp-glass"
                onClick={() => setLanguage('zh-Hans')}
                style={{ outline: language === 'zh-Hans' ? `2px solid rgba(212,83,126,0.45)` : 'none' }}
              >
                中文
              </button>
              <button
                className="flex-1 rounded-[18px] px-3 py-2 text-[14px] font-[500] lp-glass"
                onClick={() => setLanguage('en')}
                style={{ outline: language === 'en' ? `2px solid rgba(212,83,126,0.45)` : 'none' }}
              >
                English
              </button>
            </div>
          </label>

          <label className="grid gap-2 text-left">
            <span className="text-[13px] font-[500] text-[color:var(--muted)]">{t('onboarding.serverUrl')}</span>
            <input
              className="rounded-[18px] border border-white/40 bg-white/35 px-3 py-2 text-[14px] font-[500] text-[color:var(--ink)] outline-none"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:5174"
            />
          </label>

          <label className="grid gap-2 text-left">
            <span className="text-[13px] font-[500] text-[color:var(--muted)]">Couple ID</span>
            <input
              className="rounded-[18px] border border-white/40 bg-white/35 px-3 py-2 text-[14px] font-[500] text-[color:var(--ink)] outline-none"
              value={coupleId}
              onChange={(e) => setCoupleId(e.target.value)}
            />
            <div className="text-[12px] font-[500] text-[color:var(--muted)]">Open two tabs and use the same Couple ID to demo realtime.</div>
          </label>

          <label className="grid gap-2 text-left">
            <span className="text-[13px] font-[500] text-[color:var(--muted)]">{t('onboarding.relationshipStart')}</span>
            <input
              type="date"
              className="rounded-[18px] border border-white/40 bg-white/35 px-3 py-2 text-[14px] font-[500] text-[color:var(--ink)] outline-none"
              value={relationshipStartISO}
              onChange={(e) => setRelationshipStartISO(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-left">
              <span className="text-[13px] font-[500] text-[color:var(--muted)]">{t('onboarding.myName')}</span>
              <input
                className="rounded-[18px] border border-white/40 bg-white/35 px-3 py-2 text-[14px] font-[500] text-[color:var(--ink)] outline-none"
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
              />
            </label>
            <label className="grid gap-2 text-left">
              <span className="text-[13px] font-[500] text-[color:var(--muted)]">{t('onboarding.partnerName')}</span>
              <input
                className="rounded-[18px] border border-white/40 bg-white/35 px-3 py-2 text-[14px] font-[500] text-[color:var(--ink)] outline-none"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-2 text-left">
            <span className="text-[13px] font-[500] text-[color:var(--muted)]">{t('onboarding.color')}</span>
            <div className="flex items-center gap-3">
              {(Object.keys(BLOB_COLORS) as BlobColorKey[]).map((key) => (
                <button
                  key={key}
                  className="size-10 rounded-full border border-white/70"
                  onClick={() => setBlobColorKey(key)}
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${BLOB_COLORS[key].core}, ${BLOB_COLORS[key].rim})`,
                    outline: blobColorKey === key ? `2px solid rgba(212,83,126,0.55)` : 'none',
                    boxShadow: `0 18px 50px ${BLOB_COLORS[key].glow}`,
                  }}
                  aria-label={key}
                />
              ))}
            </div>
          </div>

          <button
            className="mt-2 rounded-[22px] px-4 py-3 text-[15px] font-[500] text-white lp-shadow-soft"
            style={{ background: 'linear-gradient(180deg, rgba(20,7,15,0.86), rgba(20,7,15,0.72))' }}
            onClick={() => {
              const profile: Profile = {
                version: 1,
                userId: randomId('usr'),
                coupleId: coupleId.trim(),
                myName: myName.trim() || 'Me',
                partnerName: partnerName.trim() || 'You',
                relationshipStartISO,
                blobColorKey,
                language,
                serverUrl: serverUrl.trim() || 'http://localhost:5174',
              }
              props.onCreate(profile)
            }}
          >
            {t('onboarding.create')}
          </button>
        </div>
      </div>

      <div className="mt-5 px-2 text-center text-[12px] font-[500] text-[color:var(--muted)]">
        Tip: run the Socket server, then open two tabs and create two profiles with the same Couple ID.
      </div>
    </div>
  )
}

function App() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())

  const [partner, setPartner] = useState<PartnerState | null>(null)
  const [myMissYouCount, setMyMissYouCount] = useState(0)
  const [partnerPulse, setPartnerPulse] = useState(0)
  const [selectedMood, setSelectedMood] = useState<MoodKey>('loved')
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null)

  const dayCount = useMemo(() => (profile ? daysTogether(profile.relationshipStartISO) : 1), [profile])

  useEffect(() => {
    if (!profile) return
    void i18n.changeLanguage(profile.language)
  }, [profile])

  useEffect(() => {
    if (!profile) return
    const socket = connectSocket(profile)
    socketRef.current = socket

    socket.on('state:self', (payload) => {
      if (payload.self.userId !== profile.userId) return
      setMyMissYouCount(payload.self.missYouCount)
    })

    socket.on('state:partner', (payload) => {
      if (payload.partner.userId === profile.userId) return
      setPartner((prev) => {
        const base: PartnerState = {
          userId: payload.partner.userId,
          name: payload.partner.name,
          blobColorKey: payload.partner.blobColorKey as BlobColorKey,
          currentMood: payload.partner.currentMood,
          moodUpdatedAt: payload.partner.moodUpdatedAt,
          missYouCount: payload.partner.missYouCount,
          lastUnreadNote: payload.lastUnreadNote ?? prev?.lastUnreadNote,
        }
        if (!prev) return base
        return { ...prev, ...base }
      })
    })

    socket.on('note:new', (payload) => {
      setPartnerPulse((v) => v + 1)
      setPartner((prev) => {
        if (!prev) return prev
        if (payload.fromUserId === profile.userId) return prev
        return {
          ...prev,
          lastUnreadNote: {
            id: payload.id,
            emotionKey: payload.emotionKey,
            content: payload.content,
            createdAt: payload.createdAt,
          },
          currentMood: payload.emotionKey,
          moodUpdatedAt: payload.createdAt,
        }
      })
    })

    socket.on('mood:set', (payload) => {
      setPartner((prev) => {
        if (!prev) return prev
        if (payload.userId === profile.userId) return prev
        return { ...prev, currentMood: payload.mood, moodUpdatedAt: payload.at }
      })
    })

    socket.on('ping', (payload) => {
      if (payload.fromUserId === profile.userId) {
        setMyMissYouCount(payload.missYouCount)
        return
      }
      setPartnerPulse((v) => v + 1)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [profile])

  if (!profile) {
    return (
      <Onboarding
        onCreate={(p) => {
          saveProfile(p)
          setProfile(p)
        }}
      />
    )
  }

  const missYouCount = myMissYouCount
  const partnerName = partner?.name ?? profile.partnerName
  const partnerMood: MoodKey = partner?.currentMood ?? 'happy'
  const partnerColor: BlobColorKey = partner?.blobColorKey ?? 'lavender'

  return (
    <div className="mx-auto min-h-[100svh] max-w-[960px] px-3 pb-6 pt-3 sm:px-6 sm:pb-10 sm:pt-5">
      <div className="mx-auto max-w-[920px] rounded-[34px] border border-white/70 bg-[linear-gradient(145deg,rgba(246,227,245,0.78),rgba(255,242,248,0.56),rgba(255,235,221,0.72))] px-4 pb-6 pt-4 shadow-[0_20px_60px_rgba(20,7,15,0.08)] sm:px-7">
      <div className="flex items-start justify-between">
        <div className="text-[12px] font-[500] text-[color:var(--muted)]">{t('appName')}</div>
        <button
          className="text-[12px] font-[500] text-[color:var(--muted)] underline decoration-white/40 underline-offset-4"
          onClick={() => {
            clearProfile()
            setProfile(null)
          }}
        >
          {t('common.reset')}
        </button>
      </div>

      <div className="mt-3 flex gap-3">
        <HeartStat top={String(dayCount)} bottom={t('home.dayX', { count: dayCount })} tone="left" />
        <HeartStat top={String(missYouCount)} bottom={`${t('home.notesSent')} 💌`} tone="right" />
      </div>

      <div className="mt-9 flex justify-center">
        <PrimaryButton
          label={t('home.missYou')}
          onClick={() => {
            setPartnerPulse((v) => v + 1)
            socketRef.current?.emit('ping', { coupleId: profile.coupleId, fromUserId: profile.userId })
          }}
        />
      </div>

      <div className="relative mt-2 flex flex-col items-center">
        <div className="mb-2 text-[13px] font-[500] text-[rgba(160,124,183,0.82)]">{t('home.partnerBlob', { name: partnerName })}</div>

        <div className="relative">
          <AirbrushBlob
            mood={partnerMood}
            colorKey={partnerColor}
            pulse={partnerPulse}
            size={220}
          />
          <AnimatePresence>
            {partner?.lastUnreadNote ? (
              <SpeechBubble
                key={partner.lastUnreadNote.id}
                title={t('home.partnerNote')}
                content={partner.lastUnreadNote.content}
                hint={t('home.tapToRead')}
                onClick={() => {
                  socketRef.current?.emit('note:read', {
                    coupleId: profile.coupleId,
                    noteId: partner.lastUnreadNote!.id,
                    byUserId: profile.userId,
                  })
                  setPartner((prev) => (prev ? { ...prev, lastUnreadNote: undefined } : prev))
                }}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-2">
        <QuickNoteBar
          selectedMood={selectedMood}
          onSelectMood={(mood) => {
            setSelectedMood(mood)
            socketRef.current?.emit('mood:set', { coupleId: profile.coupleId, userId: profile.userId, mood })
          }}
          onSend={({ emotionKey, content }) => {
            socketRef.current?.emit('note:new', {
              coupleId: profile.coupleId,
              fromUserId: profile.userId,
              emotionKey,
              content,
            })
          }}
        />
      </div>

      <motion.div
        className="mt-3 px-4 py-1.5 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="text-[13px] font-[500] text-[rgba(170,132,188,0.86)]">Couple ID : {profile.coupleId}</div>
      </motion.div>
      </div>
    </div>
  )
}

export default App
