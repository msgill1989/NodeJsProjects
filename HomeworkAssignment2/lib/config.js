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
        "secretKey":"sk_test_oBfW5G1NQJPEGsiQsy1CEQWm00O2DPJVj4",
        "sourceToken":"tok_visa"
    },
    "mailGun":{
        "key":"api:f50306b07d5dfff0097c6efb626ac689-2b0eef4c-c5f86c4a",
        "from":"pizzaApp@gillms89.com"
    }
}


//Export the config object
module.exports=config;