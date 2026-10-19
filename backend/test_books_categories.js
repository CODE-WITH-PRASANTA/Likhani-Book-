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
  console.log("STARTING TEST: BOOKS & DYNAMIC CATEGORIES API");
  console.log("==========================================\n");

  const results = [];

  // TEST 1: Categories fetch
  console.log("[TEST 1] Fetching dynamic categories from DB...");
  const catRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/categories",
    method: "GET",
  });
  console.log("Categories count:", catRes.data?.count, "Status:", catRes.status);
  results.push({
    name: "Categories GET",
    passed: catRes.status === 200 && catRes.data?.success && typeof catRes.data?.count === "number",
  });

  // TEST 2: Create a new custom category
  console.log("\n[TEST 2] Creating a new custom category 'Poetry'...");
  const createCatRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/categories",
    method: "POST",
  }, {
    name: "Poetry",
    description: "Classic and contemporary poems and poetic collections.",
    color: "purple",
  });
  console.log("Created category status:", createCatRes.status, "Name:", createCatRes.data?.data?.name);
  const createdCatId = createCatRes.data?.data?._id;
  results.push({
    name: "Create Category",
    passed: createCatRes.status === 201 && createCatRes.data?.success && createCatRes.data?.data?.name === "Poetry",
  });

  // TEST 3: Duplicate category prevention
  console.log("\n[TEST 3] Testing duplicate category prevention...");
  const dupCatRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/categories",
    method: "POST",
  }, {
    name: "poetry", // lowercase duplicate check
    description: "Duplicate test",
  });
  console.log("Duplicate category response status:", dupCatRes.status, dupCatRes.data?.message);
  results.push({
    name: "Duplicate Category Prevention",
    passed: dupCatRes.status === 400 && dupCatRes.data?.message?.includes("already exists"),
  });

  // TEST 4: Fetch books list
  console.log("\n[TEST 4] Fetching books list...");
  const booksRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/books",
    method: "GET",
  });
  console.log("Books status:", booksRes.status, "Total in DB:", booksRes.data?.stats?.total);
  results.push({
    name: "Get Books API",
    passed: booksRes.status === 200 && booksRes.data?.success && booksRes.data?.stats !== undefined,
  });

  // TEST 5: Create a new Book in database
  console.log("\n[TEST 5] Creating a new Book in DB...");
  const createBookRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/books",
    method: "POST",
  }, {
    title: "Chha Mana Atha Guntha",
    isbn: "9788173010011",
    author: "Fakir Mohan Senapati",
    category: "Poetry",
    price: 350,
    stock: 20,
    status: "Published",
    description: "Masterpiece of Odia literature portraying rural social realities.",
    publisher: "Likhani Publications",
    pages: 240,
    language: "Odia",
    year: 1897,
  });
  console.log("Created book status:", createBookRes.status, "Book:", createBookRes.data?.data?.title);
  const createdBookId = createBookRes.data?.data?._id;
  results.push({
    name: "Create Book",
    passed: createBookRes.status === 201 && createBookRes.data?.success && createBookRes.data?.data?.title === "Chha Mana Atha Guntha",
  });

  // TEST 6: Validation: missing required fields
  console.log("\n[TEST 6] Testing Book validation (missing title/price)...");
  const badBookRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/books",
    method: "POST",
  }, {
    author: "Author without title",
  });
  console.log("Bad book response status:", badBookRes.status, badBookRes.data?.message);
  results.push({
    name: "Book Validation Rejection",
    passed: badBookRes.status === 400,
  });

  // TEST 7: Update Book in database
  console.log("\n[TEST 7] Updating Book in DB...");
  const updateBookRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/books/${createdBookId}`,
    method: "PUT",
  }, {
    price: 399,
    stock: 15,
  });
  console.log("Updated book price:", updateBookRes.data?.data?.price, "Stock:", updateBookRes.data?.data?.stock);
  results.push({
    name: "Update Book",
    passed: updateBookRes.status === 200 && updateBookRes.data?.data?.price === 399 && updateBookRes.data?.data?.stock === 15,
  });

  // TEST 8: Toggle Book Status
  console.log("\n[TEST 8] Toggling Book Status...");
  const toggleRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/books/${createdBookId}/status`,
    method: "PATCH",
  });
  console.log("Toggled status:", toggleRes.data?.data?.status);
  results.push({
    name: "Toggle Book Status",
    passed: toggleRes.status === 200 && toggleRes.data?.data?.status === "Draft",
  });

  // TEST 9: Search and Category Filtering
  console.log("\n[TEST 9] Searching books and filtering by Category 'Poetry'...");
  const filterRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/books?search=Fakir&category=Poetry",
    method: "GET",
  });
  console.log("Filter found count:", filterRes.data?.data?.length);
  results.push({
    name: "Filter Books by Category & Search",
    passed: filterRes.status === 200 && filterRes.data?.data?.length === 1 && filterRes.data?.data[0]?._id === createdBookId,
  });

  // TEST 10: Delete Book
  console.log("\n[TEST 10] Deleting Book...");
  const delBookRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/books/${createdBookId}`,
    method: "DELETE",
  });
  console.log("Delete status:", delBookRes.status, delBookRes.data?.message);
  results.push({
    name: "Delete Book",
    passed: delBookRes.status === 200 && delBookRes.data?.success,
  });

  // CLEANUP Category
  console.log("\nCleaning up created test category...");
  if (createdCatId) {
    await request({
      hostname: "localhost",
      port: 5000,
      path: `/api/categories/${createdCatId}`,
      method: "DELETE",
    });
  }

  console.log("\n==========================================");
  console.log("TEST SUMMARY");
  console.log("==========================================");
  let allPass = true;
  results.forEach((r, idx) => {
    console.log(`[${idx + 1}] ${r.name}: ${r.passed ? "PASS" : "FAIL"}`);
    if (!r.passed) allPass = false;
  });
  console.log("\nOVERALL TEST STATUS:", allPass ? "ALL TESTS PASSED" : "TESTS FAILED");
}

runTest();
