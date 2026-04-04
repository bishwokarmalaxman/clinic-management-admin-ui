import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import AppLayout from './components/AppLayout'
import Login from './pages/Login'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import SlotBlock from './pages/doctor/SlotBlock'
import AdminDashboard from './pages/admin/AdminDashboard'
import Appointments from './pages/admin/Appointments'
import Doctors from './pages/admin/Doctors'
import Departments from './pages/admin/Departments'
import Schedule from './pages/admin/Schedule'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Doctor routes */}
          <Route element={<ProtectedRoute allowedRole="Doctor" />}>
            <Route element={<AppLayout />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/slots/block" element={<SlotBlock />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRole="Admin" />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/appointments" element={<Appointments />} />
              <Route path="/admin/doctors" element={<Doctors />} />
              <Route path="/admin/departments" element={<Departments />} />
              <Route path="/admin/doctors/:doctorId/schedule" element={<Schedule />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
