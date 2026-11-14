"use client";

import { useEffect } from "react";
import { rememberSide } from "@/lib/audience";

/** Posé sur les pages pros : le visiteur est mémorisé comme professionnel */
export default function MarkPro() {
  useEffect(() => rememberSide("pro"), []);
  return null;
}
