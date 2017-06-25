window.onload = function() {
  cast.receiver.logger.setLevelValue(0);
  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
  console.log('Starting Receiver Manager');

  // handler for the 'ready' event
  castReceiverManager.onReady = function(event) {
    console.log('Received Ready event: ' + JSON.stringify(event.data));
    window.castReceiverManager.setApplicationState('Waiting for a controller...');
  };

  // handler for 'senderconnected' event
  castReceiverManager.onSenderConnected = function(event) {
    console.log('Received Sender Connected event: ' + event.data);
    console.log("Sender", window.castReceiverManager.getSender(event.data));
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

    if(message.type == "setcontroller") {
      window.location.href = "http://" + message.controller + "/app";
    }

    window.messageBus.send(event.senderId, event.data);
  };

  // initialize the CastReceiverManager with an application status message
  window.castReceiverManager.start({statusText: 'Waiting for controller...'});
  console.log('Receiver Manager started');
};
