/**
 * SmartServe Staff Availability Management Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('availability-app');
  if (!container) return;

  const state = {
    userRole: container.getAttribute('data-user-role') || 'STAFF',
    staffId: container.getAttribute('data-staff-id') ? parseInt(container.getAttribute('data-staff-id'), 10) : null,
    staffList: [],
    periods: [],
    selectedPeriod: null,
    deleteTargetId: null
  };

  // DOM Elements
  const alertContainer = document.getElementById('page-alert');
  const staffSelector = document.getElementById('select-staff');
  const staffSelectGroup = document.getElementById('staff-select-group');
  const periodsTableBody = document.getElementById('periods-tbody');
  const emptyState = document.getElementById('periods-empty');
  const tableContainer = document.getElementById('periods-table-container');
  const staffNameDisplay = document.getElementById('current-staff-name');

  // Add Modal Elements
  const btnOpenAdd = document.getElementById('btn-open-add');
  const modalAdd = document.getElementById('modal-add');
  const formAdd = document.getElementById('form-add');
  const addStartsAt = document.getElementById('add-starts-at');
  const addEndsAt = document.getElementById('add-ends-at');
  const addAvailable = document.getElementById('add-available');
  const addNotes = document.getElementById('add-notes');
  const addAlert = document.getElementById('add-alert');

  // Edit Modal Elements
  const modalEdit = document.getElementById('modal-edit');
  const formEdit = document.getElementById('form-edit');
  const editId = document.getElementById('edit-id');
  const editStartsAt = document.getElementById('edit-starts-at');
  const editEndsAt = document.getElementById('edit-ends-at');
  const editAvailable = document.getElementById('edit-available');
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

  // Determine current user session if staffId wasn't passed via dataset
  try {
    const me = await Api.get('/api/me');
    if (me) {
      state.userRole = me.role;
      if (me.staffId) {
        state.staffId = me.staffId;
      }
    }
  } catch (err) {
    console.warn('Could not retrieve user session:', err);
  }

  const isManager = state.userRole === 'OPERATIONS_MANAGER' || state.userRole === 'ADMIN';

  // Initialize UI based on role
  if (isManager) {
    if (staffSelectGroup) staffSelectGroup.classList.remove('hidden');
    await loadStaffMembers();
  } else {
    if (staffSelectGroup) staffSelectGroup.classList.add('hidden');
    if (state.staffId) {
      await loadAvailability(state.staffId);
    } else {
      UI.showAlert(alertContainer, 'Your staff profile is not linked to a staff record. Please contact your manager.', 'warning');
    }
  }

  async function loadStaffMembers() {
    try {
      state.staffList = await Api.get('/api/staff');
      if (staffSelector) {
        staffSelector.innerHTML = '<option value="">Select a staff member...</option>' +
          state.staffList.map(s => `<option value="${s.id}">${UI.escapeHtml(s.name)} (${s.category})</option>`).join('');

        if (state.staffList.length > 0) {
          // Select first staff member by default
          staffSelector.value = state.staffList[0].id;
          state.staffId = state.staffList[0].id;
          await loadAvailability(state.staffId);
        }
      }
    } catch (err) {
      UI.showAlert(alertContainer, `Failed to load staff members: ${err.message}`, 'error', err.title);
    }
  }

  if (staffSelector) {
    staffSelector.addEventListener('change', async () => {
      const selectedId = parseInt(staffSelector.value, 10);
      if (selectedId) {
        state.staffId = selectedId;
        await loadAvailability(selectedId);
      } else {
        state.periods = [];
        renderPeriods();
      }
    });
  }

  async function loadAvailability(staffId) {
    if (!staffId) return;
    try {
      state.periods = await Api.get(`/api/staff/${staffId}/availability`);

      // Update name display
      const staffMember = state.staffList.find(s => s.id === staffId);
      if (staffNameDisplay && staffMember) {
        staffNameDisplay.textContent = `for ${staffMember.name} (${staffMember.category})`;
      }

      renderPeriods();
    } catch (err) {
      UI.showAlert(alertContainer, `Failed to load availability: ${err.message}`, 'error', err.title);
    }
  }

  function renderPeriods() {
    if (!state.periods || state.periods.length === 0) {
      if (tableContainer) tableContainer.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');

    periodsTableBody.innerHTML = state.periods.map(p => `
      <tr data-period-id="${p.id}">
        <td>
          <span class="badge-status ${p.available ? 'badge-available' : 'badge-unavailable'}">
            ${p.available ? 'AVAILABLE' : 'UNAVAILABLE'}
          </span>
        </td>
        <td>
          <strong>${UI.formatDateTime(p.startsAt)}</strong>
        </td>
        <td>
          <strong>${UI.formatDateTime(p.endsAt)}</strong>
        </td>
        <td>
          <span class="muted small">${UI.escapeHtml(p.notes || '—')}</span>
        </td>
        <td class="actions-cell">
          <button type="button" class="button secondary btn-sm btn-edit-period" data-id="${p.id}">
            Edit
          </button>
          <button type="button" class="button danger btn-sm btn-delete-period" data-id="${p.id}">
            Delete
          </button>
        </td>
      </tr>
    `).join('');

    // Attach listeners
    periodsTableBody.querySelectorAll('.btn-edit-period').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        openEditModal(id);
      });
    });

    periodsTableBody.querySelectorAll('.btn-delete-period').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        openDeleteModal(id);
      });
    });
  }

  // --- Add Period ---
  if (btnOpenAdd) {
    btnOpenAdd.addEventListener('click', () => {
      if (!state.staffId) {
        UI.showAlert(alertContainer, 'Please select a staff member first.', 'warning');
        return;
      }
      formAdd.reset();
      UI.clearAlert(addAlert);

      // Pre-fill tomorrow 08:00 to 18:00
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');

      if (addStartsAt) addStartsAt.value = `${yyyy}-${mm}-${dd}T08:00`;
      if (addEndsAt) addEndsAt.value = `${yyyy}-${mm}-${dd}T18:00`;
      if (addAvailable) addAvailable.value = 'true';

      UI.openModal('modal-add');
    });
  }

  if (formAdd) {
    formAdd.addEventListener('submit', async (e) => {
      e.preventDefault();
      UI.clearAlert(addAlert);

      const startsAt = addStartsAt.value;
      const endsAt = addEndsAt.value;
      const available = addAvailable.value === 'true';
      const notes = addNotes.value ? addNotes.value.trim() : null;

      if (!startsAt || !endsAt) {
        UI.showAlert(addAlert, 'Start and end dates/times are required.', 'warning');
        return;
      }
      if (endsAt <= startsAt) {
        UI.showAlert(addAlert, 'Start time must be strictly before end time.', 'warning');
        return;
      }

      const payload = {
        staffId: state.staffId,
        startsAt,
        endsAt,
        available,
        notes
      };

      try {
        await Api.post(`/api/staff/${state.staffId}/availability`, payload);
        UI.closeModal('modal-add');
        UI.showAlert(alertContainer, 'Availability period recorded successfully!', 'success');
        await loadAvailability(state.staffId);
      } catch (err) {
        UI.showAlert(addAlert, err.message, 'error', err.title);
      }
    });
  }

  // --- Edit Period ---
  function openEditModal(periodId) {
    const period = state.periods.find(p => p.id === periodId);
    if (!period) return;

    state.selectedPeriod = period;
    UI.clearAlert(editAlert);

    editId.value = period.id;
    // Format LocalDateTime to YYYY-MM-DDTHH:mm
    if (editStartsAt) editStartsAt.value = period.startsAt.slice(0, 16);
    if (editEndsAt) editEndsAt.value = period.endsAt.slice(0, 16);
    if (editAvailable) editAvailable.value = period.available ? 'true' : 'false';
    if (editNotes) editNotes.value = period.notes || '';

    UI.openModal('modal-edit');
  }

  if (formEdit) {
    formEdit.addEventListener('submit', async (e) => {
      e.preventDefault();
      UI.clearAlert(editAlert);

      const id = parseInt(editId.value, 10);
      const startsAt = editStartsAt.value;
      const endsAt = editEndsAt.value;
      const available = editAvailable.value === 'true';
      const notes = editNotes.value ? editNotes.value.trim() : null;

      if (!startsAt || !endsAt) {
        UI.showAlert(editAlert, 'Start and end dates/times are required.', 'warning');
        return;
      }
      if (endsAt <= startsAt) {
        UI.showAlert(editAlert, 'Start time must be strictly before end time.', 'warning');
        return;
      }

      const payload = {
        startsAt,
        endsAt,
        available,
        notes
      };

      try {
        await Api.put(`/api/staff/${state.staffId}/availability/${id}`, payload);
        UI.closeModal('modal-edit');
        UI.showAlert(alertContainer, 'Availability period updated successfully!', 'success');
        await loadAvailability(state.staffId);
      } catch (err) {
        UI.showAlert(editAlert, err.message, 'error', err.title);
      }
    });
  }

  // --- Delete Period ---
  function openDeleteModal(periodId) {
    const period = state.periods.find(p => p.id === periodId);
    if (!period) return;

    state.deleteTargetId = periodId;
    UI.clearAlert(deleteAlert);

    deleteSummary.innerHTML = `
      <p>Are you sure you want to remove the <strong>${period.available ? 'AVAILABLE' : 'UNAVAILABLE'}</strong> period from <strong>${UI.formatDateTime(period.startsAt)}</strong> to <strong>${UI.formatDateTime(period.endsAt)}</strong>?</p>
      <p class="muted small">This may affect shift scheduling and conflict detection.</p>
    `;

    UI.openModal('modal-delete');
  }

  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', async () => {
      if (!state.deleteTargetId || !state.staffId) return;

      try {
        await Api.delete(`/api/staff/${state.staffId}/availability/${state.deleteTargetId}`);
        UI.closeModal('modal-delete');
        UI.showAlert(alertContainer, 'Availability period deleted successfully.', 'success');
        state.deleteTargetId = null;
        await loadAvailability(state.staffId);
      } catch (err) {
        UI.showAlert(deleteAlert, err.message, 'error', err.title);
      }
    });
  }
});
