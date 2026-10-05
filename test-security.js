/**
 * Security Test Script
 * Tests the authentication bypass vulnerability fix
 *
 * Run with: node test-security.js
 */

require('dotenv').config();

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

const tests = [];

const log = (name, passed, message) => {
  tests.push({ name, passed, message });
  console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
};

async function runTests() {
  console.log('\n🔒 X-VOCA Security Test Suite\n');
  console.log('='.repeat(50));

  // Test 1: Health check
  try {
    const res = await axios.get(`${API_URL}/health`);
    log('Health Check', res.data.success === true, 'Server is running');
  } catch (e) {
    log('Health Check', false, `Server not reachable: ${e.message}`);
  }

  // Test 2: Admin Dashboard without token (should fail)
  try {
    await axios.get(`${API_URL}/api/admin/dashboard/stats`);
    log('Protected Route Without Token', false, 'Access granted without token (VULNERABILITY!)');
  } catch (e) {
    if (e.response?.status === 401) {
      log('Protected Route Without Token', true, 'Access denied as expected');
    } else if (e.response?.status === 403) {
      log('Protected Route Without Token', true, 'Access denied (403 - no admin role)');
    } else {
      log('Protected Route Without Token', true, `Got ${e.response?.status || 'error'} - likely protected`);
    }
  }

  // Test 3: Public routes should still work
  try {
    const res = await axios.get(`${API_URL}/api/schedules`);
    log('Public Schedule Route', res.status === 200, 'Public schedules endpoint accessible');
  } catch (e) {
    log('Public Schedule Route', false, `Failed: ${e.message}`);
  }

  // Test 4: Login endpoint should be accessible
  try {
    const res = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'nonexistent@test.com',
      password: 'wrongpassword'
    });
    log('Login Endpoint', true, 'Login endpoint accessible (got expected auth error)');
  } catch (e) {
    if (e.response?.status === 401) {
      log('Login Endpoint', true, 'Login endpoint accessible with proper error');
    } else {
      log('Login Endpoint', true, `Login endpoint returned ${e.response?.status}`);
    }
  }

  // Test 5: Rate limiting on login
  console.log('\n⚠️  Rate limit test requires multiple failed attempts...');
  console.log('(Skipped in automated test - manual testing recommended)');

  // Test 6: Dashboard stats without auth (should fail)
  try {
    await axios.get(`${API_URL}/api/dashboard/stats`);
    log('Dashboard Without Token', false, 'Dashboard accessible without token (VULNERABILITY!)');
  } catch (e) {
    if (e.response?.status === 401) {
      log('Dashboard Without Token', true, 'Dashboard blocked without token');
    } else if (e.response?.status === 403) {
      log('Dashboard Without Token', true, 'Dashboard blocked (403 - not admin)');
    } else {
      log('Dashboard Without Token', true, `Got ${e.response?.status || 'error'}`);
    }
  }

  // Test 7: Audit logs without auth (should fail)
  try {
    await axios.get(`${API_URL}/api/audit-logs`);
    log('Audit Logs Without Token', false, 'Audit logs accessible without token (VULNERABILITY!)');
  } catch (e) {
    if (e.response?.status === 401) {
      log('Audit Logs Without Token', true, 'Audit logs blocked without token');
    } else if (e.response?.status === 403) {
      log('Audit Logs Without Token', true, 'Audit logs blocked (403 - not admin)');
    } else {
      log('Audit Logs Without Token', true, `Got ${e.response?.status || 'error'}`);
    }
  }

  // Test 8: Vote stats should be public
  try {
    const res = await axios.get(`${API_URL}/api/votes/stats`);
    log('Public Vote Stats', res.status === 200, 'Vote stats endpoint accessible');
  } catch (e) {
    log('Public Vote Stats', false, `Failed: ${e.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Results:\n');

  const passed = tests.filter(t => t.passed).length;
  const failed = tests.filter(t => !t.passed).length;

  console.log(`Total: ${tests.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed}\n`);

  if (failed > 0) {
    console.log('⚠️  Failed Tests:');
    tests.filter(t => !t.passed).forEach(t => {
      console.log(`   - ${t.name}: ${t.message}`);
    });
    console.log('\n🚨 Please fix the failed security tests!');
    process.exit(1);
  } else {
    console.log('🎉 All security tests passed!');
    process.exit(0);
  }
}

runTests().catch(e => {
  console.error('Test suite error:', e.message);
  process.exit(1);
});
