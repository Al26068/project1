import { Link } from 'react-router-dom'
import { GearIcon } from './icons'
import './Header.css'

function Header() {
  return (
    <header className="app-header">
      <span className="app-header__spacer" />
      <span className="app-header__title">その場で給料</span>
      <Link to="/settings" className="app-header__settings" aria-label="設定">
        <GearIcon className="app-header__settings-icon" />
      </Link>
    </header>
  )
}

export default Header
