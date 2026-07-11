const userRepository = require('../repositories/userRepository')
const { env } = require('../config/env')
const { AppError } = require('../utils/appError')
const { signJwt } = require('../utils/jwt')
const { hashPassword, verifyPassword } = require('../utils/password')
const { isPrivilegedRole, isSupportedRole, isStandardRole } = require('../security/accessScope')
const userTypeService = require('./userTypeService')
const crypto = require('crypto')

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  name: user.name,
  ownerCode: user.ownerCode ?? user.owner_code ?? null,
  email: user.email,
  role: user.role,
  companyId: user.companyId,
  status: user.status,
  isApproved: user.isApproved,
  isOnline: user.isOnline,
  createdAt: user.createdAt,
})

const enrichUserWithAccess = async (user) => {
  const safeUser = sanitizeUser(user)
  const access = await userTypeService.getEffectivePermissionsForUser(safeUser)
  return {
    ...safeUser,
    permissions: access.permissions,
    assignedUserTypeIds: access.assignedTypeIds,
  }
}

const slugifyUsername = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60) || `user-${Date.now()}`

const ensureUniqueUsername = async (base) => {
  let candidate = base
  let counter = 1
  while (await userRepository.findUserByLogin(candidate)) {
    candidate = `${base}-${counter}`
    counter += 1
    if (counter > 1000) {
      candidate = `${base}-${Date.now()}`
      break
    }
  }
  return candidate
}

const hashRefreshToken = (refreshToken) => crypto
  .createHash('sha256')
  .update(String(refreshToken || ''))
  .digest('hex')

const createRefreshToken = () => crypto.randomBytes(48).toString('base64url')

const getRefreshTokenExpiry = () => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpiresDays)
  return expiresAt
}

const getRefreshTokenExpiryForLogin = (rememberMe = false) => {
  const expiresAt = new Date()
  expiresAt.setDate(
    expiresAt.getDate()
    + (rememberMe ? env.rememberMeRefreshTokenExpiresDays : env.refreshTokenExpiresDays)
  )
  return expiresAt
}

const getDeviceName = (userAgent = '') => {
  const value = String(userAgent || '')
  if (/android/i.test(value)) return 'Android'
  if (/iphone|ipad|ios/i.test(value)) return 'iOS'
  if (/windows/i.test(value)) return 'Windows'
  if (/macintosh|mac os/i.test(value)) return 'Mac'
  if (/linux/i.test(value)) return 'Linux'
  return 'Unknown device'
}

const getBrowserName = (userAgent = '') => {
  const value = String(userAgent || '')
  if (/edg/i.test(value)) return 'Microsoft Edge'
  if (/opr|opera/i.test(value)) return 'Opera'
  if (/chrome/i.test(value)) return 'Chrome'
  if (/firefox/i.test(value)) return 'Firefox'
  if (/safari/i.test(value)) return 'Safari'
  return 'Unknown browser'
}

