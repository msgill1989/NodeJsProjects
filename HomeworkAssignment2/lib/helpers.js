/*
*
* This file contains the helper functions
*/

//Dependencies
const crypto=require('crypto');
//const config=require('config');
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
        const hash= crypto.createHmac('sha256','hashingSecret1',).update(password).digest('hex');
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
helpers.stripeApiPayment=()=>{

    console.log('Im from payment');

    const payload={
        'amount':2000,
        'currency':'usd',
        source: 'tok_mastercard'
    };

    const stringPayload=queryString.stringify(payload);
    console.log(stringPayload);
    console.log(JSON.stringify(payload));
    const requestDetails={
        'auth':'sk_test_oBfW5G1NQJPEGsiQsy1CEQWm00O2DPJVj4',
        'protocol':'https:',
        'hostname':'api.stripe.com',
        'path': '/v1/charges',
        'method':'POST',
        'source':'tok_visa',
        'headers':{        
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload)
        }
    };

    const req=https.request(requestDetails,(res)=>{
        console.log(res.statusCode);
    });

    req.on('error',(e)=>{
        console.log('this is error');
    });

    req.write(stringPayload);

    req.end();

};

//export the helpers object
module.exports=helpers;