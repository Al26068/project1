import { NavLink } from 'react-router-dom'
import {
  BuildingIcon,
  ChartIcon,
  ClockIcon,
  PiggyBankIcon,
  SparkleIcon,
} from './icons'
import './TabBar.css'

const TABS = [
  { to: '/savings', label: '貯金', Icon: PiggyBankIcon },
  { to: '/workplace', label: '職場管理', Icon: BuildingIcon },
  { to: '/clock-in', label: '打刻', Icon: ClockIcon, center: true },
  { to: '/shift', label: 'シフト生成', Icon: SparkleIcon },
  { to: '/hours', label: '勤務時間', Icon: ChartIcon },
]

function TabBar() {
  return (
    <nav className="tab-bar">
      {TABS.map(({ to, label, Icon, center }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [
              'tab-bar__item',
              center ? 'tab-bar__item--center' : '',
              isActive ? 'tab-bar__item--active' : '',
            ]
              .filter(Boolean)
              .join(' ')
          }
        >
          <span className="tab-bar__icon">
            <Icon className="tab-bar__icon-svg" />
          </span>
          <span className="tab-bar__label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default TabBar
