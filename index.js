const app = require("express")();
const cors = require("cors");
/*
 init socket io
 note that app is still our express server
  */
const server = require("http").Server(app);
const io = require("socket.io")(server);
// end init socket io
app.use(require("express").json());
/*
added cors and origin and credentials to be true
so we dont get the CORS block on the frontend
 */
app.use(cors());
const port = process.env.PORT || 5000;
/*
 if something connects/disconnects  on our
 websocket pop/filterto get connections
  */
let connections = [];
/*
init our needed stuff
logic will get refactored later but for now
*/

app.get("/", (req, res) => {
  res.send("sanity check");
});
app.post("/makepair", (req, res) => {
  /*
  BODY KEYS
  req.body.url
  req.body.socketid
  */
  const [socket] = connections.filter(
    connection => connection.id == req.body.socketid
  );
  let otherSocket = connections.pop();
  if (socket == otherSocket) {
    otherSocket = connections.shift();
  }
  const newconnections = connections.filter(connection => connection != socket);
  connections = newconnections;
  const message = `Your pairing is ready * ${req.body.url} *`;
  const privatemessage = {
    message,
    id: Math.random()
  };
  io.to(`${socket.id}`).emit("private message", privatemessage);
  io.to(`${otherSocket.id}`).emit("private message", privatemessage);
  io.to(`${socket.id}`).emit("button disabled", true);
  io.to(`${otherSocket.id}`).emit("button disabled", true);
  res.status(200).json({ success: true });
});

io.on("connection", function (socket) {
  // push the socket to the connections array!
  io.to(`${socket.id}`).emit("socketid", socket.id);
  io.emit("connections count", connections.length);
  /*
  add chat
  functionality here
  before the
  disconnect function
  */
  socket.on("add connection", function (data) {
    socket.chat_name = data;
    connections.push(socket);

    io.emit("connections count", connections.length);
    io.emit("message", {
      message: `${socket.chat_name} entered the chat`,
      id: Math.random()
    });
    console.log(`socket connected! sockets remaining : ${connections.length}`);
  });
  socket.on("disconnect", function () {
    // when you exit localhost:3000 this block of scope will run!!
    //filter it out
    console.log(socket.chat_name, "this is the chat name");
    io.emit("message", {
      message: `${socket.chat_name} left the chat`,
      id: Math.random()
    });
    const newConnections = connections.filter(
      connection => connection != socket
    );
    // update the connections array with our new connections array!
    connections = newConnections;
    io.emit("connections count", connections.length);
    console.log(`socket disconected sockets remaining : ${connections.length}`);
    // disconnect the room!!!
  });
  socket.on("message", msg => {
    io.emit("message", msg);
  });
});

/*
app.listen will not work!!!! we need to use
the server initiatedwith the http module
 */
server.listen(port, () => {
  console.log(`app listening at port ${port}`);
});
