"use client";

import { useState, type FormEvent } from "react";

/** Inscription aux nouveautés : envoyée à /api/contact (sujet « Newsletter ») en attendant un outil d'e-mailing. */
export default function NewsletterForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "Newsletter", name: "Inscription newsletter", email, message: "Inscription aux nouveautés Dada." }),
      });
      setState(res.ok ? "done" : "error");
      if (res.ok) form.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ flex: "1 1 420px", display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: 36, lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 800 }}>
        Les nouveautés,<span className="serif-i"> avant tout le monde.</span>
      </h2>
      <label htmlFor="dada-email" style={{ fontSize: 14, color: "var(--muted-on-dark)" }}>Votre adresse e-mail</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input id="dada-email" name="email" type="email" required autoComplete="email" placeholder="vous@exemple.fr" className="input" />
        <button type="submit" className="btn btn-light" style={{ height: 52, fontSize: 16 }} disabled={state === "sending"}>
          {state === "sending" ? "Envoi…" : "S’inscrire"}
        </button>
      </div>
      <p role="status" aria-live="polite" style={{ margin: 0, fontSize: 14, color: "var(--muted-on-dark)", minHeight: 20 }}>
        {state === "done" && "C’est noté : vous recevrez les prochaines nouveautés Dada."}
        {state === "error" && "L’inscription n’a pas pu être envoyée. Réessayez dans un instant."}
      </p>
    </form>
  );
}
