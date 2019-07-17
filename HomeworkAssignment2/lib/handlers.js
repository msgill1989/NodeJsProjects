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

//token handler
handlers.token=(data,callback)=>{
    const acceptableMethods=['get','post','put','delete'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._token[data.method](data,callback);
    }
    else{
        callback(405,{'Error':'This methid is not acceptable!'})
    }
};

//cart handler
handlers.cart=(data,callback)=>{
    const acceptableMethods=['get','post'];
    if(acceptableMethods.indexOf(data.method)>-1){
        handlers._cart[data.method](data,callback);
    }
    else{
        callback(405,{'Error':'Method is not acceptable!'})
    }
};

//checkOut Handler
handlers.checkout=(data,callback)=>{
    const acceptableMethods='post';
    if(data.method==acceptableMethods){
        handlers._checkout(data,callback);
    }
    else{
        callback(405,{'Error':'The given method is not acceptable.'})
    }
};

//_users object and container of all the user methods
handlers._users={};

//_token object and container of all the token methods
handlers._token={};

//_cart object and container of all the cart methods
handlers._cart={};

//Get method for users handler
//Mandatory fields: Email and tokenid
//Optional fiels:None
handlers._users.get=(data,callback)=>{
    const email= typeof(data.queryString.email)=='string' && data.queryString.email.trim().length>0 ?data.queryString.email: false;
    const tokenid=typeof(data.header.tokenid)=='string' && data.header.tokenid.trim().length==20 ?data.header.tokenid :false;
    if(email && tokenid){
        handlers._token.verifyToken(tokenid,email,(status)=>{
            if(status){
                _data.read('users',email,(err,userData)=>{
                    if(!err && userData){
                        callback(200,userData);
                    }
                    else{
                        callback(500,{'Error':'Error occured while fetching data from user file'});
                    }
                });
            }
            else{
                callback(401,{'Error':'The user with this token id don\'t have access to view user'});
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
    const streetAddress=typeof(data.payload.streetAddress)=='object' ?data.payload.streetAddress:false;
    
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
//Mandatory fields: email, correct token and passwsord
//optional fields: streetAddress, Name
handlers._users.put=(data,callback)=>{
    //Validate input parameters
    const email=typeof(data.payload.email)=='string' && data.payload.email.trim().length >0? data.payload.email.trim(): false;
    const name=typeof(data.payload.name)=='string' && data.payload.name.trim().length>0 ?data.payload.name : false;
    const streetAddress =typeof(data.payload.streetAddress) =='string' && data.payload.streetAddress.trim().length>0?data.payload.streetAddress:false;
    const password=typeof(data.payload.password)=='string' && data.payload.password.trim().length>0? data.payload.password: false;
    const tokenid=typeof(data.header.tokenid)=='string' && data.header.tokenid.trim().length==20? data.header.tokenid: false;

    if(email)
    {
        if(name || streetAddress){
            handlers._token.verifyToken(tokenid,email,(status)=>{
                if(status){
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
                    callback(403,{'Error':'The customer with this token is not authorized to modify this customer\'s data'})
                }
            });

        }
        else{
            callback(400,{'Error':'Either name or streetAddress are not in expected format!'})
        }
    }
    else{
        callback(400,{'Error':'The Mandatory fields are not provided!'})
    }
}

//delete method for users handler
//Mandatory fields: email and token id
handlers._users.delete=(data,callback)=>{

    const email=typeof(data.queryString.email)=='string' && data.queryString.email.trim().length>0 ?data.queryString.email :false;
    const tokenid=typeof(data.header.tokenid)=='string' && data.header.tokenid.trim().length==20? data.header.tokenid :false;
 
    if(email && tokenid){
        handlers._token.verifyToken(tokenid,email,(status)=>{
            if(status){
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
                callback(403,{'Error':'The users with this token in not authorized to delete user data.'})
            }
        });
    }
    else{
        callback(400,{'Error':'Mandatory fields \'email\' or \'tokenid\' is not provided!'})
    }
}

//GET method for token
//Mandatory fields: Header: tokenID and Querystring: email id
handlers._token.get=(data,callback)=>{
    const email=typeof(data.queryString.email)=='string' && data.queryString.email.trim().length>0? data.queryString.email: false;

    if(email){
                _data.read('tokens',tokenid,(err,tokenData)=>{
                    if(!err && tokenData){
                        callback(200,tokenData)
                    }
                    else{
                        callback(404,{'Error':'The provided token is not found!'})
                    }
                });
    }
    else{
        callback(400,{'Error':'The mandatory fields, email or tokenid are not provided!'})
    }
};

//POST method for token
//Mandatory fields, payload: Email and password
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

                    //token opject
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
//Mandatory fields: tokenId(string), extend(boolean),
handlers._token.put=(data,callback)=>{
    const tokenid=typeof(data.payload.tokenid)=='string' && data.payload.tokenid.trim().length==20 ? data.payload.tokenid :false;
    const extend=typeof(data.payload.extend)=='boolean' && data.payload.extend==true? true:false;
    console.log(data);
    if(tokenid && extend){
        _data.read('tokens',tokenid,(err,tokenData)=>{
        if(!err && tokenData){
            if(tokenData.expires<Date.now()){
                tokenData.expires=Date.now()+1000*60*60
                _data.update('tokens',tokenid,tokenData,(err)=>{
                if(!err){
                    callback(200,{'Success':'Token validity has been extended for 1 hour.'})
                }
                else{
                    callback(500,{'Error':'Error occured while updating token data.'})
                }
                });
            }
            else{
                callback(400,{'Error':'Token has already expired.'})
            }
        }
        else{
            callback(404,{'Error':'The given token Id is not found.'})
        }
        });
    }
    else{
        callback(400,{'Error':'The mandatory fields token ID or extend boolean are not provided.'})
    }
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
    const email=typeof(data.queryString.email)=='string' && data.queryString.email.trim().length>0 ? data.queryString.email :false;
    const tokenid=typeof(data.header.tokenid)=='string' && data.header.tokenid.trim().length==20 ?data.header.tokenid :false;

    if(email && tokenid){
        handlers._token.verifyToken(tokenid,email,(status)=>{
            if(status){
                _data.list('menuItems',(err, itemNames)=>{
                    if(!err && itemNames){
                        let allItems='';
                      itemNames.forEach(item => {
                          allItems=item+' , '+allItems;
                      });
                      const trimmedItems={
                          "items": allItems.replace(/,\s*$/,'')
                        }
                        callback(200,trimmedItems);
                    }
                    else{
                        callback(404,{'Error':'No items available in menuItems!'});
                    }
                });
            }
            else{
                callback(404,{'Error':'The user with this token id is not authorized to view menu items.'})
            }
        });
    }
    else{
        callback(400,{'Error':'The mandatory parameters are not provided!'});
    }
};

//Checkout method, Type:POST
//Mandatory fields: email and tokenID
handlers._checkout=(data,callback)=>{
    const email=typeof(data.queryString.email)=='string' && data.queryString.email.trim().length>0 ? data.queryString.email :false;
    const tokenid=typeof(data.header.tokenid)=='string' && data.header.tokenid.trim().length==20 ?data.header.tokenid :false;
    if(email && tokenid){
        handlers._token.verifyToken(tokenid,email,(status)=>{
            if(status){
                _data.read('users',email,(err,userData)=>{
                    if(!err && userData){
                       handlers._checkout.calculateTotal(userData.cart,(err,amount)=>{
                           helpers.stripeApiPayment(amount,config.environment.stripeApi.sourceToken,(err)=>{
                               if(!err){


                                let body='Hi Customer, Order has been successfully placed and $ #amount# has been debited from your card. Regards, Team Pizza App.'.replace('#amount#',(amount/100).toFixed(2));
                                //Mail API
                                helpers.sendEmail(email,body,(err)=>{
                                    if(!err){
                                        handlers._checkout.emptyCart(email,(err)=>{
                                            if(!err){
                                                callback(200,{'Success':'Order has been placed, Payment successfull, mail sent and basket cleared.'});
                                            }
                                            else{
                                                callback(500,{'Error':'Error occured while clearing the basket.'})
                                            }
                                        })
                                        
                                    }
                                    else{
                                        callback(500,{'Error':'Error occured while sending email to user.'})
                                    }
                                });
 
 
                            }
                               else{
                                   callback(500,{'Error':'Error occured while making the transaction to stripe API.'})
                               }
                           });
                       }); 
                    }
                    else{
                        callback(404,{'Error':'The user with this email id is not found.'})
                    }
                });
            }
            else{
                callback(401,{'Error':'This user with this tokenId is not authorized to checkOut. Please check if the tokenid is expired.'})
            }
        });
    }
    else{
        callback(400,{'Error':'Mandatory parameters are not provided eithrt rmail or tokenid.'});
    }
};

//Calculate the total amount of the cart
handlers._checkout.calculateTotal=(cart,callback)=>{

    let totalAmount=0;
    let counter=0;
    const len=cart.length;
    cart.forEach(item=>{
        _data.read('menuItems',item,(err,data)=>{
            counter++;
            totalAmount=totalAmount+data.price;
            if(counter==len){
                callback(false,totalAmount);
            }
        });
    });
};

//Empty the cart
handlers._checkout.emptyCart=(email,callback)=>{
  _data.read('users',email,(err,userData)=>{
      if(!err && userData){
        userData.cart=[];
        _data.update('users',email,userData,(err)=>{
            if(!err){
                callback(false);
            }
            else{
                callback(true);
            }
        })
      }
      else{
          callback(true);
      }
  });
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