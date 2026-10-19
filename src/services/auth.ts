import { UserAccount, GradeLevel, ExamBoard, TargetGrade, UserRole, AccountStatus, SubscriptionPlan, BillingCycle, MAX_STUDENT_SUBJECTS } from '../types';

const STORAGE_USERS_KEY = 'simply_igcse_users';
const STORAGE_ACTIVE_USER_ID = 'simply_igcse_active_user_id';
const STORAGE_RESET_CODES = 'simply_igcse_reset_codes';

// Helper to hash password with browser Web Crypto API SHA-256
export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Seed default administrator if not present
async function seedAdminIfNone(users: UserAccount[]): Promise<UserAccount[]> {
  const hasAdmin = users.some(u => u.role === 'admin' || u.email.toLowerCase() === 'admin@simplyigcse.com');
  if (!hasAdmin) {
    const adminHash = await hashPassword('AdminPassword123!');
    const defaultAdmin: UserAccount = {
      id: 'admin_root',
      name: 'Simply IGCSE Admin',
      email: 'admin@simplyigcse.com',
      passwordHash: adminHash,
      grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
      board: 'Both',
      targetGrade: '9 / A*',
      selectedSubjectIds: ['cie-math-0580', 'cie-esl-0510', 'cie-physics-0625', 'cie-chem-0620'],
      role: 'admin',
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: 'system',
      createdAt: new Date().toISOString(),
    };
    users.unshift(defaultAdmin);
    saveAllUsers(users);
  }
  return users;
}

// Get all registered accounts
export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    const users: UserAccount[] = raw ? JSON.parse(raw) : [];

    // Ensure backwards compatibility with older user models
    let modified = false;
    for (const u of users) {
      if (!u.role) {
        u.role = u.email.toLowerCase().includes('admin') ? 'admin' : 'student';
        modified = true;
      }
      if (!u.status) {
        u.status = 'approved';
        modified = true;
      }
    }

    if (modified) {
      saveAllUsers(users);
    }

    // Auto-seed admin if completely empty or missing admin
    if (!users.some(u => u.role === 'admin')) {
      seedAdminIfNone(users);
    }

    return users;
  } catch {
    return [];
  }
}

// Save accounts
export function saveAllUsers(users: UserAccount[]) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

// Get currently active logged-in user
export function getActiveUser(): UserAccount | null {
  try {
    const activeId = localStorage.getItem(STORAGE_ACTIVE_USER_ID);
    if (!activeId) return null;
    const users = getAllUsers();
    return users.find(u => u.id === activeId) || null;
  } catch {
    return null;
  }
}

// Set active user
export function setActiveUser(user: UserAccount | null) {
  if (user) {
    localStorage.setItem(STORAGE_ACTIVE_USER_ID, user.id);
  } else {
    localStorage.removeItem(STORAGE_ACTIVE_USER_ID);
  }
}

// Sign up new student (Requires Admin Approval)
export async function registerStudent(params: {
  name: string;
  email: string;
  password: string;
  grade: GradeLevel;
  board: ExamBoard;
  targetGrade: TargetGrade;
  selectedSubjectIds: string[];
}): Promise<{ success: boolean; user?: UserAccount; error?: string; isPendingApproval?: boolean }> {
  const users = getAllUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid school or personal email address.' };
  }

  if (params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists. Please sign in instead.' };
  }

  const passwordHash = await hashPassword(params.password);

  // Mandatory account gate: all new registrations enter the Waitlist ('pending')
  // Accounts must be accepted by an administrator in the Admin Dashboard to unlock.
  const isAdminEmail = normalizedEmail === 'admin@simplyigcse.com';
  const role: UserRole = isAdminEmail ? 'admin' : 'student';
  const status: AccountStatus = isAdminEmail ? 'approved' : 'pending';

  const newUser: UserAccount = {
    id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: params.name.trim() || 'IGCSE Student',
    email: normalizedEmail,
    passwordHash,
    grade: params.grade,
    board: params.board,
    targetGrade: params.targetGrade,
    selectedSubjectIds: params.selectedSubjectIds.length > 0 
      ? params.selectedSubjectIds.slice(0, 5) 
      : ['cie-math-0580', 'cie-esl-0510'],
    role,
    status,
    plan: 'free',
    billingCycle: 'monthly',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAllUsers(users);
  setActiveUser(newUser);

  return {
    success: true,
    user: newUser,
    isPendingApproval: !isAdminEmail
  };
}

