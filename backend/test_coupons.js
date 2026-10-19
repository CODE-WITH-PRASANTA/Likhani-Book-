const http = require("http");

async function request(options, postData = null) {
  return new Promise((resolve) => {
    const headers = { ...(options.headers || {}) };
    let payload = null;

    if (postData) {
      payload = typeof postData === "object" ? JSON.stringify(postData) : String(postData);
      headers["Content-Length"] = Buffer.byteLength(payload);
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
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

async function runTest() {
  console.log("==========================================");
  console.log("STARTING TEST: COUPONS API & VALIDATION");
  console.log("==========================================\n");

  const results = [];

  // TEST 1: Fetch Coupons
  console.log("[TEST 1] Fetching Coupons...");
  const listRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/coupons",
    method: "GET",
  });
  console.log("Status:", listRes.status, "Count:", listRes.data?.count, "Stats:", listRes.data?.stats);
  results.push({
    name: "Coupons GET API",
    passed: listRes.status === 200 && listRes.data?.success && Array.isArray(listRes.data?.data),
  });

  // TEST 2: Create a Valid Coupon
  console.log("\n[TEST 2] Creating a new Valid Coupon (BKFEST25)...");
  const testCode = `BKTEST${Date.now().toString().slice(-4)}`;
  const createRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/coupons",
      method: "POST",
    },
    {
      code: testCode,
      title: "Festive Book Sale",
      description: "Get 25% discount on all books during the festive season",
      discountPercent: 25,
      minimumPurchase: 499,
      usageLimit: 500,
      startDate: "2026-10-01",
      endDate: "2026-11-30",
      status: "Active",
    }
  );
  console.log("Status:", createRes.status, "Code:", createRes.data?.data?.code, "Title:", createRes.data?.data?.title);
  const createdId = createRes.data?.data?._id || createRes.data?.data?.id;
  results.push({
    name: "Create Coupon API",
    passed: createRes.status === 201 && createRes.data?.success && createRes.data?.data?.code === testCode,
  });

  // TEST 3: Validation - Reject duplicate code
  console.log("\n[TEST 3] Testing Duplicate Code Rejection...");
  const dupRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/coupons",
      method: "POST",
    },
    {
      code: testCode,
      title: "Duplicate Coupon",
      description: "Should be rejected",
      discountPercent: 10,
      startDate: "2026-10-01",
      endDate: "2026-10-31",
    }
  );
  console.log("Status:", dupRes.status, "Message:", dupRes.data?.message);
  results.push({
    name: "Duplicate Code Rejection",
    passed: dupRes.status === 400 && !dupRes.data?.success,
  });

  // TEST 4: Validation - Reject invalid percentage and dates
  console.log("\n[TEST 4] Testing Invalid Percentage (>100) and EndDate < StartDate...");
  const invalidRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/coupons",
      method: "POST",
    },
    {
      code: "INVALID150",
      title: "Over 100 Percent",
      description: "Invalid percentage",
      discountPercent: 150,
      startDate: "2026-10-20",
      endDate: "2026-10-10",
    }
  );
  console.log("Status:", invalidRes.status, "Message:", invalidRes.data?.message);
  results.push({
    name: "Validation of Percentage & Date Rejection",
    passed: invalidRes.status === 400 && !invalidRes.data?.success,
  });

  // TEST 5: Get Single Coupon by ID and by Code
  console.log("\n[TEST 5] Getting Coupon by ID and Code...");
  const getByIdRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/coupons/${createdId}`,
    method: "GET",
  });
  const getByCodeRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/coupons/${testCode}`,
    method: "GET",
  });
  console.log("GetById Status:", getByIdRes.status, "GetByCode Status:", getByCodeRes.status);
  results.push({
    name: "Get Coupon by ID & Code",
    passed: getByIdRes.status === 200 && getByCodeRes.status === 200 && getByIdRes.data?.data?.code === testCode,
  });

  // TEST 6: Update Coupon
  console.log("\n[TEST 6] Updating Coupon...");
  const updateRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/coupons/${createdId}`,
      method: "PUT",
    },
    {
      title: "Updated Festive Sale",
      discountPercent: 30,
    }
  );
  console.log("Status:", updateRes.status, "New Title:", updateRes.data?.data?.title, "New Discount:", updateRes.data?.data?.discountPercent);
  results.push({
    name: "Update Coupon API",
    passed: updateRes.status === 200 && updateRes.data?.data?.discountPercent === 30,
  });

  // TEST 7: Cart Checkout Validation API
  console.log("\n[TEST 7] Validating Coupon for Cart Application...");
  const cartValidRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/coupons/validate",
      method: "POST",
    },
    {
      code: testCode,
      cartTotal: 1000,
    }
  );
  console.log("Status:", cartValidRes.status, "DiscountAmount:", cartValidRes.data?.data?.discountAmount, "FinalAmount:", cartValidRes.data?.data?.finalAmount);
  results.push({
    name: "Validate Coupon for Cart",
    passed: cartValidRes.status === 200 && cartValidRes.data?.data?.discountAmount === 300 && cartValidRes.data?.data?.finalAmount === 700,
  });

  // TEST 8: Toggle Status
  console.log("\n[TEST 8] Toggling Coupon Status...");
  const toggleRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/coupons/${createdId}/status`,
      method: "PATCH",
    },
    { status: "Disabled" }
  );
  console.log("Status:", toggleRes.status, "New Status:", toggleRes.data?.data?.status);
  results.push({
    name: "Toggle Coupon Status",
    passed: toggleRes.status === 200 && toggleRes.data?.data?.status === "Disabled",
  });

  // TEST 9: Delete Coupon
  console.log("\n[TEST 9] Deleting Coupon...");
  const deleteRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/coupons/${createdId}`,
    method: "DELETE",
  });
  console.log("Status:", deleteRes.status, "Message:", deleteRes.data?.message);
  results.push({
    name: "Delete Coupon API",
    passed: deleteRes.status === 200 && deleteRes.data?.success,
  });

  // Final Summary
  console.log("\n==========================================");
  console.log("COUPONS TEST SUITE RESULTS");
  console.log("==========================================");
  let allPassed = true;
  results.forEach((r, idx) => {
    const mark = r.passed ? "✓ PASS" : "✗ FAIL";
    if (!r.passed) allPassed = false;
    console.log(`[${idx + 1}] ${mark}: ${r.name}`);
  });

  console.log("==========================================");
  console.log(`OVERALL: ${allPassed ? "ALL TESTS PASSED!" : "SOME TESTS FAILED!"}`);
  console.log("==========================================\n");

  if (!allPassed) process.exit(1);
}

runTest().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
