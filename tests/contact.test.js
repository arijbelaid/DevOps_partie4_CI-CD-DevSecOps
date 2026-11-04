import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createMemoryContactRepository } from "../src/repositories/contactRepository.js";

describe("POST /api/contact", () => {
  let app;
  let repository;

  beforeEach(() => {
    repository = createMemoryContactRepository();
    app = createApp({ contactRepository: repository });
  });

  it("accepte un message valide (201)", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Ada", email: "ada@example.com", message: "Bonjour le monde" });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("refuse un email invalide (400 VALIDATION_ERROR)", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Ada", email: "pas-un-email", message: "Bonjour le monde" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
    expect(res.body.details[0].field).toBe("email");
  });

  it("refuse un champ manquant", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ email: "ada@example.com", message: "Bonjour" }); // name manquant
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("refuse un champ supplémentaire (ex. isAdmin: true)", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Ada", email: "ada@example.com", message: "Bonjour le monde", isAdmin: true });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("refuse un type inattendu (message: 42, name: ['a'])", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: ["a"], email: "ada@example.com", message: 42 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });

  it("refuse un JSON mal formé (400 INVALID_JSON)", async () => {
    const res = await request(app)
      .post("/api/contact")
      .set("Content-Type", "application/json")
      .send('{"name": "Ada",'); // JSON tronqué volontairement
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID_JSON");
  });

  it("refuse un corps de plus de 10 ko (413)", async () => {
    const hugeMessage = "a".repeat(15000); // 15 ko
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Ada", email: "ada@example.com", message: hugeMessage });
    expect(res.status).toBe(413);
    expect(res.body.error).toBe("PAYLOAD_TOO_LARGE");
  });

  it("stocke tel quel un nom contenant une tentative d'injection SQL", async () => {
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Robert'); DROP TABLE contacts;--", email: "bob@example.com", message: "test injection" });
    expect(res.status).toBe(201); // On ne bloque pas l'entrée, c'est le repository (requêtes paramétrées) qui protège
  });

  it("ne renvoie jamais de stack trace en cas d'erreur 500", async () => {
    // On force le repository à planter pour simuler une erreur interne
    repository.create = () => { throw new Error("Secret database error"); };
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Ada", email: "ada@example.com", message: "Bonjour le monde" });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(res.body)).not.toContain("Secret database error");
    expect(JSON.stringify(res.body)).not.toContain("at "); // Pas de stack trace
  });

  it("ajoute les headers de sécurité Helmet (x-content-type-options, ...)", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
  });

  it("ne renvoie pas le header x-powered-by", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("répond 429 après trop de requêtes sur /api/contact", async () => {
    // On envoie 6 requêtes valides. La limite est de 5.
    for (let i = 0; i < 6; i++) {
        await request(app)
          .post("/api/contact")
          .send({ name: "Ada", email: "ada@example.com", message: "Bonjour le monde" });
    }
    const res = await request(app)
      .post("/api/contact")
      .send({ name: "Ada", email: "ada@example.com", message: "Bonjour le monde" });
    expect(res.status).toBe(429);
  });
});
