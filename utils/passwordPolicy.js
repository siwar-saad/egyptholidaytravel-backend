/* ================= PASSWORD POLICY ================= */
const PASSWORD_RULE_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase and number";

const validatePasswordStrength = (password) => {
  const value = String(password || "");

  if (
    value.length < 8 ||
    !/[A-Z]/.test(value) ||
    !/[a-z]/.test(value) ||
    !/[0-9]/.test(value)
  ) {
    return {
      valid: false,
      error: PASSWORD_RULE_MESSAGE,
    };
  }

  return {
    valid: true,
    error: "",
  };
};

module.exports = {
  PASSWORD_RULE_MESSAGE,
  validatePasswordStrength,
};
