import crypto from "crypto";

export const ADMIN_SESSION_COOKIE_NAME = "startup_auction_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    return null;
  }
  return secret;
}

function sign(payload) {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      "SESSION_SECRET must be set in .env with at least 16 characters for secure sessions."
    );
  }

  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== "string") return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  try {
    const secret = getSecret();
    if (!secret) return null;

    const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
    if (crypto.timingSafeEqual(Buffer.from(sig, "base64url"), Buffer.from(expected, "base64url"))) {
      const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
      if (payload && payload.role === "admin" && payload.userId) {
        return { role: "admin", userId: String(payload.userId) };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function createAdminSessionToken(userId) {
  return sign({
    role: "admin",
    userId: String(userId),
  });
}

export function verifyAdminSessionToken(token) {
  return verify(token);
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  };
}

export function getAdminCredentials() {
  const userId = process.env.ADMIN_USER_ID;
  const password = process.env.ADMIN_PASSWORD;

  if (!userId || !password) {
    return null;
  }

  return {
    userId,
    password,
  };
}
