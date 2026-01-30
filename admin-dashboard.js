// Admin Dashboard JavaScript

let currentAdmin = null;
let allRequests = [];
let charts = {};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded fired for admin dashboard');
    // Wait for authentication
    auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user ? 'logged in' : 'not logged in');
        if (user) {
            await initializeAdminDashboard();
        }
    });
    
    // Event listeners
    const logoutBtn = document.getElementById('logoutBtn');
    console.log('Logout button found:', logoutBtn);
    if (logoutBtn) {
        logoutBtn.addEventListener('click', window.logoutUser);
        console.log('Logout event listener attached');
    } else {
        console.log('Logout button not found');
    }
    document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);
    document.getElementById('searchStaff')?.addEventListener('input', filterPendingRequests);
    document.getElementById('departmentFilter')?.addEventListener('change', filterPendingRequests);
    document.getElementById('leaveTypeFilter')?.addEventListener('change', filterPendingRequests);
    document.getElementById('allStatusFilter')?.addEventListener('change', filterAllRequests);
    document.getElementById('monthFilter')?.addEventListener('change', filterAllRequests);
    document.getElementById('viewAttendanceBtn')?.addEventListener('click', viewAttendance);
    document.getElementById('closeRequestModal')?.addEventListener('click', closeRequestModal);
});

