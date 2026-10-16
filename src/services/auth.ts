import { UserAccount, GradeLevel, ExamBoard, TargetGrade } from '../types';

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

// Get all registered accounts
export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save accounts
function saveAllUsers(users: UserAccount[]) {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
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

// Sign up new student
export async function registerStudent(params: {
  name: string;
  email: string;
  password: string;
  grade: GradeLevel;
  board: ExamBoard;
  targetGrade: TargetGrade;
  selectedSubjectIds: string[];
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
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

  const newUser: UserAccount = {
    id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: params.name.trim() || 'IGCSE Student',
    email: normalizedEmail,
    passwordHash,
    grade: params.grade,
    board: params.board,
    targetGrade: params.targetGrade,
    selectedSubjectIds: params.selectedSubjectIds.length > 0 ? params.selectedSubjectIds : ['cie-math-0580', 'cie-esl-0510'],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveAllUsers(users);
  setActiveUser(newUser);

  return { success: true, user: newUser };
}

// Sign in existing student
export async function loginStudent(email: string, password: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const users = getAllUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return { success: false, error: 'No student account found with this email. Please check your spelling or sign up.' };
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
    return { success: false, error: 'Student account not found.' };
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
