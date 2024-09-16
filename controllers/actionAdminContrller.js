const  connection  = require("../db.config");


exports.admin_getUsers = async(req,res)=>{
    const project_id = req.params.project_id;

     connection.execute('SELECT User_id, User_Fname, User_Lname, User_phone_num, User_email  FROM users WHERE project_id_fk = ?', [project_id]).then((result) => {
        
        var rawData = result[0];
        res.send(rawData);  
     
         }).catch((err) => {
            console.log(err);
            res.end();
     
         });

}

exports.admin_UpdateUser =  async(req,res) =>{
    const {User_status} = req.body;
    const now = new Date().toISOString().slice(0,19).replace('T', ' ');

    connection.execute("UPDATE users SET User_status=? ,update_at=? WHERE User_id=?",
        [User_status,now, req.params.id]
    ).then(() =>{
        console.log('Update Successfully');
        res.status(200).send("Update Successfully.");
    }).catch((err) => {
        console.log(err);
        res.status(500).send("Error updating user.");
    });
}

exports.admin_getUser = async(req,res)=>{
    const id = req.params.user_id;

    try {
        const [rows] = await connection.execute('SELECT User_id, National_ID, User_prefix, User_Fname, User_Lname, User_gender, User_Date_Birth, User_age, User_phone_num, User_email, User_status, User_Image, User_file, project_id_fk  FROM users WHERE User_id  = ?', [id]);
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving user');
    }
}

exports.admin_DeleteUser = async(req,res) =>{
    connection.execute("DELETE FROM users WHERE User_id =?;",
        [req.params.id]
    ).then(() =>{
        console.log('Delete Successfully');
    }).catch((err) =>{
        console.log(err);
    });
    res.status(200).send("Delete Successfully.");
    res.end();
}



