import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AddressInfo } from "net";
import { Server } from "http";
import app from "../../app";
import { hasTestDatabase } from "../../test/db";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  process.env.CRON_SECRET = "test-cron-secret";
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/jobs/expire-transactions`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

describe("GET /api/jobs/expire-transactions", () => {
  it("menolak request tanpa secret", async () => {
    expect((await fetch(baseUrl)).status).toBe(401);
  });

  it("menolak secret yang salah", async () => {
    const response = await fetch(baseUrl, {
      headers: { Authorization: "Bearer wrong" },
    });
    expect(response.status).toBe(401);
  });

  it.skipIf(!hasTestDatabase)("menjalankan expiry dengan secret yang benar", async () => {
    const response = await fetch(baseUrl, {
      headers: { Authorization: "Bearer test-cron-secret" },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: { expired: expect.any(Number) },
    });
  });
});
