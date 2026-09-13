import React from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react-native';
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

// Marken-Icons gibt es in lucide 1.x nicht mehr → kleine Buchstaben-Badges.
export const SocialIcon = ({ kind, url, withLabel }: { kind: 'linkedin' | 'twitter' | 'instagram' | 'website' | 'github'; url: string; withLabel?: boolean }) => {
  const m = {
    linkedin: { t: 'in', bg: c.surfaceSoft, fg: c.text2, label: 'LinkedIn' },
    twitter: { t: 'X', bg: c.surfaceSoft, fg: c.text2, label: 'X' },
    instagram: { t: 'IG', bg: c.surfaceSoft, fg: c.text2, label: 'Instagram' },
    website: { t: 'www', bg: c.surfaceSoft, fg: c.text2, label: 'Website' },
    github: { t: 'GH', bg: c.surfaceSoft, fg: c.text2, label: 'GitHub' },
  }[kind];
  return (
    <Pressable onPress={() => openLink(url)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: m.bg, borderWidth: 1, borderColor: c.border, borderRadius: r.full, paddingHorizontal: withLabel ? 10 : 8, paddingVertical: 5 }}>
      <Text style={{ fontSize: 11, fontFamily: font.display, color: m.fg }}>{m.t}</Text>
      {withLabel ? <Text style={{ fontSize: 11, fontFamily: font.medium, color: m.fg }}>{m.label}</Text> : null}
    </Pressable>
  );
};

export function openLink(url: string) {
  const u = url.startsWith('http') ? url : url.startsWith('@') ? `https://x.com/${url.slice(1)}` : `https://${url}`;
  Linking.openURL(u).catch(() => {});
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
  { visible: boolean; onClose: () => void; title: string; subtitle?: string; icon?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; sheet?: boolean }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[s.overlay, sheet ? { justifyContent: 'flex-end' } : { justifyContent: 'center', padding: 16 }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[s.modal, sheet && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, maxHeight: '92%' }]}>
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
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

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
