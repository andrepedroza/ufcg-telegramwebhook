'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
const telegram = require('telegram-bot-api');
const fs = require('fs');
const token = fs.existsSync('/run/secrets/token')
    ? fs.readFileSync('/run/secrets/token', 'utf8')
    : process.env.TOKEN

const api = new telegram({ token });

app.post('/grafana', (req, res) => {
    const { title, state, imageURL, message } = req.body

    api.sendPhoto({
        chat_id: process.env.CHATID,
        caption: `${title}\nEstado: ${state === 'ok' ? '✅  OK!' : '⚠ Alerta!' }${message ? '\nMensagem: ' + message : ''}`,
        photo: imageURL || 'https://pbs.twimg.com/profile_images/695136728441569280/h2OkRTmA_400x400.png'
    })
    .then(() => res.send('Done!'))
    .catch(() => res.send('Error!'));
});

app.listen(3000, () => console.log('[Server]: Webhook is listening'));
