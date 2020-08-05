const mongoose = require("mongoose");
const mongoURL = "mongodb+srv://root:root@cluster0.6j5px.mongodb.net/test?retryWrites=true&w=majority";
const InitiateMongoServer = async () => {
    try{
        await mongoose.connect(mongoURL,{
            useNewUrlParser:true
        })
        console.log("connected to Db");
    }
    catch(err){
        throw err;
    }
}
module.exports = InitiateMongoServer;