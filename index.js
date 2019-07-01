const app = require("express")();
const cors = require("cors");
const token = require("./jwt");
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
 websocket pop/filterto get connections */
let connections = [];

var email = "carlo.clamucha@gmail.com";
var options = {
  //You can use a different uri if you're making an API call to a different Zoom endpoint.
  uri: "https://api.zoom.us/v2/users/" + email,
  qs: {
    status: "active"
  },
  auth: {
    bearer: token
  },
  headers: {
    "User-Agent": "Zoom-api-Jwt-Request",
    "content-type": "application/json"
  },
  json: true //Parse the JSON string in the response
};
rp(options)
  .then(function(response) {
    //printing the response on the console
    console.log("User has", response);
    //console.log(typeof response);
    //Adding html to the page
  })
  .catch(function(err) {
    // API call failed...
    console.log("API call failed, reason ", err);
  });

app.get("/", (req, res) => {
  res.send("sanity check");
});

io.on("connection", function(socket) {
  // push the socket to the connections array!
  connections.push(socket);
  console.log(`socket connected! sockets remaining : ${connections.length}`);
  //  can be recieved on the front end by running socket.on("news",function(data){})
  socket.emit("news", { hello: "world" });
  socket.on("disconnect", function() {
    // when you exit localhost:3000 this block of scope will run!!
    //filter it out
    const newconnections = connections.filter(
      connection => connection != socket
    );
    // update the connections array with our new connections array!
    connections = newconnections;
    console.log(`socket disconected sockets remaining : ${connections.length}`);
  });
});

/*
app.listen will not work!!!! we need to use
the server initiatedwith the http module
 */
server.listen(port, () => {
  console.log(`app listening at port ${port}`);
});
