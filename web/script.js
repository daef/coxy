document.addEventListener('DOMContentLoaded', main, false);
var content = new Object;
var main_id = -1;
var second_id = -1;
const startmessate = `<div id="start_message" style="display: grid; place-items: center;"><p style="margin-top: 100px; text-align: center;">Please select two connected clients to compare their output<br>(You have to send some data to get clients to select)</p></div>`;

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
    console.log(msg);
    processMessage(msg);
  })

  $('#reset_desktop').bind('click', function(event) {
    socket.send(JSON.stringify({'type': 'reset'}))
  })
  $('#reset_mobile').bind('click', function(event) {
    socket.send(JSON.stringify({'type': 'reset'}))
  })
  $('#kill_desktop').bind('click', function(event) {
    socket.send(JSON.stringify({'type': 'kill'}))
  })
  $('#kill_mobile').bind('click', function(event) {
    socket.send(JSON.stringify({'type': 'kill'}))
  })
  $('#eof_desktop').bind('click', function(event) {
    socket.send(JSON.stringify({'type': 'eof'}))
  })
  $('#eof_mobile').bind('click', function(event) {
    socket.send(JSON.stringify({'type': 'eof'}))
  })
  $('#clear_log_desktop').bind('click', function(event) {
    clearOutput();
  })
  $('#clear_log_mobile').bind('click', function(event) {
    clearOutput();
  })

  $('#user_input_field').bind("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      window.scrollTo(0,document.body.scrollHeight);
      socket.send(JSON.stringify({'type': 'stdin', 'data': `${$('#user_input_field').val()}\n`}));
      $('#user_input_field').val('');
    }
  })

  // Keycombos
  document.addEventListener('keydown', function(event) {
    if (event.shiftKey && event.altKey && event.keyCode == 82) {
      socket.send(JSON.stringify({'type': 'reset'}));
      $("#reset_desktop").css("background-color", "white");
      setTimeout(function(){
        $("#reset_desktop").css("background-color", "#1e4018")
      }, 400);
    }
    if (event.shiftKey && event.altKey && event.keyCode == 81) {
      socket.send(JSON.stringify({'type': 'kill'}));
      $("#kill_desktop").css("background-color", "white");
      setTimeout(function(){
        $("#kill_desktop").css("background-color", "#1e4018")
      }, 400);
    }
    if (event.shiftKey && event.altKey && event.keyCode == 68) {
      socket.send(JSON.stringify({'type': 'eof'}));
      $("#eof_desktop").css("background-color", "white");
      setTimeout(function(){
        $("#eof_desktop").css("background-color", "#1e4018")
      }, 400);
    }
    if (event.shiftKey && event.altKey && event.keyCode == 67) {
      $("#clear_log_desktop").css("background-color", "white");
      setTimeout(function(){
        $("#clear_log_desktop").css("background-color", "#1e4018")
      }, 400);
      clearOutput();
    }
  });

  $('#content').html(startmessate);
}

function select_comparison_second(id)
{
  //console.log("Set comparison second id: " + id);
  second_id = id;
  $('#second_id_label').html(Object.keys(content)[second_id]);
  checkCompareable();
}

function select_comparison_main(id)
{
  //console.log("Set comparison main id: " + id);
  main_id = id;
  $('#main_id_label').html(Object.keys(content)[main_id]);
  checkCompareable();
}

function checkCompareable()
{
  if (main_id >= 0 && second_id >= 0 && main_id != second_id) {
    //console.log(`=> Comparing ${Object.keys(content)[second_id]} to ${Object.keys(content)[main_id]}`);
    updateContent();
  }
}

function clearOutput()
{
  //console.log("Clearing output view");
  $('#content').html(startmessate);
  content = new Object;
}

