/**
 * SmartServe API Client & UI Helpers
 */

const Api = {
  async request(url, options = {}) {
    const defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // If options.body is a FormData or already stringified, adjust
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {})
      }
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return null;
      }

      const isJson = (response.headers.get('content-type') || '').includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        let errorMessage = 'An unexpected error occurred.';
        let errorTitle = 'Error';

        if (response.status === 400) {
          errorTitle = 'Validation Error';
          errorMessage = (data && data.message) ? data.message : 'Please review the submitted form fields.';
        } else if (response.status === 403) {
          errorTitle = 'Access Denied';
          errorMessage = 'You do not have permission to perform this action.';
        } else if (response.status === 404) {
          errorTitle = 'Not Found';
          errorMessage = (data && data.message) ? data.message : 'The requested record was not found.';
        } else if (response.status === 409) {
          errorTitle = 'Conflict Detected';
          errorMessage = (data && data.message) ? data.message : 'This action conflicts with existing schedule, staff availability, or resource allocations.';
        } else if (data && data.message) {
          errorMessage = data.message;
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        error.title = errorTitle;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.status) {
        throw err;
      }
      const networkError = new Error(err.message || 'Unable to communicate with the server. Please check your network.');
      networkError.status = 0;
      networkError.title = 'Network Error';
      throw networkError;
    }
  },

  get(url) {
    return this.request(url, { method: 'GET' });
  },

  post(url, body) {
    return this.request(url, { method: 'POST', body });
  },

  put(url, body) {
    return this.request(url, { method: 'PUT', body });
  },

  delete(url) {
    return this.request(url, { method: 'DELETE' });
  }
};

const UI = {
  showAlert(container, message, type = 'error', title = null) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (!el) return;

    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    };
    const alertTitle = title || titles[type] || 'Notice';

    el.innerHTML = `
      <div class="alert alert-${type}" role="alert">
        <div class="alert-content">
          <div class="alert-title">${this.escapeHtml(alertTitle)}</div>
          <div class="alert-message">${this.escapeHtml(message)}</div>
        </div>
        <button type="button" class="alert-close" aria-label="Dismiss">&times;</button>
      </div>
    `;
    el.classList.remove('hidden');

    const closeBtn = el.querySelector('.alert-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        el.innerHTML = '';
        el.classList.add('hidden');
      });
    }

    if (type === 'success') {
      setTimeout(() => {
        if (el.innerHTML.includes('alert-success')) {
          el.innerHTML = '';
          el.classList.add('hidden');
        }
      }, 5000);
    }
  },

  clearAlert(container) {
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    if (el) {
      el.innerHTML = '';
      el.classList.add('hidden');
    }
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      const firstInput = modal.querySelector('input:not([type=hidden]), select, textarea');
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 50);
      }
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      const alertContainer = modal.querySelector('.modal-alert');
      if (alertContainer) {
        alertContainer.innerHTML = '';
        alertContainer.classList.add('hidden');
      }
    }
  },

  escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  },

  formatTime(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10);
      const m = parts[1];
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    }
    return timeStr;
  },

  formatDateTime(isoStr) {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  },

  getRoleBadge(role) {
    const roleKey = (role || '').toLowerCase();
    let cls = 'badge-server';
    if (roleKey.includes('chef')) cls = 'badge-chef';
    else if (roleKey.includes('kitchen')) cls = 'badge-kitchen';
    else if (roleKey.includes('supervisor')) cls = 'badge-supervisor';
    return `<span class="badge-role ${cls}">${this.escapeHtml(role || 'UNKNOWN')}</span>`;
  },

  getStatusBadge(status) {
    const s = (status || '').toUpperCase();
    let cls = 'badge-draft';
    if (s === 'PUBLISHED') cls = 'badge-published';
    else if (s === 'READY') cls = 'badge-ready';
    else if (s === 'CANCELLED') cls = 'badge-cancelled';
    return `<span class="badge-status ${cls}">${this.escapeHtml(s || 'DRAFT')}</span>`;
  }
};
