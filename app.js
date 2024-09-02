const express = require('express');
const dot_env = require('dotenv');
const app = express();
dot_env.config();

const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))

const authRoute = require('./routes/auth_admin');
app.use('/api/auth/admin',authRoute);

const UserRoute = require('./routes/User');
app.use('/api/user',UserRoute);

app.use('/',function(req,res,next){
    res.sendStatus(404);
});

app.listen(PORT, ()=>
    console.log(`Server running on port : `+PORT)
);