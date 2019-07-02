const app = require("express")();
const cors = require("cors");
const zoomOptions = require("./zoominit");
const rp = require("request-promise");
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
app.post("/getuserinfo", async (req, res) => {
  const options = zoomOptions(req.body.email);
  console.log(options);
  rp(options)
    .then(resp => {
      res.json({ response: resp });
    })
    .catch(err => res.json({ err }));
});

io.on("connection", function(socket) {
  // push the socket to the connections array!
  connections.push(socket);
  console.log(`socket connected! sockets remaining : ${connections.length}`);
  console.log(socket.id, "backendsocketid");
  io.to(`${socket.id}`).emit("socketid", socket.id);
  socket.emit("connections count", connections.length);
  /*
    add chat
    functionality here
    before the
     disconnect function
   */
  socket.on("disconnect", function() {
    // when you exit localhost:3000 this block of scope will run!!
    //filter it out
    const newConnections = connections.filter(
      connection => connection != socket
    );
    // update the connections array with our new connections array!
    connections = newConnections;
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
