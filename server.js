// var app = require('express')();
// var http = require('http').createServer(app);
// const cors = require('cors');

const PORT = 8080;
var options={
    cors:true,
    origins:["http://127.0.0.1:8080"],
};
// const { Server } = require('socket.io');
// const io = new Server(http, {
//     cors: { 
//     origin: "*",
//     methods: ["GET", "POST"]
//     },
//   });
//const express = require('express');
var app = require('express')();
const cors = require('cors');

app.use(cors());
const http = require('http').createServer(app);
const { Server } = require('socket.io');




//const server = http.createServer(app);
//  

const io = require('socket.io')(http, {
    cors: { 
    origin: "*",
    methods: ["GET", "POST"]
    },
});

var STATIC_CHANNELS = [{
    name: 'Villa 1',
    participants: 0,
    id: 1,
    sockets: []
}, {
    name: 'Villa 2',
    participants: 0,
    id: 2,
    sockets: []
},
{
    name: 'Villa 3',
    participants: 0,
    id: 3,
    sockets: []
},
{
    name: 'Villa 4',
    participants: 0,
    id: 4,
    sockets: []
}];

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})


http.listen(PORT,'192.168.1.20', () => {
    console.log(`listening on *:${PORT}`);
});

io.on('connection', (socket) => { // socket object may be used to send specific messages to the new connected client
    console.log('new client connected');
    socket.emit('connection', null);
    socket.on('channel-join', id => {
        console.log('channel join', id);
        STATIC_CHANNELS.forEach(c => {
            if (c.id === id) {
                if (c.sockets.indexOf(socket.id) == (-1)) {
                    c.sockets.push(socket.id);
                    c.participants++;
                    io.emit('channel', c);
                }
            } else {
                let index = c.sockets.indexOf(socket.id);
                if (index != (-1)) {
                    c.sockets.splice(index, 1);
                    c.participants--;
                    io.emit('channel', c);
                }
            }
        });

        return id;
    });
    socket.on('send-message', message => {
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        STATIC_CHANNELS.forEach(c => {
            let index = c.sockets.indexOf(socket.id);
            if (index != (-1)) {
                c.sockets.splice(index, 1);
                c.participants--;
                io.emit('channel', c);
            }
        });
    });

});



/**
 * @description This methos retirves the static channels
 */
app.get('/getChannels', (req, res) => {
    res.json({
        channels: STATIC_CHANNELS
    })
});