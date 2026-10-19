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
  console.log("STARTING TEST: BLOGS API & WEBP CONVERSION");
  console.log("==========================================\n");

  const results = [];

  // TEST 1: Fetch Blogs
  console.log("[TEST 1] Fetching Blogs...");
  const listRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/blogs",
    method: "GET",
  });
  console.log("Status:", listRes.status, "Count:", listRes.data?.count);
  results.push({
    name: "Blogs GET API",
    passed: listRes.status === 200 && listRes.data?.success && Array.isArray(listRes.data?.data),
  });

  // TEST 2: Create Blog with Base64 image and verify WebP conversion
  console.log("\n[TEST 2] Creating a new Blog with Base64 Image (testing WebP conversion)...");
  // 1x1 transparent PNG in base64
  const sampleBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const createRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/blogs",
    method: "POST",
  }, {
    title: "Understanding Modern Literature",
    slug: "understanding-modern-literature",
    category: "Academic",
    author: "Editorial Team",
    shortDescription: "A deep dive into 21st-century literature trends.",
    description: "<p>Comprehensive guide to reading contemporary literary masterpieces.</p>",
    tags: ["Literature", "Reading"],
    status: "Published",
    image: sampleBase64,
  });
  console.log("Status:", createRes.status, "Title:", createRes.data?.data?.title, "Image:", createRes.data?.data?.image);
  const createdId = createRes.data?.data?._id;
  const imageIsWebp = typeof createRes.data?.data?.image === "string" && createRes.data?.data?.image.endsWith(".webp");
  results.push({
    name: "Create Blog & Convert Image to WebP",
    passed: createRes.status === 201 && createRes.data?.success && createdId && imageIsWebp,
  });

  // TEST 3: Validation Error Handling
  console.log("\n[TEST 3] Testing validation (missing category)...");
  const badRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/blogs",
    method: "POST",
  }, {
    title: "Incomplete Blog Without Category",
  });
  console.log("Status:", badRes.status, "Message:", badRes.data?.message);
  results.push({
    name: "Validation Rejection",
    passed: badRes.status === 400 && badRes.data?.success === false,
  });

  // TEST 4: Get Blog by ID or Slug
  console.log(`\n[TEST 4] Fetching Blog by Slug 'understanding-modern-literature'...`);
  const getSlugRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/blogs/understanding-modern-literature`,
    method: "GET",
  });
  console.log("Status:", getSlugRes.status, "Found Title:", getSlugRes.data?.data?.title);
  results.push({
    name: "Get Blog by Slug",
    passed: getSlugRes.status === 200 && getSlugRes.data?.data?.slug === "understanding-modern-literature",
  });

  // TEST 5: Update Blog
  console.log(`\n[TEST 5] Updating Blog ID: ${createdId}...`);
  const updateRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/blogs/${createdId}`,
    method: "PUT",
  }, {
    title: "Understanding Modern Literature (Updated Edition)",
    status: "Draft",
  });
  console.log("Status:", updateRes.status, "New Title:", updateRes.data?.data?.title, "New Status:", updateRes.data?.data?.status);
  results.push({
    name: "Update Blog",
    passed: updateRes.status === 200 && updateRes.data?.data?.title?.includes("Updated Edition"),
  });

  // TEST 6: Toggle Status
  console.log(`\n[TEST 6] Toggling Status for ID: ${createdId}...`);
  const toggleRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/blogs/${createdId}/status`,
    method: "PATCH",
  });
  console.log("Status:", toggleRes.status, "Toggled to:", toggleRes.data?.data?.status);
  results.push({
    name: "Toggle Status",
    passed: toggleRes.status === 200 && toggleRes.data?.data?.status === "Published",
  });

  // TEST 7: Delete Blog
  console.log(`\n[TEST 7] Deleting Blog ID: ${createdId}...`);
  const deleteRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/blogs/${createdId}`,
    method: "DELETE",
  });
  console.log("Status:", deleteRes.status, "Message:", deleteRes.data?.message);
  results.push({
    name: "Delete Blog",
    passed: deleteRes.status === 200 && deleteRes.data?.success,
  });

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
