import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import { Keyboard, QrCode } from 'lucide-react-native';
import { useCrm } from '../store';
import { parseLinkedInUrl } from '../linkedin';
import { c, r } from '../theme';
import { Btn, Input, Label, ModalShell } from './ui';

const canUseCamera = Platform.OS !== 'web' && Device.isDevice;

export function ScanLinkedInModal() {
  const { isScanOpen, setScanOpen, openAddContact } = useCrm();
  if (!isScanOpen) return null;
  return <Scanner onClose={() => setScanOpen(false)} onResult={(prefill) => { setScanOpen(false); openAddContact(prefill); }} />;
}

function Scanner({ onClose, onResult }: { onClose: () => void; onResult: (prefill: Parameters<ReturnType<typeof useCrm>['openAddContact']>[0]) => void }) {
  const [manual, setManual] = useState(!canUseCamera);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handle = (text: string) => {
    const p = parseLinkedInUrl(text);
    if (!p) { setError("That doesn't look like a LinkedIn profile link."); setScanned(false); return; }
    onResult({ name: p.nameGuess, howWeMet: 'Scanned LinkedIn QR code', socialLinks: { linkedin: p.url } });
  };

  const showCamera = !manual && canUseCamera;

  return (
    <ModalShell
      visible
      onClose={onClose}
      title="Scan LinkedIn QR"
      subtitle={showCamera ? 'Point the camera at their LinkedIn QR code' : 'Paste the LinkedIn profile link'}
      icon={<QrCode size={16} color={c.accent} />}
      footer={
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {canUseCamera ? (
            <Pressable onPress={() => { setManual(!manual); setError(null); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {manual ? <QrCode size={14} color={c.accent} /> : <Keyboard size={14} color={c.accent} />}
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.accent }}>{manual ? 'Use camera' : 'Enter link instead'}</Text>
            </Pressable>
          ) : <View />}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Btn label="Cancel" variant="ghost" onPress={onClose} />
            {!showCamera && <Btn label="Continue" onPress={() => handle(url)} disabled={!url.trim()} />}
          </View>
        </View>
      }>
      {showCamera ? (
        !permission ? null : !permission.granted ? (
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 20 }}>
            <Text style={{ fontSize: 12, color: c.textSecondary, textAlign: 'center' }}>Pocket CRM needs camera access to scan QR codes.</Text>
            <Btn label="Allow camera" onPress={requestPermission} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={{ height: 300, borderRadius: r.xl, overflow: 'hidden', backgroundColor: c.text }}>
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={scanned ? undefined : ({ data }) => { setScanned(true); handle(data); }}
              />
            </View>
            <Text style={{ fontSize: 11, color: c.textSecondary, textAlign: 'center' }}>In the LinkedIn app: search bar → QR icon → “My code”.</Text>
          </View>
        )
      ) : (
        <View>
          {!canUseCamera && (
            <Text style={{ fontSize: 11, color: c.textSecondary, marginBottom: 12 }}>
              {Platform.OS === 'web' ? 'Camera scanning works in the mobile app.' : 'The simulator has no camera, so paste the link here.'}
            </Text>
          )}
          <Label>LinkedIn profile link</Label>
          <Input value={url} onChangeText={(v) => { setUrl(v); setError(null); }} placeholder="https://www.linkedin.com/in/maya-lin" autoCapitalize="none" keyboardType="url" onSubmitEditing={() => handle(url)} />
        </View>
      )}
      {error ? <Text style={{ fontSize: 11, color: c.danger, backgroundColor: c.dangerSoft, padding: 8, borderRadius: r.md, marginTop: 10 }}>{error}</Text> : null}
    </ModalShell>
  );
}
