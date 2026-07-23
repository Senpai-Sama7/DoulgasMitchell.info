'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';
import { Fingerprint, Loader2, Plus, Trash2, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { adminFetch, adminJson } from '@/lib/admin-api-client';
import { logger } from '@/lib/logger';
import { motion, AnimatePresence } from 'framer-motion';

export interface PasskeySummary {
  id: string;
  credentialId: string;
  deviceName: string | null;
  createdAt: string | Date;
  lastUsedAt: string | Date | null;
}

interface PasskeyManagerProps {
  initialPasskeys: PasskeySummary[];
}

interface PasskeyListResponse {
  passkeys: PasskeySummary[];
}

interface RegistrationOptionsResponse {
  options: PublicKeyCredentialCreationOptionsJSON;
}

function formatPasskeyDate(value: string | Date | null): string {
  if (!value) return 'Never';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
}

function isCancelledPasskeyPrompt(message: string) {
  return (
    message.includes('NotAllowedError') ||
    message.includes('timed out') ||
    message.includes('cancelled') ||
    message.includes('canceled')
  );
}

export function PasskeyManager({ initialPasskeys }: PasskeyManagerProps) {
  const [passkeys, setPasskeys] = useState<PasskeySummary[]>(initialPasskeys);
  const [isRegistering, setIsRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<PasskeySummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const refreshPasskeys = async () => {
    try {
      const data = await adminFetch<PasskeyListResponse>('/api/admin/passkeys');
      setPasskeys(data.passkeys ?? []);
    } catch (error) {
      // Non-fatal: the list will refresh on the next page load.
      logger.error('Failed to refresh passkey list:', error);
    }
  };

  const handleRegister = async () => {
    if (!deviceName.trim()) {
      toast({
        title: 'Device name required',
        description: 'Please give this passkey a name (e.g., "My iPhone" or "Work Laptop").',
        variant: 'destructive',
      });
      return;
    }

    setIsRegistering(true);

    try {
      // 1. Get registration options from the server (challenge bound to user)
      const { options } = await adminJson<RegistrationOptionsResponse>(
        '/api/admin/auth/passkey/register/generate-options',
        'POST'
      );

      // 2. Start WebAuthn registration in the browser
      let regResp;
      try {
        regResp = await startRegistration({ optionsJSON: options });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Registration was cancelled.';
        if (isCancelledPasskeyPrompt(message)) {
          toast({
            title: 'Passkey cancelled',
            description: 'The passkey prompt was dismissed before registration completed.',
          });
          return;
        }
        throw error;
      }

      // 3. Verify registration on the server
      await adminJson('/api/admin/auth/passkey/register/verify', 'POST', {
        response: regResp,
        deviceName: deviceName.trim(),
      });

      toast({
        title: 'Passkey registered!',
        description: 'You can now use this device to sign in securely.',
      });
      setDeviceName('');
      await refreshPasskeys();
    } catch (error: unknown) {
      logger.error(error instanceof Error ? error.message : String(error));
      toast({
        title: 'Registration failed',
        description:
          error instanceof Error ? error.message : 'Make sure your device supports biometrics.',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;

    setIsDeleting(true);
    try {
      await adminFetch(`/api/admin/passkeys?id=${encodeURIComponent(deleteCandidate.id)}`, {
        method: 'DELETE',
      });

      setPasskeys((current) => current.filter((pk) => pk.id !== deleteCandidate.id));
      toast({
        title: 'Passkey removed',
        description: `${deleteCandidate.deviceName || 'The device'} can no longer be used to sign in.`,
      });
      setDeleteCandidate(null);
    } catch (error: unknown) {
      toast({
        title: 'Removal failed',
        description: error instanceof Error ? error.message : 'Could not remove the passkey.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Biometric Access (Passkeys)</CardTitle>
              <CardDescription>
                Add secure, passwordless login using Touch ID, Face ID, or security keys.
              </CardDescription>
            </div>
            <Fingerprint className="h-8 w-8 text-primary opacity-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="deviceName">New Passkey Name</Label>
                <Input
                  id="deviceName"
                  placeholder="e.g. MacBook Pro Touch ID"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
                  disabled={isRegistering}
                />
              </div>
              <Button onClick={handleRegister} disabled={isRegistering} className="shrink-0">
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Passkey
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-medium mb-3">Your Registered Devices</h4>
              <div className="space-y-3">
                <AnimatePresence>
                  {passkeys.length > 0 ? (
                    passkeys.map((pk) => (
                      <motion.div
                        key={pk.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            {pk.deviceName?.toLowerCase().includes('phone') ? (
                              <Smartphone className="h-4 w-4" />
                            ) : (
                              <Monitor className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{pk.deviceName || 'Unnamed Device'}</p>
                            <p className="text-xs text-muted-foreground">
                              Added: {formatPasskeyDate(pk.createdAt)} · Last used: {formatPasskeyDate(pk.lastUsedAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove passkey for ${pk.deviceName || 'this device'}`}
                          onClick={() => setDeleteCandidate(pk)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed rounded-xl">
                      No passkeys registered yet.
                    </p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleteCandidate)}
        onOpenChange={(open) => !open && !isDeleting && setDeleteCandidate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this passkey?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCandidate
                ? `${deleteCandidate.deviceName || 'This device'} will no longer be able to sign in with a passkey. Make sure you still have a password or another passkey before removing it.`
                : 'This device will no longer be able to sign in with a passkey.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove passkey'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
