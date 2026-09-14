/**
 * SmartServe Staff Personal Schedule Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('my-schedule-app');
  if (!container) return;

  const state = {
    profile: null,
    shifts: []
  };

  const alertContainer = document.getElementById('page-alert');
  const shiftsTableBody = document.getElementById('my-shifts-tbody');
  const tableContainer = document.getElementById('my-shifts-table-container');
  const emptyState = document.getElementById('my-shifts-empty');
  const statMyUpcoming = document.getElementById('stat-my-upcoming');
  const statMyTotal = document.getElementById('stat-my-total');
  const greetingEl = document.getElementById('staff-greeting');

  async function loadStaffSchedule() {
    try {
      // Fetch user profile
      const profile = await Api.get('/api/staff/me');
      state.profile = profile;

      if (greetingEl && profile) {
        greetingEl.textContent = `Welcome back, ${profile.name} (${profile.category})`;
      }

      // Fetch own shifts
      const shifts = await Api.get(`/api/staff/${profile.id}/schedules`);
      state.shifts = shifts || [];

      updateStats();
      renderShifts();
    } catch (err) {
      UI.showAlert(alertContainer, `Unable to load your schedule: ${err.message}`, 'error', err.title);
    }
  }

  function updateStats() {
    const today = new Date().toISOString().slice(0, 10);
    const total = state.shifts.length;
    const upcoming = state.shifts.filter(s => s.workDate >= today).length;

    if (statMyTotal) statMyTotal.textContent = total;
    if (statMyUpcoming) statMyUpcoming.textContent = upcoming;
  }

  function renderShifts() {
    if (!state.shifts || state.shifts.length === 0) {
      if (tableContainer) tableContainer.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');

    shiftsTableBody.innerHTML = state.shifts.map(s => `
      <tr>
        <td>
          <strong>${UI.escapeHtml(s.eventReference)}</strong>
          <div class="muted small">${UI.escapeHtml(s.eventName)}</div>
        </td>
        <td>
          <strong>${UI.formatDate(s.workDate)}</strong>
        </td>
        <td>
          <strong>${UI.formatTime(s.startTime)} – ${UI.formatTime(s.endTime)}</strong>
        </td>
        <td>
          ${UI.getRoleBadge(s.assignedRole)}
          <span class="muted small">${UI.escapeHtml(s.area || '')}</span>
        </td>
        <td>
          ${UI.getStatusBadge(s.status)}
        </td>
        <td>
          <span class="muted small">${UI.escapeHtml(s.notes || '—')}</span>
        </td>
      </tr>
    `).join('');
  }

  loadStaffSchedule();
});
