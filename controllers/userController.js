const  connection  = require("../db.config");

exports.CreateUser = async(req,res) => {

    const {National_ID ,User_prefix ,User_Fname ,User_Lname ,User_gender ,User_Date_Birth ,User_age ,phone_num ,User_email ,User_status ,User_Image ,User_file} = req.body

    if ( !National_ID || !User_prefix || !User_Fname || !User_Lname|| !User_gender || !User_Date_Birth 
        || !User_age || !phone_num || !User_email||!User_status ||!User_Image ||!User_file
    ) {
        return res.status(400).send('Missing required fields');
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try{
        const [rows] = await connection.query('SELECT User_id FROM users ORDER BY User_id DESC LIMIT 1');
        let newUserId = 'A001';
        if (rows.length > 0) {
            let lastUserId = rows[0].User_id;
            
            // แยกตัวอักษรและตัวเลขออกจากรหัสล่าสุด
            let lastLetterPart = lastUserId.substring(0, 1); // ตัวอักษร
            let lastNumberPart = parseInt(lastUserId.substring(1), 10); // ตัวเลข

            if(lastNumberPart < 999){
                lastNumberPart += 1;
            }else{
                lastNumberPart = 1;
                if(lastLetterPart < 'Z'){
                    lastLetterPart = String.fromCharCode(lastLetterPart.charCodeAt(0) + 1);
                }else{
                    throw new Error('Reached maximum ID value');
                }
            }

            // สร้างรหัสใหม่
            newUserId = `${lastLetterPart}${lastNumberPart.toString().padStart(3, '0')}`;
        }

        connection.execute(`INSERT INTO users(User_id ,National_ID ,User_prefix ,User_Fname ,User_Lname ,User_gender ,User_Date_Birth ,User_age ,User_phone_num ,User_email ,User_status ,User_Image ,User_file ,created_at ,update_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? ,? ,? ,? ,?);`,
            [
                newUserId, National_ID, User_prefix, User_Fname, User_Lname, User_gender, User_Date_Birth, User_age, phone_num, User_email ,User_status ,User_Image ,User_file ,now ,now
            ]
        );

        console.log("Insert successfully");
        res.status(201).send('User register successfully');

    }catch (err){
        res.status(500).json({message :err.messages})
    }
    
}