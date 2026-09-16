import { useState } from 'react'
import type { FormEvent } from 'react'
import type {
  HolidayPremium,
  HolidayTargetDay,
  NightShiftPremium,
  Workplace,
  WageType,
} from '../../types/workplace'
import './WorkplaceForm.css'

const COLOR_OPTIONS = [
  { label: '赤', value: 'var(--color-accent-red)' },
  { label: '青', value: 'var(--color-accent-blue)' },
  { label: '黄', value: 'var(--color-accent-yellow)' },
  { label: '緑', value: 'var(--color-accent-green)' },
  { label: 'ピンク', value: 'var(--color-primary)' },
  { label: 'パープル', value: 'var(--color-secondary)' },
]

const ROUNDING_OPTIONS = [1, 5, 10, 15, 30]

// 1〜30日 + 「月末」（31として保存し、計算時はその月の最終日として扱う）
const DAY_OPTIONS = [...Array.from({ length: 30 }, (_, i) => i + 1), 31]

type WorkplaceInput = Omit<Workplace, 'id'>

const DEFAULT_NIGHT_SHIFT: NightShiftPremium = {
  enabled: false,
  startTime: '22:00',
  endTime: '05:00',
  mode: 'fixed',
  extraWage: undefined,
  multiplier: undefined,
}

const DEFAULT_HOLIDAY_PREMIUM: HolidayPremium = {
  enabled: false,
  targetDays: [],
  customDates: [],
  extraWage: undefined,
}

const HOLIDAY_TARGET_OPTIONS: { value: HolidayTargetDay; label: string }[] = [
  { value: 'friday', label: '金曜日' },
  { value: 'saturday', label: '土曜日' },
  { value: 'sunday', label: '日曜日' },
  { value: 'nationalHoliday', label: '祝日' },
  { value: 'dayBeforeHoliday', label: '祝前日' },
]

const DEFAULT_VALUE: WorkplaceInput = {
  name: '',
  color: COLOR_OPTIONS[0].value,
  status: 'active',
  wageType: 'hourly',
  hourlyWage: undefined,
  dailyWage: undefined,
  monthlyWage: undefined,
  roundingMinutes: 15,
  nightShiftPremium: DEFAULT_NIGHT_SHIFT,
  holidayPremium: DEFAULT_HOLIDAY_PREMIUM,
  breakDeduction: { enabled: true },
  monthlyHoursTarget: undefined,
  closingDay: 31,
  paymentDay: 25,
  paymentMonthOffset: 'nextMonth',
}

function formatDayLabel(day: number) {
  return day === 31 ? '月末' : `${day}日`
}

interface WorkplaceFormProps {
  initialValue?: WorkplaceInput
  submitLabel?: string
  onSubmit: (value: WorkplaceInput) => void
  onCancel?: () => void
}

