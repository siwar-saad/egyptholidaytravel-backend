/* ================= PACKAGE HELPERS ================= */
const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const mapPackage = (row, options = {}) => {
  const packageData = {
    id: row.id,
    title: row.title || row.name || "",
    name: row.name || row.title || "",
    backendName: row.backend_name || row.title || row.name || "",
    backend_name: row.backend_name || row.title || row.name || "",
    route: row.route || "",
    duration: row.duration || "",
    transfer: row.transfer || "",
    transferReduction: row.transfer_reduction || "",
    transfer_reduction: row.transfer_reduction || "",
    startPrice: row.start_price || row.price || "",
    start_price: row.start_price || row.price || "",
    programme: row.programme || "",
    price: row.price || row.start_price || "",
    visibility: row.visibility || "Private",
    image: row.image || "",
    options: row.options || [],
    itinerary: row.itinerary || [],
    displayOrder: row.display_order || 0,
  };

  if (options.includeAdminFields) {
    packageData.display_order = row.display_order || 0;
    packageData.created_at = row.created_at;
  }

  return packageData;
};

module.exports = {
  mapPackage,
  parseJsonArray,
};
