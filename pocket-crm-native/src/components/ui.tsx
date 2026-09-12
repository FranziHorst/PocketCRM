import React from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react-native';
import { avatarBg, BadgeColors, c, r } from '../theme';

export const Card = ({ children, style }: { children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[s.card, style]}>{children}</View>
);

export const Avatar = ({ name, color, uri, size = 32, radius }: { name: string; color?: string; uri?: string; size?: number; radius?: number }) => (
  <View style={{ width: size, height: size, borderRadius: radius ?? size / 2, backgroundColor: avatarBg(color), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
    {uri ? (
      <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" />
    ) : (
      <Text style={{ color: c.white, fontWeight: '700', fontSize: size * 0.42 }}>{name ? name.charAt(0) : '?'}</Text>
    )}
  </View>
);

export const Badge = ({ label, colors, small }: { label: string; colors: BadgeColors; small?: boolean }) => (
  <View style={{ backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderRadius: r.full, paddingHorizontal: small ? 6 : 8, paddingVertical: 2 }}>
    <Text style={{ color: colors.text, fontSize: small ? 9 : 10, fontWeight: '600' }}>{label}</Text>
  </View>
);

export const Chip = ({ label, active, onPress, icon, activeBg = c.slate900, activeText = c.white, bg = c.slate100, text = c.slate600 }:
  { label: string; active?: boolean; onPress: () => void; icon?: React.ReactNode; activeBg?: string; activeText?: string; bg?: string; text?: string }) => (
  <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: r.md, backgroundColor: active ? activeBg : bg }}>
    {icon}
    <Text style={{ fontSize: 12, fontWeight: '500', color: active ? activeText : text }}>{label}</Text>
  </Pressable>
);

export const Btn = ({ label, onPress, icon, variant = 'primary', disabled, style }:
  { label: string; onPress: () => void; icon?: React.ReactNode; variant?: 'primary' | 'soft' | 'ghost' | 'danger' | 'success' | 'violet'; disabled?: boolean; style?: ViewStyle }) => {
  const v = {
    primary: { bg: c.indigo600, text: c.white, border: c.indigo600 },
    soft: { bg: c.indigo50, text: c.indigo700, border: c.indigo200 },
    ghost: { bg: c.slate100, text: c.slate700, border: c.slate200 },
    danger: { bg: c.white, text: c.rose600, border: c.white },
    success: { bg: c.emerald600, text: c.white, border: c.emerald600 },
    violet: { bg: c.violet50, text: c.violet700, border: c.violet200 },
  }[variant];
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: r.lg, backgroundColor: v.bg, borderWidth: 1, borderColor: v.border, opacity: disabled ? 0.4 : 1 }, style]}>
      {icon}
      <Text style={{ color: v.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
};

export const Label = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: 12, fontWeight: '600', color: c.slate700, marginBottom: 4 }}>{children}</Text>
);

export const Input = (props: TextInputProps) => (
  <TextInput placeholderTextColor={c.slate400} {...props} style={[s.input, props.multiline && { minHeight: 70, textAlignVertical: 'top' }, props.style]} />
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
          <Chip key={o.value} label={o.label} active={o.value === value} onPress={() => onChange(o.value)} activeBg={c.indigo600} />
        ))}
      </ScrollView>
    </View>
  );
}

export const SectionTitle = ({ icon, children, right }: { icon?: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {icon}
      <Text style={{ fontSize: 14, fontWeight: '700', color: c.slate900 }}>{children}</Text>
    </View>
    {right}
  </View>
);

// Marken-Icons gibt es in lucide 1.x nicht mehr → kleine Buchstaben-Badges.
export const SocialIcon = ({ kind, url, withLabel }: { kind: 'linkedin' | 'twitter' | 'instagram' | 'website' | 'github'; url: string; withLabel?: boolean }) => {
  const m = {
    linkedin: { t: 'in', bg: c.blue50, fg: c.blue700, label: 'LinkedIn' },
    twitter: { t: 'X', bg: c.slate100, fg: c.slate800, label: 'X' },
    instagram: { t: 'IG', bg: c.pink50, fg: c.pink700, label: 'Instagram' },
    website: { t: '🌐', bg: c.emerald50, fg: c.emerald700, label: 'Website' },
    github: { t: 'GH', bg: c.slate100, fg: c.slate700, label: 'GitHub' },
  }[kind];
  return (
    <Pressable onPress={() => openLink(url)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: m.bg, borderRadius: r.md, paddingHorizontal: withLabel ? 10 : 7, paddingVertical: 5 }}>
      <Text style={{ fontSize: 11, fontWeight: '800', color: m.fg }}>{m.t}</Text>
      {withLabel ? <Text style={{ fontSize: 11, fontWeight: '500', color: m.fg }}>{m.label}</Text> : null}
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
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.slate900 }}>{title}</Text>
              {subtitle ? <Text style={{ fontSize: 11, color: c.slate500 }}>{subtitle}</Text> : null}
            </View>
          </View>
          <Pressable onPress={onClose} hitSlop={8} style={{ padding: 4 }}>
            <X size={20} color={c.slate400} />
          </Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20 }}>{children}</ScrollView>
        {footer ? <View style={s.modalFooter}>{footer}</View> : null}
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const s = StyleSheet.create({
  card: { backgroundColor: c.white, borderRadius: r.xl, padding: 16, borderWidth: 1, borderColor: c.slate200 },
  input: { backgroundColor: c.white, borderWidth: 1, borderColor: c.slate200, borderRadius: r.lg, paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: c.slate900 },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)' },
  modal: { backgroundColor: c.white, borderRadius: r.xxl, maxHeight: '85%', overflow: 'hidden', borderWidth: 1, borderColor: c.slate200 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.slate100, backgroundColor: c.slate50 },
  modalFooter: { paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: c.slate100, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
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
      <Pressable onPress={() => { setQuery(''); setOpen(!open); }} style={[s.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderColor: open ? c.indigo500 : c.slate200 }]}>
        <Text style={{ fontSize: 13, color: current ? c.slate900 : c.slate400 }} numberOfLines={1}>{current ? current.label : placeholder}</Text>
        {open ? <ChevronUp size={16} color={c.indigo600} /> : <ChevronDown size={16} color={c.slate400} />}
      </Pressable>

      {open && (
        <View style={{ marginTop: 6, borderWidth: 1, borderColor: c.slate200, borderRadius: r.lg, backgroundColor: c.white, overflow: 'hidden' }}>
          {searchable ? (
            <View style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: c.slate100 }}>
              <Input value={query} onChangeText={setQuery} placeholder="Search…" autoFocus />
            </View>
          ) : null}
          <ScrollView style={{ maxHeight: 260 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {shown.length === 0 ? (
              <Text style={{ fontSize: 12, color: c.slate400, textAlign: 'center', padding: 16 }}>No matches</Text>
            ) : shown.map((o, i) => {
              const on = o.value === value;
              return (
                <Pressable key={o.value || '__none'} onPress={() => { onChange(o.value); setOpen(false); }}
                  style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: pressed ? c.slate50 : on ? c.indigo50 : c.white, borderTopWidth: i ? 1 : 0, borderTopColor: c.slate100 })}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: on ? '700' : '500', color: on ? c.indigo700 : c.slate900 }}>{o.label}</Text>
                    {o.sub ? <Text style={{ fontSize: 11, color: c.slate500, marginTop: 2 }}>{o.sub}</Text> : null}
                  </View>
                  {on ? <Check size={16} color={c.indigo600} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
