'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
const telegram = require('telegram-bot-api');
const fs = require('fs');

// Telegram Bot Token
const token = fs.existsSync('/run/secrets/telegram-token')
    ? fs.readFileSync('/run/secrets/telegram-token', 'utf8')
    : process.env.TELEGRAM_TOKEN || '';

// Telegram API
const api = new telegram({ token });

// Create Grafana Endpoint
app.post('/grafana', (req, res) => {
    // Get Information from Request Body
    const { ruleName, state, imageUrl, message } = req.body;
    // Send Message with Image to Telegram
    api.sendPhoto({
        chat_id: process.env.CHAT_ID || -1,
        caption: `${ruleName}\nEstado: ${state === 'ok' ? '✅  OK!' : '⚠ Alerta!' }${message ? '\nMensagem: ' + message : ''}`,
        photo: imageUrl || 'https://pbs.twimg.com/profile_images/695136728441569280/h2OkRTmA_400x400.png'
    })
    // If Everything is OK Send Message
    .then(() => res.send('Done!'))
    // If Some Error Occurred Send Message
    .catch(() => res.send('Error!'))
});

// Start Express Server
app.listen(3000, () => console.log('[Server]: Webhook is listening'));