async function initializeAdminDashboard() {
    currentAdmin = await window.getCurrentUserData();
    
    if (!currentAdmin || currentAdmin.role !== 'admin') {
        window.location.href = 'staff-dashboard.html';
        return;
    }
    
    // Display admin information
    document.getElementById('adminEmail').textContent = currentAdmin.email;
    
    // Load data
    await loadStatistics();
    await loadPendingRequests();
    await loadAllRequests();
    await initializeCharts();
    
    // Set default month filter to current month
    const now = new Date();
    const monthFilter = document.getElementById('monthFilter');
    if (monthFilter) {
        monthFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
}

async function loadStatistics() {
    try {
        // Get total staff count
        const usersSnapshot = await db.collection('users').where('role', '==', 'staff').get();
        const totalStaff = usersSnapshot.size;
        
        // Get current month's date range
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Get leave requests
        const requestsSnapshot = await db.collection('leaveRequests').get();
        const requests = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter requests for current month
        const monthRequests = requests.filter(r => {
            if (!r.createdAt || !r.createdAt.seconds) return false;
            const createdDate = new Date(r.createdAt.seconds * 1000);
            return createdDate >= firstDay && createdDate <= lastDay;
        });
        
        const pending = requests.filter(r => r.status === 'pending').length;
        const approved = monthRequests.filter(r => r.status === 'approved').length;
        const rejected = monthRequests.filter(r => r.status === 'rejected').length;
        
        // Update statistics
        document.getElementById('totalStaff').textContent = totalStaff;
        document.getElementById('totalPending').textContent = pending;
        document.getElementById('totalApproved').textContent = approved;
        document.getElementById('totalRejected').textContent = rejected;
    } catch (error) {
        console.error('Error loading statistics:', error);
        window.showToast('Error loading statistics', 'error');
    }
}

async function loadPendingRequests() {
    try {
        const snapshot = await db.collection('leaveRequests')
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .get();
        
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayPendingRequests(requests);
    } catch (error) {
        console.error('Error loading pending requests:', error);
        window.showToast('Error loading pending requests', 'error');
    }
}

function displayPendingRequests(requests) {
    const container = document.getElementById('pendingRequests');
    
    // Apply filters
    const searchTerm = document.getElementById('searchStaff').value.toLowerCase();
    const deptFilter = document.getElementById('departmentFilter').value;
    const typeFilter = document.getElementById('leaveTypeFilter').value;
    
    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.userName.toLowerCase().includes(searchTerm) || 
                            r.staffId.toLowerCase().includes(searchTerm);
        const matchesDept = deptFilter === 'all' || r.department === deptFilter;
        const matchesType = typeFilter === 'all' || r.leaveType === typeFilter;
        
        return matchesSearch && matchesDept && matchesType;
    });
    
    if (filteredRequests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h4>No pending requests</h4>
                <p>All leave requests have been processed</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredRequests.map(request => `
        <div class="request-card">
            <div class="request-header">
                <div>
                    <h4 class="feature-title" style="margin: 0; font-size: 1.1rem;">
                        ${request.userName} - ${formatLeaveType(request.leaveType)}
                    </h4>
                    <p style="margin: 4px 0 0; color: rgba(44, 62, 80, 0.6); font-size: 0.9rem;">
                        ${request.staffId} | ${request.department}
                    </p>
                </div>
                <span class="status-pill pending">Pending</span>
            </div>
            <div class="request-details">
                <div class="status-card">
                    <h4>Duration</h4>
                    <p style="margin: 0;">
                        ${formatDate(request.startDate)} - ${formatDate(request.endDate)}
                        <br>(${request.days} days)
                    </p>
                </div>
                <div class="status-card gold">
                    <h4>Submitted</h4>
                    <p style="margin: 0;">${formatDate(request.createdAt)}</p>
                </div>
            </div>
            <div class="status-card" style="margin-top: 16px;">
                <h4>Reason</h4>
                <p style="margin: 0;">${request.reason}</p>
            </div>
            <div class="request-actions">
                <button class="btn btn-secondary" onclick="approveRequest('${request.id}')">
                    Approve
                </button>
                <button class="btn btn-danger" onclick="rejectRequest('${request.id}')">
                    Reject
                </button>
                <button class="btn btn-primary" onclick="viewRequestDetails('${request.id}')">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

async function loadAllRequests() {
    try {
        const snapshot = await db.collection('leaveRequests')
            .orderBy('createdAt', 'desc')
            .get();
        
        allRequests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        displayAllRequests();
    } catch (error) {
        console.error('Error loading all requests:', error);
        window.showToast('Error loading requests', 'error');
    }
}

function displayAllRequests() {
    const container = document.getElementById('allRequests');
    const statusFilter = document.getElementById('allStatusFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;
    
    let filteredRequests = allRequests;
    
    // Filter by status
    if (statusFilter !== 'all') {
        filteredRequests = filteredRequests.filter(r => r.status === statusFilter);
    }
    
    // Filter by month
    if (monthFilter) {
        const [year, month] = monthFilter.split('-');
        filteredRequests = filteredRequests.filter(r => {
            if (!r.createdAt || !r.createdAt.seconds) return false;
            const date = new Date(r.createdAt.seconds * 1000);
            return date.getFullYear() === parseInt(year) && 
                   date.getMonth() === parseInt(month) - 1;
        });
    }
    
    if (filteredRequests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h4>No requests found</h4>
                <p>Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredRequests.slice(0, 20).map(request => `
        <div class="request-card">
            <div class="request-header">
                <div>
                    <h4 class="feature-title" style="margin: 0; font-size: 1.1rem;">
                        ${request.userName} - ${formatLeaveType(request.leaveType)}
                    </h4>
                    <p style="margin: 4px 0 0; color: rgba(44, 62, 80, 0.6); font-size: 0.9rem;">
                        ${request.staffId} | ${request.department}
                    </p>
                </div>
                <span class="status-pill ${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
            </div>
            <div class="request-details">
                <div class="status-card">
                    <h4>Duration</h4>
                    <p style="margin: 0;">${formatDate(request.startDate)} - ${formatDate(request.endDate)}</p>
                </div>
                <div class="status-card gold">
                    <h4>Submitted</h4>
                    <p style="margin: 0;">${formatDate(request.createdAt)}</p>
                </div>
            </div>
        </div>
    `).join('');
}

async function approveRequest(requestId) {
    if (!confirm('Are you sure you want to approve this leave request?')) return;
    
    try {
        const requestDoc = await db.collection('leaveRequests').doc(requestId).get();
        const requestData = requestDoc.data();
        
        // Update request status
        await db.collection('leaveRequests').doc(requestId).update({
            status: 'approved',
            approvedBy: currentAdmin.id,
            approvedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user's leave balance
        const userDoc = await db.collection('users').doc(requestData.userId).get();
        const currentBalance = userDoc.data().leaveBalance || 21;
        await db.collection('users').doc(requestData.userId).update({
            leaveBalance: currentBalance - requestData.days
        });
        
        window.showToast('Leave request approved successfully!');
        await loadPendingRequests();
        await loadAllRequests();
        await loadStatistics();
    } catch (error) {
        console.error('Error approving request:', error);
        window.showToast('Error approving request. Please try again.', 'error');
    }
}

async function rejectRequest(requestId) {
    const comment = prompt('Please provide a reason for rejection (optional):');
    
    try {
        await db.collection('leaveRequests').doc(requestId).update({
            status: 'rejected',
            rejectedBy: currentAdmin.id,
            rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
            adminComment: comment || 'Request rejected'
        });
        
        window.showToast('Leave request rejected');
        await loadPendingRequests();
        await loadAllRequests();
        await loadStatistics();
    } catch (error) {
        console.error('Error rejecting request:', error);
        window.showToast('Error rejecting request. Please try again.', 'error');
    }
}

function viewRequestDetails(requestId) {
    // This function can be expanded to show more details in a modal
    const request = allRequests.find(r => r.id === requestId);
    if (!request) return;
    
    alert(`Request Details:
    
Staff: ${request.userName}
Department: ${request.department}
Leave Type: ${formatLeaveType(request.leaveType)}
Duration: ${formatDate(request.startDate)} - ${formatDate(request.endDate)}
Days: ${request.days}
Reason: ${request.reason}
Status: ${request.status}`);
}

async function viewAttendance() {
    const date = document.getElementById('attendanceDate').value;
    if (!date) {
        window.showToast('Please select a date', 'error');
        return;
    }
    
    try {
        const snapshot = await db.collection('attendance')
            .where('date', '==', date)
            .get();
        
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const container = document.getElementById('attendanceOverview');
        
        if (records.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h4>No attendance records for this date</h4>
                    <p>No staff marked attendance on ${formatDate(date)}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = records.map(record => `
            <div class="request-card">
                <div class="request-header">
                    <div>
                        <h4 class="feature-title" style="margin: 0; font-size: 1.1rem;">
                            ${record.userName}
                        </h4>
                        <p style="margin: 4px 0 0; color: rgba(44, 62, 80, 0.6); font-size: 0.9rem;">
                            ${record.staffId} | ${record.department}
                        </p>
                    </div>
                    <span class="status-pill approved">Present</span>
                </div>
                <div class="status-card">
                    <h4>Marked At</h4>
                    <p style="margin: 0;">${formatTimestamp(record.timestamp)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading attendance:', error);
        window.showToast('Error loading attendance records', 'error');
    }
}

async function initializeCharts() {
    try {
        const requestsSnapshot = await db.collection('leaveRequests').get();
        const requests = requestsSnapshot.docs.map(doc => doc.data());
        
        // Leave Type Chart
        const leaveTypes = {};
        requests.forEach(r => {
            leaveTypes[r.leaveType] = (leaveTypes[r.leaveType] || 0) + 1;
        });
        
        const leaveTypeChart = document.getElementById('leaveTypeChart');
        if (leaveTypeChart) {
            new Chart(leaveTypeChart, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(leaveTypes).map(formatLeaveType),
                    datasets: [{
                        data: Object.values(leaveTypes),
                        backgroundColor: [
                            '#1a237e', '#233f90', '#fdb913', '#2ecc71', 
                            '#e74c3c', '#3498db', '#9b59b6'
                        ]
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
        
        // Monthly Trend Chart
        const monthlyData = {};
        const last6Months = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[key] = 0;
            last6Months.push(key);
        }
        
        requests.forEach(r => {
            if (r.createdAt && r.createdAt.seconds) {
                const date = new Date(r.createdAt.seconds * 1000);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (monthlyData[key] !== undefined) {
                    monthlyData[key]++;
                }
            }
        });
        
        const leaveTrendChart = document.getElementById('leaveTrendChart');
        if (leaveTrendChart) {
            new Chart(leaveTrendChart, {
                type: 'line',
                data: {
                    labels: last6Months.map(m => {
                        const [year, month] = m.split('-');
                        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    }),
                    datasets: [{
                        label: 'Leave Requests',
                        data: last6Months.map(m => monthlyData[m]),
                        borderColor: '#1a237e',
                        backgroundColor: 'rgba(26, 35, 126, 0.1)',
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
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

async function generateReport() {
    try {
        const monthFilter = document.getElementById('monthFilter').value;
        let reportData = allRequests;
        
        if (monthFilter) {
            const [year, month] = monthFilter.split('-');
            reportData = allRequests.filter(r => {
                if (!r.createdAt || !r.createdAt.seconds) return false;
                const date = new Date(r.createdAt.seconds * 1000);
                return date.getFullYear() === parseInt(year) && 
                       date.getMonth() === parseInt(month) - 1;
            });
        }
        
        // Create CSV content
        const headers = ['Staff Name', 'Staff ID', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Submitted Date'];
        const rows = reportData.map(r => [
            r.userName,
            r.staffId,
            r.department,
            formatLeaveType(r.leaveType),
            formatDate(r.startDate),
            formatDate(r.endDate),
            r.days,
            r.status,
            formatDate(r.createdAt)
        ]);
        
        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
        });
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leave-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        window.showToast('Report generated successfully!');
    } catch (error) {
        console.error('Error generating report:', error);
        window.showToast('Error generating report', 'error');
    }
}

function filterPendingRequests() {
    loadPendingRequests();
}

function filterAllRequests() {
    displayAllRequests();
}

function closeRequestModal() {
    document.getElementById('requestModal').classList.remove('active');
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    if (dateString.seconds) {
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
        return date.toLocaleString('en-US');
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

// Make functions globally accessible
window.approveRequest = approveRequest;
window.rejectRequest = rejectRequest;
window.viewRequestDetails = viewRequestDetails;
