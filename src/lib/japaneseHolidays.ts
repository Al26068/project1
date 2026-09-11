// 日本の「国民の祝日」を計算するデータパック。
// 内閣府が定める祝日の計算ルール（ハッピーマンデー・振替休日・国民の休日）をもとに判定するので、
// 年が変わっても数値を更新する必要がありません。
// （春分の日・秋分の日は天文計算の近似式を使っています）

interface HolidayEntry {
  key: string // "YYYY-MM-DD"
  name: string
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month)}-${pad(day)}`
}

function vernalEquinoxDay(year: number): number {
  return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
}

function autumnalEquinoxDay(year: number): number {
  return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
}

// その月の第n月曜日を求める（ハッピーマンデー制度の祝日用）
function nthMonday(year: number, month: number, nth: number): number {
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const firstMonday = firstDayOfWeek === 1 ? 1 : ((8 - firstDayOfWeek) % 7) + 1
  return firstMonday + (nth - 1) * 7
}

function fixedHolidays(year: number): HolidayEntry[] {
  return [
    { key: dateKey(year, 1, 1), name: '元日' },
    { key: dateKey(year, 1, nthMonday(year, 1, 2)), name: '成人の日' },
    { key: dateKey(year, 2, 11), name: '建国記念の日' },
    { key: dateKey(year, 2, 23), name: '天皇誕生日' },
    { key: dateKey(year, 3, vernalEquinoxDay(year)), name: '春分の日' },
    { key: dateKey(year, 4, 29), name: '昭和の日' },
    { key: dateKey(year, 5, 3), name: '憲法記念日' },
    { key: dateKey(year, 5, 4), name: 'みどりの日' },
    { key: dateKey(year, 5, 5), name: 'こどもの日' },
    { key: dateKey(year, 7, nthMonday(year, 7, 3)), name: '海の日' },
    { key: dateKey(year, 8, 11), name: '山の日' },
    { key: dateKey(year, 9, nthMonday(year, 9, 3)), name: '敬老の日' },
    { key: dateKey(year, 9, autumnalEquinoxDay(year)), name: '秋分の日' },
    { key: dateKey(year, 10, nthMonday(year, 10, 2)), name: 'スポーツの日' },
    { key: dateKey(year, 11, 3), name: '文化の日' },
    { key: dateKey(year, 11, 23), name: '勤労感謝の日' },
  ]
}

function addDays(
  year: number,
  month: number,
  day: number,
  diff: number,
): { year: number; month: number; day: number } {
  const d = new Date(year, month - 1, day + diff)
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

function buildHolidayMap(year: number): Map<string, string> {
  // 前後の年もまとめて計算し、年またぎの振替休日にも対応する
  const entries = [...fixedHolidays(year - 1), ...fixedHolidays(year), ...fixedHolidays(year + 1)]
  const map = new Map(entries.map((h) => [h.key, h.name]))

  // 国民の休日：前後を祝日に挟まれた平日（日曜は除く）
  for (const { key } of entries) {
    const [y, m, d] = key.split('-').map(Number)
    const next = addDays(y, m, d, 1)
    const nextKey = dateKey(next.year, next.month, next.day)
    if (map.has(nextKey)) continue

    const afterNext = addDays(y, m, d, 2)
    const afterNextKey = dateKey(afterNext.year, afterNext.month, afterNext.day)
    const nextDayOfWeek = new Date(next.year, next.month - 1, next.day).getDay()
    if (map.has(afterNextKey) && nextDayOfWeek !== 0) {
      map.set(nextKey, '国民の休日')
    }
  }

  // 振替休日：日曜日の祝日の翌日以降、最初に祝日でない日を休日にする
  for (const { key } of entries) {
    const [y, m, d] = key.split('-').map(Number)
    const dayOfWeek = new Date(y, m - 1, d).getDay()
    if (dayOfWeek !== 0) continue

    let cursor = addDays(y, m, d, 1)
    while (map.has(dateKey(cursor.year, cursor.month, cursor.day))) {
      cursor = addDays(cursor.year, cursor.month, cursor.day, 1)
    }
    map.set(dateKey(cursor.year, cursor.month, cursor.day), '振替休日')
  }

  return map
}

const holidayMapCache = new Map<number, Map<string, string>>()

function getHolidayMap(year: number): Map<string, string> {
  const cached = holidayMapCache.get(year)
  if (cached) return cached
  const map = buildHolidayMap(year)
  holidayMapCache.set(year, map)
  return map
}

// 指定した日が祝日なら祝日名を返す（祝日でなければ undefined）
export function getHolidayName(date: Date): string | undefined {
  const map = getHolidayMap(date.getFullYear())
  const key = dateKey(date.getFullYear(), date.getMonth() + 1, date.getDate())
  return map.get(key)
}

export function isNationalHoliday(date: Date): boolean {
  return getHolidayName(date) !== undefined
}

// 祝前日（翌日が祝日）かどうか
export function isDayBeforeHoliday(date: Date): boolean {
  const tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  return isNationalHoliday(tomorrow)
}
