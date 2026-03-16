// Simple hardcoded admin credentials - direct login without sessions
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

export function validateAdminCredentials(username, password) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function getAdminCredentials() {
  return {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  };
}

// Simple direct authentication check
export function isAdminAuthenticated(username, password) {
  return validateAdminCredentials(username, password);
}
