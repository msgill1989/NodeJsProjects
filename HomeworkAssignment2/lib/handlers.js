/*
*
*This file contains all the handlers
*/

//Dependencies\


//Handlers object
const handlers={};


// users handler
handlers.users=(data,callback)=>{
    
    //Acceptable methods
    const acceptableMethods=['get','put','delete','post'];

    //Validate if the request method is one of the 4 methods
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._users[data.method](data,callback);
    }
    else{
        console.log(data.method);
        callback(405);
    }
};

//_users object and container of all the methods
handlers._users={};

//Get method for users handler
handlers._users.get=(data,callback)=>{

callback(200,{'This is':'from Get method'});
};

//post method for users handler
handlers._users.post=(data,callback)=>{


}

//put method for users handler
handlers._users.put=(data,callback)=>{


}

//delete methid for users handler
handlers._users.delete=(data,callback)=>{


}







handlers.notFound=(data,callback)=>{
    callback(400,{'Error':'This is not found'})
};


//export the handlers object
module.exports=handlers;