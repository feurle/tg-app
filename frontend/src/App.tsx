import { useState } from 'react'
import './App.css'
import HomePage from './pages/HomePage'
import ArticlesPage from './pages/ArticlesPage'
import ImagesPage from './pages/ImagesPage'

type Page = 'home' | 'articles' | 'images'

function App() {
  const [page, setPage] = useState<Page>('home')

  if (page === 'articles') {
    return <ArticlesPage onBack={() => setPage('home')} />
  }

  if (page === 'images') {
    return <ImagesPage onBack={() => setPage('home')} />
  }

  return (
    <div className="app">
      <HomePage onManageArticles={() => setPage('articles')} />
      <footer className="app__footer">
        <button className="btn btn--secondary" onClick={() => setPage('articles')}>
          Artikel verwalten
        </button>
        <button className="btn btn--secondary" onClick={() => setPage('images')}>
          Bilder verwalten
        </button>
      </footer>
    </div>
  )
}

export default App
