const  connection  = require("../db.config");

exports.createProject = async (req,res) => {
    const {ProjectName,Openday,Turnoffday,ProjectFile} = req.body;

    if(!ProjectName ||!Openday ||!Turnoffday  ||!File ){
        return res.status(400).send('Missing required fields');
    }
    try{
        const [rows] = await connection.query('SELECT project_id FROM PROJECTS ORDER BY project_id DESC LIMIT 1');
        let newProjectId = 'A0001';
        if (rows.length > 0) {
            let lastProjectId = rows[0].project_id;
            
            // แยกตัวอักษรและตัวเลขออกจากรหัสล่าสุด
            let lastLetterPart = lastProjectId.substring(0, 1); // ตัวอักษร
            let lastNumberPart = parseInt(lastProjectId.substring(1), 10); // ตัวเลข

            if(lastNumberPart < 9999){
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
            newProjectId = `${lastLetterPart}${lastNumberPart.toString().padStart(4, '0')}`;
        }

        connection.execute(`INSERT INTO projects(project_id ,project_name ,project_file ,project_start_date ,project_expiration_date ) VALUES (?, ?, ?, ?, ? );`,
            [
                newProjectId, ProjectName,ProjectFile,Openday,Turnoffday
            ]
        );

        console.log("Successfully added");
        res.status(201).send('Successfully added');

    }catch (err){
        console.error(err);
        res.status(500).send('An error occurred adding');
    }

}
exports.deleteProject = async (req, res) => {
    const { project_id } = req.params;

    if (!project_id) {
        return res.status(400).send('Project ID is required');
    }

    try {
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