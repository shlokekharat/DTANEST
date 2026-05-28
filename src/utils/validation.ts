import { FieldDefinition, ValidationError } from '../types';

/**
 * Validates a record client-side or server-side based on schema field definitions.
 * Returns an array of ValidationError instances.
 */
export function validateRecord(
  formData: Record<string, any>,
  fields: FieldDefinition[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  fields.forEach((field) => {
    const rawVal = formData[field.key];
    
    // 1. Required Check
    const isEmpty = rawVal === undefined || rawVal === null || String(rawVal).trim() === '';
    if (field.required && isEmpty) {
      errors.push({
        field: field.key,
        message: `${field.name} is a required field.`
      });
      return; // Skip other checks if missing and required
    }

    if (isEmpty) return;

    const valString = String(rawVal).trim();

    // 2. Text Type Checks
    if (field.type === 'text') {
      // Key-specific semantic regex validation
      const lowerKey = field.key.toLowerCase();
      const lowerName = field.name.toLowerCase();

      // Email validation
      if (lowerKey.includes('email') || lowerName.includes('email')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valString)) {
          errors.push({
            field: field.key,
            message: `Please enter a valid academic/corporate email address (e.g. name@domain.com).`
          });
        }
      }

      // Phone validation
      else if (lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerName.includes('phone')) {
        const phoneRegex = /^[\d\s()+-]{7,20}$/;
        if (!phoneRegex.test(valString)) {
          errors.push({
            field: field.key,
            message: `Invalid format. Phone must consist of numbers, spaces, or international signs (+, -).`
          });
        }
      }

      // Length restrictions
      else if (valString.length < 2) {
        errors.push({
          field: field.key,
          message: `${field.name} must be at least 2 characters long.`
        });
      } else if (valString.length > 100) {
        errors.push({
          field: field.key,
          message: `${field.name} cannot be longer than 100 characters.`
        });
      }
    }

    // 3. Number Type Checks
    else if (field.type === 'number') {
      const num = Number(rawVal);
      if (isNaN(num)) {
        errors.push({
          field: field.key,
          message: `${field.name} must be a valid numerical value.`
        });
        return;
      }

      const lowerKey = field.key.toLowerCase();
      // Rate / score-specific checks
      if (lowerKey.includes('rate') || lowerKey.includes('salary') || lowerKey.includes('compensation')) {
        if (num < 0) {
          errors.push({
            field: field.key,
            message: `Compensation rate/salary cannot be negative.`
          });
        }
      } else if (lowerKey.includes('rating') || lowerKey.includes('score')) {
        if (num < 1 || num > 10) {
          errors.push({
            field: field.key,
            message: `${field.name} rating must be an integer score between 1 and 10.`
          });
        }
      } else if (lowerKey.includes('age')) {
        if (num < 18 || num > 120) {
          errors.push({
            field: field.key,
            message: `Authorized personnel age must be between 18 and 120 years.`
          });
        }
      }
    }

    // 4. Date Type Checks
    else if (field.type === 'date') {
      const parsedDate = Date.parse(valString);
      if (isNaN(parsedDate)) {
        errors.push({
          field: field.key,
          message: `Please format ${field.name} as a valid date string.`
        });
      } else {
        const year = new Date(valString).getFullYear();
        if (year < 1900 || year > 2100) {
          errors.push({
            field: field.key,
            message: `Please supply a plausible calendar year between 1900 and 2100.`
          });
        }
      }
    }

    // 5. Select Dropdown Checks
    else if (field.type === 'select' && field.options) {
      if (!field.options.includes(rawVal)) {
        errors.push({
          field: field.key,
          message: `Selected value "${rawVal}" is not in the list of authorized options.`
        });
      }
    }
  });

  return errors;
}

/**
 * Validates user credentials profile/registry fields
 */
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please provide a valid standard email layout';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one numerical digit';
  return null;
}
