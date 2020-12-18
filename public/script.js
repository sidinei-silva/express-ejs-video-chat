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


function configureVideo() {
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  }).then(stream => {
    addVideoStream(myVideoElement, stream)

    myPeer.on('call', call => {
      call.answer(stream)
      const hostVideo = document.createElement('video')
      call.on('stream', userVideoStream => {
        addVideoStream(hostVideo, userVideoStream)
      })
    })

    socket.on('user-connected', userId => {
      connectToNewUser(userId, stream)
    })
  })
}

function addVideoStream(videoElement, stream) {
  videoElement.srcObject = stream
  videoElement.addEventListener('loadedmetadata', () => {
    videoElement.play()
  })
  videoGridElement.append(videoElement)
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const videoElement = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(videoElement, userVideoStream)
  })
  call.on('close', () => {
    videoElement.remove()
  })
}