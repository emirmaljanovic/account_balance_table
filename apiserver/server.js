var fs = require('fs');
var url = require('url');
var path = require('path');
var http = require('http');
var indexPage = fs.readFileSync(path.join(__dirname, 'client/index.html'));
var result = require('./result.json');
var port = 8080;

// Used for required Content-Type
var mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'appliaction/vnd.ms-fontobject',
    '.ttf': 'aplication/font-sfnt'
};

var server = http.createServer(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.url === '/api/getbalance') {
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        var random = Math.random();
        if (random  >= 0.8) {
            res.writeHead(503);
            res.end();
        } else {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.write(JSON.stringify(result, 0, 4));
            res.end();
        }
    } else {
        var parsedUrl = url.parse(req.url);
        var pathname = `.${parsedUrl.pathname}`;

        if (fs.existsSync(path.join(__dirname, pathname))){
            pathname = path.join(__dirname, pathname);
            
            // if is a directory, then look for index.html
            if (fs.statSync(pathname).isDirectory()) {
                pathname += '/index.html';
                if (req.url === '/') pathname = path.join(__dirname, 'client/index.html');
            }
            // read file from file system
            fs.readFile(pathname, function(err, data){
                if(err){
                    res.statusCode = 500;
                    res.end(`Error getting the file: ${err}.`);
                } else {
                    // based on the URL path, extract the file extention. e.g. .js, .doc, ...
                    var ext = path.parse(pathname).ext;
                    // if the file is found, set Content-type and send data
                    res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
                    res.end(data);
                }
            });
        } else {
            // if the file is not found, return 404
            res.statusCode = 404;
            res.end(`File ${pathname} not found!`);
            return;
        }
    }
});

server.listen(port, function(){
    console.log("Server listening on: http://localhost:%s", port);
});