/*
*
* This file contains the helper functions
*/

//Dependencies

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


//export the helpers object
module.exports=helpers;