function WorkplaceForm({ initialValue, submitLabel = '保存する', onSubmit, onCancel }: WorkplaceFormProps) {
  const [value, setValue] = useState<WorkplaceInput>(initialValue ?? DEFAULT_VALUE)
  const [customDateDraft, setCustomDateDraft] = useState('')

  const nightShift = value.nightShiftPremium ?? DEFAULT_NIGHT_SHIFT
  const holidayPremium = value.holidayPremium ?? DEFAULT_HOLIDAY_PREMIUM

  function handleWageTypeChange(wageType: WageType) {
    setValue((prev) => ({ ...prev, wageType }))
  }

  function toggleHolidayTargetDay(day: HolidayTargetDay) {
    const targetDays = holidayPremium.targetDays.includes(day)
      ? holidayPremium.targetDays.filter((d) => d !== day)
      : [...holidayPremium.targetDays, day]
    setValue((prev) => ({ ...prev, holidayPremium: { ...holidayPremium, targetDays } }))
  }

  function addCustomDate() {
    if (!customDateDraft || holidayPremium.customDates.includes(customDateDraft)) return
    setValue((prev) => ({
      ...prev,
      holidayPremium: {
        ...holidayPremium,
        customDates: [...holidayPremium.customDates, customDateDraft].sort(),
      },
    }))
    setCustomDateDraft('')
  }

  function removeCustomDate(dateToRemove: string) {
    setValue((prev) => ({
      ...prev,
      holidayPremium: {
        ...holidayPremium,
        customDates: holidayPremium.customDates.filter((d) => d !== dateToRemove),
      },
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(value)
  }

  return (
    <form className="workplace-form" onSubmit={handleSubmit}>
      <section className="workplace-form__section">
        <h3>基本情報</h3>
        <label className="workplace-form__field">
          <span>職場名</span>
          <input
            type="text"
            required
            value={value.name}
            onChange={(e) => setValue((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="例：コンビニA店"
          />
        </label>

        <div className="workplace-form__field">
          <span>カラー</span>
          <div className="workplace-form__color-list">
            {COLOR_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={
                  'workplace-form__color-swatch' +
                  (value.color === option.value ? ' workplace-form__color-swatch--active' : '')
                }
                style={{ background: option.value }}
                aria-label={option.label}
                onClick={() => setValue((prev) => ({ ...prev, color: option.value }))}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="workplace-form__section">
        <h3>給与形態</h3>
        <div className="workplace-form__wage-type">
          {(
            [
              { type: 'hourly', label: '時給' },
              { type: 'daily', label: '日給' },
              { type: 'monthly', label: '月給' },
            ] as const
          ).map(({ type, label }) => (
            <button
              key={type}
              type="button"
              className={
                'workplace-form__wage-type-btn' +
                (value.wageType === type ? ' workplace-form__wage-type-btn--active' : '')
              }
              onClick={() => handleWageTypeChange(type)}
            >
              {label}
            </button>
          ))}
        </div>

        {value.wageType === 'hourly' && (
          <>
            <label className="workplace-form__field">
              <span>時給（円）</span>
              <input
                type="number"
                required
                min={1}
                value={value.hourlyWage ?? ''}
                onChange={(e) =>
                  setValue((prev) => ({ ...prev, hourlyWage: Number(e.target.value) }))
                }
              />
            </label>

            <label className="workplace-form__field">
              <span>丸め単位</span>
              <select
                value={value.roundingMinutes}
                onChange={(e) =>
                  setValue((prev) => ({ ...prev, roundingMinutes: Number(e.target.value) }))
                }
              >
                {ROUNDING_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes}分単位
                  </option>
                ))}
              </select>
            </label>

            <div className="workplace-form__field">
              <label className="workplace-form__checkbox">
                <input
                  type="checkbox"
                  checked={nightShift.enabled}
                  onChange={(e) =>
                    setValue((prev) => ({
                      ...prev,
                      nightShiftPremium: { ...nightShift, enabled: e.target.checked },
                    }))
                  }
                />
                <span>深夜割増を設定する</span>
              </label>

              {nightShift.enabled && (
                <div className="workplace-form__night-shift">
                  <label className="workplace-form__field">
                    <span>開始時刻</span>
                    <input
                      type="time"
                      value={nightShift.startTime}
                      onChange={(e) =>
                        setValue((prev) => ({
                          ...prev,
                          nightShiftPremium: { ...nightShift, startTime: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <label className="workplace-form__field">
                    <span>終了時刻</span>
                    <input
                      type="time"
                      value={nightShift.endTime}
                      onChange={(e) =>
                        setValue((prev) => ({
                          ...prev,
                          nightShiftPremium: { ...nightShift, endTime: e.target.value },
                        }))
                      }
                    />
                  </label>
                  <div className="workplace-form__field">
                    <span>計算方式</span>
                    <div className="workplace-form__wage-type">
                      {(
                        [
                          { mode: 'fixed', label: '固定額を追加' },
                          { mode: 'multiplier', label: '倍率で計算' },
                        ] as const
                      ).map(({ mode, label }) => (
                        <button
                          key={mode}
                          type="button"
                          className={
                            'workplace-form__wage-type-btn' +
                            ((nightShift.mode ?? 'fixed') === mode
                              ? ' workplace-form__wage-type-btn--active'
                              : '')
                          }
                          onClick={() =>
                            setValue((prev) => ({
                              ...prev,
                              nightShiftPremium: { ...nightShift, mode },
                            }))
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(nightShift.mode ?? 'fixed') === 'fixed' ? (
                    <label className="workplace-form__field">
                      <span>追加される時給（円）</span>
                      <input
                        type="number"
                        step={1}
                        min={0}
                        value={nightShift.extraWage ?? ''}
                        onChange={(e) =>
                          setValue((prev) => ({
                            ...prev,
                            nightShiftPremium: {
                              ...nightShift,
                              extraWage: e.target.value === '' ? undefined : Number(e.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                  ) : (
                    <label className="workplace-form__field">
                      <span>倍率（例：1.25 → 時給の1.25倍）</span>
                      <input
                        type="number"
                        step={0.01}
                        min={1}
                        value={nightShift.multiplier ?? ''}
                        onChange={(e) =>
                          setValue((prev) => ({
                            ...prev,
                            nightShiftPremium: {
                              ...nightShift,
                              multiplier: e.target.value === '' ? undefined : Number(e.target.value),
                            },
                          }))
                        }
                      />
                      <span className="workplace-form__hint">
                        休日加給の対象日と重なる場合は、休日加給を含めた時給に倍率をかけて計算します
                      </span>
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="workplace-form__field">
              <label className="workplace-form__checkbox">
                <input
                  type="checkbox"
                  checked={holidayPremium.enabled}
                  onChange={(e) =>
                    setValue((prev) => ({
                      ...prev,
                      holidayPremium: { ...holidayPremium, enabled: e.target.checked },
                    }))
                  }
                />
                <span>休日加給を設定する</span>
              </label>

              {holidayPremium.enabled && (
                <div className="workplace-form__night-shift">
                  <div className="workplace-form__field">
                    <span>加給の対象日</span>
                    <div className="workplace-form__day-toggle-list">
                      {HOLIDAY_TARGET_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={
                            'workplace-form__day-toggle' +
                            (holidayPremium.targetDays.includes(option.value)
                              ? ' workplace-form__day-toggle--active'
                              : '')
                          }
                          onClick={() => toggleHolidayTargetDay(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="workplace-form__field">
                    <span>店舗が指定する加給日（任意）</span>
                    <div className="workplace-form__custom-date-input">
                      <input
                        type="date"
                        value={customDateDraft}
                        onChange={(e) => setCustomDateDraft(e.target.value)}
                      />
                      <button
                        type="button"
                        className="workplace-form__btn workplace-form__btn--ghost"
                        onClick={addCustomDate}
                      >
                        追加
                      </button>
                    </div>
                    {holidayPremium.customDates.length > 0 && (
                      <ul className="workplace-form__custom-date-list">
                        {holidayPremium.customDates.map((date) => (
                          <li key={date}>
                            <span>{date}</span>
                            <button type="button" onClick={() => removeCustomDate(date)}>
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <label className="workplace-form__field">
                    <span>追加される時給（円）</span>
                    <input
                      type="number"
                      step={1}
                      min={0}
                      value={holidayPremium.extraWage ?? ''}
                      onChange={(e) =>
                        setValue((prev) => ({
                          ...prev,
                          holidayPremium: {
                            ...holidayPremium,
                            extraWage: e.target.value === '' ? undefined : Number(e.target.value),
                          },
                        }))
                      }
                    />
                  </label>
                </div>
              )}
            </div>
          </>
        )}

        {value.wageType === 'daily' && (
          <label className="workplace-form__field">
            <span>日給（円）</span>
            <input
              type="number"
              required
              min={1}
              value={value.dailyWage ?? ''}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, dailyWage: Number(e.target.value) }))
              }
            />
          </label>
        )}

        {value.wageType === 'monthly' && (
          <label className="workplace-form__field">
            <span>月給（円）</span>
            <input
              type="number"
              required
              min={1}
              value={value.monthlyWage ?? ''}
              onChange={(e) =>
                setValue((prev) => ({ ...prev, monthlyWage: Number(e.target.value) }))
              }
            />
          </label>
        )}
      </section>

      <section className="workplace-form__section">
        <h3>勤務条件</h3>
        <label className="workplace-form__checkbox">
          <input
            type="checkbox"
            checked={value.breakDeduction.enabled}
            onChange={(e) =>
              setValue((prev) => ({
                ...prev,
                breakDeduction: { enabled: e.target.checked },
              }))
            }
          />
          <span>休憩時間を自動で控除する（6時間超で45分／8時間超で60分）</span>
        </label>

        <label className="workplace-form__field">
          <span>月の目標労働時間（任意・時間）</span>
          <input
            type="number"
            min={1}
            value={value.monthlyHoursTarget ?? ''}
            onChange={(e) =>
              setValue((prev) => ({
                ...prev,
                monthlyHoursTarget: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </label>
      </section>

      <section className="workplace-form__section">
        <h3>締め日・給料日</h3>
        <label className="workplace-form__field">
          <span>締め日</span>
          <select
            value={value.closingDay}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, closingDay: Number(e.target.value) }))
            }
          >
            {DAY_OPTIONS.map((day) => (
              <option key={day} value={day}>
                {formatDayLabel(day)}
              </option>
            ))}
          </select>
        </label>

        <label className="workplace-form__field">
          <span>給料日</span>
          <select
            value={value.paymentDay}
            onChange={(e) =>
              setValue((prev) => ({ ...prev, paymentDay: Number(e.target.value) }))
            }
          >
            {DAY_OPTIONS.map((day) => (
              <option key={day} value={day}>
                {formatDayLabel(day)}
              </option>
            ))}
          </select>
        </label>

        <label className="workplace-form__field">
          <span>支払い月</span>
          <select
            value={value.paymentMonthOffset}
            onChange={(e) =>
              setValue((prev) => ({
                ...prev,
                paymentMonthOffset: e.target.value as WorkplaceInput['paymentMonthOffset'],
              }))
            }
          >
            <option value="sameMonth">当月払い</option>
            <option value="nextMonth">翌月払い</option>
          </select>
        </label>
      </section>

      <div className="workplace-form__actions">
        {onCancel && (
          <button type="button" className="workplace-form__btn workplace-form__btn--ghost" onClick={onCancel}>
            キャンセル
          </button>
        )}
        <button type="submit" className="workplace-form__btn workplace-form__btn--primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default WorkplaceForm