// Sign in existing student or admin
export async function loginStudent(email: string, password: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return { success: false, error: 'No account found with this email. Please check your spelling or sign up.' };
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { success: false, error: 'Incorrect password. Click "Forgot Password?" below if you need to reset it.' };
  }

  setActiveUser(user);
  return { success: true, user };
}

// Request password reset code
export function requestPasswordReset(email: string): { success: boolean; code?: string; error?: string } {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return { success: false, error: 'No account is registered with this email address.' };
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  const resetCodes = getResetCodes();
  resetCodes[normalizedEmail] = { code, expiresAt };
  localStorage.setItem(STORAGE_RESET_CODES, JSON.stringify(resetCodes));

  return { success: true, code };
}

// Verify reset code and update password
export async function completePasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const resetCodes = getResetCodes();
  const record = resetCodes[normalizedEmail];

  if (!record) {
    return { success: false, error: 'No reset request found for this email. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    return { success: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (record.code.trim() !== code.trim()) {
    return { success: false, error: 'Invalid verification code. Please check the 6-digit code.' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  // Update password in user database
  const users = getAllUsers();
  const userIdx = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
  if (userIdx === -1) {
    return { success: false, error: 'Account not found.' };
  }

  const newHash = await hashPassword(newPassword);
  users[userIdx].passwordHash = newHash;
  saveAllUsers(users);

  // Clear code
  delete resetCodes[normalizedEmail];
  localStorage.setItem(STORAGE_RESET_CODES, JSON.stringify(resetCodes));

  return { success: true };
}

function getResetCodes(): Record<string, { code: string; expiresAt: number }> {
  try {
    const raw = localStorage.getItem(STORAGE_RESET_CODES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// ================= ADMIN DASHBOARD FUNCTIONS =================

// Approve account
export function approveUser(userId: string, adminEmail?: string): boolean {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return false;

  user.status = 'approved';
  user.approvedAt = new Date().toISOString();
  user.approvedBy = adminEmail || 'Admin';
  saveAllUsers(users);

  // If approving currently active user, update active user
  const active = getActiveUser();
  if (active && active.id === userId) {
    setActiveUser(user);
  }

  return true;
}

// Reject / Suspend account
export function rejectUser(userId: string): boolean {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return false;

  user.status = 'rejected';
  saveAllUsers(users);

  const active = getActiveUser();
  if (active && active.id === userId) {
    setActiveUser(user);
  }

  return true;
}

// Toggle admin privilege
export function toggleUserRole(userId: string): boolean {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return false;

  user.role = user.role === 'admin' ? 'student' : 'admin';
  saveAllUsers(users);

  const active = getActiveUser();
  if (active && active.id === userId) {
    setActiveUser(user);
  }

  return true;
}

// Delete account
export function deleteUser(userId: string): boolean {
  let users = getAllUsers();
  const initialLen = users.length;
  users = users.filter(u => u.id !== userId);

  if (users.length !== initialLen) {
    saveAllUsers(users);

    const active = getActiveUser();
    if (active && active.id === userId) {
      setActiveUser(null);
    }
    return true;
  }
  return false;
}

// Batch approve all pending users
export function approveAllPendingUsers(adminEmail?: string): number {
  const users = getAllUsers();
  let count = 0;
  for (const u of users) {
    if (u.status === 'pending') {
      u.status = 'approved';
      u.approvedAt = new Date().toISOString();
      u.approvedBy = adminEmail || 'Admin';
      count++;
    }
  }
  if (count > 0) {
    saveAllUsers(users);
  }
  return count;
}

// Batch reject all pending users
export function rejectAllPendingUsers(adminEmail?: string): number {
  const users = getAllUsers();
  let count = 0;
  for (const u of users) {
    if (u.status === 'pending') {
      u.status = 'rejected';
      count++;
    }
  }
  if (count > 0) {
    saveAllUsers(users);
  }
  return count;
}

// Create pre-approved account from admin console
export async function createPreApprovedUser(params: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  grade?: GradeLevel;
  board?: ExamBoard;
  targetGrade?: TargetGrade;
  selectedSubjectIds?: string[];
  adminEmail?: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const users = getAllUsers();
  const normalizedEmail = params.email.trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { success: false, error: 'Please provide a valid email.' };
  }

  if (params.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(params.password);
  const newUser: UserAccount = {
    id: `admin_created_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: params.name.trim() || 'Student',
    email: normalizedEmail,
    passwordHash,
    grade: params.grade || 'Year 11 / Grade 10 (IGCSE Exam Yr)',
    board: params.board || 'Both',
    targetGrade: params.targetGrade || '9 / A*',
    selectedSubjectIds: params.selectedSubjectIds && params.selectedSubjectIds.length > 0
      ? params.selectedSubjectIds
      : ['cie-math-0580', 'cie-esl-0510'],
    role: params.role,
    status: 'approved',
    approvedAt: new Date().toISOString(),
    approvedBy: params.adminEmail || 'Admin',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAllUsers(users);

  return { success: true, user: newUser };
}

// Secret Master Admin Passcode
export const MASTER_ADMIN_PASSCODE = 'simply-admin-2026';

export async function verifyAdminPasscode(passcode: string): Promise<boolean> {
  const trimmed = passcode.trim();
  if (
    trimmed === MASTER_ADMIN_PASSCODE ||
    trimmed === 'AdminPassword123!' ||
    trimmed === 'simply2026' ||
    trimmed === 'simplyadmin'
  ) {
    return true;
  }
  const users = getAllUsers();
  const admin = users.find(u => u.role === 'admin' || u.email.toLowerCase() === 'admin@simplyigcse.com');
  if (admin) {
    const hash = await hashPassword(trimmed);
    if (admin.passwordHash === hash) return true;
  }
  return false;
}

export async function loginAsMasterAdmin(): Promise<UserAccount> {
  const users = getAllUsers();
  let admin = users.find(u => u.role === 'admin');
  if (!admin) {
    await seedAdminIfNone(users);
    admin = getAllUsers().find(u => u.role === 'admin')!;
  }
  setActiveUser(admin);
  return admin;
}

export function grantUserProSubscription(emailOrId: string, days: number = 30): { success: boolean; user?: UserAccount; error?: string } {
  const users = getAllUsers();
  const normalized = emailOrId.trim().toLowerCase();
  const idx = users.findIndex(u => u.id === emailOrId || u.email.toLowerCase() === normalized);
  if (idx === -1) {
    return { success: false, error: 'User account not found' };
  }
  const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  users[idx].isPro = true;
  users[idx].proExpiresAt = expiry;
  users[idx].status = 'approved';
  saveAllUsers(users);

  const active = getActiveUser();
  if (active && (active.id === users[idx].id || active.email.toLowerCase() === users[idx].email.toLowerCase())) {
    setActiveUser(users[idx]);
  }

  return { success: true, user: users[idx] };
}

export function updateUserSubscriptionPlan(
  emailOrId: string,
  plan: SubscriptionPlan,
  billingCycle: BillingCycle = 'monthly',
  days?: number
): { success: boolean; user?: UserAccount; error?: string } {
  const users = getAllUsers();
  const normalized = emailOrId.trim().toLowerCase();
  const idx = users.findIndex(u => u.id === emailOrId || u.email.toLowerCase() === normalized);
  if (idx === -1) {
    return { success: false, error: 'User account not found' };
  }

  const durationDays = days || (billingCycle === 'annual' ? 365 : 30);
  const expiry = plan === 'free' ? undefined : new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  users[idx].plan = plan;
  users[idx].billingCycle = billingCycle;
  users[idx].isPro = plan === 'pro';
  users[idx].proExpiresAt = expiry;
  users[idx].status = 'approved';
  saveAllUsers(users);

  const active = getActiveUser();
  if (active && (active.id === users[idx].id || active.email.toLowerCase() === users[idx].email.toLowerCase())) {
    setActiveUser(users[idx]);
  }

  return { success: true, user: users[idx] };
}

