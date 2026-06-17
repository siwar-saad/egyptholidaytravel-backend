/* ================= COOKIE HELPERS ================= */
const getCookie = (req, name) => {
  const cookies = req.headers.cookie || "";

  return cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");
};

module.exports = {
  getCookie,
};
