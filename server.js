
'use strict';

const express = require('express');
const { Server } = require('ws');
const PORT = process.env.PORT || 3000;
const INDEX = '/client.html';


const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

wss.getUniqueID = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4() + '-' + s4();
};

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.id = wss.getUniqueID();
  let userId = {
    type: "user_id",
    message: ws.id
  }
  ws.send(JSON.stringify(userId));

  var list = [];
  wss.clients.forEach((item) => list.push(item.id));
  let userList = {
    type: "user_list",
    message: list
  }
  wss.clients.forEach((item) => item.send(JSON.stringify(userList)));

  ws.on('message', (data) => {
    console.log('On Message Data : ' + data);
    let chat = {
      type: "chat",
      message: data
    }
    wss.clients.forEach((item) => item.send(JSON.stringify(chat)));
  });

  ws.on('close', () => console.log('Client disconnected'));
});
