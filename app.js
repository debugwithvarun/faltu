// Application State Management
let currentUser = null;
let isAuthenticated = false;
let currentSection = 'dashboard';

// Mock Database - Initialize with provided data
let appData = {
    users: [
        {"id": 1, "name": "Rajesh Kumar", "email": "rajesh@farmer.com", "role": "farmer"},
        {"id": 2, "name": "Dr. Priya Sharma", "email": "priya@vet.com", "role": "veterinarian"},
        {"id": 3, "name": "Suresh Gupta", "email": "suresh@shelter.com", "role": "shelter_manager"},
        {"id": 4, "name": "Admin User", "email": "admin@lifetag.com", "role": "admin"}
    ],
    cattle: [
        {"id": 1, "tagId": "LT001", "name": "Ganga", "breed": "Holstein", "birthDate": "2022-03-15", "ownerId": 1, "status": "active", "currentWeight": "450kg", "lastHealthCheck": "2023-09-10"},
        {"id": 2, "tagId": "LT002", "name": "Saraswati", "breed": "Jersey", "birthDate": "2021-08-22", "ownerId": 1, "status": "pregnant", "currentWeight": "380kg", "lastHealthCheck": "2023-09-12"},
        {"id": 3, "tagId": "LT003", "name": "Lakshmi", "breed": "Gir", "birthDate": "2020-12-10", "ownerId": 1, "status": "end_of_cycle", "currentWeight": "320kg", "lastHealthCheck": "2023-08-15"},
        {"id": 4, "tagId": "LT004", "name": "Parvati", "breed": "Holstein", "birthDate": "2022-01-20", "ownerId": 1, "status": "active", "currentWeight": "420kg", "lastHealthCheck": "2023-09-14"},
        {"id": 5, "tagId": "LT005", "name": "Durga", "breed": "Jersey", "birthDate": "2021-11-05", "ownerId": 1, "status": "sick", "currentWeight": "360kg", "lastHealthCheck": "2023-09-16"}
    ],
    vaccinations: [
        {"id": 1, "cattleId": 1, "vaccine": "FMD", "date": "2023-06-15", "veterinarianId": 2, "nextDue": "2024-06-15", "batchNumber": "FMD-2023-001"},
        {"id": 2, "cattleId": 2, "vaccine": "Brucellosis", "date": "2023-08-20", "veterinarianId": 2, "nextDue": "2024-08-20", "batchNumber": "BRC-2023-002"},
        {"id": 3, "cattleId": 4, "vaccine": "BVD", "date": "2023-07-10", "veterinarianId": 2, "nextDue": "2024-01-10", "batchNumber": "BVD-2023-003"},
        {"id": 4, "cattleId": 5, "vaccine": "IBR", "date": "2023-05-25", "veterinarianId": 2, "nextDue": "2023-11-25", "batchNumber": "IBR-2023-004"}
    ],
    productivity: [
        {"id": 1, "cattleId": 1, "date": "2023-09-15", "milkYield": 25.5, "healthScore": 9, "feedIntake": "35kg"},
        {"id": 2, "cattleId": 2, "date": "2023-09-15", "milkYield": 22.3, "healthScore": 8, "feedIntake": "32kg"},
        {"id": 3, "cattleId": 4, "date": "2023-09-15", "milkYield": 24.1, "healthScore": 9, "feedIntake": "34kg"},
        {"id": 4, "cattleId": 1, "date": "2023-09-14", "milkYield": 26.0, "healthScore": 9, "feedIntake": "35kg"},
        {"id": 5, "cattleId": 2, "date": "2023-09-14", "milkYield": 21.8, "healthScore": 8, "feedIntake": "31kg"},
        {"id": 6, "cattleId": 1, "date": "2023-09-13", "milkYield": 25.2, "healthScore": 9, "feedIntake": "35kg"}
    ],
    shelters: [
        {"id": 1, "name": "Gau Seva Ashram", "location": "Delhi", "capacity": 500, "currentCount": 350, "managerId": 3, "established": "2015-03-20"},
        {"id": 2, "name": "Sacred Cow Shelter", "location": "Haryana", "capacity": 300, "currentCount": 280, "managerId": 3, "established": "2018-08-15"},
        {"id": 3, "name": "Dharmic Gau Shala", "location": "Rajasthan", "capacity": 400, "currentCount": 220, "managerId": 3, "established": "2017-12-10"}
    ],
    transfers: [
        {"id": 1, "cattleId": 3, "fromOwnerId": 1, "toOwnerId": 3, "date": "2023-08-20", "reason": "End of productive cycle", "status": "completed"}
    ],
    nextId: {
        users: 5,
        cattle: 6,
        vaccinations: 5,
        productivity: 7,
        shelters: 4,
        transfers: 2
    }
};

// Chart instances storage
let charts = {};

// Utility Functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
        return `${ageInMonths} months`;
    } else {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        return months > 0 ? `${years}y ${months}m` : `${years} years`;
    }
}

function generateTagId() {
    const lastId = Math.max(...appData.cattle.map(c => parseInt(c.tagId.slice(2)))) || 0;
    return `LT${String(lastId + 1).padStart(3, '0')}`;
}

