import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n/config'
import type { ArticleResponse } from '../types/article'
import './Footer.css'

// Version wird aus package.json gelesen
const APP_VERSION = '1.0.0'
const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  const { t } = useTranslation('home')
  const [articleCount, setArticleCount] = useState(0)
  const [imageCount, setImageCount] = useState(0)

  useEffect(() => {
    // Lade Artikel für Stats
    const language = i18n.language.toUpperCase()
    Promise.all([
      fetch(`/api/webcontent/articles/page/HOME_PAGE/published?language=${language}`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<ArticleResponse[]>
        })
        .then((articles) => setArticleCount(articles.length))
        .catch(() => setArticleCount(0)),
      // Lade Bilder für Stats
      fetch('/api/webcontent/images')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json() as Promise<Array<{ id: number }>>
        })
        .then((images) => setImageCount(images.length))
        .catch(() => setImageCount(0)),
    ])
  }, [i18n.language])

  return (
    <footer className="app-footer">
      <div className="footer-content">
        {/* Stats */}
        <div className="footer-stats">
          <div className="footer-stat">
            <div className="footer-stat-value">{articleCount}</div>
            <div className="footer-stat-label">{t('stats.articles')}</div>
          </div>
          <div className="footer-stat">
            <div className="footer-stat-value">{imageCount}</div>
            <div className="footer-stat-label">{t('stats.images')}</div>
          </div>
          <div className="footer-stat">
            <div className="footer-stat-value">24/7</div>
            <div className="footer-stat-label">{t('stats.availability')}</div>
          </div>
        </div>

        {/* Version & Year */}
        <p className="footer-text">
          <span className="footer-version">v{APP_VERSION}</span>
          <span className="footer-separator">•</span>
          <span className="footer-year">© {CURRENT_YEAR}</span>
        </p>
      </div>
    </footer>
  )
}
