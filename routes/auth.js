const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { sendEmail } = require("../services/emailService");
const authMiddleware = require("../middleware/authMiddleware");
const { getCookie } = require("../utils/cookies");
const { hashToken } = require("../utils/tokens");

const router = express.Router();

/* ================= AUTH HELPERS ================= */
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in environment variables");
}

const createToken = (user, expiresIn = "1d") => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "user",
    },
    JWT_SECRET,
    { expiresIn }
  );

  const decodedToken = jwt.decode(token);

  return {
    token,
    tokenHash: hashToken(token),
    tokenExpires: new Date(decodedToken.exp * 1000),
  };
};

const storeUserToken = async (userId, tokenData) => {
  await pool.query(
    `
    UPDATE users
    SET token_hash = $1,
        token_expires = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    `,
    [tokenData.tokenHash, tokenData.tokenExpires, userId]
  );
};

const getAuthCookieOptions = (tokenData) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  expires: tokenData.tokenExpires,
  path: "/",
});

const setAuthCookie = (res, tokenData) => {
  res.cookie("auth_token", tokenData.token, getAuthCookieOptions(tokenData));
};

const clearAuthCookie = (res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

const getRequestToken = (req) => {
  const cookieToken = getCookie(req, "auth_token");
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const rawToken = cookieToken || headerToken;

  return rawToken ? decodeURIComponent(rawToken) : "";
};

const cleanUser = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role || "user",
  firstName: user.first_name || "",
  lastName: user.last_name || "",
  name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
  phone: user.phone || "",
  city: user.city || "",
  country: user.country || "",
});

const createVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendSignupVerificationEmail = async (email, name, code) => {
  const info = await sendEmail(
    email,
    "Egypt Holiday - Verify Your Account",
    `
      <h2>Hello ${name || "Client"},</h2>
      <p>Your account verification code is:</p>
      <h1>${code}</h1>
      <p>This code expires in 15 minutes.</p>
    `
  );

  if (info.rejected?.length > 0 || info.accepted?.length === 0) {
    throw new Error(
      `SMTP did not accept the recipient. Accepted: ${
        info.accepted?.join(", ") || "none"
      }. Rejected: ${info.rejected?.join(", ") || "none"}`
    );
  }

  return info;
};

const getEmailErrorMessage = (error) => {
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    !process.env.EMAIL_FROM
  ) {
    return "Email configuration is missing in Backend/.env.";
  }

  if (error?.code === "EMAIL_CONFIG_MISSING" || error?.code === "EMAIL_CONFIG_INVALID") {
    return error.message;
  }

  if (error?.code === "EAUTH") {
    return "Gmail authentication failed. Check EMAIL_USER and EMAIL_PASS app password.";
  }

  if (error?.code === "EENVELOPE") {
    return "Email sender or recipient is invalid. Check EMAIL_FROM and the recipient email.";
  }

  if (error?.code === "ECONNECTION" || error?.code === "ETIMEDOUT") {
    return "Cannot connect to the email server. Check EMAIL_HOST, EMAIL_PORT and EMAIL_SECURE.";
  }

  return error?.response || error?.message || "Unknown email sending error.";
};

const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_TIME = 15 * 60 * 1000;
const signupAttempts = new Map();
const SIGNUP_WINDOW_TIME = 15 * 60 * 1000;
const MAX_SIGNUP_ATTEMPTS_PER_IP = 10;
const MAX_SIGNUP_ATTEMPTS_PER_EMAIL = 3;

/* ================= LOGIN RATE LIMIT ================= */
// Lightweight in-memory lockout to slow repeated password guessing attempts.
const getLoginKey = (req, email) => `${req.ip}:${email}`;

const isLoginLocked = (key) => {
  const attempt = loginAttempts.get(key);

  if (!attempt?.lockedUntil) return false;

  if (attempt.lockedUntil <= Date.now()) {
    loginAttempts.delete(key);
    return false;
  }

  return true;
};

const recordFailedLogin = (key) => {
  const attempt = loginAttempts.get(key) || { count: 0, lockedUntil: null };
  const nextCount = attempt.count + 1;

  loginAttempts.set(key, {
    count: nextCount,
    lockedUntil:
      nextCount >= MAX_LOGIN_ATTEMPTS
        ? Date.now() + LOGIN_LOCK_TIME
        : null,
  });
};

/* ================= SIGNUP RATE LIMIT ================= */
// Limits account creation and verification email sends without adding a dependency.
const checkSignupRateLimit = (key, maxAttempts) => {
  const now = Date.now();
  const attempts = (signupAttempts.get(key) || []).filter(
    (timestamp) => now - timestamp < SIGNUP_WINDOW_TIME
  );

  if (attempts.length >= maxAttempts) {
    return {
      limited: true,
      retryAfter: Math.ceil(
        (attempts[0] + SIGNUP_WINDOW_TIME - now) / 1000
      ),
    };
  }

  attempts.push(now);
  signupAttempts.set(key, attempts);

  return {
    limited: false,
    retryAfter: 0,
  };
};

