import { useState } from 'react'
import Modal from '../components/common/Modal'
import ClockInForm from '../components/clockin/ClockInForm'
import { createClockRecordId, loadClockRecords, saveClockRecords } from '../lib/clockRecordStorage'
import type { ClockRecord } from '../types/clockRecord'
import './ClockInScreen.css'

function ClockInScreen() {
  const [isModalOpen, setModalOpen] = useState(false)

  function handleSubmit(value: Omit<ClockRecord, 'id'>) {
    const record: ClockRecord = { ...value, id: createClockRecordId() }
    const records = loadClockRecords()
    saveClockRecords([...records, record])
    setModalOpen(false)
  }

  return (
    <section className="clock-in-screen">
      <h2>打刻</h2>
      <p className="clock-in-screen__description">
        勤務が終わったら、ボタンを押して勤務時間を記録しましょう。
      </p>

      <button type="button" className="clock-in-screen__button" onClick={() => setModalOpen(true)}>
        打刻する
      </button>

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title="勤務時間を記録">
        <ClockInForm onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </section>
  )
}

export default ClockInScreen