function showNotification(message, type = 'success') {
    const toast = document.getElementById('notification-toast');
    const messageEl = document.getElementById('toast-message');
    
    messageEl.textContent = message;
    toast.classList.remove('hidden');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

function hideNotification() {
    document.getElementById('notification-toast').classList.add('hidden');
}

// Authentication Functions
function showAuth(mode) {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-title');
    const nameGroup = document.getElementById('name-group');
    const roleGroup = document.getElementById('role-group');
    const submitBtn = document.getElementById('auth-submit');
    const switchText = document.getElementById('auth-switch-text');
    const switchLink = document.getElementById('auth-switch-link');
    
    if (mode === 'register') {
        title.textContent = 'Register';
        nameGroup.style.display = 'block';
        roleGroup.style.display = 'block';
        submitBtn.textContent = 'Register';
        switchText.textContent = "Already have an account?";
        switchLink.textContent = 'Login here';
        switchLink.setAttribute('onclick', "showAuth('login')");
    } else {
        title.textContent = 'Login';
        nameGroup.style.display = 'none';
        roleGroup.style.display = 'none';
        submitBtn.textContent = 'Login';
        switchText.textContent = "Don't have an account?";
        switchLink.textContent = 'Register here';
        switchLink.setAttribute('onclick', "showAuth('register')");
    }
    
    modal.classList.remove('hidden');
}

function hideAuth() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('auth-form').reset();
}

function toggleAuthMode() {
    const title = document.getElementById('auth-title').textContent;
    showAuth(title === 'Login' ? 'register' : 'login');
}

function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const mode = document.getElementById('auth-title').textContent.toLowerCase();
    
    if (mode === 'register') {
        const name = document.getElementById('name').value;
        const role = document.getElementById('role').value;
        
        // Create new user
        const newUser = {
            id: appData.nextId.users++,
            name: name,
            email: email,
            role: role
        };
        appData.users.push(newUser);
        currentUser = newUser;
        showNotification('Registration successful! Welcome to LifeTag.');
    } else {
        // Find existing user
        const user = appData.users.find(u => u.email === email);
        if (!user) {
            showNotification('User not found. Please register first.', 'error');
            return;
        }
        currentUser = user;
        showNotification(`Welcome back, ${user.name}!`);
    }
    
    isAuthenticated = true;
    hideAuth();
    showMainApp();
}

function showMainApp() {
    document.getElementById('landing-page').classList.remove('active');
    document.getElementById('main-app').classList.remove('hidden');
    
    // Update user info in header
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.role.replace('_', ' ').toUpperCase();
    
    // Load dashboard
    showSection('dashboard');
    loadDashboard();
}

function logout() {
    currentUser = null;
    isAuthenticated = false;
    
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('landing-page').classList.add('active');
    
    showNotification('Logged out successfully');
}

