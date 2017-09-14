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

  if (!url.startsWith('/classes/messages')) {
    response.writeHead(404, headers);
    response.end();
  } else if (method === 'GET' || method === 'OPTIONS') {
    console.log('inside GET OR OPTIONS!');
    
    const responseBody = {};
    var queries = url.match(/\?(.+)=(.+)/);

    if (queries[1] === 'order' && queries[2] === '-createdAt') {
      responseBody.results = results.slice().reverse();
    } else {
      responseBody.results = results;
    }

    console.log('results', responseBody.results);
    response.writeHead(200, headers);
    response.end(JSON.stringify(responseBody));
  } else if (method === 'POST') {
    console.log('inside POST!');
    let body = [];
    request.on('error', () => {

      console.error('ERROR!');
    });
    request.on('data', (chunk) => {
      body.push(chunk);
    });
    request.on('end', () => {
      body = body.toString();
      var message = JSON.parse(body);
      message.createdAt = new Date().toISOString();
      message.objectId = results.length + 1;
      results.push(message);
      console.log(message);

      response.writeHead(201, headers);
      response.end(JSON.stringify(message));
    });
  }
  
//


  
};



exports.requestHandler = requestHandler;
