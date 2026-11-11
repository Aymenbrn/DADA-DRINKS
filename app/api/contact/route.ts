import { NextResponse } from "next/server";

/**
 * Réception des formulaires (contact, devis pro, newsletter).
 *
 * Pour recevoir les messages par e-mail, ajoutez dans Vercel → Settings → Environment Variables :
 *   RESEND_API_KEY  clé API de https://resend.com
 *   CONTACT_TO      adresse qui reçoit les messages (ex. contact@dadadrinks.com)
 *   CONTACT_FROM    expéditeur vérifié chez Resend (ex. « Site Dada <site@dadadrinks.com> »)
 * Sans ces variables, les messages sont seulement écrits dans les logs Vercel.
 */
export async function POST(req: Request) {
  let data: Record<string, unknown>;
  try {
    data = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const str = (k: string) => (typeof data[k] === "string" ? (data[k] as string).trim().slice(0, 5000) : "");

  // Champ piège rempli = robot : on fait comme si tout allait bien
  if (str("website")) return NextResponse.json({ ok: true });

  const name = str("name");
  const email = str("email");
  const message = str("message");
  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Merci d’indiquer votre nom, votre e-mail et votre message." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "L’adresse e-mail ne semble pas valide." }, { status: 400 });
  }

  const subject = str("subject") || "Nouveau message";
  const text = Object.keys(data)
    .filter((k) => k !== "website" && typeof data[k] === "string")
    .map((k) => `${k} : ${str(k)}`)
    .join("\n");

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  if (key && to) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM ?? "Site Dada <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `[Site Dada] ${subject} — ${name}`,
        text,
      }),
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "L’envoi a échoué. Écrivez-nous sur WhatsApp au +33 7 82 20 61 31 en attendant." },
        { status: 502 }
      );
    }
  } else {
    console.log(`[contact] ${subject}\n${text}`);
  }

  return NextResponse.json({ ok: true });
}
