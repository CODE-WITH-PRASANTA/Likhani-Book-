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
  console.log("STARTING TEST: REVIEWS API & VALIDATION");
  console.log("==========================================\n");

  const results = [];

  // TEST 1: Fetch Reviews
  console.log("[TEST 1] Fetching Reviews...");
  const listRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/reviews",
    method: "GET",
  });
  console.log("Status:", listRes.status, "Count:", listRes.data?.count, "Stats:", listRes.data?.stats);
  results.push({
    name: "Reviews GET API",
    passed: listRes.status === 200 && listRes.data?.success && Array.isArray(listRes.data?.data),
  });

  // TEST 2: Create a Valid Review
  console.log("\n[TEST 2] Creating a new Valid Review...");
  const createRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/reviews",
      method: "POST",
    },
    {
      user: "Aarav Sharma",
      email: "aarav@example.com",
      book: "Chha Mana Atha Guntha",
      rating: 5,
      comment: "A monumental work of realism and social critique. Incredible translation and print quality!",
      status: "Approved",
    }
  );
  console.log("Status:", createRes.status, "ID:", createRes.data?.data?.id, "User:", createRes.data?.data?.user);
  const createdId = createRes.data?.data?.id || createRes.data?.data?._id;
  results.push({
    name: "Create Review API",
    passed: createRes.status === 201 && createRes.data?.success && createdId,
  });

  // TEST 3: Validation Rejection - Invalid Email
  console.log("\n[TEST 3] Testing Invalid Email Rejection...");
  const badEmailRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/reviews",
      method: "POST",
    },
    {
      user: "Bad Email User",
      email: "not-an-email",
      book: "Some Book",
      rating: 4,
      comment: "Good book indeed",
    }
  );
  console.log("Status:", badEmailRes.status, "Message:", badEmailRes.data?.message);
  results.push({
    name: "Invalid Email Rejection",
    passed: badEmailRes.status === 400 && !badEmailRes.data?.success,
  });

  // TEST 4: Validation Rejection - Rating out of bounds (> 5)
  console.log("\n[TEST 4] Testing Rating Bounds Rejection (rating: 6)...");
  const badRatingRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/reviews",
      method: "POST",
    },
    {
      user: "Rating User",
      email: "user@example.com",
      book: "Some Book",
      rating: 6,
      comment: "Too high rating",
    }
  );
  console.log("Status:", badRatingRes.status, "Message:", badRatingRes.data?.message);
  results.push({
    name: "Rating Bounds Rejection",
    passed: badRatingRes.status === 400 && !badRatingRes.data?.success,
  });

  // TEST 5: Get Single Review by ID
  console.log(`\n[TEST 5] Getting Review by ID ${createdId}...`);
  const getByIdRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/reviews/${createdId}`,
    method: "GET",
  });
  console.log("Status:", getByIdRes.status, "User:", getByIdRes.data?.data?.user);
  results.push({
    name: "Get Review by ID",
    passed: getByIdRes.status === 200 && getByIdRes.data?.data?.user === "Aarav Sharma",
  });

  // TEST 6: Public Approved Reviews Endpoint
  console.log("\n[TEST 6] Testing Public Approved Reviews Endpoint...");
  const publicRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/reviews/public",
    method: "GET",
  });
  console.log("Status:", publicRes.status, "Public Count:", publicRes.data?.count);
  results.push({
    name: "Public Approved Reviews",
    passed: publicRes.status === 200 && Array.isArray(publicRes.data?.data) && publicRes.data?.count >= 1,
  });

  // TEST 7: Update Review
  console.log(`\n[TEST 7] Updating Review ${createdId}...`);
  const updateRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/reviews/${createdId}`,
      method: "PUT",
    },
    {
      comment: "Updated review: An absolute masterpiece of literature!",
      rating: 4,
    }
  );
  console.log("Status:", updateRes.status, "New Rating:", updateRes.data?.data?.rating);
  results.push({
    name: "Update Review API",
    passed: updateRes.status === 200 && updateRes.data?.data?.rating === 4,
  });

  // TEST 8: Toggle Status
  console.log(`\n[TEST 8] Toggling Review Status for ${createdId}...`);
  const toggleRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/reviews/${createdId}/status`,
      method: "PATCH",
    },
    { status: "Pending" }
  );
  console.log("Status:", toggleRes.status, "New Status:", toggleRes.data?.data?.status);
  results.push({
    name: "Toggle Review Status",
    passed: toggleRes.status === 200 && toggleRes.data?.data?.status === "Pending",
  });

  // TEST 9: Delete Review
  console.log(`\n[TEST 9] Deleting Review ${createdId}...`);
  const deleteRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/reviews/${createdId}`,
    method: "DELETE",
  });
  console.log("Status:", deleteRes.status, "Message:", deleteRes.data?.message);
  results.push({
    name: "Delete Review API",
    passed: deleteRes.status === 200 && deleteRes.data?.success,
  });

  // Final Summary
  console.log("\n==========================================");
  console.log("REVIEWS TEST SUITE RESULTS");
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
