/*
*
* This file contains the helper functions
*/

//Dependencies
const crypto=require('crypto');
const config=require('./config');
const https=require('https');
const queryString=require('querystring');



const helpers={};

//Parse the jsom string to Json object
helpers.parseJsonToObj=(JsonStr)=>{
    try {
        const jObj=JSON.parse(JsonStr)
        return jObj;
    } catch (e) {
        return {};
    }
};

//Hash the password
helpers.hashedPassword=(password)=>{
    if(typeof(password)=='string' && password.length>0){
        const hash= crypto.createHmac('sha256', config.environment.hashingSecrete,).update(password).digest('hex');
        return hash;
    }
    else{
        return false;
    }
};

//Create a random string
helpers.createRandomString=(len)=>{
    const strLen=typeof(len)=='number' && len>0? len:false;
    if(strLen){

        //define all the possible characters
        const possibleCharacters='abcdefghijklmnopqrstuvwxyz0123456789';

        //string placeholder
        let str='';

        for(i=1;i<=strLen;i++){
            const randomCharacter= possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));
            str+=randomCharacter;
        }
        //Return the final string
        return str;
    }
    else{
        return false;
    }
}; 

//create a stripe API method
helpers.stripeApiPayment=(amount,source,callback)=>{

    amount=typeof(amount)=='number' && amount>0? amount : false;
    source=typeof(source)=='string' && source.trim().length>0 ?source.trim() : false;
    if(amount && source){
        const payload={
            'amount':amount,
            'currency':'usd',
            'source': source
        };
    
        const stringPayload=queryString.stringify(payload);
    
        const requestDetails={
            'auth':config.environment.stripeApi.secretKey,
            'protocol':'https:',
            'hostname':'api.stripe.com',
            'path': '/v1/charges',
            'method':'POST',
            'headers':{        
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };
    
        const req=https.request(requestDetails,(res)=>{
            const status=res.statusCode;
            if(status==200 || status==201){
                callback(false);
            }
            else{
                callback('Status code returned was '+status);
            }
        });
    
        req.on('error',(e)=>{
            callback(e);
        });
    
        req.write(stringPayload);
    
        req.end();
    }
    else{
        callback('Given parameters are invalid or missing!');   
    }
};

//Mailgun , send email method
helpers.sendEmail=(to, body,callback)=>{
 
    const payload={
        'from': config.environment.mailGun.from,
        'to': to,
        'subject': 'Order Confirmation',
        'text': body
    };

    const stringPayLoad=queryString.stringify(payload)

    const requestDetails={
        'protocol':'https:',
        'hostname':'api.mailgun.net',
        'method':'POST',
        'path':'/v3/sandbox666cb2d2355247ca8651d6b40029f7a1.mailgun.org/messages',
        'auth': config.environment.mailGun.key,
        'headers':{
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayLoad)
        }
    };

    const req=https.request(requestDetails,(res)=>{
       const status=res.statusCode;

       console.log(status)
       if(status==200 || status==201){
        callback(false);
       }
       else{
           callback('Error occured while sending mail, code: '+status);
       }
    });

    req.on('error',(e)=>{
     callback(e);
    });

    req.write(stringPayLoad);

    req.end();

};

//export the helpers object
module.exports=helpers;