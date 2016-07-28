document.addEventListener("DOMContentLoaded", function() {
    var mouse = {
        click: false,
        move: false,
        pos: { x: 0, y: 0 },
        pos_prev: false
    };

    var username = "null";

    // get canvas element and create context
    var canvas = document.getElementById('drawing');
    var context = canvas.getContext('2d');
    var colorPicker = document.getElementById('colorSelect');
    var weightPicker = document.getElementById('weightSelect');
    var chatInput = document.getElementById('chatInput');
    var messageInput = document.getElementById('messageInput');
    var chatBox = document.getElementById('chatBox');
    var width = window.innerWidth;
    var height = window.innerHeight;
    var socket = io.connect();

    var showToolMenu = true;
    var showChatWindow = true;

    // set canvas to full browser width/height
    canvas.width = 1600;
    canvas.height = 900;

    // register mouse event handlers
    canvas.onmousedown = function (e) { mouse.click = true; };
    canvas.onmouseup = function (e) { mouse.click = false; };

    canvas.onmousemove = function (e) {
        // normalize mouse position to range 0.0 - 1.0
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY / height;
        mouse.move = true;
    };

    chatInput.onsubmit = function () {
        socket.emit('chat message', {
            message: [
                messageInput.value,
                username
            ]
        });

        messageInput.value = '';
        return false;
    };

    //Button for controlling hiding/showing the tool menu
    $("#hideToolMenu").click(function () {
        if (showToolMenu == true) {
            $("#toolMenuContainer").animate({
                left: '-75px'
            }, "slow");

            $("#hideToolMenu").text(">");
        } else {
            $("#toolMenuContainer").animate({
                left: '10px'
            }, "slow");

            $("#hideToolMenu").text("<");
        }

        showToolMenu = !showToolMenu;
    });

    //Button for controlling hiding/showing the chat window
    $("#hideChatWindow").click(function () {
        if (showChatWindow == true) {
            $("#chatWindowContainer").animate({
                bottom: '-266px'
            }, "slow");

            //$("#hideToolMenu").text(">");
        } else {
            $("#chatWindowContainer").animate({
                bottom: '5px'
            }, "slow");

            //$("#hideToolMenu").text("<");
        }

        showChatWindow = !showChatWindow;
    });


    // draw line received from server
    socket.on('draw_pencil', function (data) {
        var line = data.line;
        context.beginPath();
        //context.moveTo(line[0].x * width, line[0].y * height);
        //context.lineTo(line[1].x * width, line[1].y * height);
        context.arc(line[0].x * width, line[0].y * height, line[3], 0, 2 * Math.PI);

        context.fillStyle = line[2];
        context.fill();
        //context.lineWidth = 10;

        //context.stroke();
    });

    //show messages received from server
    socket.on('chat message', function (data) {
        var message = data.message;

        //Add chat messages into the chat window as they're received
        if (message[1] === username) {
            $('#messages').append($('<li id="myMessage">').text(message[1] + ": " + message[0]));
            $('#messages').append($('</li>'));
        }
        else {
            $('#messages').append($('<li id="otherMessage">').text(message[1] + ": " + message[0]));
            $('#messages').append($('</li>'));
        }
        //Make the chatbox autoscroll to the latest message
        chatBox.scrollTop = chatBox.scrollHeight;

    });

    //set the username when the user first connects
    socket.on('set username', function (user_name) {
        username = user_name;
    });

    //update user list whenever a disconnect or connection occurs
    socket.on('update users', function (connected_users) {
        $('#users').empty();
        for (var i in connected_users) {
            $('#users').append($('<li>').text(connected_users[i]));
            $('#users').append($('</li>'));
        }
    });

    // main loop
    function mainLoop() {
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to to the server
            socket.emit('draw_pencil', {
                line: [
                    mouse.pos,
                    mouse.pos_prev,
                    colorPicker.value,
                    weightPicker.value
                ]
            });
            mouse.move = false;
        }

        mouse.pos_prev = { x: mouse.pos.x, y: mouse.pos.y };
        setTimeout(mainLoop, 0);
    }
    mainLoop();
});