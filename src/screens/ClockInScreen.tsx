import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/common/Modal'
import ClockInForm from '../components/clockin/ClockInForm'
import { createClockRecordId, loadClockRecords, saveClockRecords } from '../lib/clockRecordStorage'
import type { ClockRecord } from '../types/clockRecord'

function ClockInScreen() {
  const navigate = useNavigate()
  const [isModalOpen, setModalOpen] = useState(true)

  function handleClose() {
    setModalOpen(false)
    navigate('/')
  }

  function handleSubmit(value: Omit<ClockRecord, 'id'>) {
    const record: ClockRecord = { ...value, id: createClockRecordId() }
    const records = loadClockRecords()
    saveClockRecords([...records, record])
    setModalOpen(false)
    navigate('/')
  }

  return (
    <Modal open={isModalOpen} onClose={handleClose} title="勤務時間を記録">
      <ClockInForm onSubmit={handleSubmit} onCancel={handleClose} />
    </Modal>
  )
}

export default ClockInScreen
