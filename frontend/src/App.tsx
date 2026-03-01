import { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/public/HomePage.tsx'
import NewsPage from './pages/public/NewsPage.tsx'
import ArticlesPage from './pages/webcontent/ArticlesPage.tsx'
import ImagesPage from './pages/webcontent/ImagesPage.tsx'
import CustomerPage from './pages/customer/CustomerPage'
import UserPage from './pages/user/UserPage'

type Page = 'home' | 'news' | 'articles' | 'images' | 'customers' | 'users'

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
        {page === 'customers' && <CustomerPage onBack={() => setPage('home')} />}
        {page === 'users' && <UserPage onBack={() => setPage('home')} />}
      </main>
      <Footer />
    </div>
  )
}

export default App
