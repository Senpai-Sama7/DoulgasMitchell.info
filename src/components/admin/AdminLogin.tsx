"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, AlertCircle, Loader2, Fingerprint } from "lucide-react";
import { extractApiErrorMessage } from "./utils";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkSupport = async () => {
      if (
        typeof window === "undefined" ||
        typeof window.PublicKeyCredential === "undefined"
      ) {
        return;
      }

      if (
        typeof window.PublicKeyCredential
          .isUserVerifyingPlatformAuthenticatorAvailable !== "function"
      ) {
        if (!cancelled) {
          setIsPasskeySupported(true);
        }
        return;
      }

      try {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!cancelled) {
          setIsPasskeySupported(available);
        }
      } catch {
        if (!cancelled) {
          setIsPasskeySupported(false);
        }
      }
    };

    checkSupport();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data: unknown = await res.json().catch(() => null);
      const isSuccessResponse =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success?: unknown }).success === true;

      if (res.ok && isSuccessResponse) {
        onLogin();
        return;
      }

      const apiError =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : "";

      if (res.status === 429) {
        setError(apiError || "Too many login attempts. Please wait and try again.");
        return;
      }

      if (res.status >= 500 || apiError === "Internal server error") {
        setError("Authentication service is currently unavailable. Please try again.");
        return;
      }

      setError(apiError || "Invalid password");
    } catch {
      setError("Authentication service is currently unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setIsPasskeyLoading(true);
    setError("");

    try {
      const optionsRes = await fetch("/api/admin/passkey/auth/options", {
        method: "POST",
      });
      const optionsData = await optionsRes.json();

      if (!optionsRes.ok || !optionsData.success || !optionsData.data?.options) {
        setError(
          extractApiErrorMessage(
            optionsData,
            "Passkey login is currently unavailable. Use your password."
          )
        );
        return;
      }

      const { startAuthentication } = await import("@simplewebauthn/browser");
      const response = await startAuthentication({
        optionsJSON: optionsData.data.options,
      });

      const verifyRes = await fetch("/api/admin/passkey/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        onLogin();
        return;
      }

      setError(extractApiErrorMessage(verifyData, "Passkey authentication failed."));
    } catch (error) {
      if (error instanceof Error && error.name === "NotAllowedError") {
        setError("Passkey request was cancelled");
        return;
      }

      setError("Passkey authentication failed");
    } finally {
      setIsPasskeyLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="font-serif text-2xl text-center mb-2">Admin Portal</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Sign in with password or passkey biometrics
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password" className="sr-only">Admin password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-input w-full"
              autoFocus
              aria-label="Admin password"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading || isPasskeyLoading}
            className="btn-premium w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
                Authenticating...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" aria-hidden="true" />
                Enter Admin
              </>
            )}
          </button>

          {isPasskeySupported && (
            <>
              <button
                type="button"
                onClick={handlePasskeyLogin}
                disabled={isLoading || isPasskeyLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-accent transition-colors disabled:opacity-60"
                aria-label="Sign in with Face ID or passkey"
              >
                {isPasskeyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Verifying Passkey...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" aria-hidden="true" />
                    Sign in with Face ID / Passkey
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground mt-2">
                Passkeys work best inside Safari (iOS/macOS) or compatible browsers with WebAuthn. Use the same domain when registering and logging in: douglasmitchell.info or www.douglasmitchell.info.
              </p>
            </>
          )}
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Password is configured by server-side <code>ADMIN_PASSWORD</code>
        </p>
      </motion.div>
    </div>
  );
}