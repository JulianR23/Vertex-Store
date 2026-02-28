import { v4 as uuidv4 } from 'uuid';
import { TRANSACTION_REFERENCE_PREFIX } from '../constants/fees.constants';

/**
 * Generates a unique transaction reference.
 * Format: VS-{timestamp}-{shortUUID}
 */
export const generateTransactionReference = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const shortId = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  return `${TRANSACTION_REFERENCE_PREFIX}-${timestamp}-${shortId}`;
};