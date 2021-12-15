let log_counter = 0;
let open_blob = false;

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
  let user_name = "";

  const socket = new WebSocket(get_ws_uri())
  socket.addEventListener('open', function (event) {
    socket.send(JSON.stringify({'type': 'subscribe', 'filter': 'stdout|stderr|exit|hello'}))
  })
  socket.addEventListener('message', function (event) {
    msg = JSON.parse(event.data)
    console.log(msg);
    printMsg(msg);
  })

  var user_name_modal = new bootstrap.Modal(document.getElementById('user_name_modal'), {
    keyboard: false,
    backdrop: 'static',
    focus: true,
  });

  $('#reset').bind('click', function(event) {
    socket.send(JSON.stringify({'type': 'reset'}))
  })
  $('#kill').bind('click', function(event) {
    socket.send(JSON.stringify({'type': 'kill'}))
  })
  $('#send_EOF').bind('click', function(event) {
    socket.send(JSON.stringify({'type': 'eof'}))
  })

  $('#clear_log').bind('click', function(event) {
    $('#output_log').html("")
  })

  $('#user_input_field').bind("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      $('#output_log').append(getNewInputOutputHTML(user_name, $('#user_input_field').val()));
      open_blob = true;
      window.scrollTo(0,document.body.scrollHeight);
      socket.send(JSON.stringify({'type': 'stdin', 'data': `${$('#user_input_field').val()}\n`, 'from': user_name}))
      $('#user_input_field').val('');
    }
  });

  $('#user_name_input_field').bind("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      user_name = $( '#user_name_input_field' ).val();
      if (user_name.length > 0 && user_name.length < 20)
      {
        console.log(`Set user_name: ${user_name}`);
        $('#user_input_field').val('');
        user_name_modal.hide();
        $('#user_name_input_field').val('');
        $('#input_bar_user_name').text(`${user_name}@coxy:~$`);
        $('#input_bar').removeClass("d-none");
        $('#user_name_input_field').removeClass("is-invalid");
        $('#user_input_field').focus();
      }
      else { $('#user_name_input_field').addClass("is-invalid"); }
    }
  });

  $('#user_name_submit_btn').bind("click", function(event) {
    var e = jQuery.Event("keyup");
    e.keyCode = 13;
    $("#user_name_input_field").trigger(e);
  });

  $(document).ready(function(){
      user_name_modal.show();
      $( "#user_name_input_field" ).focus();
  });
}

function printMsg(msg)
{
  if (msg.type == "stdout")
  {
    if(open_blob)
    {
      $('#o_'+log_counter).html(msg.data);
      log_counter++;
      open_blob = false;
    }
    else {$('#output_log').append(getNewOutputHTML(msg.data))}
    window.scrollTo(0,document.body.scrollHeight);
  }
  if (msg.type == "stdin")
  {
    log_counter++;
    $('#output_log').append(getNewInputOutputHTML(msg.from, msg.data));
    window.scrollTo(0,document.body.scrollHeight);
  }
}

function getNewInputOutputHTML(user, input) {
  const evt_msg_html = `
  <div class="output_elem bg-dark" style="border-radius: 20px;">
    <p class="output_elem_title" style="color: #0f0; padding: 10px 20px 0px 20px;">${user}@coxy:~$ ${input}</p>
    <p class="output_elem_content" style="color: white; padding: 0px 20px 10px 20px;" id="o_${log_counter}"><span style='font-style: italic; color: #dedede;'>No output (yet).</span></p>
  </div>
`;
  return evt_msg_html;
}

function getNewOutputHTML(output) {
  const evt_msg_html = `
  <div class="output_elem bg-dark" style="border-radius: 20px;">
  <p class="output_elem_title" style="color: #0f0; padding: 10px 20px 0px 20px;">another_user@coxy:~$ some input</p>
  <p class="output_elem_content" style="color: white; padding: 0px 20px 10px 20px;">${output}</p>
  </div>
`;
  return evt_msg_html;
}

main()
