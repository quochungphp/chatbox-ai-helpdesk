import request from "supertest";
import type { Application } from "express";
import { setupContinuousIntegrationTest, type AuthServiceTestContext } from "./helpers/setup-ci-test.js";

describe("Auth service user and signin flow", () => {
  let app: Application;
  let appContext: AuthServiceTestContext;

  beforeAll(async () => {
    appContext = await setupContinuousIntegrationTest();
    app = appContext.app;
  });

  afterAll(async () => {
    await appContext.resetData();
    await appContext.disconnect();
  });

  beforeEach(async () => {
    await appContext.resetData();
  });

  it("signs up a user and signs in with email/password", async () => {
    const time = Date.now();
    const email = `${time}@gmail.com`;

    const signupResponse = await request(app)
      .post("/api/users")
      .set("x-api-key", appContext.serviceApiKey)
      .send({
        email,
        firstName: "Lo",
        lastName: "Rem",
        password: "123456@abc",
        phone: 123456789,
        username: email
      })
      .expect(201);

    expect(signupResponse.body).toMatchObject({
      success: true,
      data: {
        id: expect.any(String),
        email,
        firstName: "Lo",
        lastName: "Rem",
        phone: "123456789",
        username: email,
        provider: "PASSWORD",
        role: {
          name: "employee"
        },
        permissions: expect.arrayContaining([
          expect.objectContaining({
            name: "profile:read"
          })
        ]),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        token: expect.any(String)
      },
      error: null
    });
    expect(signupResponse.body.data.passwordHash).toBeUndefined();
    expect(signupResponse.body.data.secretKey).toBeUndefined();

    const signinResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "123456@abc"
      })
      .expect(200);

    expect(signinResponse.body).toMatchObject({
      success: true,
      data: {
        token: expect.any(String),
        user: {
          id: signupResponse.body.data.id,
          email,
          firstName: "Lo",
          lastName: "Rem",
          username: email,
          provider: "PASSWORD",
          role: {
            name: "employee"
          }
        }
      },
      error: null
    });
    expect(signinResponse.body.data.token.length).toBeGreaterThan(100);
  });

  it("rejects duplicate email or username during signup", async () => {
    const email = `${Date.now()}@gmail.com`;
    const payload = {
      email,
      firstName: "Lo",
      lastName: "Rem",
      password: "123456@abc",
      phone: 123456789,
      username: email
    };

    await request(app).post("/api/users").set("x-api-key", appContext.serviceApiKey).send(payload).expect(201);

    const duplicateResponse = await request(app).post("/api/users").set("x-api-key", appContext.serviceApiKey).send(payload).expect(409);

    expect(duplicateResponse.body).toMatchObject({
      success: false,
      data: null,
      error: {
        code: "CONFLICT",
        message: "User has already conflicted"
      }
    });
  });

  it("allows authenticated users to read profile and change password", async () => {
    const email = `${Date.now()}@gmail.com`;

    const signupResponse = await request(app)
      .post("/api/users")
      .set("x-api-key", appContext.serviceApiKey)
      .send({
        email,
        firstName: "Lo",
        lastName: "Rem",
        password: "123456@abc",
        phone: 123456789,
        username: email
      })
      .expect(201);

    const token = signupResponse.body.data.token;

    const profileResponse = await request(app).get("/api/users/profile").set("authorization", `Bearer ${token}`).expect(200);

    expect(profileResponse.body.data).toMatchObject({
      id: signupResponse.body.data.id,
      email
    });

    await request(app)
      .post("/api/users/change-password")
      .set("authorization", `Bearer ${token}`)
      .send({
        password: "abcdef12345",
        passwordConfirm: "abcdef12345"
      })
      .expect(201);

    await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "abcdef12345"
      })
      .expect(200);
  });
});
