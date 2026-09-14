// Culinary Connect CRM Frontend Controller
let currentInquiries = [];
let inquiryModalInstance = null;
let viewModalInstance = null;
let deleteModalInstance = null;
let inquiryToDeleteId = 0;
let searchTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    inquiryModalInstance = new bootstrap.Modal(document.getElementById('inquiryModal'));
    viewModalInstance = new bootstrap.Modal(document.getElementById('viewModal'));
    deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteModal'));

    // Set today as min date for the datepicker
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('eventDate').min = todayStr;

    checkDbStatus();
    fetchStats();
    fetchInquiries();
});

// Check database status
async function checkDbStatus() {
    try {
        const res = await fetch('/api/db-status');
        const data = await res.json();
        const badge = document.getElementById('dbStatusBadge');
        if (data.database) {
            badge.innerHTML = `<i class="fa-solid fa-circle-check text-success me-1"></i> Connected: <strong>${data.database}</strong>`;
        }
    } catch (e) {
        console.error('Error fetching DB status:', e);
    }
}

// Fetch dashboard KPIs
async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        const s = await res.json();
        document.getElementById('statTotal').innerText = s.total || 0;
        document.getElementById('statNew').innerText = s.newLeads || 0;
        document.getElementById('statContacted').innerText = s.contacted || 0;
        document.getElementById('statQuoted').innerText = s.quoted || 0;
        document.getElementById('statConfirmed').innerText = s.confirmed || 0;
        document.getElementById('statConversion').innerText = s.conversionRate || '0.0%';
    } catch (e) {
        console.error('Error fetching stats:', e);
    }
}

