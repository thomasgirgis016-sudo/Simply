import {
  getAllUsers,
  purgeAllAccountsExceptFounder,
  FOUNDER_ACCOUNT,
  requestPasswordReset,
  completePasswordReset,
  loginWithAccessCode,
  loginStudent,
  hashPassword,
  saveAllUsers
} from '../src/services/auth';

class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, val: string) { this.store[key] = String(val); }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

(global as any).localStorage = new MockStorage();
(global as any).fetch = async (url: string, opts: any) => {
  return {
    ok: true,
    json: async () => ({ success: true, emailSent: false, code: '123456' })
  };
};

async function runTests() {
  console.log('🧪 Starting Founder-Only & Password Reset Verification Tests...\n');

  // Test 1: Seed some dummy accounts into localStorage
  console.log('1. Testing non-founder account purge...');
  const dummyAccounts = [
    { ...FOUNDER_ACCOUNT },
    {
      id: 'dummy_1',
      name: 'Old Test Student 1',
      email: 'student1@test.com',
      passwordHash: 'hash1',
      role: 'student',
      status: 'approved'
    },
    {
      id: 'admin_root',
      name: 'Simply IGCSE Admin',
      email: 'admin@simplyigcse.com',
      passwordHash: 'adminhash',
      role: 'admin',
      status: 'approved'
    }
  ];
  saveAllUsers(dummyAccounts as any);

  // Run purge
  const purged = purgeAllAccountsExceptFounder();
  if (purged.length !== 1 || purged[0].id !== 'founder_thomas' || purged[0].role !== 'founder') {
    throw new Error(`Expected only founder_thomas, got: ${JSON.stringify(purged)}`);
  }
  console.log('  ✅ Purge succeeded: Only Founder Thomas exists.');

  // Test 2: Check getAllUsers() returns only founder and does NOT re-seed admin@simplyigcse.com
  console.log('2. Testing getAllUsers() stability (no auto-seeding of old admin)...');
  const allUsers = getAllUsers();
  if (allUsers.length !== 1 || allUsers[0].email !== 'thomas@simplyigcse.com') {
    throw new Error(`Expected 1 user (thomas@simplyigcse.com), got ${allUsers.length}: ${JSON.stringify(allUsers)}`);
  }
  console.log('  ✅ Verified: No unwanted admin auto-seeding occurs.');

  // Test 3: Founder login with code 2011
  console.log('3. Testing Founder login with Access Code "2011"...');
  const loginRes = await loginWithAccessCode('2011');
  if (!loginRes.success || !loginRes.user || loginRes.user.role !== 'founder') {
    throw new Error(`Failed to login with code 2011: ${JSON.stringify(loginRes)}`);
  }
  console.log(`  ✅ Founder logged in successfully as: ${loginRes.user.name} (${loginRes.user.title})`);

  // Test 4: Password reset flow
  console.log('4. Testing Password Reset flow with instant verification code return...');
  const resetReq = await requestPasswordReset('thomas@simplyigcse.com');
  if (!resetReq.success || !resetReq.code || resetReq.code.length !== 6) {
    throw new Error(`Password reset request failed: ${JSON.stringify(resetReq)}`);
  }
  console.log(`  ✅ Generated 6-digit reset code: ${resetReq.code}`);

  const newPass = 'NewSecurePass2026!';
  const resetConfirm = await completePasswordReset('thomas@simplyigcse.com', resetReq.code, newPass);
  if (!resetConfirm.success) {
    throw new Error(`Password reset confirmation failed: ${resetConfirm.error}`);
  }
  console.log('  ✅ Password successfully updated in database!');

  // Verify updated password hash
  const updatedUsers = getAllUsers();
  const founder = updatedUsers.find(u => u.email === 'thomas@simplyigcse.com')!;
  const expectedHash = await hashPassword(newPass);
  if (founder.passwordHash !== expectedHash) {
    throw new Error('Password hash does not match expected SHA-256 hash');
  }
  console.log('  ✅ Password hash verified.');

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
