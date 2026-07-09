const axios = require('axios');

async function testResearch() {
  try {
    const email = `test_${Date.now()}@test.com`;
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test Analyst',
      email: email,
      password: 'password123'
    });
    
    const token = regRes.data.data.accessToken;
    console.log('Token acquired. Invoking POST /api/research for AAPL...');
    
    const researchRes = await axios.post('http://localhost:5000/api/research', 
      { company: 'AAPL' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('SUCCESS:', JSON.stringify(researchRes.data).substring(0, 200));
  } catch (err) {
    if (err.response) {
      console.error('SERVER REJECTED:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('CRITICAL ERROR:', err.message);
    }
  }
}

testResearch();
