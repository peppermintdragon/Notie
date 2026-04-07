import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { loadLanguage } from './storage'
import type { LanguageKey } from './types'

const resources = {
  en: {
    translation: {
      appName: 'LovePaired',
      common: {
        continue: 'Continue',
        save: 'Save',
        reset: 'Reset',
        cancel: 'Cancel',
      },
      onboarding: {
        title: 'LovePaired',
        subtitle: 'A private, minimal space for two.',
        language: 'Language',
        serverUrl: 'Server URL',
        relationshipStart: 'Relationship start date',
        myName: 'Your name',
        partnerName: "Partner's name",
        color: 'Your blob color',
        create: 'Create profile',
      },
      home: {
        dayX: 'Day {{count}}',
        togetherX: 'Together for {{count}} days',
        missYouX: 'Miss you x {{count}}',
        notesSent: 'Notes sent',
        missYou: 'Miss you',
        partnerBlob: "{{name}}'s blob",
        partnerNote: 'New note',
        tapToRead: 'Tap to read',
        setMood: 'Set mood',
        moodTitle: 'My mood',
        moodHint: 'Choose one mood. Your partner sees it instantly.',
        saySomething: 'Say something',
        send: 'Send',
      },
      mood: {
        loved: 'Loved',
        happy: 'Happy',
        missing: 'Missing',
        excited: 'Excited',
        sleepy: 'Sleepy',
        silly: 'Silly',
        sad: 'Sad',
        proud: 'Proud',
      },
    },
  },
  'zh-Hans': {
    translation: {
      appName: 'LovePaired',
      common: {
        continue: '继续',
        save: '保存',
        reset: '重置',
        cancel: '取消',
      },
      onboarding: {
        title: 'LovePaired',
        subtitle: '给两个人的私密极简空间。',
        language: '语言',
        serverUrl: '服务器地址',
        relationshipStart: '在一起的开始日期',
        myName: '你的名字',
        partnerName: 'TA 的名字',
        color: '你的 Blob 颜色',
        create: '创建',
      },
      home: {
        dayX: '第 {{count}} 天',
        togetherX: '在一起第 {{count}} 天',
        missYouX: '想你 x {{count}}',
        notesSent: '发出便签',
        missYou: '想你',
        partnerBlob: '{{name}} 的 Blob',
        partnerNote: '新消息',
        tapToRead: '点开查看',
        setMood: '设置心情',
        moodTitle: '我的心情',
        moodHint: '选择一个心情，TA 会实时看到。',
        saySomething: '发一句话给 TA',
        send: '发送',
      },
      mood: {
        loved: '爱',
        happy: '开心',
        missing: '想你',
        excited: '兴奋',
        sleepy: '困',
        silly: '调皮',
        sad: '难过',
        proud: '得意',
      },
    },
  },
} as const

function detectLanguage(): LanguageKey {
  const saved = loadLanguage()
  if (saved) return saved
  const langs = navigator.languages ?? [navigator.language]
  for (const lang of langs) {
    if (lang.toLowerCase().startsWith('zh')) return 'zh-Hans'
    if (lang.toLowerCase().startsWith('en')) return 'en'
  }
  return 'en'
}

void i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
