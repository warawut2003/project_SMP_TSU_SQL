const  connection  = require("../db.config");
const multer = require('multer');
const path = require('path'); // เพิ่มบรรทัดนี้เพื่อเรียกใช้งานโมดูล path
const fs = require('fs');
// const moment = require('moment'); // ใช้ moment.js สำหรับจัดการวันที่
const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        const uploadDir = '/Project/system_recruitment_TSU_SMP/uploads/ProjectFile';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename : function (req,file,cb){
        const decodedFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null,decodedFileName);
    }
})
const upload = multer({storage})



// ฟังก์ชันสำหรับลบไฟล์
const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

exports.createProject = [
    upload.single('ProjectFile'), // ใช้ multer middleware
    async (req, res) => {
        const { ProjectName, Openday, Turnoffday } = req.body;
        const ProjectFile = req.file ? req.file.filename : null;// รับชื่อไฟล์

        

        // ตรวจสอบความครบถ้วนของข้อมูล
        if (!ProjectName || !Openday || !Turnoffday || !ProjectFile) {
            return res.status(400).send('Missing required fields');
        }

        try {
            // สร้างรหัสโครงการใหม่
            const [rows] = await connection.query('SELECT project_id FROM PROJECTS ORDER BY project_id DESC LIMIT 1');
            let newProjectId = 'A0001';
            if (rows.length > 0) {
                let lastProjectId = rows[0].project_id;

                let lastLetterPart = lastProjectId.substring(0, 1);
                let lastNumberPart = parseInt(lastProjectId.substring(1), 10);

                if (lastNumberPart < 9999) {
                    lastNumberPart += 1;
                } else {
                    lastNumberPart = 1;
                    if (lastLetterPart < 'Z') {
                        lastLetterPart = String.fromCharCode(lastLetterPart.charCodeAt(0) + 1);
                    } else {
                        throw new Error('Reached maximum ID value');
                    }
                }

                newProjectId = `${lastLetterPart}${lastNumberPart.toString().padStart(4, '0')}`;
            }

            // แทรกข้อมูลลงในฐานข้อมูล
            await connection.execute(`INSERT INTO projects (project_id, project_name, project_file, project_start_date, project_expiration_date) VALUES (?, ?, ?, ?, ?);`,
                [
                    newProjectId, ProjectName, ProjectFile, Openday, Turnoffday
                ]
            );

            console.log("Successfully added");
            res.status(201).send('Successfully added');

        } catch (err) {
            console.error(err);
            res.status(500).send('An error occurred adding');
        }
    }
];
exports.deleteProject = async (req, res) => {
    const { project_id } = req.params;

    if (!project_id) {
        return res.status(400).send('Project ID is required');
    }

    try {
        const [rows] = await connection.execute('SELECT project_file FROM projects WHERE project_id = ?', [project_id]);


        if (rows.affectedRows === 0) {
            return res.status(404).send('Project not found');
        }

        const projectFile = rows[0].project_file;
        const filePath = path.join('uploads', 'ProjectFile', projectFile);

            // ลบไฟล์
            deleteFile(filePath);

        const [result] = await connection.execute('DELETE FROM projects WHERE project_id = ?', [project_id]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Project not found');
        }


        console.log("Successfully deleted");
        res.status(200).send('Successfully deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while deleting');
    }
}
exports.updateProject = async (req, res) => {
    const { project_id } = req.params;
    const { ProjectName, Openday, Turnoffday, ProjectFile } = req.body;

    if (!project_id) {
        return res.status(400).send('Project ID is required');
    }

    try {
        const [result] = await connection.execute(
            `UPDATE projects SET project_name = ?, project_start_date = ?, project_expiration_date = ?, project_file = ? WHERE project_id = ?`,
            [ProjectName, Openday, Turnoffday, ProjectFile, project_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('Project not found');
        }

        console.log("Successfully updated");
        res.status(200).send('Successfully updated');
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while updating');
    }
}
exports.getProject = async (req, res) => {
    const { project_id } = req.params;

    if (!project_id) {
        return res.status(400).send('Project ID is required');
    }

    try {
        const [rows] = await connection.execute(
            'SELECT * FROM projects WHERE project_id = ?',
            [project_id]
        );

        if (rows.length === 0) {
            return res.status(404).send('Project not found');
        }

        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while retrieving the project');
    }
}
exports.getProjects = async (req, res) => {
    try {
        const [rows] = await connection.execute('SELECT * FROM projects');

        if (rows.length === 0) {
            return res.status(404).send('No projects found');
        }

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while retrieving projects');
    }
}

exports.nonEndProject = async(req, res) => {
    try {
        const [projects] = await connection.query(`
            SELECT project_id, project_name, project_start_date, project_expiration_date, project_file
            FROM projects 
            WHERE project_expiration_date > NOW()
            ORDER BY project_start_date DESC
        `);
        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).send('Error fetching projects.');
    }
};

// exports.applyForProject = async (req, res) => {
//     const { projectId } = req.body; // ดึง project_id จากคำขอ

//     try {
//         // ดึงข้อมูลของโปรเจคจากฐานข้อมูล
//         const [rows] = await connection.query('SELECT project_expiration_date FROM projects WHERE project_id = ?', [projectId]);

//         if (rows.length === 0) {
//             return res.status(404).send('Project not found');
//         }

//         const project = rows[0];
//         const expirationDate = moment(project.project_expiration_date);

//         // เช็คว่าปัจจุบันเกินวันหมดเขตหรือยัง
//         if (moment().isAfter(expirationDate)) {
//             return res.status(403).send('This project has reached its expiration date. Applications are no longer accepted.');
//         }

//         // ถ้ายังไม่หมดเขต ให้ดำเนินการสมัครต่อไป
//         // Your logic for applying to the project

//         res.status(200).send('Application successful');

//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('An error occurred while applying for the project.');
//     }
// };