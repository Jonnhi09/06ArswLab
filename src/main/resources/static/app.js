var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    var stompClient = null;
    var room = null;
    var can = null;

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
            stompClient.subscribe('/topic/newpoint.'+room, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                addPointToCanvas(point);
                //alert(point.x + " , " + point.y);
            });
            stompClient.subscribe('/topic/newpolygon.'+room, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                //addPointToCanvas(point);
                alert(point.x + " , " + point.y);
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
            if(stompClient!=null) {
                var pt = new Point(px, py);
                console.info("publishing point at " + pt);

                //addPointToCanvas(pt);

                //publicar el evento

                //creando un objeto literal
                //stompClient.send("/topic/newpoint", {}, JSON.stringify({x: 10, y: 10}));

                //enviando un objeto creado a partir de una clase
                stompClient.send("/app/newpoint."+room, {}, JSON.stringify(pt));
            } else {
                alert("Para enviar puntos primero debe conectarse a una sala!");
            }
        },

        connectSuscribe: function(r) {
            if(!isNaN(parseInt(r))){
                room = r;
                connectAndSubscribe();
                can.addEventListener("click", function(evt){
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
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();