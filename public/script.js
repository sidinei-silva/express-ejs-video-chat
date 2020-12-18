const socket = io('/')

const videoGridElement = document.getElementById('video-grid')
const myVideoElement = document.createElement('video')
myVideoElement.muted= true

const peers = {}

const myPeer = new Peer(undefined, {
  secure: true, 
  host: 'sidinei-peerjs-server.herokuapp.com', 
  port: 443,
})

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideoElement, stream)

  //Enviando meu video para visitante
  //myPeer = peer de quem vai receber o video
  myPeer.on('call', call => {
    call.answer(stream)
    const hostVideo = document.createElement('video')
    peers[call.peer] = call
    hostVideo.id = call.peer
    call.on('stream', userVideoStream => {
      addVideoStream(hostVideo, userVideoStream)
    })
  })

  //Conectando com visitante
  socket.on('user-connected', async userId => {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', async userId => {
  if(peers[userId]){
    peers[userId].close()
    document.getElementById(userId).remove()
  } 
})

myPeer.on('open', id => { 
  socket.emit('join-room', ROOM_ID, id)
})

function addVideoStream(videoElement, stream) {
  videoElement.srcObject = stream
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play()
  })
  videoGridElement.append(videoElement)
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  //Incluindo video do visitante no host
  // userId = id visitante
  const newUserVideoElement = document.createElement('video')
  newUserVideoElement.id = userId
  call.on('stream', userVideoStream => {
    addVideoStream(newUserVideoElement, userVideoStream)
  })
  peers[userId] = call
}