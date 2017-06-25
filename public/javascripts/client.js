var APPLICATION_ID = "060B56C5";
var NAMESPACE = 'urn:x-cast:club.octothorpe.gifplaya';
var session = null;

/**
 * Call initialization for Cast
 */
if (!chrome.cast || !chrome.cast.isAvailable) {
  setTimeout(initializeCastApi, 1000);
}
/**
 * initialization
 */
function initializeCastApi() {
  var sessionRequest = new chrome.cast.SessionRequest(APPLICATION_ID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);
  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}

/**
 * initialization success callback
 */
function onInitSuccess() {
  appendMessage('onInitSuccess');
}
/**
 * initialization error callback
 */
function onError(message) {
  appendMessage('onError: ' + JSON.stringify(message));
}
/**
 * generic success callback
 */
function onSuccess(message) {
  appendMessage('onSuccess: ' + message);
}
/**
 * callback on success for stopping app
 */
function onStopAppSuccess() {
  appendMessage('onStopAppSuccess');
}
/**
 * session listener during initialization
 */
function sessionListener(e) {
  appendMessage('New session ID:' + e.sessionId);
  session = e;
  session.addUpdateListener(sessionUpdateListener);
  session.addMessageListener(NAMESPACE, receiverMessage);
}
/**
 * listener for session updates
 */
function sessionUpdateListener(isAlive) {
  var message = isAlive ? 'Session Updated' : 'Session Removed';
  document.querySelector('.receivername').innerHTML = isAlive ? session.receiver.friendlyName : 'Disconnected';
  if (!isAlive) {
    session = null;
  }
}
/**
 * utility function to log messages from the receiver
 * @param {string} namespace The namespace of the message
 * @param {string} message A message string
 */
function receiverMessage(namespace, message) {
  appendMessage('receiverMessage: ' + namespace + ', ' + message);
}
/**
 * receiver listener during initialization
 */
function receiverListener(e) {
  if(e === 'available') {
    appendMessage('receiver found');
  }
  else {
    appendMessage('receiver list empty');
  }
}

/**
 * stop app/session
 */
function stopApp() {
  session.stop(onStopAppSuccess, onError);
}

/**
 * send a message to the receiver using the custom namespace
 * receiver CastMessageBus message handler will be invoked
 * @param {string} message A message string
 */
function sendMessage(m) {
  var message = JSON.stringify(m);
  if (session !== null) {
    session.sendMessage(NAMESPACE, message, onSuccess.bind(this, 'Message sent: ' + message), onError);
  } else {
    chrome.cast.requestSession(function(e) {
        session = e;
        session.sendMessage(NAMESPACE, message, onSuccess.bind(this, 'Message sent: ' + message), onError);
      }, onError);
  }
}

/**
 * append message to debug message window
 * @param {string} message A message string
 */
function appendMessage(message) {
  console.log(message);
  var dw = document.getElementById('debugmessage');
  dw.innerHTML += '\n' + JSON.stringify(message);
}

document.querySelector("#pushme").addEventListener('click', function() {
  sendMessage({
    type: 'setcontroller',
    controller: window.location.host
  });
});

document.querySelector("#reload").addEventListener('click', function() {
  sendMessage({type: 'reload'});
});

var socket = io.connect('http://' + window.location.host);
socket.on('play', function(url) {
  console.log(url);
});
