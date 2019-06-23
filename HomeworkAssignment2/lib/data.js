/*
*
*
*This file contains all the data manupulation methods
*/


//Dependencies
const path=require('path');
const fs=require('fs');
const path=require('path');



//Data object
const data={};

//set the base directory i.e. .data
data.baseDir=path.join(__dir,'/../.data')

//Write function
//Mandatory parameters: Name, emailAdd, StreetAdd 
//optional parameters: None
data.write=(dir,file,data,callback)=>{
    //Open the file for writting
    fs.open(data.baseDir+dir+'/'+file+'.json','wx',(err,fileDescriptor)=>{
        if(!err && fileDescriptor){

            //Convert the data to string
            const strData=JSON.stringify(data);

            //Write data to file
            fs.write(fileDescriptor,strData,(err)=>{
                if(!err){
                    //if successfull, close the file
                    fs.close(fileDescriptor,(err)=>{
                        if(!err){
                            callback(false);
                        }
                        else{
                            callback('Error closing the file');
                        }
                    });
                }
                else{
                    callback('Erro while writing data to the file');
                }
            });
        }
        else{
            callback('Could not create a new file, it may already exist');
        }
    });
};

//Get function
data.get=()=>{

}

//Update function
data.get=()=>{

};

//delete function
data.delete=()=>{

};


//Export the data object
module.exports=data;