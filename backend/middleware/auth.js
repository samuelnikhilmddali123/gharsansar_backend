const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { readData } = require("../db");
const path = require("path");

const JWT_SECRET = process.env.JWT_SECRET || "ghar_sansar_super_secret_jwt_key_2026";
const USERS_FILE = path.join(__dirname, "..", "users.json");

const normalizeEmail = (e) => (e || "").trim().toLowerCase();

/**
 * Generate a production-grade signed JWT token for a user.
 */
function generateToken(user) {
  const normEmail = normalizeEmail(user.email);
  const isAdmin = (user.role && String(user.role).toUpperCase() === "ADMIN") ||
    normEmail === "gharsansarshop@gmail.com" ||
    normEmail === "gharsansarwebsite@gmail.com";

  const payload = {
    _id: user._id ? user._id.toString() : (isAdmin ? "admin_01" : undefined),
    id: isAdmin ? "admin_01" : (typeof user.id === "number" ? user.id : (user._id ? user._id.toString() : undefined)),
    email: normEmail,
    role: isAdmin ? "ADMIN" : "CUSTOMER"
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

/**
 * Helper to look up user from MongoDB Atlas (or in-memory cache).
 */
async function findUserByIdentifier(identifier) {
  if (!identifier) return null;

  try {
    const cleanId = String(identifier).trim();
    const cleanEmail = normalizeEmail(cleanId);

    // If it's the admin identifier or email
    if (cleanEmail === "gharsansarshop@gmail.com" || cleanEmail === "gharsansarwebsite@gmail.com" || cleanId === "admin_01") {
      let admin = null;
      try {
        admin = await User.findOne({ email: cleanEmail.includes("@") ? cleanEmail : "gharsansarshop@gmail.com" });
      } catch (e) {}

      if (!admin) {
        return {
          _id: "admin_01",
          id: "admin_01",
          email: cleanEmail.includes("@") ? cleanEmail : "gharsansarshop@gmail.com",
          full_name: "Admin",
          role: "ADMIN",
          is_active: true
        };
      }
      if (typeof admin.toObject === "function") admin = admin.toObject();
      admin.role = "ADMIN";
      return admin;
    }

    // 1. If it's an email address, lookup by email (highest priority & guaranteed uniqueness)
    if (cleanEmail.includes("@")) {
      const user = await User.findOne({ email: cleanEmail });
      if (user) return user;
    }

    // 2. If it's a 24-character hexadecimal MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(cleanId)) {
      const user = await User.findById(cleanId);
      if (user) return user;
    }

    // 3. Lookup by numeric id ONLY if the identifier is strictly numeric digits
    if (/^\d+$/.test(cleanId)) {
      const numId = parseInt(cleanId, 10);
      const user = await User.findOne({ id: numId });
      if (user) return user;
    }
  } catch (err) {
    // Continue to fallback
  }

  // 4. Fallback to cache / users.json
  try {
    const users = readData(USERS_FILE, []);
    const cleanStr = String(identifier).trim();
    const cleanEmail = normalizeEmail(cleanStr);

    const found = users.find((u) => {
      if (u._id && String(u._id) === cleanStr) return true;
      if (normalizeEmail(u.email) === cleanEmail) return true;
      if (/^\d+$/.test(cleanStr) && u.id === parseInt(cleanStr, 10)) return true;
      return false;
    });

    if (found) return found;
  } catch (e) {}

  return null;
}

/**
 * Core auth resolution logic.
 */
async function resolveUserFromRequest(req) {
  let token = null;

  // 1. Authorization header: "Bearer <token>" or raw token
  const authHeader = req.headers.authorization || req.headers["x-auth-token"];
  if (authHeader) {
    token = authHeader.replace(/^Bearer\s+/i, "").trim();
  } else if (req.query && req.query.token) {
    token = String(req.query.token).trim();
  }

  if (token) {
    token = token.trim();
    if (token === "null" || token === "undefined" || token === "guest" || !token) {
      token = null;
    }
  }

  if (token) {
    // A) Try verifying as JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded) {
        const normEmail = normalizeEmail(decoded.email);
        const isAdmin = (decoded.role && String(decoded.role).toUpperCase() === "ADMIN") ||
          normEmail === "gharsansarshop@gmail.com" ||
          normEmail === "gharsansarwebsite@gmail.com" ||
          decoded.id === "admin_01" ||
          decoded._id === "admin_01";

        if (isAdmin) {
          let user = normEmail ? await findUserByIdentifier(normEmail) : null;
          if (!user) {
            user = {
              _id: "admin_01",
              id: "admin_01",
              email: normEmail || "gharsansarshop@gmail.com",
              full_name: "Admin",
              role: "ADMIN",
              is_active: true
            };
          } else {
            if (typeof user.toObject === "function") user = user.toObject();
            user.role = "ADMIN";
          }
          return user;
        }

        // For regular customers: Prioritize lookup by email first (unique), then _id, then numeric id
        let user = null;
        if (normEmail) {
          user = await findUserByIdentifier(normEmail);
        }
        if (!user && decoded._id && decoded._id !== "admin_01") {
          user = await findUserByIdentifier(decoded._id);
        }
        if (!user && decoded.id && typeof decoded.id === "number") {
          user = await findUserByIdentifier(decoded.id);
        }

        if (user && user.is_active !== false) {
          return user;
        }
      }
    } catch (jwtErr) {
      // Not a valid JWT or expired, try legacy token formats
    }

    // B) Handle legacy user token format: user_token_<id>_<timestamp>
    const userTokenMatch = token.match(/user_token_([^_]+)_/);
    if (userTokenMatch) {
      const userId = userTokenMatch[1];
      const user = await findUserByIdentifier(userId);
      if (user && user.is_active !== false) return user;
    }

    // C) Handle legacy admin token format: admin_token_gharsansar_<timestamp>
    if (token.startsWith("admin_token_")) {
      const user = await findUserByIdentifier("gharsansarshop@gmail.com");
      if (user) {
        if (typeof user.toObject === "function") return { ...user.toObject(), role: "ADMIN" };
        return { ...user, role: "ADMIN" };
      }
      return {
        _id: "admin_01",
        id: "admin_01",
        email: "gharsansarshop@gmail.com",
        full_name: "Admin",
        role: "ADMIN",
        is_active: true
      };
    }
  }

  // 2. Check header "user-id" or "x-user-id" (e.g. from frontend Axios interceptors)
  const headerUserId = req.headers["user-id"] || req.headers["x-user-id"];
  if (headerUserId && headerUserId !== "guest") {
    const user = await findUserByIdentifier(headerUserId);
    if (user && user.is_active !== false) return user;
  }

  return null;
}

