import "./App.css";
import Forms from "./components/Forms";
import { Route, Routes } from "react-router-dom";
import RoomPage from "./pages/RoomPage";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";

const server="http://localhost:5000/"
const connectionOptions={
  "force new connection":true,
  reconnectionAttempts:"Infinity",
  timeout:10000,
  transport:["websocket"]
}

const socket= io(server,connectionOptions)
const App = () => {
  const [user,setUser] =useState(null)
  const [users,setUsers] =useState([])

  useEffect(()=>{
    socket.on("userIsJoined",(data)=>{
      if(data.success){
        setUsers(data.users)
        console.log("user joined")
      }
    })

    socket.on("allUsers",(data)=>{
      if(data){
        // setUsers(data.users)
        setUsers(data)
      }
    })

    socket.on("userJoinedMessageBroadcasted",(data)=>{
      toast.info(`${data} joined the room`)
    })

    socket.on("userLeftMessageBroadcasted",(data)=>{
      toast.info(`${data} left the room`)
    })

  },[])

  const uuid = () => {
    let S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  };

  return (
    <>
      <div className="container">
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Forms uuid={uuid} socket={socket} setUser={setUser}/>} />
          <Route path="/:roomId" element={<RoomPage user={user} socket={socket} users={users} />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
