const { OAuth2Client } = require('google-auth-library');

const verifyGoogleToken = async (idToken) => {
  if (!idToken) {
    throw new Error('Google ID token is required.');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.warn('⚠️ GOOGLE_CLIENT_ID not set in environment. Google token verification may fail if client ID matching is enforced.');
  }

  const client = new OAuth2Client(clientId);
  
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error('Invalid Google token payload.');
  }

  return {
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture,
    sub: payload.sub
  };
};

module.exports = { verifyGoogleToken };
