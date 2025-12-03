const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
// Disable Express version disclosure for security
app.disable('x-powered-by');
app.use(cors({
  origin: ['http://localhost:3004', 'http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// Load environment variables based on environment - look in project root
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env.local') });

const USERNAME = process.env.NIFI_USERNAME;
const PASSWORD = process.env.NIFI_PASSWORD;
const BASE_URL = 'https://localhost:8443';

app.get('/api/authenticate', async (req, res) => {
  try {
    if (!USERNAME || !PASSWORD) {
      console.error('Auth error: Missing username or password in environment variables');
      return res.status(500).json({ error: 'Server configuration error - missing credentials' });
    }

    const params = new URLSearchParams();
    params.append('username', USERNAME);
    params.append('password', PASSWORD);

    console.log(`Authenticating with NiFi at ${BASE_URL}/nifi-api/access/token`);
    
    const response = await axios.post(`${BASE_URL}/nifi-api/access/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });

    res.cookie('authToken', response.data, {
      httpOnly: true,
      secure: false, // set to true if using HTTPS in production
      sameSite: 'Lax',
    });

    res.json({ message: 'Authentication successful' });
  } catch (error) {
    console.error('Auth error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
});


app.use('/nifi-api', async (req, res) => {
  try {
    const token = req.cookies.authToken;
    if (!token) {
      console.error('No auth token found in cookies');
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const nifiUrl = `${BASE_URL}${req.originalUrl}`;
    console.log(`Proxying request to NiFi: ${req.method} ${nifiUrl}`);
    
    const axiosConfig = {
      method: req.method,
      url: nifiUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': req.get('Content-Type') ?? 'application/json',
      },
      data: req.body,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    };

    const response = await axios(axiosConfig);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to proxy request to NiFi', details: error.message });
  }
});

// Make sure to use the same port that's defined in your REACT_APP_PROXY_URL
const PORT = process.env.PORT ?? 4001;
app.listen(PORT, () => console.log(`Node proxy server running on port ${PORT}. Make sure this matches your REACT_APP_PROXY_URL value`));