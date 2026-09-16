import CalendarView from '../components/home/CalendarView'
import MonthHoursWidget from '../components/home/MonthHoursWidget'
import './HomeScreen.css'

function HomeScreen() {
  return (
    <section className="home-screen">
      <h2>ホーム</h2>
      <MonthHoursWidget />
      <CalendarView />
    </section>
  )
}

export default HomeScreen