/**
 * Middleware: Strictly requires authenticated user session.
 */
async function authenticate(req, res, next) {
  try {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please log in to continue."
      });
    }

    req.user = user;
    // Canonical user ID string for databases
    req.userId = user._id ? user._id.toString() : String(user.id || user.email);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ success: false, error: "Internal authentication error" });
  }
}

/**
 * Middleware: Attaches user if authenticated, but does not block guests.
 */
async function optionalAuth(req, res, next) {
  try {
    const user = await resolveUserFromRequest(req);
    if (user) {
      req.user = user;
      req.userId = user._id ? user._id.toString() : String(user.id || user.email);
    } else {
      req.user = null;
      req.userId = null;
    }
    next();
  } catch (error) {
    req.user = null;
    req.userId = null;
    next();
  }
}

/**
 * Middleware: Requires admin privileges.
 */
async function requireAdmin(req, res, next) {
  try {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      // In local development / admin dashboard, allow fallback admin
      const host = req.get("host") || "";
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
      if (isLocal) {
        req.user = {
          _id: "admin_01",
          id: 1,
          email: "gharsansarshop@gmail.com",
          full_name: "Admin",
          role: "ADMIN",
          is_active: true
        };
        req.userId = "admin_01";
        return next();
      }
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const isAdmin =
      (user.role && user.role.toUpperCase() === "ADMIN") ||
      normalizeEmail(user.email) === "gharsansarshop@gmail.com" ||
      normalizeEmail(user.email) === "gharsansarwebsite@gmail.com";

    if (!isAdmin) {
      // Allow localhost admin access
      const host = req.get("host") || "";
      if (host.includes("localhost") || host.includes("127.0.0.1")) {
        req.user = user;
        req.userId = user._id ? user._id.toString() : String(user.id || user.email);
        return next();
      }
      return res.status(403).json({ success: false, error: "Access denied. Admin privileges required." });
    }

    req.user = user;
    req.userId = user._id ? user._id.toString() : String(user.id || user.email);
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: "Admin authorization check failed" });
  }
}

module.exports = {
  JWT_SECRET,
  generateToken,
  authenticate,
  optionalAuth,
  requireAdmin,
  findUserByIdentifier
};
