// src/utils/validation.js
export const ValidationRules = {
  /**
   * Validate email format
   */
  email: (email) => {
    const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return regex.test(email);
  },

  /**
   * Validate phone number (Indian)
   */
  phone: (phone) => {
    const regex = /^[6-9]\\d{9}$/;
    return regex.test(phone.replace(/\\D/g, ''));
  },

  /**
   * Validate Aadhar number (12 digits)
   */
  aadhar: (aadhar) => {
    const regex = /^\\d{12}$/;
    return regex.test(aadhar.replace(/\\D/g, ''));
  },

  /**
   * Validate PAN number
   */
  pan: (pan) => {
    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return regex.test(pan);
  },

  /**
   * Validate password strength
   */
  password: (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;
    return regex.test(password);
  },

  /**
   * Validate name (alphabets and spaces only)
   */
  name: (name) => {
    const regex = /^[a-zA-Z\\s]{2,}$/;
    return regex.test(name);
  },

  /**
   * Validate amount (positive number)
   */
  amount: (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  },

  /**
   * Validate percentage (0-100)
   */
  percentage: (percent) => {
    const num = parseFloat(percent);
    return !isNaN(num) && num >= 0 && num <= 100;
  },

  /**
   * Validate zip code
   */
  zipCode: (zip) => {
    const regex = /^[0-9]{6}$/;
    return regex.test(zip);
  },

  /**
   * Validate URL
   */
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate date format (YYYY-MM-DD)
   */
  date: (dateString) => {
    const regex = /^\\d{4}-\\d{2}-\\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  /**
   * Validate age (must be 18 or older)
   */
  age: (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 18;
  },
};

export const FormValidator = {
  /**
   * Validate login form
   */
  validateLoginForm: (email, password) => {
    const errors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!ValidationRules.email(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  },

  /**
   * Validate customer form
   */
  validateCustomerForm: (data) => {
    const errors = {};

    if (!data.fullName) {
      errors.fullName = 'Full name is required';
    } else if (!ValidationRules.name(data.fullName)) {
      errors.fullName = 'Invalid name format';
    }

    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!ValidationRules.email(data.email)) {
      errors.email = 'Invalid email format';
    }

    if (!data.phone) {
      errors.phone = 'Phone number is required';
    } else if (!ValidationRules.phone(data.phone)) {
      errors.phone = 'Invalid phone number';
    }

    if (!data.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else if (!ValidationRules.age(data.dateOfBirth)) {
      errors.dateOfBirth = 'Must be 18 years or older';
    }

    if (!data.address) {
      errors.address = 'Address is required';
    }

    if (data.aadharNumber && !ValidationRules.aadhar(data.aadharNumber)) {
      errors.aadharNumber = 'Invalid Aadhar number';
    }

    if (data.panNumber && !ValidationRules.pan(data.panNumber)) {
      errors.panNumber = 'Invalid PAN format';
    }

    return errors;
  },

  /**
   * Validate loan form
   */
  validateLoanForm: (data) => {
    const errors = {};

    if (!data.customerId) {
      errors.customerId = 'Customer selection is required';
    }

    if (!data.loanType) {
      errors.loanType = 'Loan type is required';
    }

    if (!data.principalAmount) {
      errors.principalAmount = 'Principal amount is required';
    } else if (!ValidationRules.amount(data.principalAmount)) {
      errors.principalAmount = 'Invalid amount';
    }

    if (!data.interestRate) {
      errors.interestRate = 'Interest rate is required';
    } else if (!ValidationRules.percentage(data.interestRate)) {
      errors.interestRate = 'Interest rate must be between 0-100';
    }

    if (!data.tenure) {
      errors.tenure = 'Tenure (months) is required';
    } else if (parseInt(data.tenure) < 1) {
      errors.tenure = 'Tenure must be at least 1 month';
    }

    return errors;
  },

  /**
   * Validate payment form
   */
  validatePaymentForm: (data) => {
    const errors = {};

    if (!data.loanId) {
      errors.loanId = 'Loan selection is required';
    }

    if (!data.amount) {
      errors.amount = 'Amount is required';
    } else if (!ValidationRules.amount(data.amount)) {
      errors.amount = 'Invalid amount';
    }

    if (!data.paymentDate) {
      errors.paymentDate = 'Payment date is required';
    }

    if (!data.paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }

    if (!data.referenceNumber) {
      errors.referenceNumber = 'Reference number is required';
    }

    return errors;
  },

  /**
   * Check if form has errors
   */
  hasErrors: (errors) => {
    return Object.keys(errors).length > 0;
  },

  /**
   * Get error message
   */
  getErrorMessage: (errors, fieldName) => {
    return errors[fieldName] || '';
  },
};
