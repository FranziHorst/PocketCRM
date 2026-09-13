import React, { useEffect, useRef } from 'react';
import {
  Alert, Animated, Easing, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { avatarBg, BadgeColors, c, r, t, font } from '../theme';

export const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[s.card, style]}>{children}</View>
);

export const Avatar = ({ name, color, uri, size = 32, radius }: { name: string; color?: string; uri?: string; size?: number; radius?: number }) => (
  <View style={{ width: size, height: size, borderRadius: radius ?? size / 2, backgroundColor: avatarBg(color), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    {uri ? (
      <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
    ) : (
      <Text style={{ color: c.onDark, fontFamily: font.display, fontSize: size * 0.42 }}>{name ? name.charAt(0) : '?'}</Text>
    )}
  </View>
);

export const Badge = ({ label, colors, small }: { label: string; colors: BadgeColors; small?: boolean }) => (
  <View style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderRadius: r.full, paddingHorizontal: small ? 6 : 8, paddingVertical: 2 }}>
    <Text style={{ color: colors.text, fontSize: small ? 9 : 10, fontFamily: font.medium }}>{label}</Text>
  </View>
);

export const Chip = ({ label, active, onPress, icon, activeBg = c.text, activeText = c.onDark, bg = c.surfaceSoft, text = c.textSecondary }:
  { label: string; active?: boolean; onPress: () => void; icon?: React.ReactNode; activeBg?: string; activeText?: string; bg?: string; text?: string }) => (
  <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: r.full, backgroundColor: active ? activeBg : bg, borderWidth: 1, borderColor: active ? activeBg : c.border }}>
    {icon}
    <Text style={{ fontSize: 13, fontFamily: font.medium, color: active ? activeText : text }}>{label}</Text>
  </Pressable>
);

export const Btn = ({ label, onPress, icon, variant = 'primary', disabled, style }:
  { label: string; onPress: () => void; icon?: React.ReactNode; variant?: 'primary' | 'soft' | 'ghost' | 'danger' | 'success' | 'violet'; disabled?: boolean; style?: ViewStyle }) => {
  const v = {
    primary: { bg: c.accentDark, text: c.onDark, border: c.accentDark },
    soft: { bg: c.accentSoft, text: c.accentDark, border: c.accentBorder },
    ghost: { bg: c.surface, text: c.text2, border: c.border },
    danger: { bg: 'transparent', text: c.danger, border: 'transparent' },
    success: { bg: c.accentDark, text: c.onDark, border: c.accentDark },
    violet: { bg: c.accentSoft, text: c.accentDark, border: c.accentBorder },
  }[variant];
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 11, borderRadius: r.full, backgroundColor: v.bg, borderWidth: 1, borderColor: v.border, opacity: disabled ? 0.4 : pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}>
      {icon}
      <Text style={{ color: v.text, fontSize: 14, fontFamily: font.medium }}>{label}</Text>
    </Pressable>
  );
};

export const Label = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: 13, fontFamily: font.medium, color: c.text2, marginBottom: 6 }}>{children}</Text>
);

export const Input = (props: TextInputProps) => (
  <TextInput placeholderTextColor={c.textMuted} {...props} style={[s.input, props.multiline && { minHeight: 70, textAlignVertical: 'top' }, props.style]} />
);

export const Field = ({ label, ...props }: TextInputProps & { label: string }) => (
  <View style={{ marginBottom: 10 }}>
    <Label>{label}</Label>
    <Input {...props} />
  </View>
);

