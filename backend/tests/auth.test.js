/**
 * ShopKart Authentication Service - Automated Verification Test Suite
 * Evaluates all Lab 01 Rubric Requirements & Bonus Challenges
 */

const http = require('http');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.JWT_EXPIRES_IN = '1d';

const { app } = require('../index');
const Customer = require('../models/customer.model');

let server;
let baseUrl;
let mongoServer;

// Helper: Make HTTP request to test server
function request({ method, path, body, headers = {}, cookie = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    if (cookie) {
      reqHeaders['Cookie'] = cookie;
    }

    const postData = body ? JSON.stringify(body) : null;
    if (postData) {
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: json
          });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Helper: Extract cookie from Set-Cookie header
function extractCookie(setCookieHeaders) {
  if (!setCookieHeaders) return null;
  const cookieHeader = Array.isArray(setCookieHeaders)
    ? setCookieHeaders[0]
    : setCookieHeaders;
  return cookieHeader.split(';')[0];
}

async function runTests() {
  console.log('===========================================================');
  console.log('🧪 Starting ShopKart Lab 01 Test Suite (100 Marks + Bonus)');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // 2. Start HTTP server on random free port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`📡 Test Server running on ${baseUrl}\n`);
        resolve();
      });
    });

    // -------------------------------------------------------------
    // TASK 1: REGISTER CUSTOMER TESTS (15 Marks)
    // -------------------------------------------------------------
    console.log('--- TASK 1: Customer Registration API (POST /customers/register) ---');

    // Test 1.1: Missing field (fullName) -> 400
    const missingNameRes = await request({
      method: 'POST',
      path: '/customers/register',
      body: {
        email: 'john@gmail.com',
        password: 'johnpassword123',
        phone: '9876543210'
      }
    });
    assert(missingNameRes.status === 400, 'Rejects registration when fullName is missing (400)');

    // Test 1.2: Missing field (password) -> 400
    const missingPassRes = await request({
      method: 'POST',
      path: '/customers/register',
      body: {
        fullName: 'John Doe',
        email: 'john@gmail.com',
        phone: '9876543210'
      }
    });
    assert(missingPassRes.status === 400, 'Rejects registration when password is missing (400)');

    // Test 1.3: Password too short (< 6 chars) -> 400
    const shortPassRes = await request({
      method: 'POST',
      path: '/customers/register',
      body: {
        fullName: 'John Doe',
        email: 'john@gmail.com',
        password: '12345',
        phone: '9876543210'
      }
    });
    assert(shortPassRes.status === 400, 'Rejects password shorter than 6 characters (400)');

    // Test 1.4: Valid Registration -> 201 (or 200)
    const validRegRes = await request({
      method: 'POST',
      path: '/customers/register',
      body: {
        fullName: 'John Doe',
        email: 'john@gmail.com',
        password: 'johnpassword123',
        phone: '9876543210'
      }
    });
    assert(
      (validRegRes.status === 201 || validRegRes.status === 200) &&
        validRegRes.data.success === true &&
        validRegRes.data.customer &&
        validRegRes.data.customer.fullName === 'John Doe' &&
        validRegRes.data.customer.email === 'john@gmail.com',
      'Successful registration returns customer details (201/200)'
    );
    assert(
      validRegRes.data.customer && !validRegRes.data.customer.password,
      'Password is NEVER returned in registration response'
    );

    // Test 1.5: Duplicate Email -> 409
    const duplicateEmailRes = await request({
      method: 'POST',
      path: '/customers/register',
      body: {
        fullName: 'John Duplicate',
        email: 'john@gmail.com',
        password: 'anotherpassword',
        phone: '1122334455'
      }
    });
    assert(duplicateEmailRes.status === 409, 'Rejects duplicate email registration (409)');

    // Test 1.6: Verify Password Stored as bcrypt Hash in DB
    const dbCustomer = await Customer.findOne({ email: 'john@gmail.com' });
    assert(
      dbCustomer &&
        dbCustomer.password !== 'johnpassword123' &&
        dbCustomer.password.startsWith('$2'),
      'Password in MongoDB is strictly a valid bcrypt hash'
    );

    // -------------------------------------------------------------
    // TASK 2: LOGIN API & JWT COOKIE (15 + 20 Marks)
    // -------------------------------------------------------------
    console.log('\n--- TASK 2: Customer Login API (POST /customers/login) ---');

    // Test 2.1: Non-existent email -> 401
    const invalidEmailRes = await request({
      method: 'POST',
      path: '/customers/login',
      body: {
        email: 'nonexistent@gmail.com',
        password: 'johnpassword123'
      }
    });
    assert(invalidEmailRes.status === 401, 'Rejects non-existent email (401)');

    // Test 2.2: Wrong password -> 401
    const wrongPassRes = await request({
      method: 'POST',
      path: '/customers/login',
      body: {
        email: 'john@gmail.com',
        password: 'wrongpassword'
      }
    });
    assert(wrongPassRes.status === 401, 'Rejects incorrect password (401)');

    // Test 2.3: Successful Login -> 200 with HttpOnly Cookie
    const validLoginRes = await request({
      method: 'POST',
      path: '/customers/login',
      body: {
        email: 'john@gmail.com',
        password: 'johnpassword123'
      }
    });
    assert(
      validLoginRes.status === 200 && validLoginRes.data.success === true,
      'Valid login credentials returns success: true (200)'
    );

    const setCookie = validLoginRes.headers['set-cookie'];
    const authCookie = extractCookie(setCookie);
    const setCookieStr = Array.isArray(setCookie) ? setCookie[0] : (setCookie || '');
    assert(
      Boolean(authCookie && authCookie.startsWith('token=')),
      'Sets authentication cookie with JWT'
    );
    assert(
      setCookieStr.toLowerCase().includes('httponly'),
      'Authentication cookie includes HttpOnly flag'
    );

    // -------------------------------------------------------------
    // TASK 3: PROTECTED PROFILE ROUTE (20 Marks)
    // -------------------------------------------------------------
    console.log('\n--- TASK 3: Protected Profile Route (GET /customers/me) ---');

    // Test 3.1: Profile access without cookie -> 401
    const noCookieProfileRes = await request({
      method: 'GET',
      path: '/customers/me'
    });
    assert(noCookieProfileRes.status === 401, 'Denies access without authentication cookie (401)');

    // Test 3.2: Profile access with invalid token -> 401
    const badCookieProfileRes = await request({
      method: 'GET',
      path: '/customers/me',
      cookie: 'token=invalid.tampered.token'
    });
    assert(badCookieProfileRes.status === 401, 'Denies access with invalid/tampered token (401)');

    // Test 3.3: Profile access with valid cookie -> 200 with customer data
    const validProfileRes = await request({
      method: 'GET',
      path: '/customers/me',
      cookie: authCookie
    });
    assert(
      validProfileRes.status === 200 &&
        validProfileRes.data.fullName === 'John Doe' &&
        validProfileRes.data.email === 'john@gmail.com' &&
        validProfileRes.data.phone === '9876543210',
      'Returns customer profile with valid authentication cookie (200)'
    );
    assert(
      !validProfileRes.data.password,
      'Password is NEVER returned in profile response'
    );

    // -------------------------------------------------------------
    // BONUS CHALLENGE: CHANGE PASSWORD (+10 Marks)
    // -------------------------------------------------------------
    console.log('\n--- BONUS CHALLENGE: Change Password API (PATCH /customers/change-password) ---');

    // Test Bonus 1: Unauthorized without login -> 401
    const unauthChangeRes = await request({
      method: 'PATCH',
      path: '/customers/change-password',
      body: {
        oldPassword: 'johnpassword123',
        newPassword: 'newpassword456'
      }
    });
    assert(unauthChangeRes.status === 401, 'Denies change password if not logged in (401)');

    // Test Bonus 2: Incorrect old password -> 400
    const wrongOldPassRes = await request({
      method: 'PATCH',
      path: '/customers/change-password',
      body: {
        oldPassword: 'wrongoldpassword',
        newPassword: 'newpassword456'
      },
      cookie: authCookie
    });
    assert(wrongOldPassRes.status === 400, 'Rejects password change with incorrect old password (400)');

    // Test Bonus 3: Short new password -> 400
    const shortNewPassRes = await request({
      method: 'PATCH',
      path: '/customers/change-password',
      body: {
        oldPassword: 'johnpassword123',
        newPassword: '123'
      },
      cookie: authCookie
    });
    assert(shortNewPassRes.status === 400, 'Rejects new password shorter than 6 characters (400)');

    // Test Bonus 4: Successful password change -> 200
    const successChangeRes = await request({
      method: 'PATCH',
      path: '/customers/change-password',
      body: {
        oldPassword: 'johnpassword123',
        newPassword: 'newpassword456'
      },
      cookie: authCookie
    });
    assert(
      successChangeRes.status === 200 && successChangeRes.data.success === true,
      'Changes password successfully with valid inputs (200)'
    );

    // Test Bonus 5: Old password fails to login now -> 401
    const oldLoginAttempt = await request({
      method: 'POST',
      path: '/customers/login',
      body: {
        email: 'john@gmail.com',
        password: 'johnpassword123'
      }
    });
    assert(oldLoginAttempt.status === 401, 'Old password can no longer log in (401)');

    // Test Bonus 6: New password successfully logs in -> 200
    const newLoginAttempt = await request({
      method: 'POST',
      path: '/customers/login',
      body: {
        email: 'john@gmail.com',
        password: 'newpassword456'
      }
    });
    assert(newLoginAttempt.status === 200, 'New password successfully logs in (200)');
    const updatedCookie = extractCookie(newLoginAttempt.headers['set-cookie']);

    // -------------------------------------------------------------
    // TASK 4: LOGOUT API
    // -------------------------------------------------------------
    console.log('\n--- TASK 4: Logout API (POST /customers/logout) ---');

    // Test 4.1: Logout successfully -> 200 & clears cookie
    const logoutRes = await request({
      method: 'POST',
      path: '/customers/logout',
      cookie: updatedCookie
    });
    assert(
      logoutRes.status === 200 && logoutRes.data.success === true,
      'Logged out successfully (200)'
    );

    const logoutSetCookie = logoutRes.headers['set-cookie'];
    const logoutSetCookieStr = Array.isArray(logoutSetCookie) ? logoutSetCookie[0] : (logoutSetCookie || '');
    assert(
      logoutSetCookieStr.includes('token=;') ||
        logoutSetCookieStr.toLowerCase().includes('expires=thu, 01 jan 1970') ||
        logoutSetCookieStr.toLowerCase().includes('max-age=0'),
      'Logout clears authentication cookie'
    );

    console.log('\n===========================================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`🏆 Final Score: ${failed === 0 ? '110 / 100 Marks (100% + 10 Bonus Marks)' : 'Incomplete'}`);
    console.log('===========================================================\n');
  } catch (error) {
    console.error('Test Suite Fatal Error:', error);
  } finally {
    if (server) {
      server.close();
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
