import './Navbar.css'

type Page = 'home' | 'news' | 'articles' | 'images'

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function Navbar({ currentPage, onNavigate }: Props) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="navbar-brand"
        >
          TG App
        </button>

        {/* Center Navigation */}
        <div className="navbar-nav">
          <button
            onClick={() => onNavigate('home')}
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('news')}
            className={`nav-link ${currentPage === 'news' ? 'active' : ''}`}
          >
            News
          </button>
        </div>

        {/* Right Side Actions */}
        <div className="navbar-actions">
          <button
            onClick={() => onNavigate('articles')}
            className="navbar-action-btn"
          >
            Artikel
          </button>
          <button
            onClick={() => onNavigate('images')}
            className="navbar-action-btn"
          >
            Bilder
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="navbar-mobile-menu">
        <button
          onClick={() => onNavigate('home')}
          className={`mobile-nav-link ${currentPage === 'home' ? 'active' : ''}`}
        >
          Home
        </button>
        <button
          onClick={() => onNavigate('news')}
          className={`mobile-nav-link ${currentPage === 'news' ? 'active' : ''}`}
        >
          News
        </button>
        <button
          onClick={() => onNavigate('images')}
          className={`mobile-nav-link ${currentPage === 'images' ? 'active' : ''}`}
        >
          Bilder
        </button>
      </div>
    </nav>
  )
}
