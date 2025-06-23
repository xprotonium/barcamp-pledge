// sanitize.ts
// Utility to sanitize user input

export function sanitizeInput(input: string): string {
  // Trim whitespace
  let sanitized = input.trim();
  // Escape HTML special characters
  sanitized = sanitized
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
  // Optionally, remove any other unwanted characters (e.g., script tags)
  sanitized = sanitized.replace(/<script.*?>.*?<\/script>/gi, "");
  return sanitized;
} 