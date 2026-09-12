import { Platform, Share } from 'react-native';
import { Contact, CrmEvent } from '../types';

const COLUMNS = ['Name', 'Role', 'Company', 'Email', 'Phone', 'Location', 'First met at', 'First met on', 'How we met', 'Notes', 'Tags', 'LinkedIn', 'X / Twitter', 'Instagram', 'Website', 'GitHub', 'Favorite'];

function cell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function contactsToCsv(contacts: Contact[], events: CrmEvent[]): string {
  const rows = contacts.map((ct) => {
    const ev = ct.eventId ? events.find((e) => e.id === ct.eventId) : undefined;
    const sl = ct.socialLinks || {};
    return [ct.name, ct.role, ct.company, ct.email, ct.phone, ct.location, ev?.name, ct.metOn, ct.howWeMet, ct.notes, ct.tags.join(', '), sl.linkedin, sl.twitter, sl.instagram, sl.website, sl.github, ct.isFavorite ? 'yes' : ''].map(cell).join(',');
  });
  return [COLUMNS.join(','), ...rows].join('\n');
}

// Web: Download. Nativ: System-Teilen (Files, Mail, AirDrop …).
export async function exportContactsCsv(contacts: Contact[], events: CrmEvent[]): Promise<void> {
  const csv = contactsToCsv(contacts, events);
  const filename = `pocket-crm-contacts-${new Date().toISOString().split('T')[0]}.csv`;
  if (Platform.OS === 'web') {
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    return;
  }
  await Share.share({ title: filename, message: csv });
}
