const http = require('http')
const url=require('url');

//Create the HTTP server
const server= http.createServer((req,res)=>{

    //get the parsed url
    let parsedUrl=url.parse(req.url,true);

    //get the pathname from the URL
    let path= parsedUrl.pathname;

    //remove the slashes in the front and back
    let trimmedUrl= path.replace(/^\/+|\/+$/g,'');

    //Selest the "Hello" handler else "notFound" handler
    const choosenHandler= typeof(routers[trimmedUrl])!=='undefined' ? routers[trimmedUrl] : handlers.notFound;

    choosenHandler((statusCode, payload)=>{
        statusCode=typeof(statusCode)=='integer'?statusCode : 200;
        payload=typeof(payload)!=='undefined' ? payload : {};

        //String Json
        let strPayload= JSON.stringify(payload);

        //set the Headers of the response
        res.setHeader('Content-Type','application/Json');

        //Display the JSON string payload 
        res.end(strPayload);
    });
});

//Start the server
server.listen(3000, console.log('Server is listening on 3000 port'));

//Define the handlers
handlers={};

handlers.hello= (callback)=>{
    callback(200,{'message':'Hi! this is Node JS.'})
};

handlers.notFound=(callback)=>{
    callback(404)
};

//Define the routers
routers= {
    'hello': handlers.hello
};