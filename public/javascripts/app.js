window.loopcount = 0;

function play(video) {
  if(!playout.src.endsWith(video.src)) {
    console.log('Current video has', window.loopcount, 'loops, resetting...');
    window.loopcount = 0;
    console.log('Playing', video);
    playout.setAttribute('src', video.src);
    window.castReceiverManager.setApplicationState('Playing gifs!');
  }
}


function setController(message) {
  console.log("Connecting to ", message.controller);
  if(window.io === undefined) {
    var socketiojs = document.createElement('script');
    socketiojs.addEventListener('load', function() {setController(message);});
    socketiojs.setAttribute('type', 'text/javascript');
    socketiojs.setAttribute('src', 'http://' + message.controller + '/socket.io/socket.io.js');
    document.body.appendChild(socketiojs);
  } else if(window.socket === undefined || window.socket.uri !== 'http://' + message.controller) {
    socket = io.connect('http://' + message.controller);
    socket.on('play', play);
  }
}

var actions = {
  setcontroller: setController,
  reload: function() {window.location.reload(true);}
};

window.onload = function() {
  cast.receiver.logger.setLevelValue(0);
  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
  console.log('Starting Receiver Manager');

  // handler for the 'ready' event
  castReceiverManager.onReady = function(event) {
    console.log('Received Ready event: ' + JSON.stringify(event.data));
    window.castReceiverManager.setApplicationState('Waiting for a gif to play...');
  };

  // handler for 'senderconnected' event
  castReceiverManager.onSenderConnected = function(event) {
    console.log('Received Sender Connected event: ' + event.data);
    console.log(window.castReceiverManager.getSender(event.data).userAgent);
  };

  // handler for 'senderdisconnected' event
  castReceiverManager.onSenderDisconnected = function(event) {
    console.log('Received Sender Disconnected event: ' + event.data);
  };

  // create a CastMessageBus to handle messages for a custom namespace
  window.messageBus = window.castReceiverManager.getCastMessageBus('urn:x-cast:club.octothorpe.gifplaya');

  // handler for the CastMessageBus message event
  window.messageBus.onMessage = function(event) {
    var message = JSON.parse(event.data);
    console.log('Message [' + event.senderId + ']: ', message);

    if(actions[message.type] !== undefined) {
      actions[message.type](message);
    }

    window.messageBus.send(event.senderId, event.data);
  };

  // initialize the CastReceiverManager with an application status message
  window.castReceiverManager.start({statusText: 'Application is starting'});
  console.log('Receiver Manager started');
};

var playout = document.querySelector("video");

playout.loop = true;
playout.autoplay = true;
playout.addEventListener('playing', function() {
  window.loopcount += 1;
  window.castReceiverManager.setApplicationState('Looped ' + window.loopcount + ' times');
});

setController({controller: location.host});
