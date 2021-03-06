/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var results = require('./messages');
var fs = require('fs');

var requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  const {method, url} = request;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  

  if (url === '/') {
   // headers['Content-Type'] = 'text/html';
    fs.readFile('./server/index.html', function(err, data) {
      console.log('data', data);
      if (err) {
        console.log(err);
      }
      // response.writeHead(200, headers);
      // response.write(data);
      response.end(data.toString());
    });
  } else if (!url.startsWith('/classes/messages')) {
    response.writeHead(404, headers);
    response.end();
  } else if (method === 'GET' || method === 'OPTIONS') {
    
    const responseBody = {};
    var queries = url.match(/\?(.+)=(.+)/);

    if (queries && queries[1] === 'order' && queries[2] === '-createdAt') {
      responseBody.results = results.slice().reverse();
    } else {
      responseBody.results = results;
    }
    response.writeHead(200, headers);
    response.end(JSON.stringify(responseBody));
  } else if (method === 'POST') {
    let body = [];
    request.on('error', () => {
      console.error('ERROR!');
    });
    request.on('data', (chunk) => {
      body.push(chunk);
    });
    request.on('end', () => {
      body = body.toString();
      let message = JSON.parse(body);
      message.createdAt = new Date().toISOString();
      message.objectId = results.length + 1;

      results.push(message);
      response.writeHead(201, headers);
      response.end(JSON.stringify(message));
    });

  } else {
    response.writeHead(400, headers);
    response.end('');
  }  
};



exports.requestHandler = requestHandler;
