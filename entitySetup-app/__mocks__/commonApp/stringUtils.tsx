// Mock for commonApp/stringUtils with behavior matching tests

function removeOuterQuotes(value: string): string {
  if (value == null) return '' as any;
  if (typeof value !== 'string') return value as any;
  const trimmed = value.trim();
  if (trimmed.length <= 1) return trimmed;
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return trimmed.substring(1, trimmed.length - 1);
  }
  return trimmed;
}

export const sanitizeQuotes = jest.fn((text: any) => removeOuterQuotes(text));

export const sanitizeModuleName = jest.fn((name: any) => removeOuterQuotes(name));

export const sanitizeModuleDescription = jest.fn((description: any) => removeOuterQuotes(description));

export const sanitizeTextField = jest.fn((text: any) => removeOuterQuotes(text));

export default {
  sanitizeQuotes,
  sanitizeModuleName,
  sanitizeModuleDescription,
  sanitizeTextField,
};
