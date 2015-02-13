// import the webserver module, and create a server
var server = require('webserver').create();

// start a server and register a request listener
var port = require('system').env.PORT || 8080; // default back to 8080

var urlObj;
var urlAddress

var service = server.listen(port, function(request, response) {

    var page = new WebPage();
    
    console.log('-------------------------------------------------------------------------------');
    console.log('Request at ' + new Date());
    console.log(JSON.stringify(request, null, 4));

    urlObj = parseGET(request.url);
    urlAddress = (typeof urlObj.url !== 'undefined') ? urlObj.url : "index.html";
    if (typeof urlObj.timeout !== 'undefined') {
        page.settings.resourceTimeout = urlObj.timeout;
    }
    console.log('address: '+urlAddress);
    console.log('timeout: '+page.settings.resourceTimeout);

    /*
    page.onResourceRequested = function(requestData, networkRequest) {
    //console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData, null, 4));
    //if ((/http:\/\/.+?\.css/gi).test(requestData['url']) || requestData.headers['Content-Type'] == 'text/css') {
        if (urlAddress === 'undefined') {
            networkRequest.abort();
        }
    };*/

    page.open(urlAddress, function () {
        response.statusCode = 200;    // HTTP Code: OK
        response.write(page.content); // page.content, page.plainText, htmlContent
        response.close();

        page.close();
    });
});
if (service) {
    console.log('===============================================================================');
    console.log('Server started - Connect to http://localhost:' + port + '...');
    console.log('Ctrl+C to close server');
    console.log('');
} else {
    console.log('Error: Could not create web server listening on port ' + port);
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