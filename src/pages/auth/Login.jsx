import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiShield, FiUser } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { setupApi } from '../../services/setupApi'
import { APP_NAME, APP_VERSION, getDashboardRoute } from '../../utils/constants'
import swatiLogo from '../../assets/swati-logo.png'
import './Login.css'

const panelMotion = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
}

const Login = ({ isAdmin = false, mode: modeProp = '' }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const initialMode = modeProp
    || (isAdmin ? 'admin' : (queryParams.get('role') === 'user' ? 'user' : 'choose'))

  const [mode, setMode] = useState(initialMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showLogoImage, setShowLogoImage] = useState(true)
  const [setupStatus, setSetupStatus] = useState(null)
  const [setupNotice, setSetupNotice] = useState('')

  const { login } = useAuth()
  const effectiveIsAdmin = mode === 'admin' || isAdmin

  React.useEffect(() => {
    let isMounted = true

    const loadSetupStatus = async () => {
      try {
        const data = await setupApi.getPublicSetupStatus()
        if (!isMounted) return
        setSetupStatus(data)
        setSetupNotice('')
      } catch (requestError) {
        if (!isMounted) return
        setSetupStatus(null)
        setSetupNotice(
          requestError.response?.data?.message
            || 'Backend is not reachable. Start MongoDB and the server to enable login.'
        )
      }
    }

    loadSetupStatus()
    return () => {
      isMounted = false
    }
  }, [])

  const isSetupBlocked = setupStatus && !setupStatus.ready

  const validateForm = (nextUsername = username, nextPassword = password) => {
    const nextErrors = {}
    const loginValue = String(nextUsername || '').trim()
    const passwordValue = String(nextPassword || '')

    if (!loginValue) {
      nextErrors.username = 'Email or username is required.'
    } else if (loginValue.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginValue)) {
      nextErrors.username = 'Enter a valid email address.'
    }

    if (!passwordValue) {
      nextErrors.password = 'Password is required.'
    } else if (passwordValue.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    return nextErrors
  }

  const handleUsernameChange = (event) => {
    const nextValue = event.target.value
    setUsername(nextValue)
    setFieldErrors(validateForm(nextValue, password))
  }

  const handlePasswordChange = (event) => {
    const nextValue = event.target.value
    setPassword(nextValue)
    setFieldErrors(validateForm(username, nextValue))
  }

  const navigateAfterLogin = (result) => {
    const userRole = result?.user?.role
    const fallbackRoute = getDashboardRoute(userRole)
    const fromLocation = location.state?.from
    const fromPath = [
      fromLocation?.pathname,
      fromLocation?.search,
      fromLocation?.hash,
    ].filter(Boolean).join('')
    const isAdminUser = userRole === 'admin' || userRole === 'super_admin'
    const canReturnToFromPath = fromLocation?.pathname
      && fromLocation.pathname !== '/login'
      && fromLocation.pathname !== '/admin/login'
      && (isAdminUser || !fromLocation.pathname.startsWith('/admin'))

    navigate(canReturnToFromPath ? fromPath : fallbackRoute, { replace: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const nextErrors = validateForm()
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }
    setLoading(true)

    try {
      const result = await login(username, password, effectiveIsAdmin ? 'admin' : 'user', { rememberMe })
      if (result.success) {
        navigateAfterLogin(result)
      } else {
        setError(result.message || 'Login failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (isAdmin) {
      navigate('/login')
      return
    }

    setMode('choose')
    setError('')
    setFieldErrors({})
    setUsername('')
    setPassword('')
    setRememberMe(false)
    setShowPassword(false)
  }

  if (mode === 'choose') {
    return (
      <div className="login-shell">
        <motion.div
          className="login-chooser"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={panelMotion}
        >
          {setupNotice ? (
            <div className="login-setup-banner login-setup-banner--warning">
              <strong>Setup Notice:</strong> {setupNotice}
            </div>
          ) : null}

          {isSetupBlocked ? (
            <div className="login-setup-banner">
              <strong>Login is blocked until MongoDB setup is ready.</strong>
              <span>{setupStatus.storage || 'MongoDB'} storage is not ready yet.</span>
            </div>
          ) : null}

          <motion.div
            className="login-chooser-brand"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...panelMotion, delay: 0.08 }}
          >
            <div className="login-brand-mark">
              {showLogoImage ? (
                <img
                  src={swatiLogo}
                  alt={`${APP_NAME} logo`}
                  className="login-brand-image"
                  onError={() => setShowLogoImage(false)}
                />
              ) : (
                <div className="login-brand-fallback">{APP_NAME}</div>
              )}
            </div>
            <div className="login-chooser-copy">
              <span className="login-kicker">{APP_NAME} Access</span>
              <h1 className="login-title">{APP_NAME}</h1>
              <p className="login-subtitle">
                Admin and user access are now separated. User accounts are created and approved only by the administrator.
              </p>
            </div>
          </motion.div>

          <div className="login-choose-grid">
            <motion.button
              type="button"
              className="login-choose-card login-choose-card--admin"
              onClick={() => setMode('admin')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...panelMotion, delay: 0.16 }}
            >
              <div className="login-choose-card-icon">
                <FiShield />
              </div>
              <div className="login-choose-card-title">Admin Login</div>
              <div className="login-choose-card-desc">
                Manage users, approvals, status control, and the complete CRM dashboard.
              </div>
              <div className="login-choose-card-meta">
                <span>Secure admin portal</span>
                <FiArrowRight />
              </div>
            </motion.button>

            <motion.button
              type="button"
              className="login-choose-card login-choose-card--user"
              onClick={() => setMode('user')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...panelMotion, delay: 0.24 }}
            >
              <div className="login-choose-card-icon">
                <FiUser />
              </div>
              <div className="login-choose-card-title">User Login</div>
              <div className="login-choose-card-desc">
                Access your dashboard, tasks, deals, reminders, and assigned CRM data after admin approval.
              </div>
              <div className="login-choose-card-meta">
                <span>Admin-created account only</span>
                <FiArrowRight />
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="login-shell">
      <div className="login-layout">
        <motion.section
          className="login-panel login-panel--intro"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={panelMotion}
        >
          {setupNotice ? (
            <div className="login-setup-banner login-setup-banner--warning">
              <strong>Setup Notice:</strong> {setupNotice}
            </div>
          ) : null}

          <div className="login-brand-mark login-brand-mark--left">
            {showLogoImage ? (
              <img
                src={swatiLogo}
                alt={`${APP_NAME} logo`}
                className="login-brand-image"
                onError={() => setShowLogoImage(false)}
              />
            ) : (
              <div className="login-brand-fallback">{APP_NAME}</div>
            )}
          </div>

          <span className="login-kicker">{effectiveIsAdmin ? 'Administrator Access' : 'User Workspace'}</span>
          <h1 className="login-title">
            {effectiveIsAdmin ? 'Admin Control Center' : APP_NAME}
          </h1>
          <p className="login-subtitle">
            {effectiveIsAdmin
              ? 'Sign in with the fixed MongoDB admin account to manage approvals, disable accounts, and control user access.'
              : 'Sign in with the account created by your administrator. Users cannot self-register or create accounts from this page.'}
          </p>

          <div className={`login-role-card login-role-card--${effectiveIsAdmin ? 'admin' : 'user'}`}>
            <div className="login-role-card-icon">
              {effectiveIsAdmin ? <FiShield /> : <FiLock />}
            </div>
            <div>
              <strong>{effectiveIsAdmin ? 'Admin-only access' : 'Approval-based access'}</strong>
              <p>
                {effectiveIsAdmin
                  ? 'Only the fixed admin account can create users and approve access.'
                  : 'Your account must be created and approved by admin before you can enter the dashboard.'}
              </p>
            </div>
          </div>

          {isSetupBlocked ? (
            <div className="login-setup-card">
              <strong>Current login blocker</strong>
              <p>{setupStatus.lastError || 'MongoDB setup is incomplete.'}</p>
              <ul className="login-setup-list">
                {(setupStatus.nextSteps || []).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </motion.section>

        <motion.section
          className="login-panel login-panel--form"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...panelMotion, delay: 0.08 }}
        >
          <div className="login-form-header">
            <h2>{effectiveIsAdmin ? 'Admin Login' : 'User Login'}</h2>
            <p>
              {effectiveIsAdmin
                ? 'Use your administrator credentials to continue.'
                : 'Use the username or email provided by your administrator.'}
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <Input
              label={effectiveIsAdmin ? 'Admin Username / Email' : 'Username / Email'}
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder={effectiveIsAdmin ? 'Enter admin username or email' : 'Enter username or email'}
              fullWidth
              required
            />
            {fieldErrors.username ? <div className="login-field-error">{fieldErrors.username}</div> : null}

            <div className="login-password-field input-wrapper input-full-width">
              <label className="input-label" htmlFor="login-password-input">Password</label>
              <div className="login-password-input-wrap">
                <input
                  id="login-password-input"
                  className="input-field login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            {fieldErrors.password ? <div className="login-field-error">{fieldErrors.password}</div> : null}

            <div className="login-form-options">
              <label className="login-remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me for 30 days</span>
              </label>
              <button
                type="button"
                className="login-link-button"
                onClick={() => setError('Forgot password is not enabled yet. Please contact your administrator.')}
              >
                Forgot password?
              </button>
            </div>

            {error ? <div className="login-error">{error}</div> : null}

            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
            >
              {loading ? 'Signing in...' : `Continue to ${effectiveIsAdmin ? 'Admin Dashboard' : 'User Dashboard'}`}
            </Button>
          </form>

          <div className="login-footer">
            <button
              type="button"
              className="login-link-button"
              onClick={handleBack}
            >
              Back to access options
            </button>
            <p className="login-footer-note">
              Version {APP_VERSION} - Copyright {new Date().getFullYear()} {APP_NAME}. Need an account? Contact your administrator.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

export default Login
