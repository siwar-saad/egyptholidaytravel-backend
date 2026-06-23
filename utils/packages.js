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
    country: row.country || "",
    destination: row.destination || "",
    region: row.region || "",
    forceCategory: row.force_category || "",
    force_category: row.force_category || "",
    hidePrice: Boolean(row.hide_price),
    hide_price: Boolean(row.hide_price),
    cardTitle: row.card_title || "",
    card_title: row.card_title || "",
    cardSubtitle: row.card_subtitle || "",
    card_subtitle: row.card_subtitle || "",
    badgeText: row.badge_text || "",
    badge_text: row.badge_text || "",
    hotelName: row.hotel_name || "",
    hotel_name: row.hotel_name || "",
    hotelMeal: row.hotel_meal || "",
    hotel_meal: row.hotel_meal || "",
    hotelNights: row.hotel_nights || "",
    hotel_nights: row.hotel_nights || "",
    sglPrice: row.sgl_price || "",
    sgl_price: row.sgl_price || "",
    dblPrice: row.dbl_price || "",
    dbl_price: row.dbl_price || "",
    tplPrice: row.tpl_price || "",
    tpl_price: row.tpl_price || "",
    packageGroupId: row.package_group_id || "",
    package_group_id: row.package_group_id || "",
    packageGroupTitle: row.package_group_title || "",
    package_group_title: row.package_group_title || "",
    packageGroupSubtitle: row.package_group_subtitle || "",
    package_group_subtitle: row.package_group_subtitle || "",
    packageGroupShortTitle: row.package_group_short_title || "",
    package_group_short_title: row.package_group_short_title || "",
    options: row.options || [],
    itinerary: row.itinerary || [],
    included: row.included || [],
    excluded: row.excluded || [],
    flightDetails: row.flight_details || [],
    flight_details: row.flight_details || [],
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
