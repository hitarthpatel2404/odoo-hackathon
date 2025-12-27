const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. POSTGRES DATABASE CONNECTION
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'gearguard',
    password: '2404', // Your Password
    port: 5432,
});

/* ================= API ROUTES ================= */

// --- 1. SIGN UP (Fixed for Missing Team) ---
app.post('/api/signup', async (req, res) => {
    let { name, email, password, teamId } = req.body;
    
    // FIX: Convert 'undefined' to 'null' so the database doesn't crash
    if (!teamId) teamId = null; 

    // Logic: If no team, they are a Manager. If team exists, they are a Technician.
    const role = teamId ? 'Technician' : 'Manager';

    const sql = 'INSERT INTO app_user (name, email, password_hash, role, team_id) VALUES ($1, $2, $3, $4, $5) RETURNING user_id';
    
    try {
        const result = await pool.query(sql, [name, email, password, role, teamId]);
        res.json({ success: true, userId: result.rows[0].user_id });
    } catch (err) {
        console.error(err); // Check your terminal to see the exact error
        res.status(500).json({ success: false, message: 'Error creating user' });
    }
});

// --- LOGIN (Return Team Info) ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    // Join with teams table to get the text name (e.g., 'Mechanics')
    const sql = `
        SELECT u.user_id, u.name, u.role, t.team_name 
        FROM app_user u
        LEFT JOIN teams t ON u.team_id = t.team_id
        WHERE email = $1 AND password_hash = $2
    `;
    
    try {
        const result = await pool.query(sql, [email, password]);
        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) { res.status(500).send(err); }
});

// --- DASHBOARD ANALYTICS ---
app.get('/api/stats', async (req, res) => {
    try {
        const eqRes = await pool.query("SELECT COUNT(*) FROM equipment");
        const mntRes = await pool.query("SELECT COUNT(*) FROM maintenance_request");
        const kbRes = await pool.query("SELECT COUNT(*) FROM kanban_tasks");

        res.json({
            eqCount: parseInt(eqRes.rows[0].count),
            mntCount: parseInt(mntRes.rows[0].count),
            kbCount: parseInt(kbRes.rows[0].count)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// --- EQUIPMENT ---
app.get('/api/equipment', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM equipment ORDER BY equipment_id DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err); }
});

app.post('/api/equipment', async (req, res) => {
    const { name, id, warranty, location } = req.body;
    // Postgres uses $1, $2 syntax for parameters
    const sql = 'INSERT INTO equipment (equipment_name, custom_id, warranty_expiry, location) VALUES ($1, $2, $3, $4) RETURNING equipment_id';
    
    try {
        const result = await pool.query(sql, [name, id, warranty, location]);
        res.json({ message: 'Equipment added', id: result.rows[0].equipment_id });
    } catch (err) { res.status(500).send(err); }
});

// --- MAINTENANCE ---
app.post('/api/maintenance', async (req, res) => {
    // Now receiving equipment details too
    const { subject, date, desc, eqName, category, team } = req.body;
    
    const sql = `
        INSERT INTO maintenance_request 
        (subject, maintenance_date, description, equipment_name, category, maintenance_team) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING request_id
    `;
    
    try {
        const result = await pool.query(sql, [subject, date, desc, eqName, category, team]);
        res.json({ message: 'Request added', id: result.rows[0].request_id });
    } catch (err) { 
        console.error(err);
        res.status(500).send(err); 
    }
});

app.post('/api/maintenance', async (req, res) => {
    const { subject, date, desc, eqName, category, team, type } = req.body;
    
    const sql = `
        INSERT INTO maintenance_request 
        (subject, maintenance_date, description, equipment_name, category, maintenance_team, request_type) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING request_id
    `;
    
    try {
        const result = await pool.query(sql, [subject, date, desc, eqName, category, team, type]);
        res.json({ message: 'Request added', id: result.rows[0].request_id });
    } catch (err) { res.status(500).send(err); }
});

// --- KANBAN ---
app.get('/api/kanban', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM kanban_tasks ORDER BY due_date DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err); }
});

app.post('/api/kanban', async (req, res) => {
    const { subject, eqName, eqId, date } = req.body;
    const sql = 'INSERT INTO kanban_tasks (subject, equipment_name, equipment_custom_id, due_date) VALUES ($1, $2, $3, $4) RETURNING task_id';
    
    try {
        const result = await pool.query(sql, [subject, eqName, eqId, date]);
        res.json({ message: 'Task added', id: result.rows[0].task_id });
    } catch (err) { res.status(500).send(err); }
});

// --- UPDATE KANBAN STATUS (Drag & Drop) ---
app.put('/api/kanban/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'New', 'In Progress', 'Repaired', 'Scrapped'

    const sql = 'UPDATE kanban_tasks SET status = $1 WHERE task_id = $2';

    try {
        await pool.query(sql, [status, id]);
        res.json({ success: true, message: 'Status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// START SERVER
app.listen(3000, () => {
    console.log('Server running on port 3000');
});

app.get('/api/teams', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM teams');
        res.json(result.rows);
    } catch (err) { res.status(500).send(err); }
});

// --- PICK UP TASK (Workflow Logic) ---
app.put('/api/maintenance/:id/assign', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    // Updates the task to be assigned to this user and sets status to 'In Progress'
    const sql = 'UPDATE maintenance_request SET assigned_to_user_id = $1, status = $2 WHERE request_id = $3';

    try {
        await pool.query(sql, [userId, 'In Progress', id]);
        res.json({ success: true });
    } catch (err) { res.status(500).send(err); }
});

// --- COMPLETE TASK (Log Duration) ---
app.put('/api/maintenance/:id/complete', async (req, res) => {
    const { id } = req.params;
    const { duration } = req.body; // Hours taken

    const sql = `
        UPDATE maintenance_request 
        SET status = 'Completed', duration_hours = $1 
        WHERE request_id = $2
    `;

    try {
        await pool.query(sql, [duration, id]);
        res.json({ success: true });
    } catch (err) { res.status(500).send(err); }
});