const dns = require("dns");
const https = require("https");
const crypto = require("crypto");

// Set fallback DNS to Google & Cloudflare to resolve api.razorpay.com reliably on all networks
if (typeof dns.setServers === "function") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  } catch (err) {
    console.warn("[RazorpayClient] DNS setServers notice:", err.message);
  }
}

/**
 * Custom DNS lookup resolver using IPv4 to avoid Node.js undici / DNS resolution timeouts on Windows
 */
function customLookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return dns.lookup(hostname, options, callback);
    }
    if (options && options.all) {
      return callback(
        null,
        addresses.map((addr) => ({ address: addr, family: 4 }))
      );
    }
    return callback(null, addresses[0], 4);
  });
}

/**
 * Low-level HTTPS request wrapper for api.razorpay.com
 */
function makeRazorpayRequest(endpoint, method = "GET", data = null) {
  return new Promise((resolve, reject) => {
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_TppGgVggUkbJv4";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "PMTMnawtXe2ZEHUUPT2JMzoN";

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const payload = data ? JSON.stringify(data) : null;

    const options = {
      hostname: "api.razorpay.com",
      path: endpoint,
      method: method.toUpperCase(),
      lookup: customLookup,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    };

    if (payload) {
      options.headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = https.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ ok: true, status: res.statusCode, data: parsed });
          } else {
            resolve({ ok: false, status: res.statusCode, data: parsed });
          }
        } catch (parseErr) {
          resolve({ ok: false, status: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Razorpay API request timeout (10000ms)"));
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

/**
 * Creates an authentic order in Razorpay
 * @param {Object} params
 * @param {number} params.amount - Amount in paise (e.g. 50000 for ₹500)
 * @param {string} [params.currency='INR']
 * @param {string} [params.receipt]
 * @param {Object} [params.notes]
 * @returns {Promise<{ ok: boolean, status: number, data: Object }>}
 */
async function createRazorpayOrder({ amount, currency = "INR", receipt, notes = {} }) {
  return await makeRazorpayRequest("/v1/orders", "POST", {
    amount,
    currency,
    receipt,
    notes,
  });
}

/**
 * Fetches order details from Razorpay
 * @param {string} orderId
 */
async function fetchRazorpayOrder(orderId) {
  return await makeRazorpayRequest(`/v1/orders/${orderId}`, "GET");
}

/**
 * Fetches payments associated with a Razorpay order
 * @param {string} orderId
 */
async function fetchRazorpayOrderPayments(orderId) {
  return await makeRazorpayRequest(`/v1/orders/${orderId}/payments`, "GET");
}

/**
 * Fetches a single payment record from Razorpay
 * @param {string} paymentId
 */
async function fetchRazorpayPayment(paymentId) {
  return await makeRazorpayRequest(`/v1/payments/${paymentId}`, "GET");
}

/**
 * Verifies Razorpay HMAC-SHA256 signature
 * @param {Object} params
 * @param {string} params.orderId - Razorpay Order ID (e.g. order_xxx)
 * @param {string} params.paymentId - Razorpay Payment ID (e.g. pay_xxx)
 * @param {string} params.signature - Razorpay Signature hex string
 * @returns {boolean}
 */
function verifyRazorpaySignature({ orderId, paymentId, signature }) {
  if (!orderId || !paymentId || !signature) {
    return false;
  }
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "PMTMnawtXe2ZEHUUPT2JMzoN";
  const hmac = crypto.createHmac("sha256", keySecret);
  hmac.update(`${orderId}|${paymentId}`);
  const expectedSignature = hmac.digest("hex");
  return expectedSignature === signature;
}

module.exports = {
  createRazorpayOrder,
  fetchRazorpayOrder,
  fetchRazorpayOrderPayments,
  fetchRazorpayPayment,
  verifyRazorpaySignature,
  makeRazorpayRequest,
};
