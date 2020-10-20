const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

app.get("/",function(req,res){
    res.send("<h1>College Registration System</h1>")
})

app.listen(3000,function(){
    console.log("Server started at 3000");
})