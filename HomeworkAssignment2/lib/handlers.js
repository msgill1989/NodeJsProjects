/*
*
*This file contains all the handlers
*/

//Dependencies\
const _data=require('./data');


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
//Mandatory fields: FileName
handlers._users.get=(data,callback)=>{
    const email= typeof(data.queryString.email)=='string' && data.queryString.email.trim().length>0 ?data.queryString.email: false;

    if(email){
        _data.read('users',email,(err,userData)=>{
            if(!err){
                callback(200,userData);
            }
            else{
                callback(500,{'Error':'Error occured while fetching data from user file'});
            }
        });
    }
    else{
        callback(400,{'Error':'Mandatory field is not provided!'})
    }
};

//post method for users handler
//Mandatory fields: Email, Name, Street Address
//Optional fields: None
handlers._users.post=(data,callback)=>{
    //Validate the incoming fields
    const name=typeof(data.payload.name)=='string' && data.payload.name.trim().length >0 ? data.payload.name: false;
    const email=typeof(data.payload.email)=='string' && data.payload.email.trim().length>0 ?data.payload.email :false;
    const streetAddress=typeof(data.payload.streetAddress)=='string' && data.payload.streetAddress.trim().length>0 ?data.payload.streetAddress:false;

    if(name && email && streetAddress){

        _data.read('users',email,(err)=>{
            if(err){

                //Form a JSON string of thr incoming data
            const userData={
            "name":name,
            "email":email,
            "streetAddress":streetAddress
            };
    
            //Insert the data to a file in users directory
            _data.write('users',email,userData,(err)=>{
                if(!err){
                    callback(200,{'Success':'New user has been created!'});
                }
                else{
                    callback(500,{'Error':'Could not create a new user!'})
                }
            });
            }
            else{
                callback(400,{'Error':'The requested user is already there in users directory'});
            }
        });
    }
    else{
        callback(400,{'Error':'Required fields are missing'});
    }
}

//put method for users handler
//Mandatory fields: email
//optional fields: streetAddress, Name
handlers._users.put=(data,callback)=>{
    //Validate input parameters
    const email=typeof(data.payload.email)=='string' && data.payload.email.trim().length >0? data.payload.email: false;
    const name=typeof(data.payload.name)=='string' && data.payload.name.trim().length>0 ?data.payload.name : false;
    const streetAddress =typeof(data.payload.streetAddress) =='string' && data.payload.streetAddress.trim().length>0?data.payload.streetAddress:false;

    if(email)
    {
        if(name || streetAddress){
            _data.read('users',email,(err,userData)=>{
                if(!err && userData){
                    //Update the fields
                    if(name){
                        userData.name=name;
                    }
                    if(streetAddress){
                        userData.streetAddress=streetAddress;
                    }
                    //update the data
                    _data.update('users',email,userData,(err)=>{
                        if(!err){
                            callback(200,{'Success':'User data has been updated successfully!'})
                        }
                        else{
                            callback(500,{'Error':'Error occured while updating the data!'})
                        }
                    });
                }
                else{
                    callback(400,{'Error':'The user with this email is not found!'});
                }
            });
        }
        else{
            callback(400,{'Error':'Either name or streetAddress are not in expected format!'})
        }
    }
    else{
        callback(400,{'Error':'The Mandatory email is not provided!'})
    }
}

//delete methid for users handler
//Mandatory fields: email
handlers._users.delete=(data,callback)=>{

    const email=typeof(data.queryString.email)=='string' && data.queryString.email.trim().length>0 ?data.queryString.email :false;
    if(email){
        _data.read('users',email,(err,data)=>{
            if(!err && data){
                _data.delete('users',email,(err)=>{
                    if(!err){
                        callback(200,{'Success':'File deleted successfully!'})
                    }
                    else{
                        callback(500,{'Error':'Error occured while deleting the file!'})
                    }
                });
            }
            else{
                callback(400, {'Error':'The file with this email does not exist!'})
            }
        });

    }
    else{
        callback(400,{'Error':'Mandatory field \'email\' is not provided!'})
    }
}


handlers.notFound=(data,callback)=>{
    callback(400,{'Error':'This handler is not found!'})
};


//export the handlers object
module.exports=handlers;