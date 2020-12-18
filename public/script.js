const socket = io('/')
const myPeer = new Peer(undefined, {
  secure: true, 
  host: 'sidinei-peerjs-server.herokuapp.com', 
  port: 443,
})

myPeer.on('open', id => { 
  console.log(id)
})

socket.emit('join-room', ROOM_ID, 10)

socket.on('user-connected', userId => {
  console.log('User connected:' + userId)
})