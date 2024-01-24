const http = require('http'); //to handle HTTP requests
const app = require('./app'); //imports the express application defined in app.js

const port = process.env.PORT || 3000; //either assign a port defined in the environment variables or if it isn't defined, assign 3000

const server = http.createServer(app); //requires a listener which sends a request to the server and recieves a response, here, the express app works as a listener

server.listen(port); //start the server