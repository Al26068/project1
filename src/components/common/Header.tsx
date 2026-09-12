import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BellIcon, MenuIcon } from './icons'
import './Header.css'

function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false)

  return (
    <header className="app-header">
      <Link to="/notifications" className="app-header__icon-button" aria-label="通知">
        <BellIcon className="app-header__icon" />
      </Link>

      <span className="app-header__title">その場で給料</span>

      <div className="app-header__menu-wrapper">
        <button
          type="button"
          className="app-header__icon-button"
          aria-label="メニュー"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <MenuIcon className="app-header__icon" />
        </button>

        {isMenuOpen && (
          <>
            <div className="app-header__menu-backdrop" onClick={() => setMenuOpen(false)} />
            <div className="app-header__menu">
              <Link
                to="/savings"
                className="app-header__menu-item"
                onClick={() => setMenuOpen(false)}
              >
                貯金
              </Link>
              <Link
                to="/account"
                className="app-header__menu-item"
                onClick={() => setMenuOpen(false)}
              >
                アカウント情報
              </Link>
              <Link
                to="/settings"
                className="app-header__menu-item"
                onClick={() => setMenuOpen(false)}
              >
                アプリの設定
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
