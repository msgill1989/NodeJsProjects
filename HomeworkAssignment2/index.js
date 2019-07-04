/*
 *
 *This is the primary index.js file
 */

//Dependencies
const http= require('http');
const url=require('url');
const StringDecoder=require('string_decoder').StringDecoder;
const helpers=require('./lib/helpers');
const handlers=require('./lib/handlers');

helpers.stripeApiPayment();

//Create the HTTP server
const server=http.createServer((req,res)=>{
    
    //Get the path of the request
    const parsedUrl=url.parse(req.url,true);
    const path=parsedUrl.pathname;
    const trimmedPath=path.replace(/^\/+|\/+$/g,'')

    //get the query string
    const queryString=parsedUrl.query;
    
    //Get the header of the request
    const headers=req.headers;
    
    //Fetch the method
    const method=req.method.toLowerCase();

    //Get the payload from body of the request
    const decoder= new StringDecoder('utf-8');
    let buffer='';
    req.on('data',(data)=>{
        buffer+=decoder.write(data);
    });
    
    req.on('end',()=>{
        buffer +=decoder.end();
        
        //Gather all the request variables to a data object
        const data={
            'path': trimmedPath,
            'queryString':queryString,
            'method': method,
            'header':headers,
            'payload':helpers.parseJsonToObj(buffer)
        }

        //Check if the specified router has the handler
        const chooseHandler=typeof(routers[trimmedPath])!=='undefined'? routers[trimmedPath]: routers.notFound;

        chooseHandler(data,(statusCode,payload)=>{

            statusCode=typeof(statusCode)=='number'? statusCode: 200;
            payload=typeof(payload)=='object'? payload:{};
            
            const strPayload=JSON.stringify(payload);
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(strPayload);
        });
    });
});

//Routers
routers={
  'users':handlers.users,
  'notFound':handlers.notFound,
  'tokens':handlers.token,
  'AddItems':handlers.cart,
};

//Start the server 
server.listen(3000,()=>{
    console.log('server is running on port')
});