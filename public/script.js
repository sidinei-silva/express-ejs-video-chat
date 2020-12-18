const socket = io('/')

const videoGridElement = document.getElementById('video-grid')
const myVideoElement = document.createElement('video')
myVideoElement.muted= true

const myPeer = new Peer(undefined, {
  secure: true, 
  host: 'sidinei-peerjs-server.herokuapp.com', 
  port: 443,
})

configureVideo();

myPeer.on('open', id => { 
  socket.emit('join-room', ROOM_ID, id)
})


socket.on('user-connected', userId => {
  console.log('User connected:' + userId)
})

function configureVideo() {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    addVideoStream(myVideoElement, stream)
  })
}

function addVideoStream(videoElement, stream) {
  videoElement.srcObject = stream
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play()
  })
  videoGridElement.append(videoElement)
}