const http = require("http"),
  fs = require("fs"),
  url = require("url");

http
  .createServer((request, response) => {
    // http calls it's createServer method, takes one mandatory argument, aka a call back function that receives two parameters, a request object, and a response object and then a function body that acts each time a request hits the port.
    let address = request.url; // the request object accesses the url property, returning the route being requested as a string, (currrently only two legitimate routes exists on the server, an index and documentation page,) and it gets assigned to the variable address.
    let q = url.parse(address, true); // the url module uses it's parse method, which takes two parameters, the address to be parsed, and
    let path = "";

    //  we populate the path sring with either the relative path to the documentation.html page or the relative path to index.html.
    if (q.pathname.includes("documentation")) {
      path = `${__dirname}/documentation.html`;
    } else {
      path = "index.html";
    }
    // the fs module, calls the appendFile method, arg1) the log text file arg2) the formatted string including the request url and the timestamp, an error handling callback function to console.log all types of errors.
    fs.appendFile(
      "log.txt",
      `url: ${address} \ntimestamp: ${new Date()} \n\n`,
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("added to log");
        }
      }
    );

    // we read the path string that has been filled, it will either be documentation.html or index.html,  our response object writes a status code and a mime type to the response header, and it writes the data read in, and then resolves the response.

    fs.readFile(path, (err, data) => {
      if (err) {
        throw err;
      }

      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      response.end();
    });
  })
  .listen(8080);

console.log("server is running on port 8080");
