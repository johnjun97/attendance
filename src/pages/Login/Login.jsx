import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Loading from '../../components/Loading/Loading.jsx'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    // Step 1: Login with Supabase Auth
    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    // Step 2: Check Attendance access
    const { data: attendanceUser, error: accessError } =
      await supabase
        .from('attendance_users')
        .select('role, active')
        .eq('user_id', data.user.id)
        .maybeSingle()

    if (accessError) {
      setError('Unable to check Attendance access.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Step 3: User is authenticated but not allowed
    if (!attendanceUser || !attendanceUser.active) {
      setError(
        'You are not authorized to access the Attendance system.'
      )
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Step 4: Login successful
    window.location.href = '/'
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Attendance</h1>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login