const enforceSignupRateLimit = (req, res, email) => {
  const ipLimit = checkSignupRateLimit(
    `signup:ip:${req.ip}`,
    MAX_SIGNUP_ATTEMPTS_PER_IP
  );

  if (ipLimit.limited) {
    res.set("Retry-After", String(ipLimit.retryAfter));

    return res.status(429).json({
      error: "Too many signup attempts. Please try again later.",
      retryAfter: ipLimit.retryAfter,
    });
  }

  const emailLimit = checkSignupRateLimit(
    `signup:email:${email}`,
    MAX_SIGNUP_ATTEMPTS_PER_EMAIL
  );

  if (emailLimit.limited) {
    res.set("Retry-After", String(emailLimit.retryAfter));

    return res.status(429).json({
      error: "Too many verification emails sent. Please try again later.",
      retryAfter: emailLimit.retryAfter,
    });
  }

  return null;
};

/* ================= CURRENT USER ================= */
router.get("/me", authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: cleanUser(req.user),
  });
});
//yomken zeyda 
/* ================= LOGOUT ================= */
router.post("/logout", async (req, res) => {
  const token = getRequestToken(req);

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      await pool.query(
        `
        UPDATE users
        SET token_hash = NULL,
            token_expires = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        `,
        [decoded.id]
      );
    } catch (error) {
      console.log("Logout token cleanup skipped:", error.message);
    }
  }

  clearAuthCookie(res);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      first_name,
      last_name,
      password,
      confirmPassword,
      phone,
      city,
      country,
    } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        error: "Email, password and confirmation are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    const rateLimitedResponse = enforceSignupRateLimit(req, res, email);

    if (rateLimitedResponse) {
      return rateLimitedResponse;
    }

    const existingUser = await pool.query(
      "SELECT id, email_verified FROM users WHERE email = $1",
      [email]
    );

    if (
      existingUser.rows.length > 0 &&
      existingUser.rows[0].email_verified !== false
    ) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = createVerificationCode();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
    const userValues = [
      firstName || first_name || "",
      lastName || last_name || "",
      email,
      hashedPassword,
      phone || "",
      city || "",
      country || "",
      "user",
      hashedVerificationCode,
    ];

    const result =
      existingUser.rows.length > 0
        ? await pool.query(
            `
            UPDATE users
            SET first_name = $1,
                last_name = $2,
                email = $3,
                password = $4,
                phone = $5,
                city = $6,
                country = $7,
                role = $8,
                email_verified = false,
                email_verification_code = $9,
                email_verification_expires = NOW() + INTERVAL '15 minutes',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $10
            RETURNING id, first_name, last_name, email, phone, city, country, role
            `,
            [...userValues, existingUser.rows[0].id]
          )
        : await pool.query(
            `
            INSERT INTO users
            (
              first_name,
              last_name,
              email,
              password,
              phone,
              city,
              country,
              role,
              email_verified,
              email_verification_code,
              email_verification_expires
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,false,$9,NOW() + INTERVAL '15 minutes')
            RETURNING id, first_name, last_name, email, phone, city, country, role
            `,
            userValues
          );

    const user = result.rows[0];

    let emailInfo;

    try {
      emailInfo = await sendSignupVerificationEmail(
        user.email,
        `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        verificationCode
      );
    } catch (emailError) {
      console.error("Signup verification email error:", emailError);

      return res.status(500).json({
        code: "EMAIL_SEND_FAILED",
        error: getEmailErrorMessage(emailError),
      });
    }

    res.status(201).json({
      success: true,
      verificationRequired: true,
      requiresVerification: true,
      email: user.email,
      emailDelivery: {
        messageId: emailInfo?.messageId,
        accepted: emailInfo?.accepted || [],
        rejected: emailInfo?.rejected || [],
        response: emailInfo?.response,
      },
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: "Unable to create account",
    });
  }
});

/* ================= VERIFY SIGNUP CODE ================= */
router.post("/verify-signup-code", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const code = req.body.code?.trim();

    if (!email || !code) {
      return res.status(400).json({
        error: "Email and verification code are required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        city,
        country,
        role,
        email_verification_code
      FROM users
      WHERE email = $1
      AND email_verified = false
      AND email_verification_code IS NOT NULL
      AND email_verification_expires > NOW()
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid or expired verification code",
      });
    }

    const user = result.rows[0];
    const validCode = await bcrypt.compare(code, user.email_verification_code);

    if (!validCode) {
      return res.status(400).json({
        error: "Invalid or expired verification code",
      });
    }

    await pool.query(
      `
      UPDATE users
      SET email_verified = true,
          email_verification_code = NULL,
          email_verification_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [user.id]
    );

    const tokenData = createToken(user);

    await storeUserToken(user.id, tokenData);
    setAuthCookie(res, tokenData);

    res.json({
      success: true,
      token: tokenData.token,
      tokenExpires: tokenData.tokenExpires,
      user: cleanUser({ ...user, email_verified: true }),
    });
  } catch (error) {
    console.error("Verify signup code error:", error);
    res.status(500).json({
      error: "Unable to verify account",
    });
  }
});

