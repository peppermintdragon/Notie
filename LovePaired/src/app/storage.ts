import type { LanguageKey, Profile } from './types'

const PROFILE_KEY = 'lovepaired.profile.v1'
const LANGUAGE_KEY = 'lovepaired.lang'

export function loadProfile(): Profile | null {
  const raw = window.localStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Profile
    if (parsed?.version !== 1) return null
    return parsed
  } catch {
    return null
  }
}

export function saveProfile(profile: Profile) {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  window.localStorage.setItem(LANGUAGE_KEY, profile.language)
}

export function clearProfile() {
  window.localStorage.removeItem(PROFILE_KEY)
}

export function loadLanguage(): LanguageKey | null {
  const value = window.localStorage.getItem(LANGUAGE_KEY)
  if (value === 'en' || value === 'zh-Hans') return value
  return null
}
