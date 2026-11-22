export const MIN_PASSWORD_LENGTH = 8;

const digits = (count, label, example) => ({
  regex: new RegExp(`^\\d{${count}}$`),
  hint: `Use a ${count}-digit ${label} (e.g. ${example}).`,
});

const UK_RULE = {
  regex: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
  hint: "Use a UK postcode (e.g. SW1A 1AA).",
};

const POSTAL_PATTERNS = {
  // Americas
  US: {
    regex: /^\d{5}(-\d{4})?$/,
    hint: "Use a 5-digit ZIP code (e.g. 90210 or 90210-1234).",
  },
  CA: {
    regex: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ][ -]?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i,
    hint: "Use a Canadian postal code (e.g. K1A 0B1).",
  },
  BR: {
    regex: /^\d{5}-?\d{3}$/,
    hint: "Use a Brazilian CEP (e.g. 01001-000).",
  },
  MX: digits(5, "Mexican postal code", "06600"),
  AR: {
    regex: /^[A-Z]?\d{4}[A-Z]{0,3}$/i,
    hint: "Use an Argentine CPA (e.g. C1001 or C1001ABC).",
  },
  CL: digits(7, "Chilean postal code", "8320000"),
  CO: digits(6, "Colombian postal code", "110111"),
  UY: digits(5, "Uruguayan postal code", "11100"),

  // Russia, Belarus & Eurasia
  RU: digits(6, "Russian postal index", "101000"),
  BY: digits(6, "Belarusian postal index", "220030"),
  UA: digits(5, "Ukrainian postal code", "01001"),
  TR: digits(5, "Turkish postal code", "34000"),

  // Asia & Middle East
  JP: {
    regex: /^\d{3}-?\d{4}$/,
    hint: "Use a Japanese postal code (e.g. 100-0001).",
  },
  KR: digits(5, "South Korean postal code", "03000"),
  CN: digits(6, "Chinese postal code", "100000"),
  TW: {
    regex: /^\d{3}(\d{2})?$/,
    hint: "Use a 3- or 5-digit Taiwanese postal code (e.g. 100 or 10001).",
  },
  IN: {
    regex: /^[1-9]\d{5}$/,
    hint: "Use a 6-digit Indian PIN code (e.g. 110001).",
  },
  SG: digits(6, "Singapore postal code", "018956"),
  TH: digits(5, "Thai postal code", "10110"),
  VN: digits(6, "Vietnamese postal code", "100000"),
  ID: digits(5, "Indonesian postal code", "10110"),
  MY: digits(5, "Malaysian postcode", "50000"),
  PH: digits(4, "Philippine ZIP code", "1000"),
  IL: {
    regex: /^\d{5}(\d{2})?$/,
    hint: "Use a 5- or 7-digit Israeli postal code (e.g. 6100000).",
  },

  // Oceania
  AU: digits(4, "Australian postcode", "2000"),
  NZ: digits(4, "New Zealand postcode", "1010"),

  // Europe
  UK: UK_RULE,
  GB: UK_RULE,
  ES: digits(5, "Spanish postal code", "28001"),
  DE: digits(5, "German postal code", "10115"),
  FR: digits(5, "French postal code", "75001"),
  NL: {
    regex: /^[1-9]\d{3}\s?[A-Z]{2}$/i,
    hint: "Use a Dutch postal code (e.g. 1012 JS).",
  },
  BE: digits(4, "Belgian postal code", "1000"),
  PL: {
    regex: /^\d{2}-\d{3}$/,
    hint: "Use a Polish postal code (e.g. 00-001).",
  },
  BG: digits(4, "Bulgarian postal code", "1000"),
  LV: {
    regex: /^(LV-)?\d{4}$/i,
    hint: "Use a Latvian postal code (e.g. LV-1010).",
  },
  LT: {
    regex: /^(LT-)?\d{5}$/i,
    hint: "Use a Lithuanian postal code (e.g. LT-01100).",
  },
  GR: {
    regex: /^\d{3}\s?\d{2}$/,
    hint: "Use a Greek postal code (e.g. 105 57).",
  },
  IE: {
    regex: /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/i,
    hint: "Use an Irish Eircode (e.g. D02 X285).",
  },
  IT: digits(5, "Italian postal code", "00100"),
  PT: {
    regex: /^\d{4}-\d{3}$/,
    hint: "Use a Portuguese postal code (e.g. 1100-148).",
  },
  SE: {
    regex: /^\d{3}\s?\d{2}$/,
    hint: "Use a Swedish postal code (e.g. 111 22).",
  },
  NO: digits(4, "Norwegian postal code", "0150"),
  DK: digits(4, "Danish postal code", "1050"),
  FI: digits(5, "Finnish postal code", "00100"),
  CH: digits(4, "Swiss postal code", "8001"),
  AT: digits(4, "Austrian postal code", "1010"),
  CZ: {
    regex: /^\d{3}\s?\d{2}$/,
    hint: "Use a Czech postal code (e.g. 110 00).",
  },
  SK: {
    regex: /^\d{3}\s?\d{2}$/,
    hint: "Use a Slovak postal code (e.g. 811 01).",
  },
  HU: digits(4, "Hungarian postal code", "1011"),
  RO: digits(6, "Romanian postal code", "010011"),
  HR: digits(5, "Croatian postal code", "10000"),
  SI: digits(4, "Slovenian postal code", "1000"),
  EE: digits(5, "Estonian postal code", "10111"),
  IS: digits(3, "Icelandic postal code", "101"),
  LU: {
    regex: /^(L-)?\d{4}$/i,
    hint: "Use a Luxembourg postal code (e.g. L-1115).",
  },

  // Africa
  ZA: digits(4, "South African postal code", "0001"),
};

// Require at least 4 characters for general fallback postal codes so short numbers like "800" are rejected
const GENERAL_POSTAL_REGEX = /^(?=.{4,10}$)[A-Z0-9]+(?:[ -][A-Z0-9]+)*$/i;

export function validateUsername(value) {
  const trimmed = value.trim();
  if (!trimmed) return "A username is required.";
  if (trimmed.length < 3) return "Username must be at least 3 characters.";
  if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    return "Use only letters, numbers, dots, underscores, or hyphens.";
  }
  return "";
}

export function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Email address is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
    return "Please enter a valid email address (like name@domain.com).";
  }
  return "";
}

export function validateCountry(value) {
  return value ? "" : "Please select a country.";
}

export function validatePostal(value, country) {
  const trimmed = value.trim();
  if (!trimmed) return "Postal code is required.";
  if (!country) {
    return "Select a country first so we can check the postal format.";
  }

  const rule = POSTAL_PATTERNS[String(country).toUpperCase()];
  if (rule) {
    return rule.regex.test(trimmed) ? "" : rule.hint;
  }

  return GENERAL_POSTAL_REGEX.test(trimmed)
    ? ""
    : "Enter a realistic postal code (at least 4 characters).";
}

export function validatePassword(value) {
  if (!value) return "Password is required.";
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters (${value.length}/${MIN_PASSWORD_LENGTH}).`;
  }
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value)) {
    return "Include at least one uppercase letter, one lowercase letter, and one number.";
  }
  return "";
}

export function validateConfirmPassword(confirmValue, passwordValue) {
  if (!confirmValue) return "Please confirm your password.";
  if (validatePassword(passwordValue) !== "") {
    return "Password above is not valid yet.";
  }
  return confirmValue === passwordValue ? "" : "Passwords do not match.";
}