const axios = require('axios');
const qs = require('qs');

// TDX 身份驗證 URL
const tokenUrl = 'https://tdx.transportdata.tw/auth/realms/TDX/protocol/openid-connect/token';

// 你的 API Client Credentials
const clientId = 'jack306-03f62b49-6317-490c';
const clientSecret = '91529fc7-3196-4199-8ef5-d6419df76c47';

// 1. 先請求 access token
async function getAccessToken() {
  const data = qs.stringify({
    'grant_type': 'client_credentials',
    'client_id': clientId,
    'client_secret': clientSecret,
  });

  try {
    const response = await axios.post(tokenUrl, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // 獲取 access token
    const accessToken = response.data.access_token;
    console.log('Access Token:', accessToken);

    return accessToken;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
}

// 2. 使用獲得的 access token 調用 TDX API
async function callTDXApi() {
  const accessToken = await getAccessToken();

  // TDX API 基本 URL
  const baseUrl = 'https://tdx.transportdata.tw/api/basic/v2/Bus/Route';

  try {
    const response = await axios.get(baseUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    console.log('API Response:', response.data);
  } catch (error) {
    console.error('Error calling TDX API:', error);
  }
}

// 呼叫 TDX API
callTDXApi();
