/**
 * SmartServe Resource Management & Allocation Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const state = {
    resources: [],
    events: [],
    selectedEventId: null,
    allocations: [],
    deleteAllocationId: null
  };

  // DOM Elements - Alerts
  const pageAlert = document.getElementById('page-alert');

  // DOM Elements - Resource Catalog
  const resourcesTableBody = document.getElementById('resources-tbody');
  const resourcesEmpty = document.getElementById('resources-empty');
  const resourcesTableContainer = document.getElementById('resources-table-container');

  // Modal Create Resource
  const btnOpenCreateResource = document.getElementById('btn-open-create-resource');
  const modalCreateResource = document.getElementById('modal-create-resource');
  const formCreateResource = document.getElementById('form-create-resource');
  const resourceName = document.getElementById('resource-name');
  const resourceCategory = document.getElementById('resource-category');
  const resourceQuantity = document.getElementById('resource-quantity');
  const resourceNotes = document.getElementById('resource-notes');
  const createResourceAlert = document.getElementById('create-resource-alert');

  // Event Allocation Elements
  const eventSelector = document.getElementById('select-event');
  const allocationsTableBody = document.getElementById('allocations-tbody');
  const allocationsEmpty = document.getElementById('allocations-empty');
  const allocationsTableContainer = document.getElementById('allocations-table-container');
  const eventHeaderInfo = document.getElementById('event-header-info');
  const allocationSection = document.getElementById('allocation-section');

  // Modal Allocate Resource
  const btnOpenAllocate = document.getElementById('btn-open-allocate');
  const modalAllocate = document.getElementById('modal-allocate');
  const formAllocate = document.getElementById('form-allocate');
  const allocateResourceSelect = document.getElementById('allocate-resource-select');
  const allocateQuantity = document.getElementById('allocate-quantity');
  const allocateNotes = document.getElementById('allocate-notes');
  const allocateAlert = document.getElementById('allocate-alert');

  // Modal Remove Allocation
  const modalRemoveAllocation = document.getElementById('modal-remove-allocation');
  const removeAllocationSummary = document.getElementById('remove-allocation-summary');
  const btnConfirmRemoveAllocation = document.getElementById('btn-confirm-remove-allocation');
  const removeAllocationAlert = document.getElementById('remove-allocation-alert');

  // Generic close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.getAttribute('data-close-modal');
      UI.closeModal(modalId);
    });
  });

  // Load Resources & Events
  async function loadInitialData() {
    try {
      const [resData, evtData] = await Promise.all([
        Api.get('/api/resources'),
        Api.get('/api/events')
      ]);

      state.resources = resData || [];
      state.events = evtData || [];

      renderResources();
      populateEventSelector();
      populateResourceDropdown();
    } catch (err) {
      UI.showAlert(pageAlert, `Failed to load resource data: ${err.message}`, 'error', err.title);
    }
  }

  function renderResources() {
    if (!state.resources || state.resources.length === 0) {
      if (resourcesTableContainer) resourcesTableContainer.classList.add('hidden');
      if (resourcesEmpty) resourcesEmpty.classList.remove('hidden');
      return;
    }

    if (resourcesEmpty) resourcesEmpty.classList.add('hidden');
    if (resourcesTableContainer) resourcesTableContainer.classList.remove('hidden');

    resourcesTableBody.innerHTML = state.resources.map(r => `
      <tr data-resource-id="${r.resourceId}">
        <td><strong>${UI.escapeHtml(r.name)}</strong></td>
        <td><span class="badge">${UI.escapeHtml(r.category)}</span></td>
        <td><strong>${r.quantityAvailable}</strong> units</td>
        <td><span class="muted small">${UI.escapeHtml(r.notes || '—')}</span></td>
      </tr>
    `).join('');
  }

  function populateEventSelector() {
    if (!eventSelector) return;
    eventSelector.innerHTML = '<option value="">Choose an event to manage allocations...</option>' +
      state.events.map(e => `
        <option value="${e.id}">${UI.escapeHtml(e.reference)} — ${UI.escapeHtml(e.name)} (${e.eventDate})</option>
      `).join('');

    if (state.events.length > 0) {
      eventSelector.value = state.events[0].id;
      state.selectedEventId = state.events[0].id;
      loadEventAllocations(state.selectedEventId);
    }
  }

  function populateResourceDropdown() {
    if (!allocateResourceSelect) return;
    allocateResourceSelect.innerHTML = '<option value="">Select Resource...</option>' +
      state.resources.map(r => `
        <option value="${r.resourceId}">${UI.escapeHtml(r.name)} (Available: ${r.quantityAvailable}, Category: ${r.category})</option>
      `).join('');
  }

  if (eventSelector) {
    eventSelector.addEventListener('change', () => {
      const id = parseInt(eventSelector.value, 10);
      if (id) {
        state.selectedEventId = id;
        loadEventAllocations(id);
      } else {
        state.selectedEventId = null;
        state.allocations = [];
        renderAllocations();
      }
    });
  }

  async function loadEventAllocations(eventId) {
    if (!eventId) return;
    try {
      const event = state.events.find(e => e.id === eventId);
      if (eventHeaderInfo && event) {
        eventHeaderInfo.textContent = `${event.reference} — ${event.name} (${event.eventDate} at ${event.location || 'N/A'})`;
      }

      state.allocations = await Api.get(`/api/events/${eventId}/resources`);
      renderAllocations();
    } catch (err) {
      UI.showAlert(pageAlert, `Failed to load event resources: ${err.message}`, 'error', err.title);
    }
  }

  function renderAllocations() {
    if (!state.selectedEventId) {
      if (allocationsTableContainer) allocationsTableContainer.classList.add('hidden');
      if (allocationsEmpty) {
        allocationsEmpty.classList.remove('hidden');
        allocationsEmpty.innerHTML = '<div class="empty-desc">Please select an event above to view and allocate resources.</div>';
      }
      return;
    }

    if (!state.allocations || state.allocations.length === 0) {
      if (allocationsTableContainer) allocationsTableContainer.classList.add('hidden');
      if (allocationsEmpty) {
        allocationsEmpty.classList.remove('hidden');
        allocationsEmpty.innerHTML = '<div class="empty-desc">No resources allocated to this event yet. Click "Allocate Resource" to add equipment/supplies.</div>';
      }
      return;
    }

    if (allocationsEmpty) allocationsEmpty.classList.add('hidden');
    if (allocationsTableContainer) allocationsTableContainer.classList.remove('hidden');

    allocationsTableBody.innerHTML = state.allocations.map(al => `
      <tr data-allocation-id="${al.allocationId}">
        <td><strong>${UI.escapeHtml(al.resourceName)}</strong></td>
        <td><strong>${al.quantityAllocated}</strong> units</td>
        <td><span class="muted small">${UI.escapeHtml(al.notes || '—')}</span></td>
        <td class="actions-cell">
          <button type="button" class="button danger btn-sm btn-remove-allocation" data-id="${al.allocationId}">
            Remove
          </button>
        </td>
      </tr>
    `).join('');

    // Attach listeners
    allocationsTableBody.querySelectorAll('.btn-remove-allocation').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
        openRemoveAllocationModal(id);
      });
    });
  }

  // --- Create Resource ---
  if (btnOpenCreateResource) {
    btnOpenCreateResource.addEventListener('click', () => {
      formCreateResource.reset();
      UI.clearAlert(createResourceAlert);
      UI.openModal('modal-create-resource');
    });
  }

  if (formCreateResource) {
    formCreateResource.addEventListener('submit', async (e) => {
      e.preventDefault();
      UI.clearAlert(createResourceAlert);

      const name = resourceName.value.trim();
      const category = resourceCategory.value.trim();
      const qty = parseInt(resourceQuantity.value, 10);
      const notes = resourceNotes.value ? resourceNotes.value.trim() : null;

      if (!name || !category || isNaN(qty) || qty < 0) {
        UI.showAlert(createResourceAlert, 'Name, category, and valid available quantity (>= 0) are required.', 'warning');
        return;
      }

      const payload = {
        name,
        category,
        quantityAvailable: qty,
        notes
      };

      try {
        await Api.post('/api/resources', payload);
        UI.closeModal('modal-create-resource');
        UI.showAlert(pageAlert, `Resource '${name}' created successfully!`, 'success');
        const resList = await Api.get('/api/resources');
        state.resources = resList || [];
        renderResources();
        populateResourceDropdown();
      } catch (err) {
        UI.showAlert(createResourceAlert, err.message, 'error', err.title);
      }
    });
  }

  // --- Allocate Resource to Event ---
  if (btnOpenAllocate) {
    btnOpenAllocate.addEventListener('click', () => {
      if (!state.selectedEventId) {
        UI.showAlert(pageAlert, 'Please select an event before allocating resources.', 'warning');
        return;
      }
      formAllocate.reset();
      UI.clearAlert(allocateAlert);
      UI.openModal('modal-allocate');
    });
  }

  if (formAllocate) {
    formAllocate.addEventListener('submit', async (e) => {
      e.preventDefault();
      UI.clearAlert(allocateAlert);

      const resourceId = parseInt(allocateResourceSelect.value, 10);
      const qty = parseInt(allocateQuantity.value, 10);
      const notes = allocateNotes.value ? allocateNotes.value.trim() : null;

      if (!resourceId) {
        UI.showAlert(allocateAlert, 'Please select a resource.', 'warning');
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        UI.showAlert(allocateAlert, 'Please enter a positive allocated quantity.', 'warning');
        return;
      }

      const payload = {
        resourceId,
        quantityAllocated: qty,
        notes
      };

      try {
        await Api.post(`/api/events/${state.selectedEventId}/resources`, payload);
        UI.closeModal('modal-allocate');
        UI.showAlert(pageAlert, 'Resource allocated to event successfully!', 'success');
        await loadEventAllocations(state.selectedEventId);
      } catch (err) {
        // Clear 409 conflict and over-allocation messages are handled here
        UI.showAlert(allocateAlert, err.message, 'error', err.title);
      }
    });
  }

  // --- Remove Resource Allocation ---
  function openRemoveAllocationModal(allocationId) {
    const allocation = state.allocations.find(al => al.allocationId === allocationId);
    if (!allocation) return;

    state.deleteAllocationId = allocationId;
    UI.clearAlert(removeAllocationAlert);

    removeAllocationSummary.innerHTML = `
      <p>Are you sure you want to remove <strong>${allocation.quantityAllocated} units</strong> of <strong>${UI.escapeHtml(allocation.resourceName)}</strong> from this event?</p>
      <p class="muted small">This quantity will be released back to the available inventory for other events on this date.</p>
    `;

    UI.openModal('modal-remove-allocation');
  }

  if (btnConfirmRemoveAllocation) {
    btnConfirmRemoveAllocation.addEventListener('click', async () => {
      if (!state.deleteAllocationId || !state.selectedEventId) return;

      try {
        await Api.delete(`/api/events/${state.selectedEventId}/resources/${state.deleteAllocationId}`);
        UI.closeModal('modal-remove-allocation');
        UI.showAlert(pageAlert, 'Resource allocation removed successfully.', 'success');
        state.deleteAllocationId = null;
        await loadEventAllocations(state.selectedEventId);
      } catch (err) {
        UI.showAlert(removeAllocationAlert, err.message, 'error', err.title);
      }
    });
  }

  // Run initialization
  loadInitialData();
});
