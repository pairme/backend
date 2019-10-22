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
let allConnections = [];
let connections = [];
let whosTyping = [];
let admins = [];
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
  if (!socket) {
    res.status(200).json({ success: true });
    return;
  }
  let otherSocket = connections.pop();
  if (socket == otherSocket) {
    otherSocket = connections.shift();
  }
  const newconnections = connections.filter(connection => connection != socket);
  connections = newconnections;
  const message = `Your pairing is ready with ${otherSocket.chat_name}* ${
    req.body.url
    } *`;
  const otherMessage = `Your pairing is ready with ${socket.chat_name}* ${
    req.body.url
    } *`;
  const privatemessage = {
    message,
    id: Math.random()
  };
  const otherPrivateMessage = {
    message: otherMessage,
    id: Math.random()
  };
  io.to(`${socket.id}`).emit("private message", privatemessage);
  io.to(`${otherSocket.id}`).emit("private message", otherPrivateMessage);
  io.to(`${socket.id}`).emit("button disabled", true);
  io.to(`${otherSocket.id}`).emit("button disabled", true);
  res.status(200).json({ success: true });
});

io.on("connection", function (socket) {
  // push the socket to the connections array!
  io.to(`${socket.id}`).emit("socketid", socket.id);
  io.emit("connections count", connections.length);
  io.emit("admins connected", admins.length);
  /*
  add chat
  functionality here
  before the
  disconnect function
  */
  socket.on("add connection", function (data) {
    socket.chat_name = data;
    connections.push(socket);
    allConnections.push(socket);
    io.emit("connections count", connections.length);
    io.emit("admins connected", admins.length);
    io.emit("message", {
      message: `${socket.chat_name} entered the chat`,
      id: Math.random()
    });
    console.log(`socket connected! sockets remaining : ${connections.length}`);
  });

  socket.on("add admin", function (data) {
    socket.chat_name = "Staff: " + data;
    socket.pairme_admin = true;
    admins.push(socket);
    allConnections.push(socket);
    io.emit("connections count", connections.length);
    io.emit("admins connected", admins.length);
    io.emit("message", {
      message: `${socket.chat_name} has entered the chat`,
      id: Math.random()
    });
    io.to(`${socket.id}`).emit("button disabled", true);
  });

  /*
  adding typing functionality
  */
  socket.on("all users", function (data) {
    io.to(`${socket.id}`).emit(
      "get all users",
      allConnections.map(connections => connections.chat_name)
    );
  });

  socket.on("user typing", function (user) {
    if (!whosTyping.includes(user)) {
      whosTyping.push(user);
    }
    //emit new users
    socket.emit("typing users", whosTyping);
  });
  socket.on("user done typing", function (user) {
    let newUsers = whosTyping.filter(personTyping => personTyping != user);
    whosTyping = newUsers;
    //emit new users
    socket.emit("typing users", whosTyping);
  });
  socket.on("disconnect", function () {
    // console.log(allConnections.map(connection => connection.chat_name));
    // when you exit localhost:3000 this block of scope will run!!
    //filter it out
    console.log(socket.chat_name, "this is the chat name");
    if (!socket.chat_name) {
      console.log("unregistered person left");
    } else {
      io.emit("message", {
        message: `${socket.chat_name} left the chat`,
        id: Math.random()
      });
    }
    if (socket.pairme_admin) {
      const newAdmins = admins.filter(connection => connection != socket);
      // update the connections array with our new connections array!
      admins = newAdmins;
      io.emit("admins connected", admins.length);
    } else {
      const newConnections = connections.filter(
        connection => connection != socket
      );
      connections = newConnections;
      // update the connections array with our new connections array!
      io.emit("connections count", connections.length);
      console.log(
        `socket disconected sockets remaining : ${connections.length}`
      );
    }
    // disconnect the room!!!
    const newAllConnections = allConnections.filter(
      connection => connection != socket
    );
    allConnections = newAllConnections;
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
