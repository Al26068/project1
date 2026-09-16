import { Route, Routes } from 'react-router-dom'
import Layout from './components/common/Layout'
import HomeScreen from './screens/HomeScreen'
import WorkplaceScreen from './screens/WorkplaceScreen'
import ClockInScreen from './screens/ClockInScreen'
import ShiftScreen from './screens/ShiftScreen'
import HoursGraphScreen from './screens/HoursGraphScreen'
import SavingsScreen from './screens/SavingsScreen'
import SavingsGoalDetailScreen from './screens/SavingsGoalDetailScreen'
import SettingsScreen from './screens/SettingsScreen'
import NotificationScreen from './screens/NotificationScreen'
import AccountScreen from './screens/AccountScreen'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/workplace" element={<WorkplaceScreen />} />
        <Route path="/clock-in" element={<ClockInScreen />} />
        <Route path="/shift" element={<ShiftScreen />} />
        <Route path="/hours" element={<HoursGraphScreen />} />
        <Route path="/savings" element={<SavingsScreen />} />
        <Route path="/savings/:id" element={<SavingsGoalDetailScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/notifications" element={<NotificationScreen />} />
        <Route path="/account" element={<AccountScreen />} />
      </Route>
    </Routes>
  )
}

export default App
