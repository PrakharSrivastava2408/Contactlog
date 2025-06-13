const express = require("express");
const env=require("dotenv").config();
const app=express();
const port=process.env.port;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/contacts",require("./routes/contact"));
app.use("/api/users",require("./routes/users"));

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

app.get("/",(req,res)=>{
    res.send("Hello World");
});