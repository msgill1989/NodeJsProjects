/*
*
*This file contains all the handlers
*/

//Dependencies\
const _data=require('./data');
const helpers=require('./helpers');


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

//handler's token
handlers.token=(data,callback)=>{
    const acceptableMethods=['get','post','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._token[data.method](data,callback);
    }
    else{
        callback(405,{'Error':'This methid is not acceptable!'})
    }
};

//Container of all the cart methods
handlers.cart=(data,callback)=>{
    const acceptableMethods=['get','post','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._cart[data.method](data,callback);
    }
    else{
        callback(405,{'Error':'Method is not acceptable!'})
    }
};

//_users object and container of all the methods
handlers._users={};

//Container of all the methods for token handler
handlers._token={};

//Container for all the cart methods
handlers._cart={};

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
    const password=typeof(data.payload.password)=='string' && data.payload.password.trim().length>0 ?data.payload.password: false;
    const streetAddress=typeof(data.payload.streetAddress)=='string' && data.payload.streetAddress.trim().length>0 ?data.payload.streetAddress:false;

    if(name && email && streetAddress){

        _data.read('users',email,(err)=>{
            if(err){

           //Get te hashed password
           const hashedPassword=helpers.hashedPassword(password);     

            //Form a JSON string of thr incoming data
            const userData={
            "name":name,
            "email":email,
            "password":hashedPassword,
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
    const password=typeof(data.payload.password)=='string' && data.payload.password.trim().length>0? data.payload.password: false;

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
                    if(password){
                        userData.password=helpers.hashedPassword(password);
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

//delete method for users handler
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

//GET method for token
//Mandatory fields: token ID
handlers._token.get=(data,callback)=>{
    const tokenId=typeof(data.queryString.tokenId)=='string' && data.queryString.tokenId.trim().length==20? data.queryString.tokenId : false;
    if(tokenId){
        _data.read('tokens',tokenId,(err,tokenData)=>{
            if(!err && tokenData){
                callback(200,tokenData)
            }
            else{
                callback(404,{'Error':'The provided token is not found!'})
            }
        });
    }
    else{
        callback(400,{'Error':'The mandatory field is not provided!'})
    }
};

//POST method for token
//Mandatory fields: EMail and password
handlers._token.post=(data,callback)=>{
    const email= typeof(data.payload.email)=='string' && data.payload.email.trim().length>0?data.payload.email:false;
    const password=typeof(data.payload.password)=='string' && data.payload.password.trim().length>0? data.payload.password:false;

    if(email && password){
        _data.read('users',email,(err,userData)=>{
            if(!err && userData){
                const hashedPassword=helpers.hashedPassword(password);
                if(userData.password==hashedPassword){
                    const tokenId=helpers.createRandomString(20);
                    const expires=Date.now()+1000*60*60;

                    //tokem opject
                    const tokenObj={
                        'email': email,
                        'tokenId':tokenId,
                        'expires':expires
                    };

                    //Create a token in tokens directory
                    _data.write('tokens',tokenId,tokenObj,(err)=>{
                        if(!err){
                            callback(200,tokenObj);
                        }
                        else{
                            callback(500,{'Error':'Error occured while creating the token!'});
                        }
                    });
                }
                else{
                    callback(404,{'Error':'The password of this specified user did not match to the stored password!'})
                }
            }
            else{
                callback(400,{'Error':'Can not find specified user!'});
            }
        });
    }
    else{
        callback(400,{'Error':'The mandatory fields are not provided'});
    }
};

//PUT method for token
handlers._token.put=(data,callback)=>{
    
};

//DELETE method for token
//MandatoryFields: tokenId
handlers._token.delete=(data,callback)=>{
    const tokenId=typeof(data.queryString.tokenId)=='string' && data.queryString.tokenId.trim().length==20? data.queryString.tokenId :false;
    if(tokenId){
        _data.read('tokens',tokenId,(err,tokenData)=>{
            if(!err && tokenData){
                _data.delete('tokens',tokenId,(err)=>{
                    if(!err){
                        callback(200,{'Success':'Token deleted successfully!'})
                    }
                    else{
                        callback(500,{'Error':'Error occured while deleting the token!'})
                    }
                });
            }
            else{
                callback(400,{'Error':'Requested token is not found!'});
            }
        });
    }
    else{
        callback(400,{'Error':'The mandatory field is not provided!'});
    }
};

//Post method for cart
//Mandatory fields: TokenID, 
handlers._cart.post=(data,callback)=>{
    const tokenId=typeof(data.header.tokenid)=='string' && data.header.tokenid.trim().length==20 ? data.header.tokenid :false;
    const email =typeof(data.queryString.email) =='string' && data.queryString.email.trim().length>0? data.queryString.email :false;

    handlers._token.verifyToken(tokenId,email,(status)=>{
        if(status){
            _data.list('menuItems',(err,listItems)=>{
                if(!err && listItems && listItems.length>0){
                    _data.read('users',email,(err,userData)=>{
                        if(!err &&userData){

                            const cart=typeof(userData.cart)=='object' && userData.cart instanceof Array ? userData.cart:[];
                            listItems.forEach(productId => {
                                userData.cart=cart;
                                userData.cart.push(productId);
                            });
                            _data.update('users',email,userData,(err)=>{
                                if(!err){
                                    callback(200,{'Success':'Items have been added to the card!'})
                                }
                                else{
                                    callback(500,{'Error':'Error occured while updating user data with cart items!'})
                                }
                            });
                        }
                        else{
                            callback(500,{'Error':'The user data is not getting fetched!'});
                        }
                    });
                    
                }
                else{
                    callback(400,{'Error':'There is not any item to add to cart.'})
                }
            })
        }
        else{
            callback(404,{'Error':'The user is not authorised to add menu items!'})
        }
    });
};

//get method for cart
//Mandatory Fields: token ID and email
handlers._cart.get=(data,callback)=>{
    
};

//put method for cart
handlers._cart.put=(data,callback)=>{
    
};

//delete method for cart
handlers._cart.delete=(data,callback)=>{
    
};

handlers.notFound=(data,callback)=>{
    callback(400,{'Error':'This handler is not found!'})
};

//Verify that the given token is Valid
handlers._token.verifyToken=(tokenId,email,callback)=>{
    _data.read('tokens',tokenId,(err,tokenData)=>{
        if(!err && tokenData){
            if(tokenData.email==email && tokenData.expires>Date.now()){
                callback(true);
            }
            else{
                callback(false);
            }
        }
        else{
            callback(false);
        }
    });
}

//export the handlers object
module.exports=handlers;