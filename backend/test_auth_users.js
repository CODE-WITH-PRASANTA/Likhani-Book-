const http = require("http");

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log("=== STARTING AUTH & USERS TEST SUITE ===");

  // 1. Register a new user
  console.log("\n1. Testing User Registration...");
  const ts = Date.now().toString().slice(-6);
  const regPayload = {
    firstName: "Test",
    lastName: `Reader${ts}`,
    email: `test.reader${ts}@example.com`,
    phone: `98${ts}001`,
    password: "Password@123",
  };
  const regRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/register",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    regPayload
  );
  console.log("Register Response Status:", regRes.status);
  console.log("Register Response Body:", JSON.stringify(regRes.data, null, 2));

  if (!regRes.data?.success || !regRes.data?.token || regRes.data?.user?.role !== "User") {
    throw new Error("Registration failed or user role is not User");
  }
  const token = regRes.data.token;

  // 2. Duplicate registration check
  console.log("\n2. Testing Duplicate Registration Prevention...");
  const dupRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/register",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    regPayload
  );
  console.log("Duplicate Register Status:", dupRes.status);
  console.log("Duplicate Register Message:", dupRes.data?.message);
  if (dupRes.status !== 400) {
    throw new Error("Duplicate registration should return 400");
  }

  // 3. User Login
  console.log("\n3. Testing Login with Email & Password...");
  const loginRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {
      identifier: regPayload.email,
      password: "Password@123",
    }
  );
  console.log("Login Response Status:", loginRes.status);
  console.log("Login User Role:", loginRes.data?.user?.role);
  if (!loginRes.data?.success || !loginRes.data?.token) {
    throw new Error("Login failed");
  }

  // 4. Testing Google Auth (Continue with Google)
  console.log("\n4. Testing Google Authentication...");
  const googlePayload = {
    email: "google.bookworm@gmail.com",
    name: "Alex Johnson",
    firstName: "Alex",
    lastName: "Johnson",
    googleId: "google-uid-123456789",
    avatar: "https://lh3.googleusercontent.com/a/default-user",
  };
  const googleRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/google",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    googlePayload
  );
  console.log("Google Auth Status:", googleRes.status);
  console.log("Google Auth User:", JSON.stringify(googleRes.data?.user, null, 2));
  if (!googleRes.data?.success || googleRes.data?.user?.role !== "User") {
    throw new Error("Google auth failed or user role is not User");
  }

  // 5. Testing Current User Profile (/api/auth/me)
  console.log("\n5. Testing /api/auth/me with JWT...");
  const meRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/auth/me",
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("Get Me Status:", meRes.status);
  console.log("Get Me User:", meRes.data?.user?.name);
  if (!meRes.data?.success) {
    throw new Error("/api/auth/me failed");
  }

  // 6. Testing /api/users for Admin Panel
  console.log("\n6. Testing /api/users for Admin Panel...");
  const usersRes = await request({
    hostname: "localhost",
    port: 5000,
    path: "/api/users",
    method: "GET",
  });
  console.log("Users List Status:", usersRes.status);
  console.log("Users Count:", usersRes.data?.count);
  console.log("Users Stats:", JSON.stringify(usersRes.data?.stats, null, 2));
  console.log("Users Data:", JSON.stringify(usersRes.data?.data, null, 2));

  if (!usersRes.data?.success || usersRes.data?.count < 2) {
    throw new Error("Users not appearing in /api/users");
  }

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

run().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
