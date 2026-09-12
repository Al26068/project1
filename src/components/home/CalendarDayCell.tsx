import type { SchedulePlan } from '../../types/schedulePlan'
import type { Workplace } from '../../types/workplace'
import { StarIcon } from '../common/icons'
import './CalendarDayCell.css'

interface CalendarDayCellProps {
  day: number | null
  isToday: boolean
  dateColor?: 'red' | 'blue'
  plans: SchedulePlan[]
  workplaceMap: Map<string, Workplace>
  onClick?: () => void
}

function CalendarDayCell({
  day,
  isToday,
  dateColor,
  plans,
  workplaceMap,
  onClick,
}: CalendarDayCellProps) {
  if (day === null) {
    return <div className="calendar-day-cell calendar-day-cell--empty" />
  }

  return (
    <button
      type="button"
      className={'calendar-day-cell' + (isToday ? ' calendar-day-cell--today' : '')}
      onClick={onClick}
    >
      <span
        className={
          'calendar-day-cell__number' +
          (dateColor ? ` calendar-day-cell__number--${dateColor}` : '')
        }
      >
        {day}
      </span>
      <span className="calendar-day-cell__stars">
        {plans.map((plan) => {
          const workplace = workplaceMap.get(plan.workplaceId)
          return (
            <StarIcon
              key={plan.id}
              className="calendar-day-cell__star"
              style={{ color: workplace?.color ?? 'var(--color-border)' }}
            />
          )
        })}
      </span>
    </button>
  )
}

export default CalendarDayCell
