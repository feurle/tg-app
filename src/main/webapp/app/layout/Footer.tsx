import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../config/translation.ts'
import { articleService } from '../services/article.service.ts'
import { imageService } from '../services/image.service.ts'
import './Footer.css'

// Version wird aus package.json gelesen
const APP_VERSION = '1.0.0'
const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  const { t } = useTranslation('home')
  const [articleCount, setArticleCount] = useState(0)
  const [imageCount, setImageCount] = useState(0)

  useEffect(() => {
    // Lade Artikel und Bilder für Stats
    // Note: i18n.language is checked within effect, not as dependency
    // because i18n doesn't re-render when language changes
    const language = i18n.language.toUpperCase()
    ;(async () => {
      try {
        const [articles, images] = await Promise.all([
          articleService.getPublished('HOME_PAGE', language).catch(() => []),
          imageService.getAll().catch(() => []),
        ])
        setArticleCount(articles.length)
        setImageCount(images.length)
      } catch {
        // Fallback auf 0
        setArticleCount(0)
        setImageCount(0)
      }
    })()
  }, [])

  return (
    <footer className="app-footer">
      <p className="footer-line">
        <span>{articleCount} {t('stats.articles')}</span>
        <span className="footer-sep">·</span>
        <span>{imageCount} {t('stats.images')}</span>
        <span className="footer-sep">·</span>
        <span>v{APP_VERSION}</span>
        <span className="footer-sep">·</span>
        <span>© {CURRENT_YEAR}</span>
      </p>
    </footer>
  )
}
