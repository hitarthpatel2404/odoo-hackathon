const API_URL = "http://localhost:3000/api";

// Initialize data arrays (used for calendar and charts)
let equipmentDB = [];
let maintenanceDB = [];
let kanbanDB = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchData();
});

async function fetchData() {
    try {
        // Fetch all data in parallel
        const [eqRes, mntRes, kbRes, statsRes] = await Promise.all([
            fetch(`${API_URL}/equipment`),
            fetch(`${API_URL}/maintenance`),
            fetch(`${API_URL}/kanban`),
            fetch(`${API_URL}/stats`)
        ]);

        equipmentDB = await eqRes.json();
        populateMaintenanceDropdown(); 
        maintenanceDB = await mntRes.json();
        kanbanDB = await kbRes.json();
        const stats = await statsRes.json();

        // Update Dashboard Numbers if on Dashboard
        if (document.getElementById("eqCount")) {
            document.getElementById("eqCount").innerText = stats.eqCount;
            document.getElementById("mntCount").innerText = stats.mntCount;
            document.getElementById("kbCount").innerText = stats.kbCount;
            
            renderCalendar();
            renderChart();
        }

        // Render Tables if they exist on the current page
        renderEquipmentTable();
        renderMaintenanceTable();
        renderKanbanBoard();

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

/* -------- DATA SUBMISSION FUNCTIONS -------- */

async function addEquipment() {
    const data = {
        name: document.getElementById("eqName").value,
        id: document.getElementById("eqId").value,
        warranty: document.getElementById("eqWarranty").value,
        location: document.getElementById("eqLocation").value
    };

    await fetch(`${API_URL}/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    location.reload(); // Refresh to show new data
}

async function addMaintenance() {
    const data = {
        eqName: document.getElementById("mntEqSelect").value,
        type: document.getElementById("mntType").value, // <--- NEW
        category: document.getElementById("mntCategory").value,
        team: document.getElementById("mntTeam").value,
        subject: document.getElementById("mntSubject").value,
        date: document.getElementById("mntDate").value,
        desc: document.getElementById("mntDesc").value
    };

    if (!data.eqName) {
        alert("Please select an equipment.");
        return;
    }

    await fetch(`${API_URL}/maintenance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    location.reload();
}

async function addKanban() {
    const data = {
        subject: document.getElementById("kbSubject").value,
        eqName: document.getElementById("kbEqName").value,
        eqId: document.getElementById("kbEqId").value,
        date: document.getElementById("kbDate").value
    };

    await fetch(`${API_URL}/kanban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    location.reload();
}

/* -------- RENDERERS -------- */

function renderEquipmentTable() {
    const table = document.getElementById("equipmentTable");
    if (!table) return;
    
    // Updated Header with 'Status' column
    table.innerHTML = `<tr><th>Name</th><th>ID</th><th>Warranty</th><th>Location</th><th>Status</th></tr>`;
    
    equipmentDB.forEach(eq => {
        // Check if status is scrapped (default to Active if null)
        const status = eq.status || 'Active';
        const isScrapped = status === 'Scrapped';
        
        // Add specific class for styling if scrapped
        const rowClass = isScrapped ? 'scrapped-row' : '';
        const statusIcon = isScrapped ? '🔴 Scrapped' : '🟢 Active';

        const row = `<tr class="${rowClass}">
            <td>${eq.equipment_name}</td>
            <td>${eq.custom_id}</td>
            <td>${eq.warranty_expiry}</td>
            <td>${eq.location}</td>
            <td>${statusIcon}</td>
        </tr>`;
        table.innerHTML += row;
    });
}

function renderMaintenanceTable() {
    const table = document.getElementById("maintenanceTable");
    if (!table) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const userTeam = currentUser ? currentUser.team_name : "";
    const userId = currentUser ? currentUser.user_id : null;

    // Add Type and Duration to headers
    table.innerHTML = `<tr>
        <th>Type</th>
        <th>Subject</th>
        <th>Date</th>
        <th>Team</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Action</th>
    </tr>`;
    
    maintenanceDB.forEach(m => {
        const dateStr = new Date(m.maintenance_date).toLocaleDateString();
        const isMyTask = m.assigned_to_user_id === userId;
        const isCompleted = m.status === 'Completed';

        // TYPE BADGE COLOR
        const typeBadge = m.request_type === 'Preventive' 
            ? `<span style="color:#4ade80; border:1px solid #4ade80; padding:2px 6px; border-radius:4px; font-size:10px;">PREV</span>`
            : `<span style="color:#f87171; border:1px solid #f87171; padding:2px 6px; border-radius:4px; font-size:10px;">CORR</span>`;

        // ACTION BUTTON LOGIC
        let actionBtn = "";

        if (isCompleted) {
            actionBtn = `<span style="color:#4ade80">Done ✓</span>`;
        } else if (isMyTask) {
            // If I picked it up, I can Complete it
            actionBtn = `<button onclick="completeTask(${m.request_id})" style="padding:5px 10px; background:#38bdf8; border:none; border-radius:4px; color:#000; cursor:pointer;">Complete</button>`;
        } else if (m.status === 'Open' && m.maintenance_team === userTeam) {
            // If it's open and for my team, I can Pick Up
            actionBtn = `<button onclick="pickUpTask(${m.request_id})" style="padding:5px 10px; background:#22c55e; border:none; border-radius:4px; color:white; cursor:pointer;">Pick Up</button>`;
        } else {
            actionBtn = `<span style="color:#64748b">Locked</span>`;
        }

        const row = `<tr>
            <td>${typeBadge}</td>
            <td>${m.subject}</td>
            <td>${dateStr}</td>
            <td>${m.maintenance_team || '-'}</td>
            <td>${m.status || 'Open'}</td>
            <td>${m.duration_hours ? m.duration_hours + ' hrs' : '-'}</td>
            <td>${actionBtn}</td>
        </tr>`;
        table.innerHTML += row;
    });
}

// Add the function to handle the click
async function pickUpTask(requestId) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if(!currentUser) return;

    await fetch(`${API_URL}/maintenance/${requestId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.user_id })
    });
    
    // Refresh data
    fetchData(); 
}

/* -------- KANBAN LOGIC -------- */

function renderKanbanBoard() {
    // 1. Clear all columns
    const columns = {
        'New': document.getElementById("kanbanNew"),
        'In Progress': document.getElementById("kanbanProgress"),
        'Repaired': document.getElementById("kanbanRepaired"),
        'Scrapped': document.getElementById("kanbanScrapped")
    };

    // Clear inner HTML of all columns to prevent duplicates
    for (let key in columns) {
        if (columns[key]) columns[key].innerHTML = "";
    }

    // 2. Sort tasks into columns based on DB 'status'
    kanbanDB.forEach(k => {
        const dateStr = new Date(k.due_date).toLocaleDateString();
        
        // Default to 'New' if status is null
        const status = k.status || 'New'; 
        const container = columns[status];

        if (container) {
            // Add draggable="true" and ondragstart
            const card = `
              <div class="task" draggable="true" ondragstart="drag(event)" id="task-${k.task_id}" data-id="${k.task_id}">
                <strong>${k.subject}</strong><br>
                <span style="font-size:12px; color:#94a3b8">${k.equipment_name}</span><br>
                <span style="font-size:12px; color:#38bdf8">${dateStr}</span>
              </div>
            `;
            container.innerHTML += card;
        }
    });
}

// --- UPDATE KANBAN STATUS (with Scrap Logic) ---
app.put('/api/kanban/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; 

    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // Start Transaction

        // 1. Update the Kanban Task
        await client.query('UPDATE kanban_tasks SET status = $1 WHERE task_id = $2', [status, id]);

        // 2. SCRAP LOGIC: If moving to "Scrapped", update the Equipment table too
        if (status === 'Scrapped') {
            const scrapSql = `
                UPDATE equipment 
                SET status = 'Scrapped' 
                WHERE custom_id = (
                    SELECT equipment_custom_id FROM kanban_tasks WHERE task_id = $1
                )
            `;
            await client.query(scrapSql, [id]);
        }

        await client.query('COMMIT'); // Save changes
        res.json({ success: true, message: 'Status and Equipment updated' });
    } catch (err) {
        await client.query('ROLLBACK'); // Undo if error
        console.error(err);
        res.status(500).json({ success: false, message: 'Database error' });
    } finally {
        client.release();
    }
});