// Ersatz für <select>: eine Reihe wählbarer Chips.
export function Choice<T extends string>({ label, value, options, onChange }:
  { label?: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <View style={{ marginBottom: 10 }}>
      {label ? <Label>{label}</Label> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {options.map((o) => (
          <Chip key={o.value} label={o.label} active={o.value === value} onPress={() => onChange(o.value)} activeBg={c.accentDark} />
        ))}
      </ScrollView>
    </View>
  );
}

export const SectionTitle = ({ icon, children, right }: { icon?: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {icon}
      <Text style={{ fontSize: 14, fontFamily: font.display, color: c.text }}>{children}</Text>
    </View>
    {right}
  </View>
);

export type SocialKind = 'linkedin' | 'twitter' | 'instagram' | 'website' | 'github';

// lucide 1.x liefert keine Marken-Icons mehr, also die Glyphen selbst zeichnen.
// Pfade im 24er Raster, damit sie zu den lucide-Größen im Rest der App passen.
const GLYPH: Record<SocialKind, { label: string; brand: string; path: string }> = {
  linkedin: {
    label: 'LinkedIn',
    brand: '#0A66C2',
    path: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z',
  },
  twitter: {
    label: 'X',
    brand: '#000000',
    path: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z',
  },
  instagram: {
    label: 'Instagram',
    brand: '#E4405F',
    path: 'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38S.94 3.35.63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.67 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.41a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z',
  },
  github: {
    label: 'GitHub',
    brand: '#181717',
    path: 'M12 .3a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58l-.02-2.04c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.08-.74.09-.73.09-.73 1.2.08 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.36.81 1.1.81 2.22l-.01 3.29c0 .31.21.69.82.57A12 12 0 0 0 12 .3z',
  },
  website: {
    label: 'Website',
    brand: '#4B5563',
    // Globus: Kreis plus Meridian und Äquator.
    path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 1.8c1.4 0 3.1 2.7 3.5 7.3H8.5C8.9 6.5 10.6 3.8 12 3.8zM6.7 11.1c.2-2.5.9-4.6 1.9-6a8.2 8.2 0 0 0-4.6 6h2.7zm-2.7 1.8h2.7c.2 2.5.9 4.6 1.9 6a8.2 8.2 0 0 1-4.6-6zm4.5 0h7c-.4 4.6-2.1 7.3-3.5 7.3s-3.1-2.7-3.5-7.3zm8.8 0H20a8.2 8.2 0 0 1-4.6 6c1-1.4 1.7-3.5 1.9-6zm0-1.8c-.2-2.5-.9-4.6-1.9-6a8.2 8.2 0 0 1 4.6 6h-2.7z',
  },
};

export const SocialGlyph = ({ kind, size = 18, color }: { kind: SocialKind; size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d={GLYPH[kind].path} fill={color ?? GLYPH[kind].brand} />
  </Svg>
);

export const socialLabel = (kind: SocialKind) => GLYPH[kind].label;

export const SocialIcon = ({ kind, url, withLabel }: { kind: SocialKind; url: string; withLabel?: boolean }) => (
  <Pressable onPress={() => openLink(url)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.surfaceSoft, borderWidth: 1, borderColor: c.border, borderRadius: r.full, paddingHorizontal: withLabel ? 10 : 8, paddingVertical: 5 }}>
    <SocialGlyph kind={kind} size={13} />
    {withLabel ? <Text style={{ fontSize: 11, fontFamily: font.medium, color: c.text2 }}>{GLYPH[kind].label}</Text> : null}
  </Pressable>
);

export function openLink(url: string) {
  const u = url.startsWith('http') ? url : url.startsWith('@') ? `https://x.com/${url.slice(1)}` : `https://${url}`;
  Linking.openURL(u).catch(() => {});
}

// Was im Profil unter dem Namen steht: ohne Protokoll und ohne Schrägstrich am Ende.
export function displayLink(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

// confirm() gibt es nativ nicht; auf Web ist Alert.alert wirkungslos.
export function confirmAsync(title: string, message?: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' && window.confirm(message ? `${title}\n\n${message}` : title));
  }
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'OK', style: 'destructive', onPress: () => resolve(true) },
    ])
  );
}

export const ModalShell = ({ visible, onClose, title, subtitle, icon, children, footer, sheet }:
  { visible: boolean; onClose: () => void; title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; sheet?: boolean }) => {
  // Eigene Einblend-Animation statt animationType="slide": dort rutscht der ganze
  // Dialog samt dunklem Hintergrund von unten hoch. Hier blendet der Hintergrund
  // weich ein und die Karte faehrt nur ein Stueck hoch.
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [visible, progress]);

  const backdropStyle = { opacity: progress };
  const cardStyle = {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [sheet ? 40 : 18, 0] }) }],
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, s.overlay, backdropStyle]} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[{ flex: 1 }, sheet ? { justifyContent: 'flex-end' } : { justifyContent: 'center', padding: 16 }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[s.modal, sheet && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, maxHeight: '92%' }, cardStyle]}>
          <View style={s.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              {icon}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: font.display, color: c.text }}>{title}</Text>
                {subtitle ? <Text style={{ fontSize: 11, color: c.textSecondary , fontFamily: font.regular}}>{subtitle}</Text> : null}
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={{ padding: 4 }}>
              <X size={20} color={c.textMuted} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20 }}>{children}</ScrollView>
          {footer ? <View style={s.modalFooter}>{footer}</View> : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const s = StyleSheet.create({
  card: { backgroundColor: c.surface, borderRadius: r.xxl, padding: 16, borderWidth: 1, borderColor: c.line },
  input: { backgroundColor: c.surfaceSoft, borderWidth: 1, borderColor: c.border, borderRadius: r.lg, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text },
  overlay: { flex: 1, backgroundColor: 'rgba(62,56,53,0.45)' },
  modal: { backgroundColor: c.surface, borderRadius: r.xxl, maxHeight: '85%', overflow: 'hidden', borderWidth: 1, borderColor: c.line },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.line, backgroundColor: c.surface },
  modalFooter: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
});

