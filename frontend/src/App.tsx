import { useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/public/HomePage.tsx'
import NewsPage from './pages/public/NewsPage.tsx'
import ArticlesPage from './pages/ArticlesPage'
import ImagesPage from './pages/ImagesPage'

type Page = 'home' | 'news' | 'articles' | 'images'

function App() {
  const [page, setPage] = useState<Page>('home')

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar currentPage={page} onNavigate={setPage} />
      <main className="flex-1">
        {page === 'home' && <HomePage onManageArticles={() => setPage('articles')} />}
        {page === 'news' && <NewsPage />}
        {page === 'articles' && <ArticlesPage onBack={() => setPage('home')} />}
        {page === 'images' && <ImagesPage onBack={() => setPage('home')} />}
      </main>
    </div>
  )
}

export default App
