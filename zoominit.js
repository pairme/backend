const token = require("./jwt");

module.exports = email => {
  const options = {
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
  return options;
  // rp(options)
  //   .then(function(response) {
  //     //printing the response on the console
  //     // console.log("User has", response);
  //     console.log(typeof response);
  //     //Adding html to the page
  //     setTimeout(() => {console.log(res)},500)
  //     // console.log(response, "zoom response");
  //     return response;
  //     // zoom_response = response;
  //   })
  //   .catch(function(err) {
  //     // API call failed...
  //     console.log("API call failed, reason ", err);
  //     return new Error(err);
  //   });
};
