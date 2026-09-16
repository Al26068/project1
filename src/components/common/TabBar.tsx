import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { BuildingIcon, ChartIcon, ClockIcon, HomeIcon, SparkleIcon } from './icons'
import './TabBar.css'

const TABS = [
  { to: '/', label: 'ホーム', Icon: HomeIcon },
  { to: '/workplace', label: '職場管理', Icon: BuildingIcon },
  { to: '/clock-in', label: '打刻', Icon: ClockIcon, center: true },
  { to: '/shift', label: 'シフト生成', Icon: SparkleIcon },
  { to: '/hours', label: '勤務時間', Icon: ChartIcon },
]

function isTabActive(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname.startsWith(to)
}

interface IndicatorRect {
  left: number
  top: number
  width: number
  height: number
  visible: boolean
}

function TabBar() {
  const { pathname } = useLocation()
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])
  const [indicator, setIndicator] = useState<IndicatorRect>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    visible: false,
  })

  const activeIndex = TABS.findIndex((tab) => isTabActive(pathname, tab.to))

  useLayoutEffect(() => {
    function measure() {
      const activeTab = TABS[activeIndex]
      const el = itemRefs.current[activeIndex]
      // 中央（打刻）タブは独自の浮き出たボタン表現を持つため、液体インジケーターの対象外にする
      if (!el || activeTab?.center) {
        setIndicator((prev) => ({ ...prev, visible: false }))
        return
      }
      setIndicator({
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
        visible: true,
      })
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeIndex])

  return (
    <nav className="tab-bar">
      <span
        className="tab-bar__liquid"
        aria-hidden="true"
        style={{
          transform: `translate(${indicator.left}px, ${indicator.top}px)`,
          width: indicator.width,
          height: indicator.height,
          opacity: indicator.visible ? 1 : 0,
        }}
      />
      {TABS.map(({ to, label, Icon, center }, index) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
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
