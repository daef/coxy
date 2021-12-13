
function get_ws_uri() {
  var loc = window.location, uri
  if (loc.protocol === "https:") {
    uri = "wss:"
  } else {
    uri = "ws:"
  }
  uri += "//" + loc.host
  uri += loc.pathname + "ws"
  return uri
}

function main() {
  const socket = new WebSocket(get_ws_uri())
  socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({'type': 'subscribe', 'filter': 'stdout|stderr|exit|hello'}))
  })
  socket.addEventListener('message', function (event) {
    msg = JSON.parse(event.data)
    console.log(msg)
  })
  document.getElementById('reset').addEventListener('click', function(event) {
    socket.send(JSON.stringify({'type': 'reset'}))
  })
  document.getElementById('send_hello').addEventListener('click', function(event) {
    socket.send(JSON.stringify({'type': 'stdin', 'data': 'hello'}))
  })
}

main()

