import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface Props {
  allowedRole?: string
}

export default function ProtectedRoute({ allowedRole }: Props) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" replace />

  return <Outlet />
}
