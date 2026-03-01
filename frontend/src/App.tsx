import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import HomePage from './pages/public/HomePage.tsx'
import NewsPage from './pages/public/NewsPage.tsx'
import ArticlesPage from './pages/webcontent/ArticlesPage.tsx'
import ImagesPage from './pages/webcontent/ImagesPage.tsx'
import CustomerPage from './pages/customer/CustomerPage'
import UserPage from './pages/user/UserPage'
import type { AuthUser } from './types/auth'

type Page = 'home' | 'news' | 'articles' | 'images' | 'customers' | 'users'

const ADMIN_PAGES: Page[] = ['articles', 'images', 'customers', 'users']

function App() {
  const [page, setPage] = useState<Page>('home')
  const [authUser, setAuthUser] = useState<AuthUser | null | 'loading'>('loading')
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? (res.json() as Promise<AuthUser>) : null))
      .then((user) => setAuthUser(user))
      .catch(() => setAuthUser(null))
  }, [])

  function handleNavigate(newPage: Page) {
    if (ADMIN_PAGES.includes(newPage) && !authUser) {
      setShowLoginModal(true)
    } else {
      setPage(newPage)
    }
  }

  function handleLogin(user: AuthUser) {
    setAuthUser(user)
    setShowLoginModal(false)
  }

  function handleLogout() {
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
      setAuthUser(null)
      setPage('home')
    })
  }

  if (authUser === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500 text-lg">Laden…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar
        currentPage={page}
        onNavigate={handleNavigate}
        authUser={authUser}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
      />
      <main className="flex-1">
        {page === 'home' && <HomePage />}
        {page === 'news' && <NewsPage />}
        {page === 'articles' && authUser && <ArticlesPage onBack={() => setPage('home')} />}
        {page === 'images' && authUser && <ImagesPage onBack={() => setPage('home')} />}
        {page === 'customers' && authUser && <CustomerPage onBack={() => setPage('home')} />}
        {page === 'users' && authUser && <UserPage onBack={() => setPage('home')} />}
      </main>
      <Footer />
      {showLoginModal && (
        <LoginModal onLogin={handleLogin} onCancel={() => setShowLoginModal(false)} />
      )}
    </div>
  )
}

export default App
