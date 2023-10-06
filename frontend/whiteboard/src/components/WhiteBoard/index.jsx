import { useEffect, useRef, useState } from "react";
import rough from "roughjs";

const roughGenerator = rough.generator();

const WhiteBoard = ({
  canvasRef,
  ctxRef,
  element,
  setElement,
  tool,
  color,
  user,
  socket,
}) => {
  

  // const imgRef=useRef(null)
  const [img, setImg] = useState(null);

  useEffect(() => {
    socket.on("whiteboardDataResponse", (data) => {
      setImg(data);
      // imgRef.current.src=data
    });
  }, []);
  
  if (!user?.presenter) {
    return (
      <div className="border border-dark border-3 h-100 w-100 overflow-hidden">
        <img src={img} alt="real time image" style={{
          height:window.innerHeight*2,
          width:"285%"
        }} />
      </div>
    );
  }
  const [isDrawing, setIsDrawing] = useState(false);
  

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round ";
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    ctxRef.current.strokeStyle = color;
  }, [color]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === "pencil") {
      setElement((prevElement) => [
        ...prevElement,
        {
          type: "pencil",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color,
        },
      ]);
    } else if (tool === "line") {
      setElement((prevElement) => [
        ...prevElement,
        {
          type: "line",
          offsetX,
          offsetY,
          width: offsetX,
          height: offsetY,
          stroke: color,
        },
      ]);
    } else if (tool === "rect") {
      setElement((prevElement) => [
        ...prevElement,
        {
          type: "rect",
          offsetX,
          offsetY,
          width: 0,
          height: 0,
          stroke: color,
        },
      ]);
    }
    setIsDrawing(true);
  };
  //actual drawing
  useEffect(() => {
    if (canvasRef) {
      const roughCanvas = rough.canvas(canvasRef.current);

      if (element.length > 0) {
        ctxRef.current.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
      element.map((ele) => {
        if (ele.type == "pencil")
          roughCanvas.linearPath(ele.path, {
            stroke: ele.stroke,
            strokeWidth: 3,
            roughness: 0,
          });
        else if (ele.type == "line")
          roughCanvas.draw(
            roughGenerator.line(
              ele.offsetX,
              ele.offsetY,
              ele.width,
              ele.height,
              {
                stroke: ele.stroke,
                strokeWidth: 3,
                roughness: 0,
              }
            )
          );
        else if (ele.type == "rect")
          roughCanvas.draw(
            roughGenerator.rectangle(
              ele.offsetX,
              ele.offsetY,
              ele.width,
              ele.height,
              {
                stroke: ele.stroke,
                strokeWidth: 3,
                roughness: 0,
              }
            )
          );
      });

      const canvasImage = canvasRef.current.toDataURL();
      socket.emit("whiteboardData", canvasImage);
    }
  }, [element]);

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    // Pencil default
    if (isDrawing) {
      if (tool === "pencil") {
        setElement((prevElement) => {
          const { path } = prevElement[prevElement.length - 1];
          const newPath = [...path, [offsetX, offsetY]];
          // console.log(path, newPath)
          return prevElement.map((ele, index) => {
            if (index === prevElement.length - 1) {
              return {
                ...ele,
                path: newPath,
              };
            } else return ele;
          });
        });
      } else if (tool === "line" || tool === "rect") {
        setElement((prevElement) => {
          return prevElement.map((ele, index) => {
            if (index === prevElement.length - 1) {
              return {
                ...ele,
                width: tool === "rect" ? offsetX - ele.offsetX : offsetX,
                height: tool === "rect" ? offsetY - ele.offsetY : offsetY,
              };
            } else return ele;
          });
        });
      }
      //   else if(tool==="rect"){

      //   }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <>
      {/* {JSON.stringify(element)} */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border border-dark border-3 h-100 w-100 overflow-hidden"
      >
        <canvas ref={canvasRef}></canvas>
      </div>
    </>
  );
};

export default WhiteBoard;
