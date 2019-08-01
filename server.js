// modules to import
const http = require('http'),
    fs = require('fs'),
    url = require('url');

http.createServer((request, response) => {
    var addr = request.url,
        q = url.parse(addr, true),
        filePath = '';

    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    } /* redirection to index page, if no documentation in url */

    fs.readFile(filePath, function(err, data) {
        if (err) {
            throw err;
        } /* throw an error and terminate the function if the file can’t be read */

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(data);
        response.end('What is your favorite movie?');
    });

    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Added to log.');
        } 
    }); /* to log the request URL and a timestamp */
}).listen(8080); /* end of function to create a server on 8080 port */