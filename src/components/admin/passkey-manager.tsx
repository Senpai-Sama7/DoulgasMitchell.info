'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Fingerprint, Plus, Trash2, Smartphone, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Passkey {
  id: string;
  credentialId: string;
  deviceName: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

interface PasskeyManagerProps {
  initialPasskeys: any[];
}

export function PasskeyManager({ initialPasskeys }: PasskeyManagerProps) {
  const [passkeys, setPasskeys] = useState<Passkey[]>(initialPasskeys.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt).toLocaleDateString(),
    lastUsedAt: p.lastUsedAt ? new Date(p.lastUsedAt).toLocaleDateString() : 'Never',
  })));
  const [isRegistering, setIsRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const { toast } = useToast();

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
      // 1. Get registration options from server
      const optionsRes = await fetch('/api/admin/webauthn/register/options', {
        method: 'POST',
      });

      if (!optionsRes.ok) {
        const err = await optionsRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get registration options');
      }
      const options = await optionsRes.json();

      // 2. Start WebAuthn registration in browser
      const regResp = await startRegistration({ optionsJSON: options });

      // 3. Verify registration on server — send the registration response directly
      //    plus deviceName as a top-level field for the server to persist
      const verifyRes = await fetch(`/api/admin/webauthn/register/verify?name=${encodeURIComponent(deviceName)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regResp),
      });

      if (verifyRes.ok) {
        toast({
          title: 'Passkey registered!',
          description: 'You can now use this device to sign in securely.',
        });
        window.location.reload();
      } else {
        const error = await verifyRes.json().catch(() => ({ error: 'Verification failed' }));
        throw new Error(error.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Registration failed',
        description: error.message || 'Make sure your device supports biometrics.',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
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
                />
              </div>
              <Button onClick={handleRegister} disabled={isRegistering} className="shrink-0">
                {isRegistering ? 'Registering...' : (
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
                              Added: {pk.createdAt} · Last used: {pk.lastUsedAt}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove passkey for ${pk.deviceName || 'this device'}`}
                          title="Passkey removal is not available from this interface yet."
                          disabled
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
    </div>
  );
}
