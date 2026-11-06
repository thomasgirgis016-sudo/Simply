import { hasActiveSubscription, validateActiveSession } from '../src/services/auth';
import handler from '../api/auth';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    testsFailed++;
  }
}

async function runApiCall(body: any): Promise<any> {
  const req = {
    method: 'POST',
    body
  };
  let responseData: any = null;
  let statusCode = 200;
  const res = {
    status(code: number) {
      statusCode = code;
      return {
        json(data: any) {
          responseData = data;
          return data;
        }
      };
    }
  };

  await handler(req, res);
  return { status: statusCode, data: responseData };
}

async function runSuite() {
  console.log('===========================================================');
  console.log('  SINGLE-DEVICE SESSION & SUBSCRIPTION GATE AUDIT');
  console.log('===========================================================');

  // 1. Subscription Gating Logic
  console.log('\n--- 1. Subscription Gating Logic ---');
  
  const freeStudent: any = {
    id: 'user_free_1',
    email: 'free@student.com',
    role: 'student',
    status: 'approved',
    plan: 'free',
    isPro: false
  };

  const proStudent: any = {
    id: 'user_pro_1',
    email: 'pro@student.com',
    role: 'student',
    status: 'approved',
    plan: 'pro',
    isPro: true
  };

  const founderUser: any = {
    id: 'user_thomas',
    email: 'thomas@simplyigcse.com',
    role: 'founder',
    status: 'approved',
    plan: 'pro',
    isPro: true
  };

  const expiredProUser: any = {
    id: 'user_expired_1',
    email: 'expired@student.com',
    role: 'student',
    status: 'approved',
    plan: 'pro',
    isPro: true,
    proExpiresAt: new Date(Date.now() - 100000).toISOString()
  };

  assert(hasActiveSubscription(freeStudent) === false, 'Free student is NOT marked as subscribed');
  assert(hasActiveSubscription(null) === false, 'Null user is NOT marked as subscribed');
  assert(hasActiveSubscription(proStudent) === true, 'Pro student is marked as subscribed');
  assert(hasActiveSubscription(founderUser) === true, 'Founder is marked as subscribed');
  assert(hasActiveSubscription(expiredProUser) === false, 'Expired pro student is NOT marked as subscribed');

  // 2. Cross-Device Single Session Registration & Invalidation via /api/auth
  console.log('\n--- 2. Cross-Device Single Session Invalidation via /api/auth ---');

  const testUserId = 'test_student_999';
  const testEmail = 'student999@simplyigcse.com';
  const device1Token = 'sess_device_1_abc123';
  const device2Token = 'sess_device_2_xyz789';

  // Step A: Device 1 logs in
  const reg1 = await runApiCall({
    action: 'register_session',
    userId: testUserId,
    email: testEmail,
    sessionToken: device1Token
  });
  assert(reg1.status === 200 && reg1.data.success === true, 'Device 1 successfully registered active session');

  // Step B: Device 1 checks session integrity -> should be VALID
  const val1 = await runApiCall({
    action: 'validate_session',
    userId: testUserId,
    email: testEmail,
    sessionToken: device1Token
  });
  assert(val1.status === 200 && val1.data.valid === true, 'Device 1 session is valid while only Device 1 is active');

  // Step C: Device 2 logs in with the same account -> supersedes Device 1
  const reg2 = await runApiCall({
    action: 'register_session',
    userId: testUserId,
    email: testEmail,
    sessionToken: device2Token
  });
  assert(reg2.status === 200 && reg2.data.success === true, 'Device 2 successfully registered newer session for same account');

  // Step D: Device 1 checks session integrity on next heartbeat -> MUST BE INVALIDATED
  const val1AfterDevice2 = await runApiCall({
    action: 'validate_session',
    userId: testUserId,
    email: testEmail,
    sessionToken: device1Token
  });
  assert(val1AfterDevice2.data.valid === false, 'Device 1 is INVALIDATED when Device 2 logs in');
  assert(val1AfterDevice2.data.reason.includes('logged into from another device'), 'Device 1 receives single-device logout reason');

  // Step E: Device 2 checks session integrity -> MUST BE VALID
  const val2 = await runApiCall({
    action: 'validate_session',
    userId: testUserId,
    email: testEmail,
    sessionToken: device2Token
  });
  assert(val2.status === 200 && val2.data.valid === true, 'Device 2 session remains valid as the latest device');

  // Step F: Clean logout
  const logoutRes = await runApiCall({
    action: 'logout_session',
    userId: testUserId,
    email: testEmail
  });
  assert(logoutRes.status === 200 && logoutRes.data.success === true, 'Logout successfully clears server session registry');

  console.log('\n===========================================================');
  console.log(`  AUDIT COMPLETE: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('===========================================================');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
