"use client";
import { useContext } from "react";
import { LoginContext } from "@/components/auth/LoginProvider";

export default function useLogin() {
  const ctx = useContext(LoginContext);
  if (!ctx) throw new Error("useLogin must be used within <LoginProvider />");
  return ctx;
}
