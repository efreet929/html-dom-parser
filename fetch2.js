// import the webserver module, and create a server
var server = require('webserver').create();

// start a server and register a request listener
var port = require('system').env.PORT || 8080; // default back to 8080

var service = server.listen(port, function(request, response) {

    var page = new WebPage();
    
    console.log('-------------------------------------------------------------------------------');
    console.log('Request at ' + new Date());
    //console.log(JSON.stringify(request, null, 4));

    var urlObj = parseGET(request.url);
    //var urlAddress = (typeof urlObj.url !== 'undefined') ? urlObj.url : "index.html";
    page.settings.resourceTimeout = urlObj.halttime;
    //console.log('address: ' + urlAddress);
    //console.log('halttime: ' + page.settings.resourceTimeout);
    //console.log('waittime: ' + urlObj.waittime);

    var redirectURLs = [],
    doLog = false;

    page.onResourceRequested = function(requestData, networkRequest) {
        if (doLog) console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData) + "\n");
        if (redirectURLs.indexOf(requestData.url) !== -1) {
            // this is a redirect url
            //console.log('REDIRECT URL!!');
            //networkRequest.abort();
        }
    };

    page.onResourceReceived = function(response) {
        if (doLog) console.log('Response (#' + response.id + ', stage "' + response.stage + '"): ' + JSON.stringify(response) + "\n");
        if (response.status >= 300 && response.status < 400 && response.redirectURL) { // maybe more specific
            //console.log('REDIRECT URL PUSHED.....');
            console.log('redirectURL: '+response.redirectURL);
            redirectURLs.push(response.redirectURL);
        }
    };
    
    console.log(phantom.cookies);

    page.open(urlObj.url, function () {
        window.setTimeout(function () {
            response.statusCode = 200;    // HTTP Code: OK
            response.write(page.content); // page.content, page.plainText, htmlContent
            response.close();

            page.close();
        }, urlObj.waittime);
    });
});
if (service) {
    console.log('===============================================================================');
    console.log('Server started - Connect to http://localhost:' + port + '...');
    console.log('Ctrl+C to close server');
    console.log('');
} else {
    console.log('Error: Could not create web server listening on port '+ port);
    phantom.exit();
}

function parseGET(url){
    var query = url.substr(url.indexOf("?")+1);
    var result = {};
    query.split("&").forEach(function(part) {
        var e = part.indexOf("=")
        var key = part.substr(0, e);
        var value = part.substr(e+1);
        result[key] = decodeURIComponent(value);
    });
  return result;
}