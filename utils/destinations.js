const parseJson = (value, fallback) => {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseArray = (value) => {
  const parsed = parseJson(value, []);
  return Array.isArray(parsed) ? parsed : [];
};

const destinationSelectFields = `
  id,
  name,
  title,
  description,
  region,
  country,
  badge,
  duration,
  location,
  image,
  images,
  highlights,
  included,
  days,
  visibility,
  display_order,
  data,
  created_at,
  updated_at
`;

const mapDestination = (row, { includeAdminFields = false } = {}) => {
  const data = parseJson(row.data, {});
  const images = parseArray(row.images);
  const image = row.image || images[0] || data.image || "";
  const normalizedImages = images.length
    ? images
    : Array.isArray(data.images) && data.images.length
      ? data.images
      : image
        ? [image]
        : [];
  const title = row.title || row.name || data.title || data.name || "";
  const visibility = row.visibility || "Published";

  const destination = {
    ...data,
    id: row.id,
    name: row.name || title,
    title,
    description: row.description || data.description || data.short || "",
    short: data.short || row.description || data.description || "",
    region: row.region || data.region || "",
    country: row.country || data.country || data.stamp || "Egypt",
    stamp: data.stamp || row.country || data.country || "Egypt",
    badge: row.badge || data.badge || data.tag || "Destination Program",
    duration: row.duration || data.duration || "",
    location: row.location || data.location || "",
    image,
    images: normalizedImages,
    highlights: parseArray(row.highlights).length
      ? parseArray(row.highlights)
      : parseArray(data.highlights),
    included: parseArray(row.included).length
      ? parseArray(row.included)
      : parseArray(data.included),
    days: parseArray(row.days).length ? parseArray(row.days) : parseArray(data.days),
    isPublished: visibility === "Published",
    displayOrder: Number(row.display_order || 0),
  };

  if (includeAdminFields) {
    destination.visibility = visibility;
    destination.createdAt = row.created_at;
    destination.updatedAt = row.updated_at;
  }

  return destination;
};

module.exports = {
  destinationSelectFields,
  mapDestination,
  parseArray,
};
