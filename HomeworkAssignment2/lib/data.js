/*
*
*
*This file contains all the data manupulation methods
*/


//Dependencies
const path=require('path');
const fs=require('fs');
const helpers=require('./helpers');



//Data object
const lib={};

//set the base directory i.e. .data
lib.baseDir=path.join(__dirname,'/../.data/');

//Write function
//Mandatory parameters: Name, emailAdd, StreetAdd 
//optional parameters: None
lib.write=(dir,file,data,callback)=>{
    //Open the file for writting
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',(err,fileDescriptor)=>{
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
            console.log(lib.baseDir);
            callback('Could not create a new file, it may already exist');
        }
    });
};

//Get function
//Mandatory parameters:directory, fileName
lib.read=(dir,file,callback)=>{
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8',(err,data)=>{
        if(!err && data){
            const parsedata=helpers.parseJsonToObj(data)
            callback(false,parsedata);    
        }
        else{
             callback(err,data);
        }
    });
}

//Update function
//Mandatory Parameters: directory, filename, data
lib.update=(dir,file,data,callback)=>{
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',(err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            const strData=JSON.stringify(data);
            fs.ftruncate(fileDescriptor,(err)=>{
                if(!err){
                    fs.writeFile(fileDescriptor,strData,(err)=>{
                        if(!err){
                            fs.close(fileDescriptor,(err)=>{
                                if(!err){
                                    callback(false);
                                }
                                else{
                                    callback('Error in closing the file!');
                                }
                            });
                        }
                        else{
                            callback('Error in writing to file.');
                        }
                    });
                }
                else{
                    callback('Error truncating the file.');
                }
            });
        }
        else{
            callback('Could not open the file for updating');
        }
    });
};

//delete function
//Mandatory fields: File Name
lib.delete=(dir,file,callback)=>{
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',(err)=>{
        if(!err){
            callback(false);
        }
        else{
            callback('Error in deleting the file!');
        }
    });
};

//List all the file name in a directory
lib.list=(dir,callback)=>{
    fs.readdir(lib.baseDir+dir+'/',(err,data)=>{
        if(!err && data &&data.length>0){
            let trimmedFileNames=[];
            data.forEach(fileName=>{
                trimmedFileNames.push(fileName.replace('.json',''));
            });
            callback(false,trimmedFileNames);
        }
        else{
            callback(err,data);
        }
    });
};


//Export the data object
module.exports=lib;