const express = require('express');
const socketio = require('socket.io');
const path=require('path');
const http = require('http');
const cors = require('cors');

const format = require('./utils/messages');
const {Userjoin,getUser,removeUser,getUsersInroom,getUserByColor} = require('./utils/users');


const PORT= process.env.PORT || 5000;

const router=require('./router');

const app=express();
// app.use(express.static(path.join(__dirname,'../../public')));
const server=http.createServer(app);
const io=socketio(server,{
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
  });

app.use(router);
app.use(cors());

io.on('connection',socket=>{
    socket.on('Join',({username,room,player})=>{
        var numClients=getUsersInroom(room).length;
        // console.log(numClients);
        var clients=getUsersInroom(room);
        // console.log(clients)
        if(numClients<2){
            if(numClients===0){
                let user=Userjoin(socket.id,username,room,player)
                socket.join(user.room)
                // console.log(`${user.username} connected`);
                if(user!==undefined){
                    // console.log(user)
                    socket.to(user.room).emit('checkplayer',user)
                    socket.emit('message', format('admin',`You have joined ${user.room} chat group!!!`));
                    socket.broadcast.to(user.room).emit('message',format('admin',`${user.username} joined the game`));
                }
            }
            if(numClients===1){
                let existPlayercol=getUserByColor(player);
                if (existPlayercol){
                    if(existPlayercol.player==='White'){
                         player='Black';
                    }
                    else{
                        player='White';  
                    }
                }
                let user=Userjoin(socket.id,username,room,player)
                socket.join(user.room)
                // console.log(`${user.username} connected`);
                if(user!==undefined){
                    // console.log(user)
                    socket.emit('checkplayer',user);
                    socket.to(user.room).emit('checkplayer',user)
                    socket.emit('message', format('admin',`You have joined ${user.room} chat group!!!`));
                    socket.broadcast.to(user.room).emit('message',format('admin',`${user.username} joined the game`));
                }
                // console.log(player);
            }
        }
        // if(numClients>2){
        //     removeUser(socket.id);
        // }
    })

    
    socket.on('sendMessage',(msg)=>{
        const user=getUser(socket.id)
        if(user!==undefined){
        var numClients=getUsersInroom(user.room).length;
        if(numClients<=2){
        io.to(user.room).emit('message',format(`${user.username}`,msg));
        }
    }
    });

    socket.on('move',(move)=>{
        const user=getUser(socket.id)
        if(user!==undefined){
        var numClients=getUsersInroom(user.room).length;
        if(numClients===2){
        socket.broadcast.to(user.room).emit('move',move);
    }
    socket.broadcast.to(user.room).emit('message',format('admin',`${user.username} made a move!`))
    }
    })

    socket.on('gamereset',()=>{
        const user=getUser(socket.id)
        if(user!==undefined){
        var numClients=getUsersInroom(user.room).length;
        if(numClients===2){
         io.to(user.room).emit('gamereset',user.player);
         io.to(user.room).emit('message', format('admin',`${user.username} started new game!!!`));
        }
    }
    })
    
    socket.on('disconnect',()=>{
        const user=getUser(socket.id)
        if(user!==undefined){
        console.log(`${user.username} left!!!`);
        var numClients=getUsersInroom(user.room).length;
            socket.broadcast.to(user.room).emit('message',format('admin',`${user.username} left the game`));     
        io.to(user.room).emit('gamereset');
            }
    removeUser(socket.id);
    })
})
  
server.listen(PORT,()=>console.log(`Server is running on PORT:${PORT}`));