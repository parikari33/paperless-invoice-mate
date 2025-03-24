
import { InvoiceData, ValidationError } from '@/types/invoice';

export const validateInvoiceData = (data: InvoiceData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Invoice number validation
  if (!data.invoiceNumber) {
    errors.push({
      field: 'invoiceNumber',
      message: 'Invoice number is required'
    });
  }

  // Date validation
  if (!data.date) {
    errors.push({
      field: 'date',
      message: 'Invoice date is required'
    });
  } else if (!isValidDate(data.date)) {
    errors.push({
      field: 'date',
      message: 'Invoice date is invalid'
    });
  }

  // Due date validation
  if (data.dueDate && !isValidDate(data.dueDate)) {
    errors.push({
      field: 'dueDate',
      message: 'Due date is invalid'
    });
  }

  // Customer name validation
  if (!data.customerName) {
    errors.push({
      field: 'customerName',
      message: 'Customer name is required'
    });
  }

  // Email validation
  if (data.customerEmail && !isValidEmail(data.customerEmail)) {
    errors.push({
      field: 'customerEmail',
      message: 'Customer email is invalid'
    });
  }

  // Items validation
  if (!data.items || data.items.length === 0) {
    errors.push({
      field: 'items',
      message: 'At least one invoice item is required'
    });
  } else {
    data.items.forEach((item, index) => {
      if (!item.description) {
        errors.push({
          field: `items[${index}].description`,
          message: `Item #${index + 1} description is required`
        });
      }
      
      if (isNaN(item.quantity) || item.quantity <= 0) {
        errors.push({
          field: `items[${index}].quantity`,
          message: `Item #${index + 1} quantity must be a positive number`
        });
      }
      
      if (isNaN(item.unitPrice) || item.unitPrice < 0) {
        errors.push({
          field: `items[${index}].unitPrice`,
          message: `Item #${index + 1} unit price must be a non-negative number`
        });
      }
    });
  }

  // Total validation
  if (isNaN(data.total) || data.total < 0) {
    errors.push({
      field: 'total',
      message: 'Total amount must be a non-negative number'
    });
  }

  return errors;
};

const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const parseFormattedCurrency = (formattedAmount: string): number => {
  // Remove currency symbol and commas, then parse to number
  const numericString = formattedAmount.replace(/[^0-9.-]+/g, '');
  return parseFloat(numericString);
};

export const calculateInvoiceTotal = (data: InvoiceData): InvoiceData => {
  // Calculate each item amount
  const items = data.items.map(item => ({
    ...item,
    amount: item.quantity * item.unitPrice
  }));
  
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate tax amount
  const taxAmount = (data.taxRate / 100) * subtotal;
  
  // Calculate total
  const total = subtotal + taxAmount;
  
  return {
    ...data,
    items,
    subtotal,
    taxAmount,
    total
  };
};
