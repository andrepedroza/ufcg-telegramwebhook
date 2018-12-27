'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
const telegram = require('telegram-bot-api');
const webdav = require('webdav-server').v2;
const fs = require('fs');
const path = require('path');

// Telegram Bot Token
const token = fs.existsSync('/run/secrets/telegram-token')
    ? fs.readFileSync('/run/secrets/telegram-token', 'utf8')
    : process.env.TELEGRAM_TOKEN || '';

// Telegram API
const api = new telegram({ token });

// Webdav User Password
const webdavPassword = fs.existsSync('/run/secrets/webdav-password')
    ? fs.readFileSync('/run/secrets/webdav-password', 'utf8')
    : process.env.WEBDAV_PASSWORD || 'password';

// User Manager (tells who are the users)
const userManager = new webdav.SimpleUserManager();
const user = userManager.addUser(process.env.WEBDAV_USERNAME || 'username', webdavPassword, false);
console.log(JSON.stringify(user))

// Privilege Manager (tells which users can access which files/folders)
const privilegeManager = new webdav.SimplePathPrivilegeManager();
privilegeManager.setRights(user, '/', [ 'all' ]);

// WebDAV Server
const webDAVServer = new webdav.WebDAVServer({
    // HTTP Digest authentication with the realm 'Default realm'
    httpAuthentication: new webdav.HTTPDigestAuthentication(userManager, 'Default realm'),
    privilegeManager
});

// Set Root Folder
webDAVServer.setFileSystemSync('/', new webdav.PhysicalFileSystem(path.join(__dirname, 'webdav')))

// Create Grafana Endpoint
app.post('/grafana', (req, res) => {
    console.log(req.body, fs.readdirSync(path.join(__dirname, 'webdav')))
    // Get Information from Request Body
    const { ruleName, state, imageURL, message } = req.body;
    const imgPath = imageURL && path.join(__dirname, 'webdav', imageURL.split('/webdav/')[1])
    // Send Message with Image to Telegram
    api.sendPhoto({
        chat_id: process.env.CHAT_ID || -1,
        caption: `${ruleName}\nEstado: ${state === 'ok' ? '✅  OK!' : '⚠ Alerta!' }${message ? '\nMensagem: ' + message : ''}`,
        photo: imgPath || 'https://pbs.twimg.com/profile_images/695136728441569280/h2OkRTmA_400x400.png'
    })
    // If Everything is OK Send Message
    .then(() => res.send('Done!'))
    // If Some Error Occurred Send Message
    .catch(() => res.send('Error!'))
    // If Image Exists Remove It
    .finally(() => imgPath && fs.existsSync(imgPath) && fs.unlinkSync(imgPath) && console.log('File Removed'));
});

// Bind Webdav with Express
app.use(webdav.extensions.express('/', webDAVServer));

// Start Express Server
app.listen(3000, () => console.log('[Server]: Webhook is listening'));
