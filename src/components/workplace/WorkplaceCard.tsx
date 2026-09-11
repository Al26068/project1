import type { Workplace } from '../../types/workplace'
import './WorkplaceCard.css'

function formatYen(value: number) {
  return `${value.toLocaleString()}円`
}

function getWageSummary(workplace: Workplace) {
  switch (workplace.wageType) {
    case 'hourly':
      return {
        label: '時給',
        value: workplace.hourlyWage != null ? formatYen(workplace.hourlyWage) : '-',
        estimate:
          workplace.hourlyWage != null && workplace.monthlyHoursTarget != null
            ? formatYen(workplace.hourlyWage * workplace.monthlyHoursTarget)
            : null,
      }
    case 'daily':
      return {
        label: '日給',
        value: workplace.dailyWage != null ? formatYen(workplace.dailyWage) : '-',
        estimate: null,
      }
    case 'monthly':
      return {
        label: '月給',
        value: workplace.monthlyWage != null ? formatYen(workplace.monthlyWage) : '-',
        estimate: workplace.monthlyWage != null ? formatYen(workplace.monthlyWage) : null,
      }
  }
}

interface WorkplaceCardProps {
  workplace: Workplace
  onRetire?: () => void
  onRestore?: () => void
}

function WorkplaceCard({ workplace, onRetire, onRestore }: WorkplaceCardProps) {
  const wage = getWageSummary(workplace)
  const isRetired = workplace.status === 'retired'

  return (
    <article className={'workplace-card' + (isRetired ? ' workplace-card--retired' : '')}>
      <span className="workplace-card__color" style={{ background: workplace.color }} />
      <div className="workplace-card__body">
        <h3 className="workplace-card__name">
          {workplace.name}
          {isRetired && <span className="workplace-card__badge">退職済み</span>}
        </h3>
        <p className="workplace-card__row">
          {wage.label}：{wage.value}
        </p>
        <p className="workplace-card__row">
          月の目標労働時間：
          {workplace.monthlyHoursTarget != null ? `${workplace.monthlyHoursTarget}時間` : '未設定'}
        </p>
        <p className="workplace-card__row workplace-card__row--highlight">
          今月の給与（目安）：{wage.estimate ?? '打刻すると計算されます'}
        </p>
        {onRetire && (
          <button type="button" className="workplace-card__action" onClick={onRetire}>
            退職済みにする
          </button>
        )}
        {onRestore && (
          <button type="button" className="workplace-card__action" onClick={onRestore}>
            現在の職場に戻す
          </button>
        )}
      </div>
    </article>
  )
}

export default WorkplaceCard
