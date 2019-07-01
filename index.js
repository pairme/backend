const app = require("express")();
const cors = require("cors");
const zoominit = require("./zoominit");
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
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true
  })
);
const port = process.env.PORT || 5000;
/*
 if something connects/disconnects  on our
 websocket pop/filterto get connections */
let connections = [];

app.get("/", (req, res) => {
  res.send("sanity check");
});
app.post("/getuserinfo", (req, res) => {
  const response = zoominit(req.body.email);
  res.send(response);
});

io.on("connection", function (socket) {
  // push the socket to the connections array!
  connections.push(socket);
  console.log(`socket connected! sockets remaining : ${connections.length}`);
  //  can be recieved on the front end by running socket.on("news",function(data){})
  socket.on("disconnect", function () {
    // when you exit localhost:3000 this block of scope will run!!
    //filter it out
    const newconnections = connections.filter(
      connection => connection != socket
    );
    // update the connections array with our new connections array!
    connections = newconnections;
    console.log(`socket disconected sockets remaining : ${connections.length}`);
  });
  socket.on('message', msg => {
    io.emit('message', msg)
  })
});

/*
app.listen will not work!!!! we need to use
the server initiatedwith the http module
 */
server.listen(port, () => {
  console.log(`app listening at port ${port}`);
});
