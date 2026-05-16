// src/utils/formatters.js
export const DateFormatter = {
  /**
   * Format date to DD/MM/YYYY
   */
  toDisplayDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  },

  /**
   * Format date to YYYY-MM-DD (for inputs)
   */
  toInputDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Format date with time
   */
  toDateTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    const dateStr = this.toDisplayDate(d);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
  },

  /**
   * Format date to relative time (e.g., "2 hours ago")
   */
  toRelativeTime: (date) => {
    if (!date) return '';
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return this.toDisplayDate(date);
  },

  /**
   * Get month name
   */
  getMonthName: (monthIndex) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[monthIndex] || '';
  },

  /**
   * Get formatted month and year
   */
  getMonthYear: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${this.getMonthName(d.getMonth())} ${d.getFullYear()}`;
  },
};

export const NumberFormatter = {
  /**
   * Format currency (Indian Rupees)
   */
  formatCurrency: (amount) => {
    if (!amount && amount !== 0) return '₹0';
    const num = parseFloat(amount);
    return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  },

  /**
   * Format number with commas
   */
  formatNumber: (number) => {
    if (!number && number !== 0) return '0';
    return parseFloat(number).toLocaleString('en-IN', { maximumFractionDigits: 2 });
  },

  /**
   * Format large numbers with abbreviations
   */
  formatLargeNumber: (number) => {
    if (!number && number !== 0) return '0';
    if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
    if (number >= 1000) return (number / 1000).toFixed(1) + 'K';
    return number.toString();
  },

  /**
   * Format percentage
   */
  formatPercentage: (value, decimals = 2) => {
    if (!value && value !== 0) return '0%';
    return parseFloat(value).toFixed(decimals) + '%';
  },

  /**
   * Format phone number
   */
  formatPhone: (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\\D/g, '');
    if (cleaned.length !== 10) return phone;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  },

  /**
   * Format Aadhar number
   */
  formatAadhar: (aadhar) => {
    if (!aadhar) return '';
    const cleaned = aadhar.replace(/\\D/g, '');
    if (cleaned.length !== 12) return aadhar;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
  },

  /**
   * Parse currency string to number
   */
  parseCurrency: (str) => {
    if (!str) return 0;
    return parseFloat(str.replace(/[^0-9.-]/g, ''));
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes) => {
    if (!bytes) return '0 B';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  },

  /**
   * Round to 2 decimal places
   */
  round: (number, decimals = 2) => {
    return parseFloat(number).toFixed(decimals);
  },
};

export const TextFormatter = {
  /**
   * Capitalize first letter
   */
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Convert to title case
   */
  toTitleCase: (str) => {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  },

  /**
   * Convert to uppercase
   */
  toUpperCase: (str) => {
    return (str || '').toUpperCase();
  },

  /**
   * Truncate string
   */
  truncate: (str, length = 20) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  },

  /**
   * Replace underscores with spaces and capitalize
   */
  formatLabel: (str) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').split(' ').map(this.capitalize).join(' ');
  },

  /**
   * Mask sensitive data
   */
  maskSensitive: (str, showChars = 4) => {
    if (!str || str.length <= showChars) return str;
    return '*'.repeat(str.length - showChars) + str.slice(-showChars);
  },
};

export const StatusFormatter = {
  /**
   * Get loan status color
   */
  getLoanStatusColor: (status) => {
    const colors = {
      applied: '#f59e0b',
      approved: '#0ea5e9',
      rejected: '#ef4444',
      active: '#10b981',
      closed: '#64748b',
    };
    return colors[status] || '#6b7280';
  },

  /**
   * Get loan status label
   */
  getLoanStatusLabel: (status) => {
    const labels = {
      applied: 'Applied',
      approved: 'Approved',
      rejected: 'Rejected',
      active: 'Active',
      closed: 'Closed',
    };
    return labels[status] || status;
  },

  /**
   * Get payment status color
   */
  getPaymentStatusColor: (status) => {
    const colors = {
      pending: '#f59e0b',
      completed: '#10b981',
      failed: '#ef4444',
      reversed: '#8b5cf6',
    };
    return colors[status] || '#6b7280';
  },

  /**
   * Get KYC status color
   */
  getKYCStatusColor: (status) => {
    const colors = {
      pending: '#f59e0b',
      verified: '#10b981',
      rejected: '#ef4444',
    };
    return colors[status] || '#6b7280';
  },
};
