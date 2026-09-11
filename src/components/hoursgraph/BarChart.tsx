import type { MonthSummary } from '../../lib/hoursSummary'
import './BarChart.css'

interface BarChartProps {
  summaries: MonthSummary[]
}

function BarChart({ summaries }: BarChartProps) {
  const maxTotal = Math.max(1, ...summaries.map((s) => s.totalHours))

  const legendMap = new Map<string, string>()
  for (const summary of summaries) {
    for (const w of summary.byWorkplace) {
      legendMap.set(w.name, w.color)
    }
  }

  return (
    <div className="bar-chart">
      <div className="bar-chart__bars">
        {summaries.map((summary) => (
          <div key={summary.monthKey} className="bar-chart__column">
            <span className="bar-chart__total">{summary.totalHours || ''}</span>
            <div className="bar-chart__track">
              <div
                className="bar-chart__bar"
                style={{ height: `${(summary.totalHours / maxTotal) * 100}%` }}
              >
                {summary.byWorkplace.map((w) => (
                  <span
                    key={w.workplaceId}
                    className="bar-chart__segment"
                    style={{
                      height: `${(w.hours / summary.totalHours) * 100}%`,
                      background: w.color,
                    }}
                  />
                ))}
              </div>
            </div>
            <span className="bar-chart__label">{summary.label}</span>
          </div>
        ))}
      </div>

      {legendMap.size > 0 && (
        <div className="bar-chart__legend">
          {[...legendMap.entries()].map(([name, color]) => (
            <span key={name} className="bar-chart__legend-item">
              <span className="bar-chart__legend-dot" style={{ background: color }} />
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default BarChart
