/**
 * SmartServe Staff Scheduling Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    events: [],
    staff: [],
    schedules: [],
    selectedSchedule: null,
    deleteTargetId: null
  };

  // DOM Elements
  const alertContainer = document.getElementById('page-alert');
  const rosterTableBody = document.getElementById('roster-tbody');
  const emptyState = document.getElementById('roster-empty');
  const tableContainer = document.getElementById('roster-table-container');

  // Stats Elements
  const statTotalShifts = document.getElementById('stat-total-shifts');
  const statUpcomingShifts = document.getElementById('stat-upcoming-shifts');
  const statAssignedStaff = document.getElementById('stat-assigned-staff');
  const statActiveEvents = document.getElementById('stat-active-events');

  // Filter Elements
  const filterMonth = document.getElementById('filter-month');
  const filterDate = document.getElementById('filter-date');
  const filterEvent = document.getElementById('filter-event');
  const filterStaff = document.getElementById('filter-staff');
  const filterRole = document.getElementById('filter-role');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const btnRefresh = document.getElementById('btn-refresh');

  // Create Modal Elements
  const btnOpenCreate = document.getElementById('btn-open-create');
  const modalCreate = document.getElementById('modal-create');
  const formCreate = document.getElementById('form-create');
  const createEvent = document.getElementById('create-event');
  const createStaff = document.getElementById('create-staff');
  const createRole = document.getElementById('create-role');
  const createArea = document.getElementById('create-area');
  const createDate = document.getElementById('create-date');
  const createStartTime = document.getElementById('create-start-time');
  const createEndTime = document.getElementById('create-end-time');
  const createNotes = document.getElementById('create-notes');
  const createAlert = document.getElementById('create-alert');

  // Edit Modal Elements
  const modalEdit = document.getElementById('modal-edit');
  const formEdit = document.getElementById('form-edit');
  const editId = document.getElementById('edit-id');
  const editEventInfo = document.getElementById('edit-event-info');
  const editStaffInfo = document.getElementById('edit-staff-info');
  const editRole = document.getElementById('edit-role');
  const editArea = document.getElementById('edit-area');
  const editDate = document.getElementById('edit-date');
  const editStartTime = document.getElementById('edit-start-time');
  const editEndTime = document.getElementById('edit-end-time');
  const editNotes = document.getElementById('edit-notes');
  const editAlert = document.getElementById('edit-alert');

  // Delete Modal Elements
  const modalDelete = document.getElementById('modal-delete');
  const deleteSummary = document.getElementById('delete-summary');
  const btnConfirmDelete = document.getElementById('btn-confirm-delete');
  const deleteAlert = document.getElementById('delete-alert');

  // Generic close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.getAttribute('data-close-modal');
      UI.closeModal(modalId);
    });
  });

  // Role -> Area auto-selection helper
  function updateAreaDefault(roleSelect, areaSelect) {
    const role = roleSelect.value;
    if (role === 'CHEF' || role === 'KITCHEN_ASSISTANT') {
      areaSelect.value = 'KITCHEN';
    } else if (role === 'SUPERVISOR' || role === 'SERVER') {
      areaSelect.value = 'EVENT';
    }
  }

  if (createRole && createArea) {
    createRole.addEventListener('change', () => updateAreaDefault(createRole, createArea));
  }
  if (editRole && editArea) {
    editRole.addEventListener('change', () => updateAreaDefault(editRole, editArea));
  }

  // --- Data Loading ---
  async function loadMetadata() {
    try {
      const [eventsData, staffData] = await Promise.all([
        Api.get('/api/events'),
        Api.get('/api/staff')
      ]);

      state.events = eventsData || [];
      state.staff = staffData || [];

      populateDropdowns();
    } catch (err) {
      UI.showAlert(alertContainer, `Failed to load event or staff options: ${err.message}`, 'error', err.title);
    }
  }

  function populateDropdowns() {
    // Populate Events
    const eventOptions = state.events.map(e =>
      `<option value="${e.id}">${UI.escapeHtml(e.reference)} — ${UI.escapeHtml(e.name)} (${e.eventDate})</option>`
    ).join('');

    if (filterEvent) {
      filterEvent.innerHTML = '<option value="">All Events</option>' + eventOptions;
    }
    if (createEvent) {
      createEvent.innerHTML = '<option value="">Select Event...</option>' + eventOptions;
    }

    // Populate Staff
    const staffOptions = state.staff.map(s =>
      `<option value="${s.id}" data-category="${s.category}">${UI.escapeHtml(s.name)} (${s.category})</option>`
    ).join('');

    if (filterStaff) {
      filterStaff.innerHTML = '<option value="">All Staff</option>' + staffOptions;
    }
    if (createStaff) {
      createStaff.innerHTML = '<option value="">Select Staff Member...</option>' + staffOptions;
    }
  }

  // Sync staff selection with role in create modal
  if (createStaff) {
    createStaff.addEventListener('change', () => {
      const selectedOption = createStaff.selectedOptions[0];
      if (selectedOption && selectedOption.dataset.category) {
        createRole.value = selectedOption.dataset.category;
        updateAreaDefault(createRole, createArea);
      }
    });
  }

  async function loadSchedules() {
    try {
      const params = new URLSearchParams();
      if (filterEvent && filterEvent.value) params.append('eventId', filterEvent.value);
      if (filterStaff && filterStaff.value) params.append('staffId', filterStaff.value);
      if (filterDate && filterDate.value) params.append('workDate', filterDate.value);
      if (filterMonth && filterMonth.value) params.append('month', filterMonth.value);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const list = await Api.get(`/api/schedules${queryString}`);

      // Apply client-side role filter if selected
      const selectedRole = filterRole ? filterRole.value : '';
      state.schedules = selectedRole
        ? list.filter(s => s.assignedRole === selectedRole)
        : list;

      renderRoster();
      updateStatistics();
    } catch (err) {
      UI.showAlert(alertContainer, `Failed to load schedules: ${err.message}`, 'error', err.title);
    }
  }

  function updateStatistics() {
    const today = new Date().toISOString().slice(0, 10);
    const total = state.schedules.length;
    const upcoming = state.schedules.filter(s => s.workDate >= today).length;
    const uniqueStaff = new Set(state.schedules.map(s => s.staffId)).size;
    const uniqueEvents = new Set(state.schedules.map(s => s.eventId)).size;

    if (statTotalShifts) statTotalShifts.textContent = total;
    if (statUpcomingShifts) statUpcomingShifts.textContent = upcoming;
    if (statAssignedStaff) statAssignedStaff.textContent = uniqueStaff;
    if (statActiveEvents) statActiveEvents.textContent = uniqueEvents;
  }

  function renderRoster() {
    if (!state.schedules || state.schedules.length === 0) {
      if (tableContainer) tableContainer.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');

    rosterTableBody.innerHTML = state.schedules.map(s => `
      <tr data-schedule-id="${s.scheduleId}">
        <td>
          <strong>${UI.escapeHtml(s.eventReference)}</strong>
          <div class="muted small">${UI.escapeHtml(s.eventName)}</div>
        </td>
        <td>
          <strong>${UI.escapeHtml(s.staffName)}</strong>
        </td>
        <td>
          ${UI.getRoleBadge(s.assignedRole)}
          <span class="muted small">${UI.escapeHtml(s.area || '')}</span>
        </td>
        <td>
          <strong>${UI.formatDate(s.workDate)}</strong>
        </td>
        <td>
          ${UI.formatTime(s.startTime)} – ${UI.formatTime(s.endTime)}
        </td>
        <td>
          ${UI.getStatusBadge(s.status)}
        </td>
        <td>
          <span class="muted small">${UI.escapeHtml(s.notes || '—')}</span>
        </td>
        <td class="actions-cell">
          <button type="button" class="button secondary btn-sm btn-edit-schedule" data-id="${s.scheduleId}">
            Edit
          </button>
          <button type="button" class="button danger btn-sm btn-delete-schedule" data-id="${s.scheduleId}">
            Cancel
          </button>
        </td>
      </tr>
    `).join('');

    // Attach row action listeners
    rosterTableBody.querySelectorAll('.btn-edit-schedule').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        openEditModal(id);
      });
    });

    rosterTableBody.querySelectorAll('.btn-delete-schedule').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        openDeleteModal(id);
      });
    });
  }

  // --- Create Schedule ---
  if (btnOpenCreate) {
    btnOpenCreate.addEventListener('click', () => {
      formCreate.reset();
      UI.clearAlert(createAlert);
      // Pre-fill tomorrow as default work date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (createDate) createDate.value = tomorrow.toISOString().slice(0, 10);
      if (createStartTime) createStartTime.value = '09:00';
      if (createEndTime) createEndTime.value = '17:00';
      UI.openModal('modal-create');
    });
  }

  if (formCreate) {
    formCreate.addEventListener('submit', async (e) => {
      e.preventDefault();
      UI.clearAlert(createAlert);

      const eventId = parseInt(createEvent.value, 10);
      const staffId = parseInt(createStaff.value, 10);
      const role = createRole.value;
      const area = createArea.value;
      const workDate = createDate.value;
      const startTime = createStartTime.value;
      const endTime = createEndTime.value;
      const notes = createNotes.value ? createNotes.value.trim() : null;

      // Basic client-side validations before request
      if (!eventId) {
        UI.showAlert(createAlert, 'Please select an event.', 'warning');
        return;
      }
      if (!staffId) {
        UI.showAlert(createAlert, 'Please select a staff member.', 'warning');
        return;
      }
      if (!role) {
        UI.showAlert(createAlert, 'Please select a role.', 'warning');
        return;
      }
      if (!workDate || !startTime || !endTime) {
        UI.showAlert(createAlert, 'Work date, start time, and end time are required.', 'warning');
        return;
      }
      if (endTime <= startTime) {
        UI.showAlert(createAlert, 'Start time must be before end time.', 'warning');
        return;
      }

      const payload = {
        eventId,
        staffId,
        role,
        area: area || null,
        workDate,
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
        notes
      };

      try {
        await Api.post('/api/schedules', payload);
        UI.closeModal('modal-create');
        UI.showAlert(alertContainer, 'Shift schedule successfully created!', 'success');
        await loadSchedules();
      } catch (err) {
        UI.showAlert(createAlert, err.message, 'error', err.title);
      }
    });
  }

  // --- Edit Schedule ---
  function openEditModal(scheduleId) {
    const item = state.schedules.find(s => s.scheduleId === scheduleId);
    if (!item) return;

    state.selectedSchedule = item;
    UI.clearAlert(editAlert);

    editId.value = item.scheduleId;
    editEventInfo.textContent = `${item.eventReference} — ${item.eventName}`;
    editStaffInfo.textContent = item.staffName;
    editRole.value = item.assignedRole;
    editArea.value = item.area || 'EVENT';
    editDate.value = item.workDate;
    editStartTime.value = (item.startTime || '').slice(0, 5);
    editEndTime.value = (item.endTime || '').slice(0, 5);
    editNotes.value = item.notes || '';

    UI.openModal('modal-edit');
  }

  if (formEdit) {
    formEdit.addEventListener('submit', async (e) => {
      e.preventDefault();
      UI.clearAlert(editAlert);

      const id = parseInt(editId.value, 10);
      const role = editRole.value;
      const area = editArea.value;
      const workDate = editDate.value;
      const startTime = editStartTime.value;
      const endTime = editEndTime.value;
      const notes = editNotes.value ? editNotes.value.trim() : null;

      if (!workDate || !startTime || !endTime) {
        UI.showAlert(editAlert, 'Work date, start time, and end time are required.', 'warning');
        return;
      }
      if (endTime <= startTime) {
        UI.showAlert(editAlert, 'Start time must be before end time.', 'warning');
        return;
      }

      const payload = {
        role,
        area: area || null,
        workDate,
        startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
        endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
        notes
      };

      try {
        await Api.put(`/api/schedules/${id}`, payload);
        UI.closeModal('modal-edit');
        UI.showAlert(alertContainer, 'Shift schedule successfully updated!', 'success');
        await loadSchedules();
      } catch (err) {
        UI.showAlert(editAlert, err.message, 'error', err.title);
      }
    });
  }

  // --- Delete Schedule ---
  function openDeleteModal(scheduleId) {
    const item = state.schedules.find(s => s.scheduleId === scheduleId);
    if (!item) return;

    state.deleteTargetId = scheduleId;
    UI.clearAlert(deleteAlert);

    deleteSummary.innerHTML = `
      <p>Are you sure you want to cancel the shift assignment for <strong>${UI.escapeHtml(item.staffName)}</strong> (${UI.escapeHtml(item.assignedRole)}) on <strong>${UI.formatDate(item.workDate)}</strong> for <strong>${UI.escapeHtml(item.eventReference)}</strong>?</p>
      <p class="muted small">This will remove the assignment and update requirement counts.</p>
    `;

    UI.openModal('modal-delete');
  }

  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
      if (!state.deleteTargetId) return;

      try {
        await Api.delete(`/api/schedules/${state.deleteTargetId}`);
        UI.closeModal('modal-delete');
        UI.showAlert(alertContainer, 'Shift assignment removed successfully.', 'success');
        state.deleteTargetId = null;
        await loadSchedules();
      } catch (err) {
        UI.showAlert(deleteAlert, err.message, 'error', err.title);
      }
    });
  }

  // --- Filter Listeners ---
  [filterMonth, filterDate, filterEvent, filterStaff, filterRole].forEach(el => {
    if (el) el.addEventListener('change', loadSchedules);
  });

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      if (filterMonth) filterMonth.value = '';
      if (filterDate) filterDate.value = '';
      if (filterEvent) filterEvent.value = '';
      if (filterStaff) filterStaff.value = '';
      if (filterRole) filterRole.value = '';
      loadSchedules();
    });
  }

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      loadSchedules();
    });
  }

  // Initial Load
  loadMetadata().then(() => loadSchedules());
});
