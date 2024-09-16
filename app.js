const express = require('express');
const dot_env = require('dotenv');
const app = express();
const path = require('path'); 
dot_env.config();

const PORT = process.env.PORT || 3000;

app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))

app.use(express.static(path.join(__dirname, 'public')));

const authRoute = require('./routes/auth_admin');
app.use('/api/auth/admin',authRoute);

const UserRoute = require('./routes/User');
app.use('/api/user',UserRoute);

const adminRoute = require('./routes/admin_action');
app.use('/api/admin',adminRoute);

const ProjectRoute = require('./routes/project');
app.use('/api/project',ProjectRoute);

app.get('/smp/sci/tsu', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin', 'login.html')); //Login
});

app.get('/admin/projects', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin', 'projects.html')); // แสดงโครงการทั้งหมด
});

app.get('/admin/add/project', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin', 'add_project.html')); // เพิ่มโครงการ
});

app.get('/admin/project/view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin', 'detail_project.html')); // เพิ่มดูรายละเอียดโครงการ
});

app.get('/admin/project/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin', 'update_project.html')); //แก้ไข้โครงการ
});

app.get('/admin/list/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin', 'Users.html')); // ตรวจสอบรายชื่อผู้สมัคร
});

app.get('/admin/user/examine', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin', 'examineUser.html')); // รายละเอียดผุ้สมัคร
});


app.get('/users/project', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/users', 'UserProject.html')); // แสดงโครงการหน้า User
});

app.get('/users/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/users', 'user_register.html')); // สมัครเข้าโครงการ
});

app.get('/user/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/users', 'user_search.html')); // ค้นหาผู้สมัครหน้า user
});

app.get('/homepage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Homepage.html')); // แสดงหน้าหลัก
});


// ให้บริการไฟล์จากโฟลเดอร์ uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/',function(req,res,next){
    res.sendStatus(404);
});

app.listen(PORT, ()=>
    console.log(`Server running on port : `+PORT)
);