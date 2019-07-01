const app = require("express")();
const cors = require("cors");
const zoomoptions = require("./zoominit");
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
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true
  })
);
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
let availablerooms = [];
let currentroom;
let counter = 0;

app.get("/", (req, res) => {
  res.send("sanity check");
});
app.post("/getuserinfo", async (req, res) => {
  const options = zoomoptions(req.body.email);
  console.log(options);
  rp(options)
    .then(resp => {
      res.json({ response: resp });
    })
    .catch(err => res.json({ error: true }));
});

io.on("connection", function (socket) {
  // push the socket to the connections array!
  connections.push(socket);
  console.log(`socket connected! sockets remaining : ${connections.length}`);
  //  can be recieved on the front end by running socket.on("news",function(data){})
  if (availablerooms.length > 0) {
    // there is a available room to join in pop it and join in it
    const roomicangoin = availablerooms.pop();
    console.log(roomicangoin, "there is a available room");
    socket.join(roomicangoin);
  } else {
    // make a new room and join in it if the available rooms array is empty
    currentroom = `room${counter}`;
    counter += 1;
    availablerooms.push(currentroom);
    socket.join(currentroom);
  }
  /*
    add chat
    functionality here
    before the
     disconnect function
   */
  socket.on("disconnect", function () {
    // when you exit localhost:3000 this block of scope will run!!
    //filter it out
    const newconnections = connections.filter(
      connection => connection != socket
    );
    // update the connections array with our new connections array!
    connections = newconnections;
    console.log(`socket disconected sockets remaining : ${connections.length}`);
    // disconnect the room!!!
    const newavailablerooms = availablerooms.filter(
      room => room != currentroom
    );
    availablerooms = newavailablerooms;
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