// Fetch inquiries with search & filters
async function fetchInquiries() {
    const query = document.getElementById('searchInput').value.trim();
    const status = document.getElementById('statusFilter').value;
    const channel = document.getElementById('channelFilter').value;

    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (status && status !== 'ALL') params.append('status', status);
    if (channel && channel !== 'ALL') params.append('channel', channel);

    const tbody = document.getElementById('inquiriesTableBody');
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                Loading inquiries...
            </td>
        </tr>
    `;

    try {
        const res = await fetch('/api/inquiries?' + params.toString());
        const result = await res.json();
        if (result.success) {
            currentInquiries = result.data || [];
            renderTable(currentInquiries);
            document.getElementById('inquiryCountLabel').innerText = `Showing ${currentInquiries.length} ${currentInquiries.length === 1 ? 'entry' : 'entries'}`;
        } else {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Error: ${result.error}</td></tr>`;
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Connection Error. Please ensure backend server is running.</td></tr>`;
    }
}

// Render inquiries in table
function renderTable(inquiries) {
    const tbody = document.getElementById('inquiriesTableBody');
    if (inquiries.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5 text-muted">
                    <i class="fa-regular fa-folder-open fs-2 d-block mb-2 text-secondary"></i>
                    No customer inquiries found matching your filters.
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    inquiries.forEach(i => {
        const c = i.customer || {};
        const channelClass = getChannelClass(i.communicationChannel);
        const channelIcon = getChannelIcon(i.communicationChannel);
        const statusBadgeClass = `status-${i.status}`;

        html += `
            <tr>
                <td class="fw-bold text-muted">#${i.inquiryId}</td>
                <td>
                    <div class="fw-bold text-dark">${escapeHtml(c.fullName || 'N/A')}</div>
                    <div class="small text-muted"><i class="fa-solid fa-phone me-1"></i>${escapeHtml(c.phone || '')}</div>
                    <div class="small text-muted"><i class="fa-solid fa-envelope me-1"></i>${escapeHtml(c.email || '')}</div>
                    ${c.companyName ? `<span class="badge bg-light text-dark border small mt-1"><i class="fa-solid fa-building me-1"></i>${escapeHtml(c.companyName)}</span>` : ''}
                </td>
                <td>
                    <div class="fw-semibold text-primary">${escapeHtml(i.eventType)}</div>
                    <div class="small text-dark"><i class="fa-regular fa-calendar me-1"></i>${i.eventDate}</div>
                    <div class="small text-muted"><i class="fa-solid fa-location-dot me-1"></i>${escapeHtml(i.venueLocation)}</div>
                    <div class="small text-muted fst-italic">${escapeHtml(i.cateringStyle)}</div>
                </td>
                <td>
                    <span class="badge bg-light text-dark border px-2 py-1">
                        <i class="fa-solid fa-users me-1 text-secondary"></i><strong>${i.guestCount}</strong> pax
                    </span>
                </td>
                <td>
                    <span class="fw-semibold">LKR ${Number(i.budgetEstimate).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </td>
                <td>
                    <span class="badge-channel ${channelClass}">
                        <i class="${channelIcon}"></i> ${escapeHtml(i.communicationChannel)}
                    </span>
                </td>
                <td>
                    <div class="dropdown">
                        <button class="btn btn-sm status-badge ${statusBadgeClass} dropdown-toggle border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            ${i.statusDisplayName || i.status}
                        </button>
                        <ul class="dropdown-menu shadow-sm border-0 small">
                            <li><h6 class="dropdown-header">Advance Status</h6></li>
                            <li><button class="dropdown-item" onclick="quickUpdateStatus(${i.inquiryId}, 'NEW')">New Lead</button></li>
                            <li><button class="dropdown-item" onclick="quickUpdateStatus(${i.inquiryId}, 'CONTACTED')">Contacted</button></li>
                            <li><button class="dropdown-item" onclick="quickUpdateStatus(${i.inquiryId}, 'QUOTATION_SENT')">Quotation Sent</button></li>
                            <li><button class="dropdown-item text-success fw-bold" onclick="quickUpdateStatus(${i.inquiryId}, 'CONFIRMED')"><i class="fa-solid fa-check me-1"></i> Confirm Booking</button></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><button class="dropdown-item text-danger" onclick="quickUpdateStatus(${i.inquiryId}, 'CANCELLED')"><i class="fa-solid fa-ban me-1"></i> Cancel</button></li>
                        </ul>
                    </div>
                </td>
                <td class="text-end">
                    <div class="btn-group">
                        <button class="btn btn-outline-info action-btn" title="View Details & Notes" onclick="openViewModal(${i.inquiryId})">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-primary action-btn" title="Edit Inquiry" onclick="openEditModal(${i.inquiryId})">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-outline-danger action-btn" title="Delete" onclick="openDeleteModal(${i.inquiryId}, '${escapeHtml(c.fullName)}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

// Open modal for Create
function openCreateModal() {
    document.getElementById('inquiryModalLabel').innerHTML = '<i class="fa-solid fa-calendar-plus me-2"></i> Log New Catering Inquiry';
    document.getElementById('modalInquiryId').value = '0';
    document.getElementById('inquiryForm').reset();
    document.getElementById('modalErrorAlert').classList.add('d-none');
    document.getElementById('saveInquiryBtn').innerHTML = '<i class="fa-solid fa-floppy-disk me-1"></i> Save Inquiry';
    
    // Set default status to NEW
    document.getElementById('inquiryStatus').value = 'NEW';
    document.getElementById('commChannel').value = 'WhatsApp';
    document.getElementById('cateringStyle').value = 'Buffet';
}

// Open modal for Edit
function openEditModal(inquiryId) {
    const inq = currentInquiries.find(x => x.inquiryId === inquiryId);
    if (!inq) return;

    document.getElementById('inquiryModalLabel').innerHTML = `<i class="fa-solid fa-pen-to-square me-2"></i> Edit Inquiry #${inq.inquiryId}`;
    document.getElementById('modalInquiryId').value = inq.inquiryId;
    document.getElementById('modalErrorAlert').classList.add('d-none');
    document.getElementById('saveInquiryBtn').innerHTML = '<i class="fa-solid fa-check me-1"></i> Update Inquiry';

    const c = inq.customer || {};
    document.getElementById('custName').value = c.fullName || '';
    document.getElementById('custPhone').value = c.phone || '';
    document.getElementById('custEmail').value = c.email || '';
    document.getElementById('custCompany').value = c.companyName || '';

    document.getElementById('eventType').value = inq.eventType || '';
    document.getElementById('eventDate').value = inq.eventDate || '';
    document.getElementById('guestCount').value = inq.guestCount || '';
    document.getElementById('venueLocation').value = inq.venueLocation || '';
    document.getElementById('cateringStyle').value = inq.cateringStyle || 'Buffet';
    document.getElementById('budgetEstimate').value = inq.budgetEstimate || '';
    document.getElementById('commChannel').value = inq.communicationChannel || 'WhatsApp';
    document.getElementById('inquiryStatus').value = inq.status || 'NEW';
    document.getElementById('dietaryNotes').value = inq.dietaryNotes || '';
    document.getElementById('followUpNotes').value = inq.followUpNotes || '';

    inquiryModalInstance.show();
}

// Handle Form Submission (Create or Update)
async function handleFormSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('inquiryForm');
    const errAlert = document.getElementById('modalErrorAlert');
    const errMsg = document.getElementById('modalErrorMessage');

    errAlert.classList.add('d-none');

    // Client-side HTML5 validation trigger
    if (!form.checkValidity()) {
        event.stopPropagation();
        form.classList.add('was-validated');
        showFormError('Please fill out all required fields marked with * correctly.');
        return;
    }

    const inquiryId = parseInt(document.getElementById('modalInquiryId').value) || 0;
    const isEdit = inquiryId > 0;

    // Date check
    const eventDate = document.getElementById('eventDate').value;
    const today = new Date().toISOString().split('T')[0];
    if (eventDate < today) {
        showFormError('Event Date cannot be in the past. Please select a valid future date.');
        return;
    }

    // Phone format check
    const phone = document.getElementById('custPhone').value.trim();
    if (phone.length < 9) {
        showFormError('Contact phone number must be at least 9 digits.');
        return;
    }

    const payload = {
        inquiryId: inquiryId,
        fullName: document.getElementById('custName').value.trim(),
        phone: phone,
        email: document.getElementById('custEmail').value.trim(),
        companyName: document.getElementById('custCompany').value.trim(),
        eventType: document.getElementById('eventType').value,
        eventDate: eventDate,
        guestCount: parseInt(document.getElementById('guestCount').value) || 0,
        venueLocation: document.getElementById('venueLocation').value.trim(),
        cateringStyle: document.getElementById('cateringStyle').value,
        budgetEstimate: parseFloat(document.getElementById('budgetEstimate').value) || 0.0,
        communicationChannel: document.getElementById('commChannel').value,
        status: document.getElementById('inquiryStatus').value,
        dietaryNotes: document.getElementById('dietaryNotes').value.trim(),
        followUpNotes: document.getElementById('followUpNotes').value.trim()
    };

    const url = isEdit ? '/api/inquiries/update' : '/api/inquiries';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.success) {
            inquiryModalInstance.hide();
            showToast(isEdit ? `Inquiry #${inquiryId} updated successfully!` : 'New inquiry created and stored successfully!');
            fetchStats();
            fetchInquiries();
        } else {
            showFormError(result.error || 'Failed to process inquiry.');
        }
    } catch (e) {
        showFormError('Network request failed. Is the server running?');
    }
}

