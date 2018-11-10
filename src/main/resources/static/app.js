var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var eventMouse = null;
    var room = null;
    var can = null;
    var polygon = 3;
    var colors = ["Aqua", "BlueViolet", "Brown", "DarkMagenta", "DeepPink", "OrangeRed"];

    var addPolygonToCanvas = function polygon(vertices) {
    	var canvas = document.getElementById("canvas");
    	var ctx = canvas.getContext("2d");
    	ctx.beginPath();
    	ctx.moveTo(vertices[0].x, vertices[0].y);
    	for (var i = 1; i < vertices.length; i++){
    		ctx.lineTo(vertices[i].x, vertices[i].y);
    	}
    	ctx.closePath();
    	ctx.stroke();
    	ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    	ctx.fill();
	}

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + room, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                addPointToCanvas(point);
                //alert(point.x + " , " + point.y);
            });
            stompClient.subscribe('/topic/newpolygon.' + room, function (eventbody) {
                addPolygonToCanvas(JSON.parse(eventbody.body));
            });
        });
    };


    return {

        init: function () {
            can = document.getElementById("canvas");

            //websocket connection
            //connectAndSubscribe();

        },

        publishPoint: function (px, py) {
            if (stompClient != null) {
                var pt = new Point(px, py);
                console.info("publishing point at " + pt);

                //addPointToCanvas(pt);

                //publicar el evento

                //creando un objeto literal
                //stompClient.send("/topic/newpoint", {}, JSON.stringify({x: 10, y: 10}));

                //enviando un objeto creado a partir de una clase
                stompClient.send("/app/newpoint." + room, {}, JSON.stringify(pt));
            } else {
                alert("Para enviar puntos primero debe conectarse a una sala!");
            }
        },

        connectSuscribe: function (r) {
            if (!isNaN(parseInt(r))) {
            	document.getElementById("btnConnect").disabled=true;
            	document.getElementById("btnDisconnect").disabled=false;
                room = r;
                connectAndSubscribe();
                can.addEventListener("click", eventMouse = function eventMouse (evt) {
                	var mousePosition = getMousePosition(evt);
					app.publishPoint(mousePosition.x, mousePosition.y);
                });
            } else {
                alert("Debe ingresar un número de sala válido");
            }
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
                stompClient = null;
                document.getElementById("btnConnect").disabled=false;
                document.getElementById("btnDisconnect").disabled=true;
                can.getContext('2d').clearRect(0, 0, can.width, can.height);
                can.removeEventListener("click", eventMouse); 
            }
            //setConnected(false);
            console.log("Disconnected");
        }
    };

})();