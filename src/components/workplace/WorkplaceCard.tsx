import { calculatePeriodWage, todayDateKey } from '../../lib/wageCalculation'
import type { ClockRecord } from '../../types/clockRecord'
import type { PayPeriod } from '../../lib/wageCalculation'
import type { Workplace } from '../../types/workplace'
import './WorkplaceCard.css'

function formatYen(value: number) {
  return `${Math.round(value).toLocaleString()}円`
}

function getWageRate(workplace: Workplace) {
  switch (workplace.wageType) {
    case 'hourly':
      return {
        label: '時給',
        value: workplace.hourlyWage != null ? formatYen(workplace.hourlyWage) : '-',
      }
    case 'daily':
      return {
        label: '日給',
        value: workplace.dailyWage != null ? formatYen(workplace.dailyWage) : '-',
      }
    case 'monthly':
      return {
        label: '月給',
        value: workplace.monthlyWage != null ? formatYen(workplace.monthlyWage) : '-',
      }
  }
}

function formatPeriodLabel(period: PayPeriod) {
  const format = (key: string) => {
    const [, m, d] = key.split('-')
    return `${Number(m)}/${Number(d)}`
  }
  return `${format(period.startKey)}〜${format(period.endKey)}`
}

interface WorkplaceCardProps {
  workplace: Workplace
  records: ClockRecord[]
  onEdit?: () => void
  onRetire?: () => void
  onRestore?: () => void
}

function WorkplaceCard({ workplace, records, onEdit, onRetire, onRestore }: WorkplaceCardProps) {
  const isRetired = workplace.status === 'retired'
  const rate = getWageRate(workplace)
  const wage = calculatePeriodWage(workplace, records, todayDateKey())

  const premiumNotes: string[] = []
  if (wage.nightPremiumWage > 0) {
    premiumNotes.push(`深夜+${wage.nightPremiumWage.toLocaleString()}円`)
  }
  if (wage.holidayPremiumWage > 0) {
    premiumNotes.push(`休日+${wage.holidayPremiumWage.toLocaleString()}円`)
  }

  return (
    <article className={'workplace-card' + (isRetired ? ' workplace-card--retired' : '')}>
      <span className="workplace-card__color" style={{ background: workplace.color }} />
      <div className="workplace-card__body">
        <h3 className="workplace-card__name">
          {workplace.name}
          {isRetired && <span className="workplace-card__badge">退職済み</span>}
        </h3>
        <p className="workplace-card__row">
          {rate.label}：{rate.value}
        </p>
        <p className="workplace-card__row">
          月の目標労働時間：
          {workplace.monthlyHoursTarget != null ? `${workplace.monthlyHoursTarget}時間` : '未設定'}
        </p>
        <p className="workplace-card__row">給与期間：{formatPeriodLabel(wage.period)}</p>
        <p className="workplace-card__row workplace-card__row--highlight">
          この期間の給与：{formatYen(wage.totalWage)}
          {premiumNotes.length > 0 ? `（${premiumNotes.join('・')}を含む）` : ''}
        </p>
        <div className="workplace-card__actions">
          {onEdit && (
            <button type="button" className="workplace-card__action" onClick={onEdit}>
              編集する
            </button>
          )}
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
      </div>
    </article>
  )
}

export default WorkplaceCard
