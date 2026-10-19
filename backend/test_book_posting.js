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
  console.log("STARTING TEST: BOOK POSTING DEDICATED API");
  console.log("==========================================\n");

  const results = [];

  // TEST 1: Fetch Book Postings
  console.log("[TEST 1] Fetching Book Postings...");
  const listRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/book-posting",
    method: "GET",
  });
  console.log("Status:", listRes.status, "Count:", listRes.data?.count);
  results.push({
    name: "Book Postings GET API",
    passed: listRes.status === 200 && listRes.data?.success && Array.isArray(listRes.data?.data),
  });

  // TEST 2: Create Book Posting
  console.log("\n[TEST 2] Creating a new Book Posting...");
  const createRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/book-posting",
    method: "POST",
  }, {
    title: "Dedicated Posting Story",
    author: "Fakir Mohan Senapati",
    category: "Fiction",
    price: 320,
    offerPrice: 280,
    stock: 25,
    status: "Published",
    featured: true,
    description: "<p>Classic literature book posted via dedicated route.</p>",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
    images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"],
  });
  console.log("Status:", createRes.status, "Title:", createRes.data?.data?.title);
  const createdId = createRes.data?.data?._id;
  results.push({
    name: "Create Book Posting",
    passed: createRes.status === 201 && createRes.data?.success && createdId,
  });

  // TEST 3: Validation Error Handling
  console.log("\n[TEST 3] Testing validation (missing author & price)...");
  const badRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/book-posting",
    method: "POST",
  }, {
    title: "Incomplete Book",
  });
  console.log("Status:", badRes.status, "Message:", badRes.data?.message);
  results.push({
    name: "Validation Rejection",
    passed: badRes.status === 400 && badRes.data?.success === false,
  });

  // TEST 4: Get Single Book Posting
  console.log(`\n[TEST 4] Fetching Book Posting by ID: ${createdId}...`);
  const getSingleRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/book-posting/${createdId}`,
    method: "GET",
  });
  console.log("Status:", getSingleRes.status, "Author:", getSingleRes.data?.data?.author);
  results.push({
    name: "Get Book Posting by ID",
    passed: getSingleRes.status === 200 && getSingleRes.data?.data?._id === createdId,
  });

  // TEST 5: Update Book Posting
  console.log(`\n[TEST 5] Updating Book Posting ID: ${createdId}...`);
  const updateRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/book-posting/${createdId}`,
    method: "PUT",
  }, {
    price: 350,
    stock: 40,
  });
  console.log("Status:", updateRes.status, "Updated Price:", updateRes.data?.data?.price);
  results.push({
    name: "Update Book Posting",
    passed: updateRes.status === 200 && updateRes.data?.data?.price === 350 && updateRes.data?.data?.stock === 40,
  });

  // TEST 6: Toggle Status
  console.log(`\n[TEST 6] Toggling Status for ID: ${createdId}...`);
  const toggleStatusRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/book-posting/${createdId}/status`,
    method: "PATCH",
  });
  console.log("Status:", toggleStatusRes.status, "New Status:", toggleStatusRes.data?.data?.status);
  results.push({
    name: "Toggle Status",
    passed: toggleStatusRes.status === 200 && toggleStatusRes.data?.data?.status === "Draft",
  });

  // TEST 7: Toggle Featured
  console.log(`\n[TEST 7] Toggling Featured for ID: ${createdId}...`);
  const toggleFeaturedRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/book-posting/${createdId}/featured`,
    method: "PATCH",
  });
  console.log("Status:", toggleFeaturedRes.status, "New Featured:", toggleFeaturedRes.data?.data?.featured);
  results.push({
    name: "Toggle Featured",
    passed: toggleFeaturedRes.status === 200 && toggleFeaturedRes.data?.data?.featured === false,
  });

  // TEST 8: Malformed ID rejection
  console.log("\n[TEST 8] Testing malformed ObjectId...");
  const malformedRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/book-posting/not-a-valid-id",
    method: "GET",
  });
  console.log("Status:", malformedRes.status, "Message:", malformedRes.data?.message);
  results.push({
    name: "Malformed ID Rejection",
    passed: malformedRes.status === 400 && malformedRes.data?.success === false,
  });

  // TEST 9: Delete Book Posting
  console.log(`\n[TEST 9] Deleting Book Posting ID: ${createdId}...`);
  const deleteRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/book-posting/${createdId}`,
    method: "DELETE",
  });
  console.log("Status:", deleteRes.status, "Message:", deleteRes.data?.message);
  results.push({
    name: "Delete Book Posting",
    passed: deleteRes.status === 200 && deleteRes.data?.success,
  });

  // TEST 10: Large Base64 Payload Upload (Verifying 413 fix and disk saving)
  console.log("\n[TEST 10] Testing Large Base64 image payload (over 250KB)...");
  const largeDummyBase64 = "data:image/png;base64," + Buffer.alloc(260 * 1024, "A").toString("base64");
  const largeUploadRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/book-posting",
    method: "POST",
  }, {
    title: "Large Base64 Book",
    author: "Test Author",
    category: "Fiction",
    price: 199,
    stock: 10,
    image: largeDummyBase64,
    images: [largeDummyBase64],
  });
  console.log("Status:", largeUploadRes.status, "Image path saved:", largeUploadRes.data?.data?.image);
  const largeCreatedId = largeUploadRes.data?.data?._id;
  const isDiskPath = typeof largeUploadRes.data?.data?.image === "string" && largeUploadRes.data?.data?.image.startsWith("/uploads/");
  results.push({
    name: "Large Base64 Payload Upload (No 413)",
    passed: largeUploadRes.status === 201 && isDiskPath,
  });

  if (largeCreatedId) {
    await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/book-posting/${largeCreatedId}`,
      method: "DELETE",
    });
  }

  // SUMMARY
  console.log("\n==========================================");
  console.log("TEST SUMMARY");
  console.log("==========================================");
  let allPassed = true;
  results.forEach((r, idx) => {
    console.log(`[${idx + 1}] ${r.name}: ${r.passed ? "PASS" : "FAIL"}`);
    if (!r.passed) allPassed = false;
  });

  console.log("\nOVERALL TEST STATUS:", allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED");
  if (!allPassed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTest();
