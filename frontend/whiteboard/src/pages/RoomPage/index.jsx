import { useEffect, useRef, useState } from "react";
import "./index.css";
import WhiteBoard from "../../components/WhiteBoard";
import ChatBar from "../../components/ChatBar";

const RoomPage = ({ user,socket,users }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("black");
  const [element, setElement] = useState([]);
  const [history, setHistory] = useState([]);
  const [openUserTab,setOpenUserTab]=useState(false);
  const [openChatTab,setOpenChatTab]=useState(false);

  // useEffect(()=>{
  //   return ()=>{
  //     socket.emit("userLeft",user)
  //   }
  // },[])


  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillRect = "white";
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setElement([]);
  };

  const undo = () => {
    history.push(element.pop());
    setElement((prev) => [...prev]);
    setHistory((prev) => [...prev]);
    if (element.length === 0) handleClearCanvas();

    // setHistory((prev)=>{
    //   const x=element.pop();
    //   setElement((prev)=>[...prev])
    //   return[
    //     ...prev,
    //     x
    //   ]
    // }
    // )
  };

  const redo = () => {
    element.push(history.pop());
    setHistory((prev) => [...prev]);
    setElement((prev) => [...prev]);
    // setElement((prev)=>[
    //   ...prev,
    //   history.pop()
    // ])
    // setHistory(history)
  };

  return (
    <div className="row">
      <button className="btn btn-dark" style={{
        display:"block",
        position:"absolute",
        top:"5%",
        left:"3%",
        height:"40px",
        width:"100px"
      }}
      onClick={()=>{setOpenUserTab(true)}}>
        Users
      </button>
      <button className="btn btn-primary" style={{
        display:"block",
        position:"absolute",
        top:"5%",
        left:"10%",
        height:"40px",
        width:"100px"
      }}
      onClick={()=>{setOpenChatTab(true)}}>
       Chats
      </button>
      {
        openUserTab && (
          <div className="position-fixed top-0 h-100 text-white bg-dark" style={{
            width:"250px",
            left:"0%"
          }}>
            <button className="btn btn-dark btn-block w-100 mt-5" onClick={()=>setOpenUserTab(false)}>Close</button>
            <div className="w-100 mt-5 pt-5">
            {
              users.map((usr,idx)=>(
                <p key={idx*999} className="my-2 w-100 text-center">{usr.name}{user.userId === usr.userId && "(You)"}</p>
              ))
            }
            </div>
            
          </div>
        )
      }
      {
        openChatTab && (
          <ChatBar setOpenChatTab={setOpenChatTab} socket={socket} />
        )
      }
      <h1 className="text-center py-5">
        White Board App <span className="text-primary">[Users Online:{users.length}]</span>
      </h1>
      {user?.presenter && (
        <div className="col-md-10 mx-auto px-5 mb-3 d-flex align-items-center justify-content-center">
          <div className="d-flex col-md-2 justify-content-center gap-1">
            <div className="d-flex gap-1">
              <label htmlFor="pencil">Pencil</label>
              <input
                type="radio"
                name="tool"
                value="pencil"
                id="pencil"
                checked={tool === "pencil"}
                className="mt-1"
                onChange={(e) => {
                  setTool(e.target.value);
                }}
              />
            </div>
            <div className="d-flex gap-1">
              <label htmlFor="line">Line</label>
              <input
                type="radio"
                name="tool"
                value="line"
                id="line"
                checked={tool === "line"}
                className="mt-1"
                onChange={(e) => {
                  setTool(e.target.value);
                }}
              />
            </div>

            <div className="d-flex gap-1">
              <label htmlFor="rect">Rectangle</label>
              <input
                type="radio"
                name="tool"
                value="rect"
                id="rect"
                className="mt-1"
                checked={tool === "rect"}
                onChange={(e) => {
                  setTool(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="col-md-2 mx-auto">
            <div className="col-md-7">
              <div className="d-flex align-items-center justify-content-center">
                <label htmlFor="color">Select Color:</label>
                <input
                  type="color"
                  id="color"
                  className="mt-1 ms-3"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="col-md-3 d-flex gap-2">
            <button
              className="btn btn-primary mt-1"
              disabled={element.length === 0}
              onClick={undo}
            >
              Undo
            </button>
            <button
              className="btn btn-outline-primary mt-1"
              disabled={history.length < 1}
              onClick={redo}
            >
              Redo
            </button>
          </div>
          <div className="col-md-2">
            <button className="btn btn-danger" onClick={handleClearCanvas}>
              Clear Canvas
            </button>
          </div>
        </div>
      )}
      <div className="col-md-10 mx-auto mt-4 border canvas-box">
        <WhiteBoard
          canvasRef={canvasRef}
          ctxRef={ctxRef}
          element={element}
          setElement={setElement}
          tool={tool}
          color={color}
          user={user}
          socket={socket}
        />
      </div>
    </div>
  );
};

export default RoomPage;
