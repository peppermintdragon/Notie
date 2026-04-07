import type { BlobColorKey } from './types'

export const BLOB_COLORS: Record<
  BlobColorKey,
  { label: { en: string; 'zh-Hans': string }; glow: string; core: string; rim: string }
> = {
  rose: {
    label: { en: 'Rose', 'zh-Hans': '玫粉' },
    glow: 'rgba(244, 143, 177, 0.62)',
    core: 'rgba(255, 240, 248, 0.95)',
    rim: 'rgba(212, 83, 126, 0.92)',
  },
  lavender: {
    label: { en: 'Lavender', 'zh-Hans': '薰紫' },
    glow: 'rgba(202, 170, 255, 0.58)',
    core: 'rgba(250, 244, 255, 0.95)',
    rim: 'rgba(150, 120, 220, 0.92)',
  },
  peach: {
    label: { en: 'Peach', 'zh-Hans': '蜜桃' },
    glow: 'rgba(255, 186, 150, 0.56)',
    core: 'rgba(255, 249, 244, 0.95)',
    rim: 'rgba(255, 138, 92, 0.92)',
  },
  mint: {
    label: { en: 'Mint', 'zh-Hans': '薄荷' },
    glow: 'rgba(150, 255, 218, 0.46)',
    core: 'rgba(245, 255, 252, 0.94)',
    rim: 'rgba(54, 191, 158, 0.88)',
  },
  butter: {
    label: { en: 'Butter', 'zh-Hans': '奶油' },
    glow: 'rgba(255, 230, 130, 0.52)',
    core: 'rgba(255, 252, 236, 0.95)',
    rim: 'rgba(218, 170, 66, 0.92)',
  },
}
