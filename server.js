const http = require("http"),
  fs = require("fs"),
  url = require("url");

http
  .createServer((request, response) => {
    let address = request.url;
    let q = url.parse(address, true);
    let path = "";

    fs.appendFile("log.txt", `url: ${address} \n${new Date()} \n\n`, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("added to log");
      }
    });

    if (q.pathname.includes("documentation")) {
      path = `${__dirname}/documentation.html`;
    } else {
      path = "index.html";
    }

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