// Auswahlfeld für längere Listen: klappt direkt unter dem Feld auf, ohne Overlay.
export type SelectOption = { value: string; label: string; sub?: string };

export function SelectField({ label, value, options, onChange, placeholder = 'Select…', searchable }:
  { label: string; value: string; options: SelectOption[]; onChange: (v: string) => void; placeholder?: string; searchable?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const current = options.find((o) => o.value === value);
  const shown = searchable && query.trim()
    ? options.filter((o) => `${o.label} ${o.sub ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  return (
    <View style={{ marginBottom: 10 }}>
      <Label>{label}</Label>
      <Pressable onPress={() => { setQuery(''); setOpen(!open); }} style={[s.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderColor: open ? c.accent : c.border }]}>
        <Text style={{ fontSize: 13, color: current ? c.text : c.textMuted , fontFamily: font.regular}} numberOfLines={1}>{current ? current.label : placeholder}</Text>
        {open ? <ChevronUp size={16} color={c.accent} /> : <ChevronDown size={16} color={c.textMuted} />}
      </Pressable>

      {open && (
        <View style={{ marginTop: 6, borderWidth: 1, borderColor: c.border, borderRadius: r.lg, backgroundColor: c.surface, overflow: 'hidden' }}>
          {searchable ? (
            <View style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: c.line }}>
              <Input value={query} onChangeText={setQuery} placeholder="Search…" autoFocus />
            </View>
          ) : null}
          <ScrollView style={{ maxHeight: 260 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {shown.length === 0 ? (
              <Text style={{ fontSize: 12, color: c.textMuted, textAlign: 'center', padding: 16 , fontFamily: font.regular}}>No matches</Text>
            ) : shown.map((o, i) => {
              const on = o.value === value;
              return (
                <Pressable key={o.value || '__none'} onPress={() => { onChange(o.value); setOpen(false); }}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: pressed ? c.surfaceSoft : on ? c.accentSoft : c.surface, borderTopWidth: i ? 1 : 0, borderTopColor: c.line })}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: on ? font.display : font.medium, color: on ? c.accentDark : c.text}}>{o.label}</Text>
                    {o.sub ? <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2 , fontFamily: font.regular}}>{o.sub}</Text> : null}
                  </View>
                  {on ? <Check size={16} color={c.accent} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// Seitentitel im Stil großer iOS-Titel.
export const PageTitle = ({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
    <View style={{ flex: 1 }}>
      <Text style={t.title}>{title}</Text>
      {subtitle ? <Text style={[t.secondary, { marginTop: 2 }]}>{subtitle}</Text> : null}
    </View>
    {right}
  </View>
);

// Abschnittskopf ohne Kachel.
export const SectionHeader = ({ title, right, style }: { title: string; right?: React.ReactNode; style?: ViewStyle }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 }, style]}>
    <Text style={t.h2}>{title}</Text>
    {right}
  </View>
);

// Listenzeile mit Hairline statt Rahmen.
export const Row = ({ children, onPress, first, style }: { children: React.ReactNode; onPress?: () => void; first?: boolean; style?: ViewStyle }) => (
  <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: first ? 0 : 1, borderTopColor: c.line, backgroundColor: pressed ? c.surfaceSoft : 'transparent', marginHorizontal: -16, paddingHorizontal: 16 }, style]}>
    {children}
  </Pressable>
);

// Gruppe von Zeilen auf heller Fläche.
export const Group = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[{ backgroundColor: c.surface, borderRadius: r.xxl, paddingHorizontal: 16, overflow: 'hidden' }, style]}>{children}</View>
);

// Textlink-Button für Kopfzeilen ("Add", "Edit", "See all").
export const TextBtn = ({ label, onPress, icon }: { label: string; onPress: () => void; icon?: React.ReactNode }) => (
  <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 4, opacity: pressed ? 0.6 : 1 })}>
    {icon}
    <Text style={{ fontSize: 15, fontFamily: font.medium, color: c.accentDark }}>{label}</Text>
  </Pressable>
);

// Seitencontainer mit Safe-Area oben, ohne App-Header.
export const Screen = ({ children, scroll = true, bottomInset = 32 }: { children: React.ReactNode; scroll?: boolean; bottomInset?: number }) => {
  const insets = useSafeAreaInsets();
  if (!scroll) return <View style={{ flex: 1, paddingTop: insets.top + 8 }}>{children}</View>;
  return (
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: bottomInset }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
};
