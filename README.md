# idea

share how your program works without sharing its source.

collaboratively test and compare works.

somewhat like w2g for binaries...

## setup

first create a virtualenv

    python3 -m venv venv

and activate it

    source venv/bin/activate

before installing the dependencies

    pip install -r requirements.txt

then you shoult be able to run the server

    ./cosrv

point your browser to localhost:8069 to check if it's up


## cosrv

    ./cosrv [--host][--port]

websocket/webserver to orchestrate everything

## coxy

usage something like

    ./coxy host[:socket_port] [--nick] prog [args...]

shares a program to a server

## cocli

    ./cocli host[:socket_port]

command line client to send stdin to all connected coxys



## ws-msgs

will probably look something like

{"type": "stdin|stdout|hello|bye|exit|", ...}


## webinterface

served from /web/ directory


[r]   [   stdin   ]

daef    | flo | user123
---- stdin: test ------
foo     | foo | bar
exit(1) | bar | 

