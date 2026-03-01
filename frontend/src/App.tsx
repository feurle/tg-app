import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/public/HomePage.tsx'
import NewsPage from './pages/public/NewsPage.tsx'
import ArticlesPage from './pages/webcontent/ArticlesPage.tsx'
import ImagesPage from './pages/webcontent/ImagesPage.tsx'
import CustomerPage from './pages/customer/CustomerPage'
import UserPage from './pages/user/UserPage'
import LoginPage from './pages/auth/LoginPage'
import type { AuthUser } from './types/auth'

type Page = 'home' | 'news' | 'articles' | 'images' | 'customers' | 'users' | 'login'

const ADMIN_PAGES: Page[] = ['articles', 'images', 'customers', 'users']

function App() {
  const [page, setPage] = useState<Page>('home')
  const [pendingPage, setPendingPage] = useState<Page | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null | 'loading'>('loading')

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? (res.json() as Promise<AuthUser>) : null))
      .then((user) => setAuthUser(user))
      .catch(() => setAuthUser(null))
  }, [])

  function handleNavigate(newPage: Page) {
    if (ADMIN_PAGES.includes(newPage) && !authUser) {
      setPendingPage(newPage)
      setPage('login')
    } else {
      setPage(newPage)
    }
  }

  function handleLogin(user: AuthUser) {
    setAuthUser(user)
    setPage(pendingPage ?? 'home')
    setPendingPage(null)
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
      />
      <main className="flex-1">
        {page === 'login' && (
          <LoginPage onLogin={handleLogin} onCancel={() => setPage('home')} />
        )}
        {page === 'home' && <HomePage />}
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
