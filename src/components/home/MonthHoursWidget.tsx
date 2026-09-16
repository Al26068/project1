import { useMemo } from 'react'
import { loadClockRecords } from '../../lib/clockRecordStorage'
import { loadWorkplaces } from '../../lib/workplaceStorage'
import { summarizeHours } from '../../lib/hoursSummary'
import './MonthHoursWidget.css'

function MonthHoursWidget() {
  const summary = useMemo(() => {
    const records = loadClockRecords()
    const workplaces = loadWorkplaces()
    return summarizeHours(records, workplaces, 1)[0]
  }, [])

  return (
    <div className="month-hours-widget">
      <div className="month-hours-widget__header">
        <span className="month-hours-widget__title">今月の労働時間</span>
        <span className="month-hours-widget__total">
          {summary.totalHours}
          <span className="month-hours-widget__unit">時間</span>
        </span>
      </div>

      {summary.byWorkplace.length === 0 ? (
        <p className="month-hours-widget__empty">今月の勤務記録はまだありません</p>
      ) : (
        <ul className="month-hours-widget__list">
          {summary.byWorkplace.map((w) => (
            <li key={w.workplaceId} className="month-hours-widget__item">
              <span className="month-hours-widget__dot" style={{ background: w.color }} />
              <span className="month-hours-widget__name">{w.name}</span>
              <span className="month-hours-widget__hours">{w.hours}時間</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MonthHoursWidget
