/* ================= CUSTOMER HELPERS ================= */
const getCustomerName = (customerInfo = {}) =>
  customerInfo?.fullName ||
  customerInfo?.name ||
  customerInfo?.full_name ||
  customerInfo?.email ||
  "Client";

const buildCustomerInfo = (customerInfo = {}, user = {}) => ({
  ...customerInfo,
  name:
    customerInfo.name ||
    customerInfo.fullName ||
    customerInfo.full_name ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    "",
  email: String(user.email || "").trim().toLowerCase(),
});

module.exports = {
  buildCustomerInfo,
  getCustomerName,
};
