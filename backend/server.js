const express= require("express")
const app=express()
// const cors = require("cors");
const server=require("http").createServer(app)
const {Server}=require("socket.io")
const { addUser, removeUser, getUser } = require("./utils/user")
const io=new Server(server,{ cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }})

//routes
app.get("/",(req,res)=>{
    res.send("its the whiteboard backend")
})

let roomIdGlobal, imgURLGlobal;

io.on("connection",(socket)=>{
    socket.on("userJoined",(data)=>{
        const {name,userId,roomId,host,presenter}=data
        roomIdGlobal=roomId
        socket.join(roomId)
        const users=addUser({name,userId,roomId,host,presenter,socketId:socket.id})
        socket.emit("userIsJoined",{success:true, users})
        socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted",name)
        socket.broadcast.to(roomId).emit("allUsers",users)
        socket.broadcast.to(roomId).emit("whiteboardDataResponse",{
            imgURL: imgURLGlobal
        })
    });

    socket.on("whiteboardData",(data)=>{
        imgURLGlobal=data
        socket.broadcast.to(roomIdGlobal).emit("whiteboardDataResponse",data)
    })

    socket.on("message",(data)=>{
        const {message}=data
        const user=getUser(socket.id)
        if(user){
            // removeUser(socket.id)
            // socket.broadcast;
            socket.broadcast.to(roomIdGlobal).emit("messageResponse",{message,name: user.name} )
            
        }

    })

    socket.on("disconnect",()=>{
        const user=getUser(socket.id)
        if(user){
            removeUser(socket.id)
            socket.broadcast.to(roomIdGlobal).emit("userLeftMessageBroadcasted",user.name )
            
        }
    })
})

const port = process.env.PORT || 5000
server.listen(port,()=>{
    console.log("Server is running dude")
})