function showFormError(msg) {
    const errAlert = document.getElementById('modalErrorAlert');
    const errMsg = document.getElementById('modalErrorMessage');
    errMsg.innerText = msg;
    errAlert.classList.remove('d-none');
}

// Quick status advancement from dropdown
async function quickUpdateStatus(inquiryId, newStatus) {
    try {
        const res = await fetch(`/api/inquiries/${inquiryId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const result = await res.json();
        if (result.success) {
            showToast(`Inquiry #${inquiryId} moved to ${newStatus}`);
            fetchStats();
            fetchInquiries();
        } else {
            alert('Failed: ' + result.error);
        }
    } catch (e) {
        alert('Error updating status: ' + e);
    }
}

// Open View Details Modal
function openViewModal(inquiryId) {
    const inq = currentInquiries.find(x => x.inquiryId === inquiryId);
    if (!inq) return;

    const c = inq.customer || {};
    const body = document.getElementById('viewModalBody');
    body.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="badge bg-primary fs-6">Inquiry #${inq.inquiryId}</span>
            <span class="status-badge status-${inq.status}">${inq.statusDisplayName || inq.status}</span>
        </div>
        <h5 class="fw-bold text-dark mb-1">${escapeHtml(c.fullName || 'N/A')}</h5>
        <div class="text-muted small mb-3">
            ${c.companyName ? `<i class="fa-solid fa-building me-1"></i>${escapeHtml(c.companyName)} &bull; ` : ''}
            <i class="fa-solid fa-phone me-1"></i>${escapeHtml(c.phone || '')} &bull; 
            <i class="fa-solid fa-envelope me-1"></i>${escapeHtml(c.email || '')}
        </div>
        <hr>
        <div class="row g-2 small">
            <div class="col-6"><strong>Event Type:</strong> ${escapeHtml(inq.eventType)}</div>
            <div class="col-6"><strong>Event Date:</strong> ${inq.eventDate}</div>
            <div class="col-6"><strong>Guest Count:</strong> ${inq.guestCount} pax</div>
            <div class="col-6"><strong>Catering Style:</strong> ${escapeHtml(inq.cateringStyle)}</div>
            <div class="col-6"><strong>Venue:</strong> ${escapeHtml(inq.venueLocation)}</div>
            <div class="col-6"><strong>Budget:</strong> LKR ${Number(inq.budgetEstimate).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            <div class="col-6"><strong>Lead Source:</strong> ${escapeHtml(inq.communicationChannel)}</div>
        </div>
        <div class="mt-3 p-3 bg-light rounded border">
            <div class="fw-semibold text-danger small mb-1"><i class="fa-solid fa-triangle-exclamation me-1"></i> Dietary & Allergy Notes:</div>
            <div class="small">${inq.dietaryNotes ? escapeHtml(inq.dietaryNotes) : '<em class="text-muted">None specified</em>'}</div>
        </div>
        <div class="mt-2 p-3 bg-light rounded border">
            <div class="fw-semibold text-primary small mb-1"><i class="fa-solid fa-clipboard-user me-1"></i> Customer Service Follow-Up Notes:</div>
            <div class="small">${inq.followUpNotes ? escapeHtml(inq.followUpNotes) : '<em class="text-muted">No notes recorded yet.</em>'}</div>
        </div>
        <div class="mt-3 alert alert-info py-2 px-3 small mb-0">
            <i class="fa-solid fa-circle-nodes me-1"></i> <strong>Module Handoff:</strong> When confirmed, this inquiry automatically provides headcount data to Chef Nuwan (Mod 3) & Logistics (Mod 5).
        </div>
    `;

    document.getElementById('viewEditBtn').onclick = () => {
        viewModalInstance.hide();
        openEditModal(inquiryId);
    };

    viewModalInstance.show();
}

// Open Delete Modal
function openDeleteModal(inquiryId, customerName) {
    inquiryToDeleteId = inquiryId;
    document.getElementById('deleteInquiryName').innerText = `#${inquiryId} (${customerName})`;
    document.getElementById('confirmDeleteBtn').onclick = confirmDelete;
    deleteModalInstance.show();
}

// Confirm Delete
async function confirmDelete() {
    if (inquiryToDeleteId <= 0) return;
    try {
        const res = await fetch('/api/inquiries/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inquiryId: inquiryToDeleteId })
        });
        const result = await res.json();
        deleteModalInstance.hide();
        if (result.success) {
            showToast(`Inquiry #${inquiryToDeleteId} deleted successfully.`);
            fetchStats();
            fetchInquiries();
        } else {
            alert('Failed to delete: ' + result.error);
        }
    } catch (e) {
        alert('Delete request failed: ' + e);
    }
}

