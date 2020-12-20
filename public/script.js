const socket = io("/");

const videoGridElement = document.getElementById("video-grid");
const myVideoElement = document.createElement("video");
myVideoElement.id = "host-video";
myVideoElement.muted = true;

const peers = {};

// Cria conexão com servidor peer
const myPeer = new Peer(undefined, {
  secure: true,
  host: "sidinei-peerjs-server.herokuapp.com",
  port: 443,
  config: {
    iceServers: [
      { url: "stun:stun.l.google.com:19302" },
    ],
  },
});

/**
 * @description: Ouve entrada e usuário e inscreve ele na sala
 */
myPeer.on("open", (id) => {
  // Emite socket informando inserindo usuário na sala
  socket.emit("join-room", ROOM_ID, id);
});

/**
 * @description: Ouve saida de usuário,
 * fecha a conexão removendo video da grade
 */
socket.on("user-disconnected", (userId) => {
  // Verifica se usar id foi passado
  if (peers[userId]) {
    //Fecha a conexão do usuário com peer
    peers[userId].close();

    // Remove video do usuário desconectado
    document.getElementById(userId).remove();
  }
});

/**
 * @description: Captura media de video do host
 */
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // Renderiza video do host
    addVideoStream(myVideoElement, stream);

    /**
     * @param {*} call: call do host
     * @description: Ouve chamada que visitante faz
     * @callback: Envia video do host para para visitante
     * @event myPeer: Peer de quem recebe a chamada
     */
    myPeer.on("call", (call) => {
      // Responde chamada do vistante passando stream do host
      call.answer(stream);

      // Cria elemento de video do host
      const hostVideo = document.createElement("video");

      // Insere id do host como propriedade id do video
      hostVideo.id = call.peer;

      //Insere host na lista de peers
      peers[call.peer] = call;

      // Ouve se video de host chegou no visitante
      // e renderiza video dele
      call.on("stream", (userVideoStream) => {
        addVideoStream(hostVideo, userVideoStream);
      });
    });

    /**
     * @description: Ouvindo evento de visitante conectado
     */
    socket.on("user-connected", async (userId) => {
      // Inserindo video do visitante no host
      connectToNewUser(userId, stream);
    });
  });

/**
 *
 * @param {*} videoElement : Elemento a ter video incluído
 * @param {*} stream : Conteúdo do video a ser incluído
 *
 * @description: Adiciona video em grade de videos
 */
function addVideoStream(videoElement, stream) {
  // Insere conteúdo dentro do elemento de video
  videoElement.srcObject = stream;
  console.log('Incluindo stream no elemento', {
    streamVisitanteL: stream,
    objetoDeVideo: videoElement.srcObject,
    elemento: videoElement
  })

  // Ouve evento de conteúdo carregado e dar play
  videoElement.addEventListener("loadedmetadata", () => {
    videoElement.play();
    console.log('Elemento feito play')
  });

  // Insere elemento dentro da grid
  videoGridElement.append(videoElement);
  console.log('Incluindo elemento em grid', {
    grid: videoGridElement
  })
}

/**
 *
 * @param {*} userId : Id do visitante
 * @param {*} stream  : Stream do host
 *
 * @description: Função que conecta novo visitante o qual
 * acessou o link. Inclui visitante no host
 *
 */
function connectToNewUser(userId, stream) {
  // Chama visitante
  const call = myPeer.call(userId, stream);
  console.log('Visitante chamado', {
    idVisitante: userId,
    meuStrema: stream,
    callRetornado: call
  })
  // Cria video source do visitante
  const newUserVideoElement = document.createElement("video");
  console.log('Criando elemento de visitante', newUserVideoElement)
  // Insere id do visitante como propriedade id do video
  newUserVideoElement.id = userId;

  // Ouve resposta do visitante e renderiza video dele
  call.on("stream", (userVideoStream) => {
    console.log('Visitante respondido', {
      streamVisitante: userVideoStream,
      elementoRender: newUserVideoElement,
    })
    addVideoStream(newUserVideoElement, userVideoStream);
  });

  peers[userId] = call;
}
