const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');

async function getUserData(access_Token) {
    const response = await fetch(`
        https://www.googleapis.com/oauth2/v3/userinfo?access_token${access_Token}
    `);

    const data = await response.json();

    console.log('data', data)
}

router.get('/', async (req, res, next) => {
    const code = req.query.code;

    try {
        const redirectUrl = 'http://127.0.0.1:5500/oauth';
        const oAuth2Client = new OAuth2Client(
            process.env.CLIEND_ID,
            process.env.CLIENT_SECRET,
            redirectUrl
        );
        const res = await oAuth2Client.getToken(code);
        await oAuth2Client.setCredentials(res.tokens);
        console.log('Tokens acquired');
        const user = oAuth2Client.credentials;
        console.log('credentials', user);
        await getUserData(user.access_token);
    } catch (error) {
        console.log(error.message)
    }
})

module.exports = router;