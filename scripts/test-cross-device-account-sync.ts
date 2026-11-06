import {
  getAllUsers,
  purgeAllAccountsExceptFounder,
  registerStudent,
  syncUsersWithServer,
  FOUNDER_ACCOUNT
} from '../src/services/auth';

class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, val: string) { this.store[key] = String(val); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

(global as any).localStorage = new MockStorage();

// Simulate server with in-memory map
const serverDatabase: any[] = [{ ...FOUNDER_ACCOUNT }];

(global as any).fetch = async (url: string, opts: any) => {
  const body = opts?.body ? JSON.parse(opts.body) : {};
  if (body.action === 'get_users') {
    return {
      ok: true,
      json: async () => ({ success: true, users: serverDatabase })
    };
  }
  if (body.action === 'sync_user' || body.action === 'register_user') {
    serverDatabase.push(body.user);
    return {
      ok: true,
      json: async () => ({ success: true, user: body.user })
    };
  }
  return {
    ok: true,
    json: async () => ({ success: true })
  };
};

async function runTest() {
  console.log('🧪 Testing Cross-Device & Server User Synchronization...\n');

  // 1. Initial State: Founder only
  purgeAllAccountsExceptFounder();
  console.log('1. Purged local storage, checking users...');
  let users = getAllUsers();
  console.log(`  Found ${users.length} user(s): ${users.map(u => u.email).join(', ')}`);

  // 2. Student signs up on a "Phone" / "Incognito" client
  console.log('\n2. Simulating new student registration on separate client/phone...');
  const regResult = await registerStudent({
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@cambridge.edu',
    password: 'Password123!',
    grade: 'Year 11 / Grade 10 (IGCSE Exam Yr)',
    board: 'CIE',
    targetGrade: '9 / A*',
    selectedSubjectIds: ['cie-math-0580', 'cie-physics-0625']
  });

  if (!regResult.success || !regResult.user) {
    throw new Error('Registration failed!');
  }
  console.log(`  ✅ Registered: ${regResult.user.name} (${regResult.user.email}, status: ${regResult.user.status})`);

  // Verify server received the account
  const foundOnServer = serverDatabase.find(u => u.email === 'sarah.jenkins@cambridge.edu');
  if (!foundOnServer) {
    throw new Error('User was NOT synced to server database!');
  }
  console.log('  ✅ Verified: Student account successfully stored in server persistent database.');

  // 3. Founder Console on another device opens/syncs
  console.log('\n3. Simulating Founder Console polling server on Thomas\'s computer...');
  // Wipe this local mock storage to simulate a fresh browser / different device
  (global as any).localStorage = new MockStorage();
  localStorage.setItem('simply_purged_non_founder_accounts_2011_v3', 'true');

  const syncedUsers = await syncUsersWithServer();
  const founderHasStudent = syncedUsers.find(u => u.email === 'sarah.jenkins@cambridge.edu');
  if (!founderHasStudent) {
    throw new Error('Founder Console failed to retrieve student from server!');
  }
  console.log(`  ✅ Success! Founder Console now sees: ${founderHasStudent.name} (${founderHasStudent.email})`);

  console.log('\n🎉 ALL CROSS-DEVICE SYNC TESTS PASSED SUCCESSFULLY!');
}

runTest().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
