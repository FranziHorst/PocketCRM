import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import * as Device from 'expo-device';
import { Check, Copy, Keyboard, QrCode as QrIcon } from 'lucide-react-native';
import { useCrm } from '../store';
import { parseLinkedInUrl } from '../linkedin';
import { buildContactCard, parseContactCard } from '../contactCard';
import { c, r, font } from '../theme';
import { Btn, Chip, Input, Label, ModalShell } from './ui';
import { QrCode } from './QrCode';

const canUseCamera = Platform.OS !== 'web' && Device.isDevice;

export function ScanLinkedInModal() {
  const { isScanOpen, setScanOpen, openAddContact } = useCrm();
  if (!isScanOpen) return null;
  return <Scanner onClose={() => setScanOpen(false)} onResult={(prefill) => { setScanOpen(false); openAddContact(prefill); }} />;
}

function Scanner({ onClose, onResult }: { onClose: () => void; onResult: (prefill: Parameters<ReturnType<typeof useCrm>['openAddContact']>[0]) => void }) {
  const [tab, setTab] = useState<'scan' | 'mine'>('scan');
  const [manual, setManual] = useState(!canUseCamera);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handle = (text: string) => {
    const card = parseContactCard(text);
    if (card) {
      onResult({
        name: card.name,
        role: card.role,
        company: card.company,
        email: card.email,
        location: card.location,
        howWeMet: 'Swapped Pocket CRM QR codes',
        socialLinks: card.socialLinks,
      });
      return;
    }
    const p = parseLinkedInUrl(text);
    if (!p) { setError("That's not a Pocket CRM or LinkedIn QR code."); setScanned(false); return; }
    onResult({ name: p.nameGuess, howWeMet: 'Scanned LinkedIn QR code', socialLinks: { linkedin: p.url } });
  };

  const showCamera = tab === 'scan' && !manual && canUseCamera;
  const subtitle = tab === 'mine'
    ? 'Let them scan this to add you'
    : showCamera ? 'Point the camera at their QR code' : 'Paste their Pocket CRM or LinkedIn link';

  return (
    <ModalShell
      visible
      onClose={onClose}
      title="Scan QR"
      subtitle={subtitle}
      icon={<QrIcon size={16} color={c.accent} />}
      footer={
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {tab === 'scan' && canUseCamera ? (
            <Pressable onPress={() => { setManual(!manual); setError(null); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {manual ? <QrIcon size={14} color={c.accent} /> : <Keyboard size={14} color={c.accent} />}
              <Text style={{ fontSize: 12, fontFamily: font.medium, color: c.accent }}>{manual ? 'Use camera' : 'Enter link instead'}</Text>
            </Pressable>
          ) : <View />}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Btn label={tab === 'mine' ? 'Done' : 'Cancel'} variant="ghost" onPress={onClose} />
            {tab === 'scan' && !showCamera ? <Btn label="Continue" onPress={() => handle(url)} disabled={!url.trim()} /> : null}
          </View>
        </View>
      }>
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Scan theirs" active={tab === 'scan'} onPress={() => { setTab('scan'); setError(null); }} />
          <Chip label="My code" active={tab === 'mine'} onPress={() => { setTab('mine'); setError(null); }} />
        </View>

        {tab === 'mine' ? <MyCode /> : showCamera ? (
          !permission ? null : !permission.granted ? (
            <View style={{ alignItems: 'center', gap: 12, paddingVertical: 20 }}>
              <Text style={{ fontSize: 12, color: c.textSecondary, textAlign: 'center', fontFamily: font.regular }}>Pocket CRM needs camera access to scan QR codes.</Text>
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
              <Text style={{ fontSize: 11, color: c.textSecondary, textAlign: 'center', fontFamily: font.regular }}>Works with another Pocket CRM code, or a LinkedIn code.</Text>
            </View>
          )
        ) : (
          <View>
            {!canUseCamera && (
              <Text style={{ fontSize: 11, color: c.textSecondary, marginBottom: 12, fontFamily: font.regular }}>
                {Platform.OS === 'web' ? 'Camera scanning works in the mobile app. Paste their link here instead.' : 'The simulator has no camera, so paste the link here.'}
              </Text>
            )}
            <Label>Their Pocket CRM or LinkedIn link</Label>
            <Input value={url} onChangeText={(v) => { setUrl(v); setError(null); }} placeholder="pocketcrm://contact?n=… or linkedin.com/in/…" autoCapitalize="none" onSubmitEditing={() => handle(url)} />
          </View>
        )}

        {error ? <Text style={{ fontSize: 11, color: c.danger, backgroundColor: c.dangerSoft, padding: 8, borderRadius: r.md, fontFamily: font.regular }}>{error}</Text> : null}
      </View>
    </ModalShell>
  );
}

function MyCode() {
  const { userProfile } = useCrm();
  const [copied, setCopied] = useState(false);
  const value = buildContactCard(userProfile);

  const copy = async () => {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <View style={{ padding: 14, backgroundColor: c.surface, borderRadius: r.xl, borderWidth: 1, borderColor: c.line }}>
        <QrCode value={value} size={240} />
      </View>
      <View style={{ alignItems: 'center', gap: 2 }}>
        <Text style={{ fontSize: 16, fontFamily: font.display, color: c.text }}>{userProfile.name}</Text>
        {(userProfile.jobTitle || userProfile.company) ? (
          <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: font.regular }}>{[userProfile.jobTitle, userProfile.company].filter(Boolean).join(' at ')}</Text>
        ) : null}
      </View>
      <Btn
        label={copied ? 'Copied' : 'Copy my link'}
        variant="ghost"
        icon={copied ? <Check size={14} color={c.accentDark} /> : <Copy size={14} color={c.text2} />}
        onPress={copy}
      />
    </View>
  );
}
