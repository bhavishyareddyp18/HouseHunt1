const http = require("http");
const { Socket } = require("net");
const jwt = require("jsonwebtoken");

// Load app and routes
const app = require("./app");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const agreementRoutes = require("./routes/agreementRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const agentRoutes = require("./routes/agentRoutes");
const errorHandler = require("./middleware/errorHandler");

// Mount routes in test runner identical to server.js
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/agreements", agreementRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/agents", agentRoutes);
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Resource not found: ${req.method} ${req.originalUrl}` });
});
app.use(errorHandler);

// Helper for in-memory request execution using genuine Node.js HTTP prototypes
function request(method, url, body = null, headers = {}) {
  return new Promise((resolve) => {
    const socket = new Socket();
    socket.remoteAddress = "127.0.0.1";

    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = {
      host: "localhost:5001",
      ...headers
    };

    if (body) {
      const jsonStr = JSON.stringify(body);
      req.headers["content-type"] = "application/json";
      req.headers["content-length"] = Buffer.byteLength(jsonStr);
      req.push(jsonStr);
      req.push(null);
    } else {
      req.push(null);
    }

    const res = new http.ServerResponse(req);
    res.assignSocket(socket);

    let output = "";
    res.write = (chunk) => {
      if (chunk) output += chunk.toString();
      return true;
    };

    res.end = (chunk) => {
      if (chunk) output += chunk.toString();
      let parsedData = null;
      try {
        parsedData = JSON.parse(output);
      } catch (e) {
        parsedData = output;
      }
      resolve({
        status: res.statusCode,
        data: parsedData,
        raw: output
      });
    };

    app(req, res);
  });
}

async function runTests() {
  console.log("=========================================");
  console.log(" Running HouseHunt Automated Test Suite ");
  console.log("=========================================\n");

  const results = [];
  function assert(name, condition, details = "") {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      results.push({ name, passed: true });
    } else {
      console.error(`❌ FAIL: ${name} - ${details}`);
      results.push({ name, passed: false, details });
    }
  }

  // 1. Root endpoint test
  const rootRes = await request("GET", "/");
  assert(
    "Root endpoint returns exact running message",
    rootRes.status === 200 && rootRes.data?.message === "HouseHunt API Running",
    `Status: ${rootRes.status}, Message: ${rootRes.data?.message}`
  );

  // 2. Health check endpoint test
  const healthRes = await request("GET", "/api/health");
  assert(
    "Health check returns status ok",
    healthRes.status === 200 && healthRes.data?.status === "ok",
    `Status: ${healthRes.status}`
  );

  // 3. Properties list endpoint
  const propsRes = await request("GET", "/api/properties");
  assert(
    "Properties endpoint returns success and array of data",
    propsRes.status === 200 &&
      propsRes.data?.success === true &&
      Array.isArray(propsRes.data?.data) &&
      propsRes.data.data.length >= 2,
    `Count: ${propsRes.data?.count}, Data Length: ${propsRes.data?.data?.length}`
  );

  // 4. Property data schema validation (fields required by frontend)
  const firstProp = propsRes.data?.data?.[0];
  assert(
    "Property record contains _id, title, city, type, price, rent, location, and images",
    firstProp &&
      (firstProp._id || firstProp.id) &&
      firstProp.title &&
      firstProp.city &&
      firstProp.type &&
      (firstProp.price !== undefined || firstProp.rent !== undefined) &&
      firstProp.location &&
      Array.isArray(firstProp.images),
    JSON.stringify(firstProp)
  );

  // 5. Property filtering by city
  const cityRes = await request("GET", "/api/properties?city=Hyderabad");
  assert(
    "Property search by city filters results correctly",
    cityRes.status === 200 &&
      cityRes.data?.success === true &&
      cityRes.data.data.every((p) => p.city.toLowerCase().includes("hyderabad")),
    `Filtered Count: ${cityRes.data?.count}`
  );

  // 6. Property filtering by type
  const typeRes = await request("GET", "/api/properties?type=apartment");
  assert(
    "Property filtering by type (apartment) returns matching items",
    typeRes.status === 200 &&
      typeRes.data?.success === true &&
      typeRes.data.data.every((p) => p.type.toLowerCase() === "apartment"),
    `Filtered Count: ${typeRes.data?.count}`
  );

  // 7. Property details by ID (1)
  const prop1Res = await request("GET", "/api/properties/1");
  assert(
    "Property details by ID 1 returns Modern 2BHK Apartment",
    prop1Res.status === 200 &&
      prop1Res.data?.success === true &&
      prop1Res.data.data?.title?.includes("Modern 2BHK"),
    `Title: ${prop1Res.data?.data?.title}`
  );

  // 8. Property details by ID (2)
  const prop2Res = await request("GET", "/api/properties/2");
  assert(
    "Property details by ID 2 returns Luxury Villa",
    prop2Res.status === 200 &&
      prop2Res.data?.success === true &&
      prop2Res.data.data?.title?.includes("Luxury Villa"),
    `Title: ${prop2Res.data?.data?.title}`
  );

  // 9. Property details for non-existent ID
  const notFoundProp = await request("GET", "/api/properties/nonexistent_9999");
  assert(
    "Property details for missing ID returns 404",
    notFoundProp.status === 404 && notFoundProp.data?.success === false,
    `Status: ${notFoundProp.status}`
  );

  // 10. Registration validation - missing fields
  const regMissing = await request("POST", "/api/auth/register", {});
  assert(
    "Registration without required fields returns 400 or 503 error",
    regMissing.status === 400 || regMissing.status === 503,
    `Status: ${regMissing.status}, Message: ${regMissing.data?.message}`
  );

  // 11. Registration validation - invalid email
  const regBadEmail = await request("POST", "/api/auth/register", {
    name: "Test User",
    email: "notanemail",
    password: "Password123"
  });
  assert(
    "Registration with invalid email returns 400 or 503",
    regBadEmail.status === 400 || regBadEmail.status === 503,
    `Status: ${regBadEmail.status}, Message: ${regBadEmail.data?.message}`
  );

  // 12. Registration validation - short password
  const regShortPass = await request("POST", "/api/auth/register", {
    name: "Test User",
    email: "valid@example.com",
    password: "123"
  });
  assert(
    "Registration with password < 6 characters returns 400 or 503",
    regShortPass.status === 400 || regShortPass.status === 503,
    `Status: ${regShortPass.status}, Message: ${regShortPass.data?.message}`
  );

  // 13. Login validation - missing fields
  const loginEmpty = await request("POST", "/api/auth/login", {});
  assert(
    "Login without credentials returns 400 or 503",
    loginEmpty.status === 400 || loginEmpty.status === 503,
    `Status: ${loginEmpty.status}, Message: ${loginEmpty.data?.message}`
  );

  // 14. Protected route without token
  const noTokenRes = await request("GET", "/api/auth/profile");
  assert(
    "Protected route without token returns 401 Not authorized",
    noTokenRes.status === 401 && noTokenRes.data?.success === false,
    `Status: ${noTokenRes.status}, Message: ${noTokenRes.data?.message}`
  );

  // 15. Protected route with invalid token
  const badTokenRes = await request("GET", "/api/auth/profile", null, {
    authorization: "Bearer invalid.jwt.token"
  });
  assert(
    "Protected route with invalid token returns 401",
    badTokenRes.status === 401 && badTokenRes.data?.success === false,
    `Status: ${badTokenRes.status}`
  );

  // 16. Protected route with valid token
  const testSecret = process.env.JWT_SECRET || "househunt_jwt_secret_production_fallback_2026";
  const validToken = jwt.sign({ id: "test_user_id_123", role: "user" }, testSecret, { expiresIn: "1h" });
  const validTokenRes = await request("GET", "/api/auth/profile", null, {
    authorization: `Bearer ${validToken}`
  });
  assert(
    "Protected route with valid token allows request",
    validTokenRes.status === 200 && validTokenRes.data?.success === true,
    `Status: ${validTokenRes.status}, User: ${JSON.stringify(validTokenRes.data?.user)}`
  );

  // 17. Agents list endpoint
  const agentsRes = await request("GET", "/api/agents");
  assert(
    "Agents endpoint returns list of agents",
    agentsRes.status === 200 && agentsRes.data?.success === true && Array.isArray(agentsRes.data?.data),
    `Count: ${agentsRes.data?.count}`
  );

  // 18. Agents dashboard route routing precedence check
  const agentDashRes = await request("GET", "/api/agents/dashboard", null, {
    authorization: `Bearer ${validToken}`
  });
  assert(
    "Agents /dashboard route is not masked by /:id",
    agentDashRes.status === 200 && agentDashRes.data?.success === true && agentDashRes.data.data?.totalListings !== undefined,
    `Status: ${agentDashRes.status}`
  );

  // 19. Unmatched route 404 test
  const notFoundRes = await request("GET", "/api/nonexistent-route-xyz");
  assert(
    "Unmatched routes return structured 404 error",
    notFoundRes.status === 404 && notFoundRes.data?.success === false,
    `Status: ${notFoundRes.status}`
  );

  console.log("\n=========================================");
  const passed = results.filter((r) => r.passed).length;
  console.log(` Test Summary: ${passed}/${results.length} Tests Passed`);
  console.log("=========================================");

  if (passed === results.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
