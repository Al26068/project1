import { Outlet } from 'react-router-dom'
import Header from './Header'
import TabBar from './TabBar'
import './Layout.css'

function Layout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-content">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}

export default Layout
