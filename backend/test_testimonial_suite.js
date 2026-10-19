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
  console.log("STARTING TEST: TESTIMONIAL API & MODEL");
  console.log("==========================================\n");

  const results = [];

  // TEST 1: Fetch Testimonials (Plural & Singular routes)
  console.log("[TEST 1] Testing /api/testimonials and /api/testimonial endpoints...");
  const pluralRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/testimonials",
    method: "GET",
  });
  const singularRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/testimonial",
    method: "GET",
  });
  console.log("Plural Status:", pluralRes.status, "Singular Status:", singularRes.status);
  results.push({
    name: "Testimonial Endpoints Availability",
    passed: pluralRes.status === 200 && singularRes.status === 200 && Array.isArray(pluralRes.data?.data),
  });

  // TEST 2: Create a Valid Testimonial with WebP image conversion
  console.log("\n[TEST 2] Creating a new Testimonial with Base64 image (testing WebP conversion)...");
  const sampleBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const createRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/testimonials",
      method: "POST",
    },
    {
      clientName: "Sunita Mohanty",
      designation: "Chief Librarian",
      company: "National Heritage Library",
      rating: 5,
      message: "The curated rare books and prompt deliveries have made our library acquisition seamless.",
      accentColor: "#0284c7",
      status: "Active",
      profileImage: sampleBase64,
    }
  );
  console.log("Status:", createRes.status, "Client:", createRes.data?.data?.clientName, "ProfileImage:", createRes.data?.data?.profileImage);
  const createdId = createRes.data?.data?._id;
  const isWebp = typeof createRes.data?.data?.profileImage === "string" && createRes.data?.data?.profileImage.endsWith(".webp");
  results.push({
    name: "Create Testimonial & WebP Conversion",
    passed: createRes.status === 201 && createRes.data?.success && createdId && isWebp,
  });

  // TEST 3: Validation Error Handling
  console.log("\n[TEST 3] Testing validation (missing clientName)...");
  const badRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/testimonials",
      method: "POST",
    },
    {
      designation: "Manager",
      message: "Incomplete testimonial",
    }
  );
  console.log("Status:", badRes.status, "Message:", badRes.data?.message);
  results.push({
    name: "Validation Rejection",
    passed: badRes.status === 400 && !badRes.data?.success,
  });

  // TEST 4: Get Single Testimonial by ID
  console.log(`\n[TEST 4] Getting Testimonial by ID ${createdId}...`);
  const getByIdRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/testimonials/${createdId}`,
    method: "GET",
  });
  console.log("Status:", getByIdRes.status, "Client:", getByIdRes.data?.data?.clientName);
  results.push({
    name: "Get Testimonial by ID",
    passed: getByIdRes.status === 200 && getByIdRes.data?.data?.clientName === "Sunita Mohanty",
  });

  // TEST 5: Public Active Testimonials
  console.log("\n[TEST 5] Testing Public Active Testimonials...");
  const activeRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/testimonials/active",
    method: "GET",
  });
  console.log("Status:", activeRes.status, "Count:", activeRes.data?.count);
  results.push({
    name: "Active Testimonials Public Endpoint",
    passed: activeRes.status === 200 && Array.isArray(activeRes.data?.data) && activeRes.data?.data?.some(t => t._id === createdId),
  });

  // TEST 6: Update Testimonial
  console.log(`\n[TEST 6] Updating Testimonial ${createdId}...`);
  const updateRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/testimonials/${createdId}`,
      method: "PUT",
    },
    {
      designation: "Senior Dean of Literature",
      rating: 5,
    }
  );
  console.log("Status:", updateRes.status, "New Designation:", updateRes.data?.data?.designation);
  results.push({
    name: "Update Testimonial API",
    passed: updateRes.status === 200 && updateRes.data?.data?.designation === "Senior Dean of Literature",
  });

  // TEST 7: Toggle Status
  console.log(`\n[TEST 7] Toggling Testimonial Status for ${createdId}...`);
  const toggleRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/testimonials/${createdId}/status`,
      method: "PATCH",
    }
  );
  console.log("Status:", toggleRes.status, "New Status:", toggleRes.data?.data?.status);
  results.push({
    name: "Toggle Status to Inactive",
    passed: toggleRes.status === 200 && toggleRes.data?.data?.status === "Inactive",
  });

  // TEST 8: Delete Testimonial
  console.log(`\n[TEST 8] Deleting Testimonial ${createdId}...`);
  const deleteRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/testimonials/${createdId}`,
    method: "DELETE",
  });
  console.log("Status:", deleteRes.status, "Message:", deleteRes.data?.message);
  results.push({
    name: "Delete Testimonial API",
    passed: deleteRes.status === 200 && deleteRes.data?.success,
  });

  // Final Summary
  console.log("\n==========================================");
  console.log("TESTIMONIAL TEST SUITE RESULTS");
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
