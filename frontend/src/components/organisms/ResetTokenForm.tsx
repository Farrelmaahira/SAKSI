"use client";

import { useSearchParams } from "next/navigation";
import ResetForm from "./ResetForm";

/* The reset form with the token from the link in the email */
export default function ResetTokenForm() {
  return <ResetForm token={useSearchParams().get("token") ?? ""} />;
}
