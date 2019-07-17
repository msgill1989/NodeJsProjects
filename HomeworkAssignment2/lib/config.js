/*
*
*
*This file contains the config variables
*/

//Create a config object
config={};

config.environment={
    "httpPort": 3000,
    "httpsPort": 3001,
    "hashingSecrete":"hashingSecret1",
    "stripeApi":{
        "secretKey":"sk_test_XXX",
        "sourceToken":"tok_visa"
    },
    "mailGun":{
        "key":"api:XXXXXX",
        "from":"pizzaApp@gillms89.com"
    }
}


//Export the config object
module.exports=config;
