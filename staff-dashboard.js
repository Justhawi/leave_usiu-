// Staff Dashboard JavaScript

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for authentication
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await initializeStaffDashboard();
        }
    });
    
    // Event listeners
    document.getElementById('logoutBtn')?.addEventListener('click', window.logoutUser);
    document.getElementById('newLeaveBtn')?.addEventListener('click', openLeaveModal);
    document.getElementById('closeLeaveModal')?.addEventListener('click', closeLeaveModal);
    document.getElementById('leaveForm')?.addEventListener('submit', submitLeaveRequest);
    document.getElementById('statusFilter')?.addEventListener('change', filterLeaveRequests);
    document.getElementById('markAttendanceBtn')?.addEventListener('click', markAttendance);
    document.getElementById('attendanceMonth')?.addEventListener('change', loadAttendanceRecords);
    
    // Set default attendance month to current month
    const now = new Date();
    const monthInput = document.getElementById('attendanceMonth');
    if (monthInput) {
        monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
});

async function initializeStaffDashboard() {
    currentUser = await window.getCurrentUserData();
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Display user information
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('staffDept').textContent = currentUser.department;
    document.getElementById('staffId').textContent = currentUser.staffId;
    document.getElementById('availableDays').textContent = currentUser.leaveBalance || 21;
    
    // Load leave requests
    await loadLeaveRequests();
    
    // Load attendance records
    await loadAttendanceRecords();
}

async function loadLeaveRequests() {
    try {
        const snapshot = await db.collection('leaveRequests')
            .where('userId', '==', currentUser.id)
            .orderBy('createdAt', 'desc')
            .get();
        
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Update statistics
        const pending = requests.filter(r => r.status === 'pending').length;
        const approved = requests.filter(r => r.status === 'approved').length;
        const usedDays = requests
            .filter(r => r.status === 'approved')
            .reduce((sum, r) => sum + calculateDays(r.startDate, r.endDate), 0);
        
        document.getElementById('pendingCount').textContent = pending;
        document.getElementById('approvedCount').textContent = approved;
        document.getElementById('usedDays').textContent = usedDays;
        
        // Display requests
        displayLeaveRequests(requests);
    } catch (error) {
        console.error('Error loading leave requests:', error);
        window.showToast('Error loading leave requests', 'error');
    }
}