// Export CSV
function exportCsv() {
    window.location.href = '/api/inquiries/export';
}

// Search debounce
function debounceSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchInquiries();
    }, 250);
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'ALL';
    document.getElementById('channelFilter').value = 'ALL';
    fetchInquiries();
}

// Helper icons & classes
function getChannelClass(ch) {
    switch (ch) {
        case 'WhatsApp': return 'channel-whatsapp';
        case 'Phone Call': return 'channel-phone';
        case 'Email': return 'channel-email';
        case 'Walk-in': return 'channel-walkin';
        case 'Website Form': return 'channel-website';
        default: return 'bg-secondary text-white';
    }
}

function getChannelIcon(ch) {
    switch (ch) {
        case 'WhatsApp': return 'fa-brands fa-whatsapp';
        case 'Phone Call': return 'fa-solid fa-phone';
        case 'Email': return 'fa-regular fa-envelope';
        case 'Walk-in': return 'fa-solid fa-person-walking';
        case 'Website Form': return 'fa-solid fa-globe';
        default: return 'fa-solid fa-comment';
    }
}

function showToast(msg) {
    document.getElementById('toastMessage').innerText = msg;
    const toastEl = document.getElementById('liveToast');
    toastEl.className = 'toast align-items-center text-white bg-success border-0';
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
