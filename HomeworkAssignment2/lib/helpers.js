/*
*
* This file contains the helper functions
*/

//Dependencies
const crypto=require('crypto');



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

//export the helpers object
module.exports=helpers;