/* ================= RESEND SIGNUP CODE ================= */
router.post("/resend-verification-code", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const rateLimitedResponse = enforceSignupRateLimit(req, res, email);

    if (rateLimitedResponse) {
      return rateLimitedResponse;
    }

    const result = await pool.query(
      `
      SELECT id, first_name, last_name, email, email_verified
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Account not found",
      });
    }

    const user = result.rows[0];

    if (user.email_verified !== false) {
      return res.json({
        success: true,
        alreadyVerified: true,
        message: "Email is already verified. You can login now.",
      });
    }

    const verificationCode = createVerificationCode();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

    await pool.query(
      `
      UPDATE users
      SET email_verification_code = $1,
          email_verification_expires = NOW() + INTERVAL '15 minutes',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [hashedVerificationCode, user.id]
    );

    let emailInfo;

    try {
      emailInfo = await sendSignupVerificationEmail(
        user.email,
        `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        verificationCode
      );
    } catch (emailError) {
      console.error("Resend verification email error:", emailError);

      return res.status(500).json({
        code: "EMAIL_SEND_FAILED",
        error: getEmailErrorMessage(emailError),
      });
    }

    res.json({
      success: true,
      email: user.email,
      emailDelivery: {
        messageId: emailInfo?.messageId,
        accepted: emailInfo?.accepted || [],
        rejected: emailInfo?.rejected || [],
        response: emailInfo?.response,
      },
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Resend verification code error:", error);
    res.status(500).json({
      error: "Unable to resend verification code",
    });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const loginKey = getLoginKey(req, email);

    if (isLoginLocked(loginKey)) {
      return res.status(429).json({
        error: "Too many failed login attempts. Please try again later.",
      });
    }

    const result = await pool.query(
      `
      SELECT id, first_name, last_name, email, phone, city, country, password, role, email_verified
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      recordFailedLogin(loginKey);

      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    if (user.email_verified === false) {
      return res.status(403).json({
        error: "Please verify your email before login",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      recordFailedLogin(loginKey);

      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    loginAttempts.delete(loginKey);

    const tokenData = createToken(user, rememberMe ? "30d" : "1d");

    await storeUserToken(user.id, tokenData);
    setAuthCookie(res, tokenData);

    res.json({
      success: true,
      token: tokenData.token,
      tokenExpires: tokenData.tokenExpires,
      user: cleanUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
    });
  }
});

/* ================= FORGOT PASSWORD ================= */
router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const result = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "No account found with this email",
      });
    }

    const user = result.rows[0];
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(resetCode, 10);

    await pool.query(
      `
      UPDATE users
      SET reset_token = $1,
          reset_token_expires = NOW() + INTERVAL '15 minutes'
      WHERE id = $2
      `,
      [hashedCode, user.id]
    );

    await sendEmail(
      user.email,
      "Egypt Holiday - Password Reset Code",
      `
      <h2>Password Reset</h2>
      <p>Your reset code is:</p>
      <h1>${resetCode}</h1>
      <p>This code expires in 15 minutes.</p>
      `
    );

    res.json({
      success: true,
      message: "Reset code sent successfully",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: "Unable to send reset code",
    });
  }
});

/* ================= VERIFY RESET CODE ================= */
router.post("/verify-reset-code", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const code = req.body.code?.trim();

    if (!email || !code) {
      return res.status(400).json({
        error: "Email and verification code are required",
      });
    }

    const result = await pool.query(
      `
      SELECT id, reset_token
      FROM users
      WHERE email = $1
      AND reset_token IS NOT NULL
      AND reset_token_expires > NOW()
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid or expired reset code",
      });
    }

    const validCode = await bcrypt.compare(code, result.rows[0].reset_token);

    if (!validCode) {
      return res.status(400).json({
        error: "Invalid or expired reset code",
      });
    }

    res.json({
      success: true,
      message: "Verification code is valid",
    });
  } catch (error) {
    console.error("Verify reset code error:", error);
    res.status(500).json({
      error: "Unable to verify reset code",
    });
  }
});

/* ================= RESET PASSWORD ================= */
router.post("/reset-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const code = req.body.code?.trim();
    const { newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        error: "Email, code and new password are required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        city,
        country,
        role,
        reset_token
      FROM users
      WHERE email = $1
      AND reset_token IS NOT NULL
      AND reset_token_expires > NOW()
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid or expired reset code",
      });
    }

    const user = result.rows[0];

    const validCode = await bcrypt.compare(code, user.reset_token);

    if (!validCode) {
      return res.status(400).json({
        error: "Invalid or expired reset code",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [hashedPassword, user.id]
    );

    const tokenData = createToken(user);

    await storeUserToken(user.id, tokenData);
    setAuthCookie(res, tokenData);

    res.json({
      success: true,
      message: "Password reset successfully",
      token: tokenData.token,
      tokenExpires: tokenData.tokenExpires,
      user: cleanUser(user),
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      error: "Unable to reset password",
    });
  }
});

module.exports = router;
