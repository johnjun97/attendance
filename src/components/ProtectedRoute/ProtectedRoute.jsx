import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Loading from '../Loading/Loading.jsx'

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [])

  async function checkAccess() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const { data: attendanceUser } = await supabase
      .from('attendance_users')
      .select('active')
      .eq('user_id', user.id)
      .maybeSingle()

    if (attendanceUser?.active) {
      setAuthorized(true)
    }

    setLoading(false)
  }

  if (loading) {
    return <Loading />
  }

  if (!authorized) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute