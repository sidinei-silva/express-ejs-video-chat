const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server,{
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {console.log(`Listening in port: ${PORT}`)})