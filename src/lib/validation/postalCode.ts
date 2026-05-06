/**
 * Accept French metropolitan (01000–95999) and DOM (97xxx) postal codes.
 * Reject TOM (98xxx), 96xxx, 99xxx, anything not 5 digits, and any non-FR.
 *
 * 96xxx is not a real metropolitan range, hence excluded explicitly.
 */
export const ACCEPTED_POSTAL_CODE_REGEX = /^(?:0[1-9]|[1-8]\d|9[0-5]|97)\d{3}$/;

export function isAcceptedPostalCode(value: string): boolean {
  return ACCEPTED_POSTAL_CODE_REGEX.test(value);
}
