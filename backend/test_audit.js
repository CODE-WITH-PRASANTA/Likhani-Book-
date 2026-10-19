const http = require("http");

async function request(options, postData = null) {
  return new Promise((resolve) => {
    const headers = { ...(options.headers || {}) };
    let payload = null;

    if (postData) {
      payload = typeof postData === "object" ? JSON.stringify(postData) : String(postData);
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request({ ...options, headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on("error", (err) => {
      resolve({ status: 500, error: err.message, data: err.message });
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runAudit() {
  console.log("==========================================");
  console.log("STARTING SYSTEM AUDIT: EDGE CASES & FAILURE PATHS");
  console.log("==========================================\n");

  const results = [];

  // TEST 1: Regex injection in enquiry search
  console.log("[TEST 1] Testing unescaped regex in /api/enquiries?search=([test...");
  const t1 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/enquiries?search=" + encodeURIComponent("([test*"),
    method: "GET",
  });
  console.log("Result status:", t1.status, "Response:", t1.data);
  results.push({ name: "Enquiry Search Regex Crash", passed: t1.status === 200, status: t1.status, data: t1.data });

  // TEST 2: Malformed MongoDB ID in /api/supports/:id
  console.log("\n[TEST 2] Testing malformed ObjectId in GET /api/supports/not-a-valid-id...");
  const t2 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/supports/not-a-valid-id",
    method: "GET",
  });
  console.log("Result status:", t2.status, "Response:", t2.data);
  results.push({ name: "Support Invalid ID GET", passed: t2.status === 400 || t2.status === 404, status: t2.status, data: t2.data });

  // TEST 3: Malformed MongoDB ID in PUT /api/supports/:id
  console.log("\n[TEST 3] Testing malformed ObjectId in PUT /api/supports/not-a-valid-id...");
  const t3 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/supports/not-a-valid-id",
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  }, { name: "Test" });
  console.log("Result status:", t3.status, "Response:", t3.data);
  results.push({ name: "Support Invalid ID PUT", passed: t3.status === 400 || t3.status === 404, status: t3.status, data: t3.data });

  // TEST 4: Malformed MongoDB ID in /api/enquiries/:id
  console.log("\n[TEST 4] Testing malformed ObjectId in GET /api/enquiries/12345...");
  const t4 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/enquiries/12345",
    method: "GET",
  });
  console.log("Result status:", t4.status, "Response:", t4.data);
  results.push({ name: "Enquiry Invalid ID GET", passed: t4.status === 400 || t4.status === 404, status: t4.status, data: t4.data });

  // TEST 5: Malformed MongoDB ID in /api/testimonials/:id
  console.log("\n[TEST 5] Testing malformed ObjectId in GET /api/testimonials/invalid-hex...");
  const t5 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/testimonials/invalid-hex",
    method: "GET",
  });
  console.log("Result status:", t5.status, "Response:", t5.data);
  results.push({ name: "Testimonial Invalid ID GET", passed: t5.status === 400 || t5.status === 404, status: t5.status, data: t5.data });

  // TEST 6: Invalid IDs in bulk delete /api/supports/bulk-delete
  console.log("\n[TEST 6] Testing invalid IDs in POST /api/supports/bulk-delete...");
  const t6 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/supports/bulk-delete",
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, { ids: ["bad_id_1", "bad_id_2"] });
  console.log("Result status:", t6.status, "Response:", t6.data);
  results.push({ name: "Support Bulk Delete Invalid IDs", passed: t6.status === 400, status: t6.status, data: t6.data });

  // TEST 7: Invalid IDs in bulk delete /api/enquiries/bulk
  console.log("\n[TEST 7] Testing invalid IDs in DELETE /api/enquiries/bulk...");
  const t7 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/enquiries/bulk",
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  }, { ids: ["bad_id_1", "bad_id_2"] });
  console.log("Result status:", t7.status, "Response:", t7.data);
  results.push({ name: "Enquiry Bulk Delete Invalid IDs", passed: t7.status === 400, status: t7.status, data: t7.data });

  // TEST 8: Invalid IDs in bulk delete /api/testimonials/bulk-delete
  console.log("\n[TEST 8] Testing invalid IDs in POST /api/testimonials/bulk-delete...");
  const t8 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/testimonials/bulk-delete",
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }, { ids: ["bad_id_1", "bad_id_2"] });
  console.log("Result status:", t8.status, "Response:", t8.data);
  results.push({ name: "Testimonial Bulk Delete Invalid IDs", passed: t8.status === 400, status: t8.status, data: t8.data });

  // TEST 9: Check missing endpoint GET /api/profiles
  console.log("\n[TEST 9] Checking admin panel route GET /api/profiles...");
  const t9 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/profiles",
    method: "GET",
  });
  console.log("Result status:", t9.status, "Response:", t9.data);
  results.push({ name: "Profiles Route", passed: t9.status === 200, status: t9.status, data: t9.data });

  console.log("\n==========================================");
  console.log("AUDIT SUMMARY");
  console.log("==========================================");
  let allPassed = true;
  results.forEach((r, idx) => {
    console.log(`[${idx + 1}] ${r.name}: ${r.passed ? "PASS" : "FAIL"} (HTTP ${r.status})`);
    if (!r.passed) allPassed = false;
  });
  console.log("\nOVERALL STATUS:", allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED");
}

runAudit();
