"use client";

import { useState, type FormEvent } from "react";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  autoComplete?: string;
  /** Occupe toute la largeur du formulaire */
  wide?: boolean;
};

type Props = {
  fields: Field[];
  /** Sujet fixe (ex. « Demande de devis pro ») ; sinon le champ « subject » du formulaire */
  subject?: string;
  submitLabel: string;
  successText: string;
  dark?: boolean;
};

/** Formulaire envoyé à /api/contact (voir app/api/contact/route.ts pour la réception par e-mail). */
export default function ContactForm({ fields, subject, submitLabel, successText, dark }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data: Record<string, string> = {};
    new FormData(form).forEach((v, k) => { data[k] = String(v); });
    if (subject) data.subject = subject;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setState("done");
        form.reset();
      } else {
        setState("error");
        setError(json.error ?? "L’envoi a échoué. Réessayez dans un instant.");
      }
    } catch {
      setState("error");
      setError("Pas de connexion : vérifiez votre réseau et réessayez.");
    }
  }

  if (state === "done") {
    return (
      <div className={`form-done${dark ? " is-dark" : ""}`} role="status">
        <p className="form-done-title">Message envoyé.</p>
        <p>{successText}</p>
        <button type="button" className="link-btn" onClick={() => setState("idle")}>Envoyer un autre message</button>
      </div>
    );
  }

  return (
    <form className={`form${dark ? " is-dark" : ""}`} onSubmit={onSubmit} noValidate={false}>
      {fields.map((f) => {
        const id = `f-${f.name}`;
        const common = { id, name: f.name, required: f.required, autoComplete: f.autoComplete };
        return (
          <div key={f.name} className={`field${f.wide || f.type === "textarea" ? " is-wide" : ""}`}>
            <label htmlFor={id}>
              {f.label}
              {f.required && <span aria-hidden="true"> *</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea {...common} rows={6} />
            ) : f.type === "select" ? (
              <select {...common} defaultValue="">
                <option value="" disabled>Choisir…</option>
                {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input {...common} type={f.type ?? "text"} />
            )}
          </div>
        );
      })}
      {/* Champ piège anti-spam, invisible pour les visiteurs */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Site web</label>
        <input id="f-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="field is-wide form-actions">
        <button type="submit" className={`btn ${dark ? "btn-light" : "btn-dark"}`} disabled={state === "sending"}>
          {state === "sending" ? "Envoi…" : submitLabel}
        </button>
        <p className="form-note">* champs obligatoires</p>
      </div>
      {state === "error" && <p className="form-error is-wide" role="alert">{error}</p>}
    </form>
  );
}