// Navigation Functions
function showSection(sectionName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetBtn = document.querySelector(`[onclick*="showSection('${sectionName}')"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // Update sections
    document.querySelectorAll('.app-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    currentSection = sectionName;
    
    // Load section data
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'cattle':
            loadCattle();
            break;
        case 'vaccinations':
            loadVaccinations();
            break;
        case 'productivity':
            loadProductivity();
            break;
        case 'shelters':
            loadShelters();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

// Dashboard Functions
function loadDashboard() {
    const stats = {
        totalCattle: appData.cattle.length,
        vaccinatedMonth: appData.vaccinations.filter(v => {
            const vaccineDate = new Date(v.date);
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            return vaccineDate.getMonth() === currentMonth && vaccineDate.getFullYear() === currentYear;
        }).length,
        avgMilkYield: calculateAvgMilkYield(),
        totalShelters: appData.shelters.length
    };
    
    document.getElementById('total-cattle').textContent = stats.totalCattle;
    document.getElementById('vaccinated-month').textContent = stats.vaccinatedMonth;
    document.getElementById('avg-milk-yield').textContent = `${stats.avgMilkYield}L`;
    document.getElementById('total-shelters').textContent = stats.totalShelters;
    
    loadRecentActivities();
}

function calculateAvgMilkYield() {
    const recentProductivity = appData.productivity.filter(p => {
        const recordDate = new Date(p.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return recordDate >= weekAgo;
    });
    
    if (recentProductivity.length === 0) return 0;
    
    const totalYield = recentProductivity.reduce((sum, p) => sum + p.milkYield, 0);
    return (totalYield / recentProductivity.length).toFixed(1);
}

function loadRecentActivities() {
    const activities = [
        { text: "New cattle 'Durga' registered with tag LT005", time: "2 hours ago" },
        { text: "Vaccination completed for Ganga (LT001)", time: "1 day ago" },
        { text: "Milk yield recorded: 25.5L for Ganga", time: "1 day ago" },
        { text: "Health checkup completed for Saraswati", time: "2 days ago" },
        { text: "Ownership transfer completed for Lakshmi", time: "3 days ago" }
    ];
    
    const container = document.getElementById('recent-activities');
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div>${activity.text}</div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

// Cattle Management Functions
function loadCattle() {
    const container = document.getElementById('cattle-grid');
    const filteredCattle = filterCattleData();
    
    container.innerHTML = filteredCattle.map(cattle => {
        const owner = appData.users.find(u => u.id === cattle.ownerId);
        return `
            <div class="cattle-card" onclick="showCattleDetail(${cattle.id})">
                <div class="cattle-card-header">
                    <h3 class="cattle-name">${cattle.name}</h3>
                    <div class="cattle-tag">${cattle.tagId}</div>
                    <span class="cattle-status status-${cattle.status}">${cattle.status.replace('_', ' ')}</span>
                </div>
                <div class="cattle-card-body">
                    <div class="cattle-info">
                        <div class="info-item">
                            <span class="info-label">Breed</span>
                            <span class="info-value">${cattle.breed}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Age</span>
                            <span class="info-value">${calculateAge(cattle.birthDate)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Weight</span>
                            <span class="info-value">${cattle.currentWeight || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Owner</span>
                            <span class="info-value">${owner ? owner.name : 'Unknown'}</span>
                        </div>
                    </div>
                    <div class="cattle-actions">
                        <button class="btn btn--sm btn--outline btn-icon" onclick="event.stopPropagation(); editCattle(${cattle.id})" title="Edit">✏️</button>
                        <button class="btn btn--sm btn--outline btn-icon" onclick="event.stopPropagation(); transferCattle(${cattle.id})" title="Transfer">🔄</button>
                        <button class="btn btn--sm btn--outline btn-icon" onclick="event.stopPropagation(); generateQR('${cattle.tagId}')" title="QR Code">📱</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterCattleData() {
    const searchTerm = document.getElementById('cattle-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    
    return appData.cattle.filter(cattle => {
        const matchesSearch = cattle.name.toLowerCase().includes(searchTerm) || 
                            cattle.tagId.toLowerCase().includes(searchTerm) ||
                            cattle.breed.toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || cattle.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
}

function filterCattle() {
    loadCattle();
}

function showAddCattleForm() {
    const formHtml = `
        <form id="cattle-form" onsubmit="handleCattleSubmit(event)">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="cattle-name">Cattle Name *</label>
                    <input type="text" id="cattle-name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cattle-breed">Breed *</label>
                    <select id="cattle-breed" class="form-control" required>
                        <option value="">Select Breed</option>
                        <option value="Holstein">Holstein</option>
                        <option value="Jersey">Jersey</option>
                        <option value="Gir">Gir</option>
                        <option value="Sahiwal">Sahiwal</option>
                        <option value="Red Sindhi">Red Sindhi</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="cattle-birth-date">Birth Date *</label>
                    <input type="date" id="cattle-birth-date" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cattle-weight">Current Weight (kg)</label>
                    <input type="number" id="cattle-weight" class="form-control" placeholder="450">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="cattle-status">Status</label>
                    <select id="cattle-status" class="form-control">
                        <option value="active">Active</option>
                        <option value="pregnant">Pregnant</option>
                        <option value="sick">Sick</option>
                        <option value="end_of_cycle">End of Cycle</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="cattle-owner">Owner</label>
                    <select id="cattle-owner" class="form-control">
                        ${appData.users.filter(u => u.role === 'farmer').map(user => 
                            `<option value="${user.id}" ${user.id === currentUser.id ? 'selected' : ''}>${user.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div class="qr-container">
                <h4>Generated QR Code</h4>
                <div id="qr-code"></div>
                <p>Tag ID: <strong id="generated-tag-id">${generateTagId()}</strong></p>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn--outline" onclick="hideFormsModal()">Cancel</button>
                <button type="submit" class="btn btn--primary">Register Cattle</button>
            </div>
        </form>
    `;
    
    document.getElementById('form-title').textContent = 'Register New Cattle';
    document.getElementById('form-container').innerHTML = formHtml;
    document.getElementById('forms-modal').classList.remove('hidden');
    
    // Generate QR code for the new tag ID
    const tagId = generateTagId();
    setTimeout(() => {
        const qrContainer = document.getElementById('qr-code');
        if (qrContainer && typeof QRCode !== 'undefined') {
            QRCode.toCanvas(qrContainer, tagId, {
                width: 150,
                height: 150
            });
        }
    }, 100);
}

function handleCattleSubmit(event) {
    event.preventDefault();
    
    const newCattle = {
        id: appData.nextId.cattle++,
        tagId: document.getElementById('generated-tag-id').textContent,
        name: document.getElementById('cattle-name').value,
        breed: document.getElementById('cattle-breed').value,
        birthDate: document.getElementById('cattle-birth-date').value,
        ownerId: parseInt(document.getElementById('cattle-owner').value),
        status: document.getElementById('cattle-status').value,
        currentWeight: document.getElementById('cattle-weight').value + 'kg',
        lastHealthCheck: new Date().toISOString().split('T')[0]
    };
    
    appData.cattle.push(newCattle);
    hideFormsModal();
    loadCattle();
    showNotification(`Cattle ${newCattle.name} registered successfully with tag ${newCattle.tagId}`);
}

function showCattleDetail(cattleId) {
    const cattle = appData.cattle.find(c => c.id === cattleId);
    if (!cattle) return;
    
    const owner = appData.users.find(u => u.id === cattle.ownerId);
    const vaccinations = appData.vaccinations.filter(v => v.cattleId === cattleId);
    const productivity = appData.productivity.filter(p => p.cattleId === cattleId).slice(-5);
    const transfers = appData.transfers.filter(t => t.cattleId === cattleId);
    
    const detailHtml = `
        <div class="cattle-detail">
            <div class="cattle-detail-header">
                <div>
                    <h2>${cattle.name} (${cattle.tagId})</h2>
                    <p class="cattle-breed">${cattle.breed} • ${calculateAge(cattle.birthDate)} old</p>
                    <span class="cattle-status status-${cattle.status}">${cattle.status.replace('_', ' ')}</span>
                </div>
                <div class="qr-container">
                    <div id="cattle-qr-code"></div>
                </div>
            </div>
            
            <div class="cattle-detail-tabs">
                <button class="tab-btn active" onclick="showCattleTab('info')">Basic Info</button>
                <button class="tab-btn" onclick="showCattleTab('vaccinations')">Vaccinations</button>
                <button class="tab-btn" onclick="showCattleTab('productivity')">Productivity</button>
                <button class="tab-btn" onclick="showCattleTab('transfers')">Transfers</button>
            </div>
            
            <div id="cattle-tab-content">
                <div id="cattle-info-tab" class="cattle-tab-panel active">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Tag ID</span>
                            <span class="info-value">${cattle.tagId}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Name</span>
                            <span class="info-value">${cattle.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Breed</span>
                            <span class="info-value">${cattle.breed}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Birth Date</span>
                            <span class="info-value">${formatDate(cattle.birthDate)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Age</span>
                            <span class="info-value">${calculateAge(cattle.birthDate)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Current Weight</span>
                            <span class="info-value">${cattle.currentWeight || 'Not recorded'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Status</span>
                            <span class="info-value">${cattle.status.replace('_', ' ')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Owner</span>
                            <span class="info-value">${owner ? owner.name : 'Unknown'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Last Health Check</span>
                            <span class="info-value">${cattle.lastHealthCheck ? formatDate(cattle.lastHealthCheck) : 'Not recorded'}</span>
                        </div>
                    </div>
                </div>
                
                <div id="cattle-vaccinations-tab" class="cattle-tab-panel">
                    <h4>Vaccination History</h4>
                    ${vaccinations.length > 0 ? vaccinations.map(v => {
                        const vet = appData.users.find(u => u.id === v.veterinarianId);
                        return `
                            <div class="vaccination-item">
                                <div class="vaccination-info">
                                    <h5>${v.vaccine}</h5>
                                    <p class="vaccination-meta">
                                        Administered: ${formatDate(v.date)} by ${vet ? vet.name : 'Unknown'}<br>
                                        Next Due: ${formatDate(v.nextDue)}<br>
                                        Batch: ${v.batchNumber || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p>No vaccination records found.</p>'}
                </div>
                
                <div id="cattle-productivity-tab" class="cattle-tab-panel">
                    <h4>Recent Productivity Records</h4>
                    ${productivity.length > 0 ? productivity.map(p => `
                        <div class="productivity-item">
                            <div class="productivity-date">${formatDate(p.date)}</div>
                            <div class="productivity-metrics">
                                <span>Milk: ${p.milkYield}L</span>
                                <span>Health Score: ${p.healthScore}/10</span>
                                <span>Feed: ${p.feedIntake || 'N/A'}</span>
                            </div>
                        </div>
                    `).join('') : '<p>No productivity records found.</p>'}
                </div>
                
                <div id="cattle-transfers-tab" class="cattle-tab-panel">
                    <h4>Ownership Transfer History</h4>
                    ${transfers.length > 0 ? transfers.map(t => {
                        const fromOwner = appData.users.find(u => u.id === t.fromOwnerId);
                        const toOwner = appData.users.find(u => u.id === t.toOwnerId);
                        return `
                            <div class="transfer-item">
                                <div class="transfer-info">
                                    <p><strong>Date:</strong> ${formatDate(t.date)}</p>
                                    <p><strong>From:</strong> ${fromOwner ? fromOwner.name : 'Unknown'}</p>
                                    <p><strong>To:</strong> ${toOwner ? toOwner.name : 'Unknown'}</p>
                                    <p><strong>Reason:</strong> ${t.reason}</p>
                                    <p><strong>Status:</strong> ${t.status}</p>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p>No transfer records found.</p>'}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('cattle-detail-title').textContent = `${cattle.name} (${cattle.tagId})`;
    document.getElementById('cattle-detail-content').innerHTML = detailHtml;
    document.getElementById('cattle-detail-modal').classList.remove('hidden');
    
    // Generate QR code
    setTimeout(() => {
        const qrContainer = document.getElementById('cattle-qr-code');
        if (qrContainer && typeof QRCode !== 'undefined') {
            QRCode.toCanvas(qrContainer, cattle.tagId, {
                width: 100,
                height: 100
            });
        }
    }, 100);
}

function showCattleTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.cattle-detail-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.cattle-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`cattle-${tabName}-tab`).classList.add('active');
}

function hideCattleDetail() {
    document.getElementById('cattle-detail-modal').classList.add('hidden');
}

function generateQR(tagId) {
    const qrHtml = `
        <div class="qr-container">
            <h4>QR Code for ${tagId}</h4>
            <div id="modal-qr-code"></div>
            <p>Scan this code to access cattle information</p>
        </div>
        <div class="form-actions">
            <button type="button" class="btn btn--primary" onclick="hideFormsModal()">Close</button>
        </div>
    `;
    
    document.getElementById('form-title').textContent = 'QR Code';
    document.getElementById('form-container').innerHTML = qrHtml;
    document.getElementById('forms-modal').classList.remove('hidden');
    
    setTimeout(() => {
        const qrContainer = document.getElementById('modal-qr-code');
        if (qrContainer && typeof QRCode !== 'undefined') {
            QRCode.toCanvas(qrContainer, tagId, {
                width: 200,
                height: 200
            });
        }
    }, 100);
}

// Vaccination Functions
function loadVaccinations() {
    showVaccinationTab('schedule');
}

function showVaccinationTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.vaccination-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const targetBtn = document.querySelector(`[onclick*="showVaccinationTab('${tabName}')"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    const container = document.getElementById('vaccination-content');
    let content = '';
    
    switch(tabName) {
        case 'schedule':
            content = getVaccinationSchedule();
            break;
        case 'history':
            content = getVaccinationHistory();
            break;
        case 'due':
            content = getVaccinationsDue();
            break;
    }
    
    container.innerHTML = content;
}

function getVaccinationSchedule() {
    const upcomingVaccinations = appData.vaccinations.filter(v => {
        const nextDue = new Date(v.nextDue);
        const today = new Date();
        const monthFromNow = new Date();
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);
        return nextDue > today && nextDue <= monthFromNow;
    });
    
    if (upcomingVaccinations.length === 0) {
        return '<div class="vaccination-list"><p>No vaccinations scheduled for the next month.</p></div>';
    }
    
    return `
        <div class="vaccination-list">
            ${upcomingVaccinations.map(v => {
                const cattle = appData.cattle.find(c => c.id === v.cattleId);
                const vet = appData.users.find(u => u.id === v.veterinarianId);
                return `
                    <div class="vaccination-item">
                        <div class="vaccination-info">
                            <h4>${v.vaccine} - ${cattle ? cattle.name : 'Unknown'} (${cattle ? cattle.tagId : 'N/A'})</h4>
                            <p class="vaccination-meta">
                                Due: ${formatDate(v.nextDue)}<br>
                                Veterinarian: ${vet ? vet.name : 'Not assigned'}<br>
                                Last administered: ${formatDate(v.date)}
                            </p>
                        </div>
                        <button class="btn btn--primary btn--sm" onclick="scheduleVaccination(${v.cattleId}, '${v.vaccine}')">Schedule</button>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function getVaccinationHistory() {
    if (appData.vaccinations.length === 0) {
        return '<div class="vaccination-list"><p>No vaccination history available.</p></div>';
    }
    
    return `
        <div class="vaccination-list">
            ${appData.vaccinations.map(v => {
                const cattle = appData.cattle.find(c => c.id === v.cattleId);
                const vet = appData.users.find(u => u.id === v.veterinarianId);
                return `
                    <div class="vaccination-item">
                        <div class="vaccination-info">
                            <h4>${v.vaccine} - ${cattle ? cattle.name : 'Unknown'} (${cattle ? cattle.tagId : 'N/A'})</h4>
                            <p class="vaccination-meta">
                                Administered: ${formatDate(v.date)}<br>
                                Veterinarian: ${vet ? vet.name : 'Unknown'}<br>
                                Batch: ${v.batchNumber || 'N/A'}<br>
                                Next Due: ${formatDate(v.nextDue)}
                            </p>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function getVaccinationsDue() {
    const dueVaccinations = appData.vaccinations.filter(v => {
        const nextDue = new Date(v.nextDue);
        const today = new Date();
        return nextDue <= today;
    });
    
    if (dueVaccinations.length === 0) {
        return '<div class="vaccination-list"><p>No overdue vaccinations.</p></div>';
    }
    
    return `
        <div class="vaccination-list">
            ${dueVaccinations.map(v => {
                const cattle = appData.cattle.find(c => c.id === v.cattleId);
                const vet = appData.users.find(u => u.id === v.veterinarianId);
                const isOverdue = new Date(v.nextDue) < new Date();
                return `
                    <div class="vaccination-item ${isOverdue ? 'overdue' : 'due-soon'}">
                        <div class="vaccination-info">
                            <h4>${v.vaccine} - ${cattle ? cattle.name : 'Unknown'} (${cattle ? cattle.tagId : 'N/A'})</h4>
                            <p class="vaccination-meta">
                                Due: ${formatDate(v.nextDue)} ${isOverdue ? '(OVERDUE)' : ''}<br>
                                Veterinarian: ${vet ? vet.name : 'Not assigned'}<br>
                                Last administered: ${formatDate(v.date)}
                            </p>
                        </div>
                        <button class="btn btn--primary btn--sm" onclick="logVaccination(${v.cattleId}, '${v.vaccine}')">Log Now</button>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function showVaccinationForm() {
    const formHtml = `
        <form id="vaccination-form" onsubmit="handleVaccinationSubmit(event)">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="vacc-cattle">Cattle *</label>
                    <select id="vacc-cattle" class="form-control" required>
                        <option value="">Select Cattle</option>
                        ${appData.cattle.map(cattle => 
                            `<option value="${cattle.id}">${cattle.name} (${cattle.tagId})</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="vacc-vaccine">Vaccine *</label>
                    <select id="vacc-vaccine" class="form-control" required>
                        <option value="">Select Vaccine</option>
                        <option value="FMD">FMD (Foot and Mouth Disease)</option>
                        <option value="Brucellosis">Brucellosis</option>
                        <option value="BVD">BVD (Bovine Viral Diarrhea)</option>
                        <option value="IBR">IBR (Infectious Bovine Rhinotracheitis)</option>
                        <option value="PI3">PI3 (Parainfluenza 3)</option>
                        <option value="BRSV">BRSV (Bovine Respiratory Syncytial Virus)</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="vacc-date">Vaccination Date *</label>
                    <input type="date" id="vacc-date" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="vacc-batch">Batch Number</label>
                    <input type="text" id="vacc-batch" class="form-control" placeholder="e.g., FMD-2023-001">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="vacc-vet">Veterinarian</label>
                    <select id="vacc-vet" class="form-control">
                        ${appData.users.filter(u => u.role === 'veterinarian').map(user => 
                            `<option value="${user.id}">${user.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="vacc-next-due">Next Due Date</label>
                    <input type="date" id="vacc-next-due" class="form-control">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn--outline" onclick="hideFormsModal()">Cancel</button>
                <button type="submit" class="btn btn--primary">Log Vaccination</button>
            </div>
        </form>
    `;
    
    document.getElementById('form-title').textContent = 'Log Vaccination';
    document.getElementById('form-container').innerHTML = formHtml;
    document.getElementById('forms-modal').classList.remove('hidden');
    
    // Set default date to today
    document.getElementById('vacc-date').value = new Date().toISOString().split('T')[0];
    
    // Set default next due date (6 months from now)
    const nextDue = new Date();
    nextDue.setMonth(nextDue.getMonth() + 6);
    document.getElementById('vacc-next-due').value = nextDue.toISOString().split('T')[0];
}

function handleVaccinationSubmit(event) {
    event.preventDefault();
    
    const newVaccination = {
        id: appData.nextId.vaccinations++,
        cattleId: parseInt(document.getElementById('vacc-cattle').value),
        vaccine: document.getElementById('vacc-vaccine').value,
        date: document.getElementById('vacc-date').value,
        veterinarianId: parseInt(document.getElementById('vacc-vet').value) || 2,
        nextDue: document.getElementById('vacc-next-due').value,
        batchNumber: document.getElementById('vacc-batch').value
    };
    
    appData.vaccinations.push(newVaccination);
    hideFormsModal();
    loadVaccinations();
    
    const cattle = appData.cattle.find(c => c.id === newVaccination.cattleId);
    showNotification(`Vaccination logged for ${cattle ? cattle.name : 'cattle'} successfully`);
}

// Productivity Functions
function loadProductivity() {
    loadProductivityChart();
    loadProductivityRecords();
}

function loadProductivityChart() {
    const ctx = document.getElementById('milk-yield-chart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.milkYield) {
        charts.milkYield.destroy();
    }
    
    // Get last 7 days of data
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }
    
    // Aggregate milk yield by date
    const yieldByDate = last7Days.map(date => {
        const records = appData.productivity.filter(p => p.date === date);
        return records.reduce((sum, record) => sum + record.milkYield, 0);
    });
    
    charts.milkYield = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days.map(date => formatDate(date)),
            datasets: [{
                label: 'Total Milk Yield (L)',
                data: yieldByDate,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Milk Yield (Liters)'
                    }
                }
            }
        }
    });
}

function loadProductivityRecords() {
    const container = document.getElementById('productivity-records');
    if (!container) return;
    
    const recentRecords = appData.productivity
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);
    
    container.innerHTML = `
        <h3>Recent Productivity Records</h3>
        <div class="productivity-table">
            ${recentRecords.map(record => {
                const cattle = appData.cattle.find(c => c.id === record.cattleId);
                return `
                    <div class="productivity-record">
                        <div class="record-info">
                            <h4>${cattle ? cattle.name : 'Unknown'} (${cattle ? cattle.tagId : 'N/A'})</h4>
                            <p class="record-date">${formatDate(record.date)}</p>
                        </div>
                        <div class="record-metrics">
                            <div class="metric">
                                <span class="metric-value">${record.milkYield}L</span>
                                <span class="metric-label">Milk Yield</span>
                            </div>
                            <div class="metric">
                                <span class="metric-value">${record.healthScore}/10</span>
                                <span class="metric-label">Health</span>
                            </div>
                            <div class="metric">
                                <span class="metric-value">${record.feedIntake || 'N/A'}</span>
                                <span class="metric-label">Feed Intake</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function showProductivityForm() {
    const formHtml = `
        <form id="productivity-form" onsubmit="handleProductivitySubmit(event)">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="prod-cattle">Cattle *</label>
                    <select id="prod-cattle" class="form-control" required>
                        <option value="">Select Cattle</option>
                        ${appData.cattle.filter(c => c.status === 'active' || c.status === 'pregnant').map(cattle => 
                            `<option value="${cattle.id}">${cattle.name} (${cattle.tagId})</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="prod-date">Date *</label>
                    <input type="date" id="prod-date" class="form-control" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="prod-milk-yield">Milk Yield (Liters) *</label>
                    <input type="number" id="prod-milk-yield" class="form-control" step="0.1" min="0" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="prod-health-score">Health Score (1-10) *</label>
                    <input type="number" id="prod-health-score" class="form-control" min="1" max="10" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="prod-feed-intake">Feed Intake (kg)</label>
                    <input type="number" id="prod-feed-intake" class="form-control" step="0.1" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label" for="prod-notes">Notes</label>
                    <input type="text" id="prod-notes" class="form-control" placeholder="Additional observations">
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn--outline" onclick="hideFormsModal()">Cancel</button>
                <button type="submit" class="btn btn--primary">Record Productivity</button>
            </div>
        </form>
    `;
    
    document.getElementById('form-title').textContent = 'Record Productivity Data';
    document.getElementById('form-container').innerHTML = formHtml;
    document.getElementById('forms-modal').classList.remove('hidden');
    
    // Set default date to today
    document.getElementById('prod-date').value = new Date().toISOString().split('T')[0];
}

function handleProductivitySubmit(event) {
    event.preventDefault();
    
    const feedIntake = document.getElementById('prod-feed-intake').value;
    const newRecord = {
        id: appData.nextId.productivity++,
        cattleId: parseInt(document.getElementById('prod-cattle').value),
        date: document.getElementById('prod-date').value,
        milkYield: parseFloat(document.getElementById('prod-milk-yield').value),
        healthScore: parseInt(document.getElementById('prod-health-score').value),
        feedIntake: feedIntake ? feedIntake + 'kg' : null,
        notes: document.getElementById('prod-notes').value
    };
    
    appData.productivity.push(newRecord);
    hideFormsModal();
    loadProductivity();
    
    const cattle = appData.cattle.find(c => c.id === newRecord.cattleId);
    showNotification(`Productivity data recorded for ${cattle ? cattle.name : 'cattle'} successfully`);
}

// Shelter Functions
function loadShelters() {
    const container = document.getElementById('shelters-grid');
    
    container.innerHTML = appData.shelters.map(shelter => {
        const capacityPercent = (shelter.currentCount / shelter.capacity * 100).toFixed(1);
        const isNearCapacity = capacityPercent > 80;
        const manager = appData.users.find(u => u.id === shelter.managerId);
        
        return `
            <div class="shelter-card">
                <div class="shelter-header">
                    <h3 class="shelter-name">${shelter.name}</h3>
                    <p class="shelter-location">📍 ${shelter.location}</p>
                </div>
                <div class="shelter-capacity">
                    <div class="capacity-text">
                        <span>Capacity: ${shelter.currentCount}/${shelter.capacity}</span>
                        <span class="${isNearCapacity ? 'text-warning' : ''}">${capacityPercent}%</span>
                    </div>
                    <div class="capacity-bar">
                        <div class="capacity-fill" style="width: ${capacityPercent}%; background-color: ${isNearCapacity ? '#FFC185' : '#1FB8CD'}"></div>
                    </div>
                    <div class="shelter-info">
                        <p><strong>Manager:</strong> ${manager ? manager.name : 'Not assigned'}</p>
                        <p><strong>Established:</strong> ${formatDate(shelter.established)}</p>
                    </div>
                    <div class="shelter-actions">
                        <button class="btn btn--sm btn--outline" onclick="manageShelter(${shelter.id})">Manage</button>
                        <button class="btn btn--sm btn--primary" onclick="addCattleToShelter(${shelter.id})">Add Cattle</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showShelterForm() {
    const formHtml = `
        <form id="shelter-form" onsubmit="handleShelterSubmit(event)">
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="shelter-name">Shelter Name *</label>
                    <input type="text" id="shelter-name" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="shelter-location">Location *</label>
                    <input type="text" id="shelter-location" class="form-control" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="shelter-capacity">Capacity *</label>
                    <input type="number" id="shelter-capacity" class="form-control" min="1" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="shelter-manager">Manager</label>
                    <select id="shelter-manager" class="form-control">
                        <option value="">Select Manager</option>
                        ${appData.users.filter(u => u.role === 'shelter_manager').map(user => 
                            `<option value="${user.id}">${user.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="shelter-established">Established Date</label>
                <input type="date" id="shelter-established" class="form-control">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn--outline" onclick="hideFormsModal()">Cancel</button>
                <button type="submit" class="btn btn--primary">Add Shelter</button>
            </div>
        </form>
    `;
    
    document.getElementById('form-title').textContent = 'Add New Shelter';
    document.getElementById('form-container').innerHTML = formHtml;
    document.getElementById('forms-modal').classList.remove('hidden');
    
    // Set default established date to today
    document.getElementById('shelter-established').value = new Date().toISOString().split('T')[0];
}

function handleShelterSubmit(event) {
    event.preventDefault();
    
    const newShelter = {
        id: appData.nextId.shelters++,
        name: document.getElementById('shelter-name').value,
        location: document.getElementById('shelter-location').value,
        capacity: parseInt(document.getElementById('shelter-capacity').value),
        currentCount: 0,
        managerId: parseInt(document.getElementById('shelter-manager').value) || currentUser.id,
        established: document.getElementById('shelter-established').value
    };
    
    appData.shelters.push(newShelter);
    hideFormsModal();
    loadShelters();
    showNotification(`Shelter ${newShelter.name} added successfully`);
}

// Analytics Functions
function loadAnalytics() {
    setTimeout(() => {
        loadCattleDistributionChart();
        loadVaccinationCoverageChart();
        loadMonthlyProductivityChart();
        loadShelterCapacityChart();
    }, 100);
}

function loadCattleDistributionChart() {
    const ctx = document.getElementById('cattle-distribution-chart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    if (charts.cattleDistribution) {
        charts.cattleDistribution.destroy();
    }
    
    const statusCounts = appData.cattle.reduce((acc, cattle) => {
        acc[cattle.status] = (acc[cattle.status] || 0) + 1;
        return acc;
    }, {});
    
    charts.cattleDistribution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts).map(status => status.replace('_', ' ')),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#5D878F'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function loadVaccinationCoverageChart() {
    const ctx = document.getElementById('vaccination-coverage-chart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    if (charts.vaccinationCoverage) {
        charts.vaccinationCoverage.destroy();
    }
    
    const vaccineCounts = appData.vaccinations.reduce((acc, vaccination) => {
        acc[vaccination.vaccine] = (acc[vaccination.vaccine] || 0) + 1;
        return acc;
    }, {});
    
    charts.vaccinationCoverage = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(vaccineCounts),
            datasets: [{
                label: 'Vaccinations Given',
                data: Object.values(vaccineCounts),
                backgroundColor: '#1FB8CD',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function loadMonthlyProductivityChart() {
    const ctx = document.getElementById('monthly-productivity-chart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    if (charts.monthlyProductivity) {
        charts.monthlyProductivity.destroy();
    }
    
    // Generate last 6 months data
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push({
            key: date.toISOString().slice(0, 7), // YYYY-MM format
            label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
        });
    }
    
    const monthlyYields = months.map(month => {
        const records = appData.productivity.filter(p => p.date.startsWith(month.key));
        return records.reduce((sum, record) => sum + record.milkYield, 0);
    });
    
    charts.monthlyProductivity = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months.map(m => m.label),
            datasets: [{
                label: 'Monthly Milk Yield (L)',
                data: monthlyYields,
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function loadShelterCapacityChart() {
    const ctx = document.getElementById('shelter-capacity-chart');
    if (!ctx || typeof Chart === 'undefined') return;
    
    if (charts.shelterCapacity) {
        charts.shelterCapacity.destroy();
    }
    
    charts.shelterCapacity = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: appData.shelters.map(s => s.name),
            datasets: [
                {
                    label: 'Current Count',
                    data: appData.shelters.map(s => s.currentCount),
                    backgroundColor: '#1FB8CD'
                },
                {
                    label: 'Total Capacity',
                    data: appData.shelters.map(s => s.capacity),
                    backgroundColor: '#ECEBD5'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Modal Management
function hideFormsModal() {
    document.getElementById('forms-modal').classList.add('hidden');
}

// Placeholder functions for missing functionality
function editCattle(cattleId) {
    showNotification('Edit functionality will be available in future version');
}

function transferCattle(cattleId) {
    showNotification('Transfer functionality will be available in future version');
}

function scheduleVaccination(cattleId, vaccine) {
    showNotification(`Scheduling ${vaccine} for cattle ID ${cattleId}`);
}

function logVaccination(cattleId, vaccine) {
    showVaccinationForm();
}

function manageShelter(shelterId) {
    showNotification('Shelter management functionality will be available in future version');
}

function addCattleToShelter(shelterId) {
    showNotification('Add cattle to shelter functionality will be available in future version');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Auth form submission
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleAuth);
    }
    
    // Load initial page
    if (!isAuthenticated) {
        document.getElementById('landing-page').classList.add('active');
    }
});

// Export functions to global scope for onclick handlers
window.showAuth = showAuth;
window.hideAuth = hideAuth;
window.toggleAuthMode = toggleAuthMode;
window.logout = logout;
window.showSection = showSection;
window.showAddCattleForm = showAddCattleForm;
window.showVaccinationForm = showVaccinationForm;
window.showProductivityForm = showProductivityForm;
window.showShelterForm = showShelterForm;
window.hideFormsModal = hideFormsModal;
window.hideCattleDetail = hideCattleDetail;
window.hideNotification = hideNotification;
window.filterCattle = filterCattle;
window.showCattleDetail = showCattleDetail;
window.showCattleTab = showCattleTab;
window.generateQR = generateQR;
window.showVaccinationTab = showVaccinationTab;
window.handleCattleSubmit = handleCattleSubmit;
window.handleVaccinationSubmit = handleVaccinationSubmit;
window.handleProductivitySubmit = handleProductivitySubmit;
window.handleShelterSubmit = handleShelterSubmit;
window.editCattle = editCattle;
window.transferCattle = transferCattle;
window.scheduleVaccination = scheduleVaccination;
window.logVaccination = logVaccination;
window.manageShelter = manageShelter;
window.addCattleToShelter = addCattleToShelter;