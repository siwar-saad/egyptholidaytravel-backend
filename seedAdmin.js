const bcrypt = require("bcryptjs");
const pool = require("./config/database");

/* ================= SEED ADMIN ================= */
const seedAdmin = async () => {
  try {
    const email = "admin@gmail.com";
    const password = "admin123";

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email)
      DO UPDATE SET 
        password = EXCLUDED.password,
        role = 'admin'
      `,
      [email, hashedPassword, "Admin", "EgyptHoliday", "admin"]
    );

    console.log("\u2705 Admin created successfully");
    console.log("Email: admin@gmail.com");
    console.log("Password: admin123");

    process.exit();
  } catch (error) {
    console.error("âŒ Seed admin error:", error.message);
    process.exit(1);
  }
};

seedAdmin();


