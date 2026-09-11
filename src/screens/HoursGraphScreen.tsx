import BarChart from '../components/hoursgraph/BarChart'
import { loadClockRecords } from '../lib/clockRecordStorage'
import { summarizeHours } from '../lib/hoursSummary'
import { loadWorkplaces } from '../lib/workplaceStorage'
import './HoursGraphScreen.css'

function HoursGraphScreen() {
  const records = loadClockRecords()
  const workplaces = loadWorkplaces()
  const summaries = summarizeHours(records, workplaces)
  const hasAnyRecord = summaries.some((s) => s.totalHours > 0)

  return (
    <section className="hours-graph-screen">
      <h2>勤務時間</h2>
      <p className="hours-graph-screen__description">直近6ヶ月の月別・職場別の勤務時間です。</p>

      {hasAnyRecord ? (
        <BarChart summaries={summaries} />
      ) : (
        <p className="hours-graph-screen__empty">
          まだ打刻記録がありません。打刻タブから記録すると、ここにグラフが表示されます。
        </p>
      )}
    </section>
  )
}

export default HoursGraphScreen
