import crypto from "crypto";

export const SESSION_COOKIE_NAME = "startup_auction_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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
      if (payload && typeof payload.team_id !== "undefined" && payload.captain_email) {
        return { team_id: String(payload.team_id), captain_email: payload.captain_email };
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Get the current session from the request (for API routes that receive Request).
 * @param {Request} request
 * @returns {{ team_id: string, captain_email: string } | null}
 */
export function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  const token = match ? decodeURIComponent(match[1].trim()) : null;
  return verify(token);
}

/**
 * Create a signed session token for the given team.
 * @param {{ team_id: string | number, captain_email: string }} payload
 * @returns string
 */
export function createSessionToken(payload) {
  return sign({
    team_id: String(payload.team_id),
    captain_email: payload.captain_email,
  });
}

/** Cookie options for setting the session cookie (use with response.cookies.set). */
export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  };
}