/* --- DRAG AND DROP FUNCTIONS --- */

function allowDrop(ev) {
    ev.preventDefault(); // Default behavior prevents dropping, so we turn it off
}

function drag(ev) {
    // Store the ID of the dragged element
    ev.dataTransfer.setData("text", ev.target.id);
}

async function drop(ev, newStatus) {
    ev.preventDefault();
    const elementId = ev.dataTransfer.getData("text");
    const taskElement = document.getElementById(elementId);
    
    // 1. Visually move the card immediately (for responsiveness)
    // Find the container div inside the column (the one with class 'task-container')
    const dropColumn = ev.currentTarget.querySelector('.task-container');
    dropColumn.appendChild(taskElement);

    // 2. Update Database via API
    const taskId = taskElement.getAttribute("data-id");
    
    try {
        await fetch(`${API_URL}/kanban/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        console.log(`Task ${taskId} moved to ${newStatus}`);
    } catch (error) {
        console.error("Failed to update status:", error);
        alert("Failed to save changes. Please refresh.");
    }
}

/* -------- DASHBOARD WIDGETS (Keep Logic Same, just use DB data) -------- */

function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    const monthLabel = document.getElementById("monthName");
    if (!grid) return;

    const date = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    monthLabel.innerText = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Clear grid and add Day Headers (S, M, T...)
    const days = ["S","M","T","W","T","F","S"];
    grid.innerHTML = days.map(d => `<div class="day-name">${d}</div>`).join("");

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;

    // Generate Days
    for (let i = 1; i <= daysInMonth; i++) {
        // Create a comparable date string for the current grid day: YYYY-MM-DD
        // We manually format to avoid timezone shifts
        const dayString = i.toString().padStart(2, '0');
        const monthString = (currentMonth + 1).toString().padStart(2, '0');
        const checkDate = `${currentYear}-${monthString}-${dayString}`;
        
        // Find tasks for this specific day
        // We stick to simple string matching (first 10 chars) to handle ISO strings from Postgres
        const dayTasks = maintenanceDB.filter(m => m.maintenance_date.substring(0, 10) === checkDate);
        const kanbanTasks = kanbanDB.filter(k => k.due_date && k.due_date.substring(0, 10) === checkDate);

        const allTasks = [...dayTasks, ...kanbanTasks];
        const hasEvent = allTasks.length > 0;
        
        // Build Tooltip Text (e.g., "Boiler Check, Pump Repair")
        const tooltipText = allTasks.map(t => t.subject).join('\n');

        const isToday = i === date.getDate();
        
        // Render the Day Cell
        // We add 'title' attribute so hovering shows the task names
        const dayHTML = `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" 
                 title="${hasEvent ? tooltipText : ''}">
                 ${i}
            </div>
        `;
        
        grid.innerHTML += dayHTML;
    }
}
function renderChart() {
    const canvas = document.getElementById("analyticsChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Use REAL data lengths for the first 3 columns
    const dataPoints = [
        equipmentDB.length * 2, 
        maintenanceDB.length * 5, 
        kanbanDB.length * 3, 
        15, // Dummy data for parts
        25  // Dummy data for audits
    ];
    
    const labels = ["Assets", "Repairs", "Tasks", "Parts", "Audit"];
    const maxVal = Math.max(...dataPoints, 10);
    const barWidth = 40;
    const gap = (rect.width - (dataPoints.length * barWidth)) / (dataPoints.length + 1);
    
    dataPoints.forEach((val, index) => {
        const x = gap + (index * (barWidth + gap));
        const barHeight = (val / maxVal) * (rect.height - 40);
        const y = rect.height - barHeight - 20;

        const gradient = ctx.createLinearGradient(0, y, 0, rect.height);
        gradient.addColorStop(0, "#38bdf8");
        gradient.addColorStop(1, "rgba(56, 189, 248, 0.1)");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px Inter";
        ctx.textAlign = "center";
        ctx.fillText(labels[index], x + barWidth/2, rect.height - 5);
    });
}

/* -------- AUTO-FILL LOGIC -------- */

function populateMaintenanceDropdown() {
    const select = document.getElementById("mntEqSelect");
    if (!select) return;

    // Keep the first default option
    select.innerHTML = '<option value="">-- Select Equipment --</option>';

    equipmentDB.forEach(eq => {
        // We store the array INDEX as the value so we can easily lookup the full object later
        const option = document.createElement("option");
        option.value = eq.equipment_name; // Store name as value
        option.text = `${eq.equipment_name} (${eq.custom_id})`;
        
        // Save the extra data in data-attributes
        option.setAttribute("data-category", eq.category || "General"); 
        option.setAttribute("data-team", eq.maintenance_team || "Plant Ops");
        
        select.appendChild(option);
    });
}

function autoFillMaintenance() {
    const select = document.getElementById("mntEqSelect");
    const selectedOption = select.options[select.selectedIndex];

    // Get data from the selected option's attributes
    const category = selectedOption.getAttribute("data-category");
    const team = selectedOption.getAttribute("data-team");

    // Fill the inputs
    document.getElementById("mntCategory").value = category || "";
    document.getElementById("mntTeam").value = team || "";
}

async function completeTask(requestId) {
    // Simple prompt to get duration (In a real app, use a modal)
    const duration = prompt("How many hours did this repair take?");
    
    if (duration !== null && duration !== "") {
        await fetch(`${API_URL}/maintenance/${requestId}/complete`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ duration: parseFloat(duration) })
        });
        fetchData(); // Refresh table
    }
}