function displayLeaveRequests(requests) {
    const container = document.getElementById('leaveRequests');
    const filter = document.getElementById('statusFilter').value;
    
    const filteredRequests = filter === 'all' 
        ? requests 
        : requests.filter(r => r.status === filter);
    
    if (filteredRequests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h4>No leave requests found</h4>
                <p>Click "New Leave Request" to submit your first request</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredRequests.map(request => `
        <div class="request-card">
            <div class="request-header">
                <div>
                    <h4 class="feature-title" style="margin: 0; font-size: 1.1rem;">
                        ${formatLeaveType(request.leaveType)}
                    </h4>
                    <p style="margin: 4px 0 0; color: rgba(44, 62, 80, 0.6); font-size: 0.9rem;">
                        ${formatDate(request.startDate)} - ${formatDate(request.endDate)}
                        (${calculateDays(request.startDate, request.endDate)} days)
                    </p>
                </div>
                <span class="status-pill ${request.status}">
                    ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
            </div>
            <div class="request-details">
                <div class="status-card">
                    <h4>Reason</h4>
                    <p style="margin: 0;">${request.reason}</p>
                </div>
                <div class="status-card gold">
                    <h4>Submitted</h4>
                    <p style="margin: 0;">${formatDate(request.createdAt)}</p>
                </div>
            </div>
            ${request.adminComment ? `
                <div class="status-card" style="margin-top: 16px;">
                    <h4>Admin Comment</h4>
                    <p style="margin: 0;">${request.adminComment}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
}

function filterLeaveRequests() {
    loadLeaveRequests();
}

function openLeaveModal() {
    document.getElementById('leaveModal').classList.add('active');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;
}

function closeLeaveModal() {
    document.getElementById('leaveModal').classList.remove('active');
    document.getElementById('leaveForm').reset();
}

async function submitLeaveRequest(e) {
    e.preventDefault();
    
    const leaveType = document.getElementById('leaveType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const reason = document.getElementById('reason').value;
    
    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
        window.showToast('End date must be after start date', 'error');
        return;
    }
    
    const days = calculateDays(startDate, endDate);
    
    // Check leave balance
    if (days > currentUser.leaveBalance) {
        window.showToast('Insufficient leave balance', 'error');
        return;
    }
    
    try {
        await db.collection('leaveRequests').add({
            userId: currentUser.id,
            userName: currentUser.name,
            userEmail: currentUser.email,
            staffId: currentUser.staffId,
            department: currentUser.department,
            leaveType: leaveType,
            startDate: startDate,
            endDate: endDate,
            reason: reason,
            days: days,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        window.showToast('Leave request submitted successfully!');
        closeLeaveModal();
        await loadLeaveRequests();
    } catch (error) {
        console.error('Error submitting leave request:', error);
        window.showToast('Error submitting request. Please try again.', 'error');
    }
}

async function markAttendance() {
    const today = new Date().toISOString().split('T')[0];
    
    try {
        // Check if attendance already marked today
        const snapshot = await db.collection('attendance')
            .where('userId', '==', currentUser.id)
            .where('date', '==', today)
            .get();
        
        if (!snapshot.empty) {
            window.showToast('Attendance already marked for today', 'error');
            return;
        }
        
        // Mark attendance
        await db.collection('attendance').add({
            userId: currentUser.id,
            userName: currentUser.name,
            staffId: currentUser.staffId,
            department: currentUser.department,
            date: today,
            status: 'present',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        window.showToast('Attendance marked successfully!');
        await loadAttendanceRecords();
    } catch (error) {
        console.error('Error marking attendance:', error);
        window.showToast('Error marking attendance. Please try again.', 'error');
    }
}

async function loadAttendanceRecords() {
    const monthInput = document.getElementById('attendanceMonth').value;
    if (!monthInput) return;
    
    const [year, month] = monthInput.split('-');
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-${new Date(year, month, 0).getDate()}`;
    
    try {
        const snapshot = await db.collection('attendance')
            .where('userId', '==', currentUser.id)
            .where('date', '>=', startDate)
            .where('date', '<=', endDate)
            .orderBy('date', 'desc')
            .get();
        
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const container = document.getElementById('attendanceRecords');
        
        if (records.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No attendance records found</h4>
                    <p>Mark your attendance to see records here</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = records.map(record => `
            <div class="request-card">
                <div class="request-header">
                    <div>
                        <h4 class="feature-title" style="margin: 0; font-size: 1.1rem;">
                            ${formatDate(record.date)}
                        </h4>
                        <p style="margin: 4px 0 0; color: rgba(44, 62, 80, 0.6); font-size: 0.9rem;">
                            Marked at ${formatTimestamp(record.timestamp)}
                        </p>
                    </div>
                    <span class="status-pill approved">Present</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading attendance records:', error);
        window.showToast('Error loading attendance records', 'error');
    }
}

// Utility functions
function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    if (dateString.seconds) {
        // Firestore timestamp
        const date = new Date(dateString.seconds * 1000);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    
    if (timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
        });
    }
    
    return 'N/A';
}

function formatLeaveType(type) {
    const types = {
        'annual': 'Annual Leave',
        'sick': 'Sick Leave',
        'maternity': 'Maternity Leave',
        'paternity': 'Paternity Leave',
        'unpaid': 'Unpaid Leave',
        'study': 'Study Leave',
        'compassionate': 'Compassionate Leave'
    };
    return types[type] || type;
}
