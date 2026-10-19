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

async function runE2E() {
  console.log("==========================================");
  console.log("STARTING FULL END-TO-END VERIFICATION");
  console.log("==========================================\n");

  const results = [];

  // ==========================================
  // FLOW 1: ENQUIRY FLOW (Frontend -> Backend -> Admin)
  // ==========================================
  console.log("--> Testing FLOW 1: Enquiry Submission & Admin Management");

  // 1. Submit from Contact Us form
  const createRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/enquiries",
    method: "POST",
  }, {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "9876543210",
    message: "Inquiring about Odia book collections.",
    type: "General Enquiry",
    subject: "Website Contact Us Form",
  });
  console.log("1.1 Submission result:", createRes.status, createRes.data?.success);
  const enquiryId = createRes.data?.enquiry?._id;
  results.push({
    flow: "Enquiry: Public Submission",
    passed: createRes.status === 201 && createRes.data?.success && createRes.data?.enquiry?.phone === "9876543210",
  });

  // 1.2 Fetch in Admin with global stats
  const listRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/enquiries?page=1&limit=10",
    method: "GET",
  });
  console.log("1.2 Admin list fetch:", listRes.status, "Stats:", listRes.data?.stats);
  results.push({
    flow: "Enquiry: Admin Fetch with Global Stats",
    passed: listRes.status === 200 && listRes.data?.stats?.total >= 1 && listRes.data?.stats?.newCount >= 1,
  });

  // 1.3 Date filter check
  const todayStr = new Date().toISOString().split("T")[0];
  const dateRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/enquiries?date=${todayStr}`,
    method: "GET",
  });
  console.log("1.3 Date filter fetch for", todayStr, ":", dateRes.status, "Found:", dateRes.data?.data?.length);
  results.push({
    flow: "Enquiry: Backend Date Filtering",
    passed: dateRes.status === 200 && dateRes.data?.data?.some(e => e._id === enquiryId),
  });

  // 1.4 Admin reply & status update
  const updateRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/enquiries/${enquiryId}`,
    method: "PUT",
  }, {
    status: "In Progress",
    adminReply: "Thank you Priya, we have sent the catalog to your email.",
  });
  console.log("1.4 Admin update:", updateRes.status, "Status:", updateRes.data?.data?.status);
  results.push({
    flow: "Enquiry: Admin Reply & Status Transition",
    passed: updateRes.status === 200 && updateRes.data?.data?.status === "In Progress" && updateRes.data?.data?.adminReply?.length > 0,
  });

  // ==========================================
  // FLOW 2: SUPPORT TICKETS (Frontend -> Admin)
  // ==========================================
  console.log("\n--> Testing FLOW 2: Support Ticket Submission & Lifecycle");

  const supportRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/supports",
    method: "POST",
  }, {
    name: "Rajesh Kumar",
    mobile: "+91 9876501234",
    email: "rajesh@example.com",
    message: "Need help tracking my parcel.",
    status: "New",
  });
  console.log("2.1 Support submission:", supportRes.status, supportRes.data?.success);
  const supportId = supportRes.data?.data?._id;
  results.push({
    flow: "Support: Submission",
    passed: supportRes.status === 201 && supportRes.data?.success,
  });

  // Support list check
  const supportList = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/supports",
    method: "GET",
  });
  console.log("2.2 Support list fetch:", supportList.status, "Count:", supportList.data?.count);
  results.push({
    flow: "Support: Admin Fetch",
    passed: supportList.status === 200 && supportList.data?.count >= 1,
  });

  // ==========================================
  // FLOW 3: TESTIMONIALS (Admin CRUD & Public Visibility)
  // ==========================================
  console.log("\n--> Testing FLOW 3: Testimonial Public/Private Visibility Toggle");

  // 3.1 Create Testimonial
  const testmCreate = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/testimonials",
    method: "POST",
  }, {
    clientName: "Dr. Ananya Mohapatra",
    designation: "Professor",
    company: "Utkal University",
    rating: 5,
    message: "Exceptional collection of historical texts. Highly recommended!",
    status: "Active",
  });
  console.log("3.1 Testimonial create:", testmCreate.status, testmCreate.data?.message);
  const testmId = testmCreate.data?.data?._id;
  results.push({
    flow: "Testimonial: Create Active",
    passed: testmCreate.status === 201 && testmCreate.data?.success,
  });

  // 3.2 Verify visible on public /active endpoint
  const publicActive1 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/testimonials/active",
    method: "GET",
  });
  const isVisiblePublicly1 = publicActive1.data?.data?.some(t => t._id === testmId);
  console.log("3.2 Publicly visible when Active:", isVisiblePublicly1);
  results.push({
    flow: "Testimonial: Visible on /api/testimonials/active",
    passed: isVisiblePublicly1 === true,
  });

  // 3.3 Toggle to Inactive
  const toggleRes = await request({
    hostname: "localhost",
    port: 5000,
    path: `/api/testimonials/${testmId}/status`,
    method: "PATCH",
  });
  console.log("3.3 Toggle status:", toggleRes.status, "New status:", toggleRes.data?.data?.status);
  results.push({
    flow: "Testimonial: Toggle Status to Inactive",
    passed: toggleRes.status === 200 && toggleRes.data?.data?.status === "Inactive",
  });

  // 3.4 Verify NOT visible on public /active endpoint when Inactive
  const publicActive2 = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/testimonials/active",
    method: "GET",
  });
  const isVisiblePublicly2 = publicActive2.data?.data?.some(t => t._id === testmId);
  console.log("3.4 Hidden from public when Inactive:", !isVisiblePublicly2);
  results.push({
    flow: "Testimonial: Hidden from public when Inactive",
    passed: isVisiblePublicly2 === false,
  });

  // ==========================================
  // FLOW 4: ADMIN PROFILE LIFECYCLE
  // ==========================================
  console.log("\n--> Testing FLOW 4: Admin Profiles CRUD");

  // 4.1 Create profile
  const profileCreate = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/profiles",
    method: "POST",
  }, {
    name: "Admin User",
    email: "admin.likhani@example.com",
    travelerType: "Super Admin",
    homeLocation: "Bhubaneswar, Odisha",
    bio: "Chief Editor and Operations Lead",
  });
  console.log("4.1 Profile create:", profileCreate.status, profileCreate.data?.message);
  const profileId = profileCreate.data?.data?._id;
  results.push({
    flow: "Profile: Create Admin Profile",
    passed: profileCreate.status === 201 && profileCreate.data?.success,
  });

  // 4.2 Fetch profiles
  const profileList = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/profiles",
    method: "GET",
  });
  console.log("4.2 Profile list fetch:", profileList.status, "Count:", profileList.data?.count);
  results.push({
    flow: "Profile: Fetch All",
    passed: profileList.status === 200 && profileList.data?.count >= 1,
  });

  // ==========================================
  // CLEANUP CREATED TEST DATA
  // ==========================================
  console.log("\n--> Cleaning up test data...");
  await request({ hostname: "localhost", port: 5000, path: `/api/enquiries/${enquiryId}`, method: "DELETE" });
  await request({ hostname: "localhost", port: 5000, path: `/api/supports/${supportId}`, method: "DELETE" });
  await request({ hostname: "localhost", port: 5000, path: `/api/testimonials/${testmId}`, method: "DELETE" });
  await request({ hostname: "localhost", port: 5000, path: `/api/profiles/${profileId}`, method: "DELETE" });
  console.log("Cleanup complete.");

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log("\n==========================================");
  console.log("E2E VERIFICATION SUMMARY");
  console.log("==========================================");
  let allPass = true;
  results.forEach((r, idx) => {
    console.log(`[${idx + 1}] ${r.flow}: ${r.passed ? "PASS" : "FAIL"}`);
    if (!r.passed) allPass = false;
  });
  console.log("\nALL E2E FLOWS STATUS:", allPass ? "VERIFIED & PASSED" : "FAILED");
}

runE2E();