function processMessage(msg)
{
  if (!(msg.from in content))
  {
    content[msg.from] = {};
    content[msg.from]["data"] = "";
    content[msg.from]["open_exit"] = false;
  }

  if (msg.type == "exit")
  {
    if (content[msg.from]["open_exit"]) {
      content[msg.from]["data"] += `<span style="font-style: italic;">${msg.code}</span>`;
    }
    else {
      content[msg.from]["data"] += `<span style="font-style: italic;">(Exit code) ${msg.code}</span>`;
      content[msg.from]["open_exit"] = true;
    }
  }
  else if (msg.type == "stderr") {
    if (content[msg.from]["open_exit"]) {
      content[msg.from]["open_exit"] = false;
      content[msg.from]["data"] += "<hr>";
    }
    content[msg.from]["data"] += `<span style="color: #f40f0f;">${msg.data}</span>`;
  }
  else {
    if (content[msg.from]["open_exit"]) {
      content[msg.from]["open_exit"] = false;
      content[msg.from]["data"] += "<hr>";
    }
    content[msg.from]["data"] += msg.data;
  }

  updateClients();
  checkCompareable();
}

function updateClients()
{
  $('#compare_drop_down_selects').html("");
  $('#main_drop_down_selects').html("");
  var client_id = 0;
  for (const [key, value] of Object.entries(content)) {
    //console.log(value);
    $('#compare_drop_down_selects').append(
      `
      <li><a class="dropdown-item green_text" onclick="select_comparison_second(${client_id});">${key}</a></li>
      `
    );
    $('#main_drop_down_selects').append(
      `
      <li><a class="dropdown-item green_text" onclick="select_comparison_main(${client_id});">${key}</a></li>
      `
    );
    client_id++;
  }
}

function updateContent()
{
  $('#content').html("");
  var conn_i = 0;
  // Set diff cols
  $('#content').append(
    `
    <div class="col-12 col-lg-6 client_col">
      <div>
        <h5 style="margin-top: 90px;">Difference to main</h5>
        <hr>
        <div id="diff_content" style="white-space: pre-line;"></div>
      </div>
    </div>
    `
  );
  // Set main cols
  $('#content').append(
    `
    <div class="col-12 col-lg-3 client_col">
      <div>
        <h5 style="margin-top: 90px;">Comparing <span style="text-decoration: underline;">${Object.keys(content)[second_id]}</span></h5>
        <hr>
        <div id="client_${second_id}" style="white-space: pre-line;">${content[Object.keys(content)[second_id]]["data"]}</div>
      </div>
    </div>
    `
  );
  // Set second cols
  $('#content').append(
    `
    <div class="col-12 col-lg-3 client_col">
      <div>
        <h5 style="margin-top: 90px;">to <span style="text-decoration: underline;">${Object.keys(content)[main_id]}</span> (main)</h5>
        <hr>
        <div id="client_${main_id}" style="white-space: pre-line;">${content[Object.keys(content)[main_id]]["data"]}</div>
      </div>
    </div>
    `
  );
  MergeResults(content[Object.keys(content)[second_id]]["data"], content[Object.keys(content)[main_id]]["data"]);
  window.scrollTo(0,document.body.scrollHeight);
}

function MergeResults(res1, res2)
{
  //console.log("Merging outputs:");
  var dmp = new diff_match_patch();
  var diff = dmp.diff_main(res1, res2);
  dmp.diff_cleanupSemantic(diff);
  printToDiffSection(diff);
}

function printToDiffSection(diff)
{
  diff.forEach((item, index) => {
    if (item[0] == 0) {
      $('#diff_content').append(`<span class="common">${item[1]}</span>`);
    }
    if (item[0] == 1) {
      $('#diff_content').append(`<span class="add">${item[1]}</span>`);
    }
    if (item[0] == -1) {
      $('#diff_content').append(`<span class="del">${item[1]}</span>`);
    }
  });
  $('#diff_content').append(`<hr>`);
  $('#diff_content').append(`<br><br>&nbsp;`);
}
