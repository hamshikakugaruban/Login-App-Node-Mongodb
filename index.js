const express = require("express");
const bodyParser = require("body-parser");
const user = require("./routes/user")
const InitiateMongoServer = require("./config/db");
InitiateMongoServer();

const app = express();
const port = process.env.port || 8083;

app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get("/", (req,res) => {
    res.json({
        message : "API working"
    })
})

app.use("/user",user)

app.listen(port,(req,res) => {
    console.log(`server started at port ${port}`);
})