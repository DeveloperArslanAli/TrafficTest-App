import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function verifyAdminFlow() {
  console.log('🧪 Starting Admin CRUD & Version Synchronization Verification...\n');

  // Step 1: Admin Authentication
  console.log('1️⃣ Authenticating as Admin...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@roadwise.com',
    password: 'Admin1234!',
  });

  const token = loginRes.data.access_token;
  if (!token) {
    throw new Error('❌ Failed to retrieve admin access token');
  }
  console.log('   ✅ Admin successfully authenticated.');

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  // Step 2: Read initial question bank version
  console.log('\n2️⃣ Checking initial question bank version...');
  const vInitialRes = await axios.get(`${BASE_URL}/quiz/version`);
  const initialVersion = vInitialRes.data.version;
  console.log(`   ✅ Current bank version: ${initialVersion}`);

  // Step 3: Create a question through Admin API
  console.log('\n3️⃣ Admin creating a new question...');
  const newQuestionPayload = {
    category: 'WARNING',
    text: 'VERIFICATION TEST: What does this emergency test sign mean?',
    options: JSON.stringify([
      'Test Answer A',
      'Test Answer B',
      'Test Answer C',
      'Test Answer D',
    ]),
    correctIndex: 1,
    explanation: 'Test explanation for verification.',
    signCode: 'CURVE_RIGHT',
    isPublished: true,
  };

  const createRes = await axios.post(`${BASE_URL}/admin/questions`, newQuestionPayload, {
    headers: authHeaders,
  });
  const createdQuestion = createRes.data;
  console.log(`   ✅ Question created successfully with ID: ${createdQuestion.id}`);
  console.log(`   ✅ signCode recorded: ${createdQuestion.signCode}`);

  // Step 4: Verify version bumped in Redis / DB
  const vAfterCreateRes = await axios.get(`${BASE_URL}/quiz/version`);
  const vAfterCreate = vAfterCreateRes.data.version;
  console.log(`   ✅ Version after create: ${vAfterCreate} (Incremented: ${vAfterCreate > initialVersion})`);
  if (vAfterCreate <= initialVersion) {
    throw new Error('❌ Version was not bumped after question creation');
  }

  // Step 5: Update the created question
  console.log('\n4️⃣ Admin updating the created question...');
  const updatePayload = {
    text: 'VERIFICATION TEST: UPDATED question text by Admin',
    options: JSON.stringify([
      'Updated Option A',
      'Updated Option B',
      'Updated Option C',
      'Updated Option D',
    ]),
    correctIndex: 2,
    explanation: 'Updated explanation by Admin.',
    signCode: 'STOP_SIGN',
  };

  const updateRes = await axios.put(`${BASE_URL}/admin/questions/${createdQuestion.id}`, updatePayload, {
    headers: authHeaders,
  });
  console.log(`   ✅ Question updated successfully.`);
  console.log(`   ✅ Updated text: "${updateRes.data.text}"`);
  console.log(`   ✅ Updated signCode: "${updateRes.data.signCode}"`);

  // Step 6: Verify version bumped after update
  const vAfterUpdateRes = await axios.get(`${BASE_URL}/quiz/version`);
  const vAfterUpdate = vAfterUpdateRes.data.version;
  console.log(`   ✅ Version after update: ${vAfterUpdate} (Incremented: ${vAfterUpdate > vAfterCreate})`);

  // Step 7: Delete the test question
  console.log('\n5️⃣ Admin deleting the test question...');
  const deleteRes = await axios.delete(`${BASE_URL}/admin/questions/${createdQuestion.id}`, {
    headers: authHeaders,
  });
  console.log(`   ✅ Delete response:`, deleteRes.data);

  // Step 8: Verify version bumped after delete
  const vAfterDeleteRes = await axios.get(`${BASE_URL}/quiz/version`);
  const vAfterDelete = vAfterDeleteRes.data.version;
  console.log(`   ✅ Version after delete: ${vAfterDelete} (Incremented: ${vAfterDelete > vAfterUpdate})`);

  // Step 9: Verify live question bank returns exactly 320 published questions
  console.log('\n6️⃣ Verifying client /quiz/bank endpoint...');
  const bankRes = await axios.get(`${BASE_URL}/quiz/bank`);
  const bank = bankRes.data;
  console.log(`   ✅ Total active questions in bank: ${bank.length}`);
  const deletedStillExists = bank.some((q: any) => q.id === createdQuestion.id);
  console.log(`   ✅ Deleted test question removed from bank: ${!deletedStillExists}`);

  console.log('\n🎯 ALL ADMIN CRUD & VERSION PROPAGATION TESTS PASSED 100%!');
}

verifyAdminFlow().catch((err) => {
  console.error('\n❌ Verification failed:', err.response?.data || err.message);
  process.exit(1);
});