const buildSessionMetadata = (requestMeta = {}) => {
  const userAgent = requestMeta.userAgent || ''
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`,
    deviceName: requestMeta.deviceName || getDeviceName(userAgent),
    browser: requestMeta.browser || getBrowserName(userAgent),
    ipAddress: requestMeta.ipAddress || '',
    loginTime: new Date(),
    lastActivity: new Date(),
  }
}

const createAccessToken = (safeUser, rawUser = {}) => signJwt(
  {
    userId: safeUser.id,
    username: safeUser.username,
    name: safeUser.name,
    email: safeUser.email,
    role: safeUser.role,
    companyId: safeUser.companyId,
    tokenVersion: rawUser.auth_token_version ?? rawUser.authTokenVersion ?? safeUser.authTokenVersion ?? 0,
  },
  env.jwtSecret,
  env.jwtExpiresIn
)

const issueSession = async (safeUser, rawUser = {}, options = {}) => {
  const token = createAccessToken(safeUser, rawUser)
  const refreshToken = createRefreshToken()
  const refreshTokenExpiresAt = options.refreshTokenExpiresAt || getRefreshTokenExpiryForLogin(options.rememberMe)
  const sessionMeta = options.session || buildSessionMetadata(options.requestMeta)

  const session = await userRepository.saveRefreshTokenHash(
    safeUser.id,
    hashRefreshToken(refreshToken),
    refreshTokenExpiresAt,
    sessionMeta
  )

  return {
    token,
    refreshToken,
    refreshTokenExpiresAt,
    session,
  }
}

const validateUserPayload = ({ name, email, password }) => {
  const nameValue = String(name || '').trim()
  const emailValue = String(email || '').trim().toLowerCase()
  const passwordValue = String(password || '')

  if (!nameValue || !emailValue || !passwordValue) {
    throw new AppError('Name, email and password are required.', 400)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailValue)) {
    throw new AppError('Please enter a valid email address.', 400)
  }

  if (passwordValue.length < 6) {
    throw new AppError('Password must be at least 6 characters.', 400)
  }

  return {
    nameValue,
    emailValue,
    passwordValue,
  }
}

const register = async ({ name, email, password }) => {
  const { nameValue, emailValue, passwordValue } = validateUserPayload({ name, email, password })

  const existing = await userRepository.findUserByEmail(emailValue)
  if (existing) {
    throw new AppError('An account with this email already exists.', 409)
  }

  const baseUsername = slugifyUsername(nameValue || emailValue.split('@')[0])
  const username = await ensureUniqueUsername(baseUsername)
  const passwordHash = await hashPassword(passwordValue)

  const created = await userRepository.createUser({
    username,
    name: nameValue,
    email: emailValue,
    passwordHash,
    role: 'user',
    companyId: 1,
    status: 'pending',
    isApproved: false,
  })

  return {
    user: await enrichUserWithAccess(created),
    message: 'Registration submitted. Your account is awaiting admin approval.',
  }
}

const createAdminManagedUser = async ({ name, email, password, companyId = 1, role = 'user' }) => {
  const { nameValue, emailValue, passwordValue } = validateUserPayload({ name, email, password })

  const existing = await userRepository.findUserByEmail(emailValue)
  if (existing) {
    throw new AppError('An account with this email already exists.', 409)
  }

  if (!isSupportedRole(role) || isPrivilegedRole(role)) {
    throw new AppError('Only standard user roles can be created through this flow.', 400)
  }

  const baseUsername = slugifyUsername(nameValue || emailValue.split('@')[0])
  const username = await ensureUniqueUsername(baseUsername)
  const passwordHash = await hashPassword(passwordValue)

  const created = await userRepository.createUser({
    username,
    name: nameValue,
    email: emailValue,
    passwordHash,
    role,
    companyId,
    status: 'pending',
    isApproved: false,
  })

  return {
    user: await enrichUserWithAccess(created),
  }
}

const login = async ({ username, password, role, rememberMe }, requestMeta = {}) => {
  const loginValue = String(username || '').trim().toLowerCase()
  if (!loginValue || !password) {
    throw new AppError('Username and password are required.', 400)
  }

  const user = await userRepository.findUserByLogin(loginValue)
  if (!user) {
    throw new AppError('Incorrect username/email or password.', 401)
  }

  const isPasswordValid = await verifyPassword(password, user.password_hash)
  if (!isPasswordValid) {
    throw new AppError('Incorrect username/email or password.', 401)
  }

  if (role === 'admin' && !isPrivilegedRole(user.role)) {
    throw new AppError('Invalid role for this portal.', 403)
  }

  if (role === 'user' && !isStandardRole(user.role)) {
    throw new AppError('Invalid role for this portal.', 403)
  }

  if (!isPrivilegedRole(user.role)) {
    if (user.status === 'pending' || user.is_approved === false) {
      throw new AppError('Your account is awaiting admin approval.', 403)
    }
    if (user.status === 'rejected') {
      throw new AppError('Your registration was rejected. Please contact the administrator.', 403)
    }
    if (user.status === 'disabled') {
      throw new AppError('Your account has been disabled. Please contact the administrator.', 403)
    }
    if (user.status !== 'approved') {
      throw new AppError('Your account is not active.', 403)
    }
  }

  const safeUser = await enrichUserWithAccess({
    id: user.id,
    username: user.username,
    name: user.name,
    ownerCode: user.owner_code,
    email: user.email,
    role: user.role,
    companyId: user.company_id,
    status: user.status,
    isApproved: user.is_approved,
    isOnline: user.is_online,
    createdAt: user.created_at,
  })

  const session = await issueSession(safeUser, user, {
    rememberMe: Boolean(rememberMe),
    requestMeta,
  })

  return {
    ...session,
    user: safeUser,
  }
}

const refreshSession = async (refreshToken) => {
  const tokenValue = String(refreshToken || '').trim()
  if (!tokenValue) {
    throw new AppError('Refresh token is required.', 401)
  }

  const oldRefreshTokenHash = hashRefreshToken(tokenValue)
  const newRefreshToken = createRefreshToken()
  const refreshTokenExpiresAt = getRefreshTokenExpiry()
  const rotation = await userRepository.rotateRefreshSession(
    oldRefreshTokenHash,
    hashRefreshToken(newRefreshToken),
    refreshTokenExpiresAt
  )
  const rawUser = rotation?.user
  if (!rawUser) {
    throw new AppError('Refresh token is invalid or expired.', 401)
  }

  const safeUser = await enrichUserWithAccess({
    id: rawUser.id,
    username: rawUser.username,
    name: rawUser.name,
    ownerCode: rawUser.owner_code,
    email: rawUser.email,
    role: rawUser.role,
    companyId: rawUser.company_id,
    status: rawUser.status,
    isApproved: rawUser.is_approved,
    isOnline: rawUser.is_online,
    createdAt: rawUser.created_at,
    authTokenVersion: rawUser.auth_token_version,
  })

  return {
    token: createAccessToken(safeUser, rawUser),
    refreshToken: newRefreshToken,
    refreshTokenExpiresAt,
    session: rotation.session,
    user: safeUser,
  }
}

const getCurrentUser = async (userId) => {
  const user = await userRepository.findUserById(userId)
  if (!user) {
    throw new AppError('User not found.', 404)
  }

  if (!isPrivilegedRole(user.role) && (!user.isApproved || user.status !== 'approved')) {
    throw new AppError('Your account is not active.', 403)
  }

  return enrichUserWithAccess(user)
}

const logoutUser = async (userId) => {
  if (!userId) return
  await userRepository.incrementAuthTokenVersion(userId)
  await userRepository.revokeRefreshToken(userId)
}

const logoutRefreshSession = async (refreshToken) => {
  const tokenValue = String(refreshToken || '').trim()
  if (!tokenValue) return

  await userRepository.revokeRefreshSessionByHash(hashRefreshToken(tokenValue))
}

const listSessions = async (userId) => {
  if (!userId) {
    throw new AppError('User is required.', 401)
  }

  return {
    sessions: await userRepository.listRefreshSessions(userId),
  }
}

const revokeSession = async (userId, sessionId) => {
  if (!userId) {
    throw new AppError('User is required.', 401)
  }
  await userRepository.revokeRefreshSessionById(userId, sessionId)
  return { success: true }
}

const logoutAllSessions = async (userId) => {
  if (!userId) return { success: true }
  await userRepository.incrementAuthTokenVersion(userId)
  await userRepository.revokeRefreshToken(userId)
  return { success: true }
}

const updateAdminManagedUser = async (userId, { name, email, password }) => {
  const targetUser = await userRepository.findRawUserById(userId)
  if (!targetUser) {
    throw new AppError('User not found.', 404)
  }

  if (isPrivilegedRole(targetUser.role)) {
    throw new AppError('Privileged accounts cannot be modified through this form.', 403)
  }

  const nameValue = String(name || '').trim()
  const emailValue = String(email || '').trim().toLowerCase()
  const passwordValue = String(password || '')

  if (!nameValue || !emailValue) {
    throw new AppError('Name and email are required.', 400)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailValue)) {
    throw new AppError('Please enter a valid email address.', 400)
  }

  const existing = await userRepository.findUserByEmail(emailValue)
  if (existing && existing.id !== userId) {
    throw new AppError('An account with this email already exists.', 409)
  }

  let passwordHash = null
  if (passwordValue) {
    if (passwordValue.length < 6) {
      throw new AppError('Password must be at least 6 characters.', 400)
    }
    passwordHash = await hashPassword(passwordValue)
  }

  const updated = await userRepository.updateUserDetails(userId, {
    name: nameValue,
    email: emailValue,
    passwordHash,
  })

  return {
    user: await enrichUserWithAccess(updated),
  }
}

module.exports = {
  login,
  refreshSession,
  logoutUser,
  logoutRefreshSession,
  register,
  createAdminManagedUser,
  updateAdminManagedUser,
  getCurrentUser,
  listSessions,
  revokeSession,
  logoutAllSessions,
}
