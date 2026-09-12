import React, { useState } from 'react';
import { View } from 'react-native';
import { CheckSquare } from 'lucide-react-native';
import { useCrm } from '../store';
import { DailyTask } from '../../types';
import { c } from '../theme';
import { Btn, Choice, Field, ModalShell } from './ui';

export function AddTaskModal() {
  const { isAddTaskOpen, setAddTaskOpen, contacts, addTask } = useCrm();
  if (!isAddTaskOpen) return null;
  return <Form onClose={() => setAddTaskOpen(false)} contacts={contacts} addTask={addTask} />;
}

function Form({ onClose, contacts, addTask }: { onClose: () => void; contacts: ReturnType<typeof useCrm>['contacts']; addTask: (t: DailyTask) => void }) {
  const [title, setTitle] = useState('');
  const [contactId, setContactId] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<DailyTask['priority']>('medium');
  const [type, setType] = useState<DailyTask['type']>('follow-up');

  const submit = () => {
    if (!title.trim()) return;
    const ct = contacts.find((x) => x.id === contactId);
    addTask({ id: `task_${Date.now()}`, title: title.trim(), contactId: contactId || undefined, contactName: ct?.name, dueDate, completed: false, priority, type });
    onClose();
  };

  return (
    <ModalShell
      visible
      onClose={onClose}
      title="Add Daily Task"
      icon={<CheckSquare size={16} color={c.indigo600} />}
      footer={
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
          <Btn label="Cancel" variant="ghost" onPress={onClose} />
          <Btn label="Add Task" onPress={submit} disabled={!title.trim()} />
        </View>
      }>
      <Field label="Task Description *" value={title} onChangeText={setTitle} placeholder="e.g., Send follow-up email after coffee..." />
      <Choice label="Related Contact (Optional)" value={contactId} options={[{ value: '', label: '-- None --' }, ...contacts.map((ct) => ({ value: ct.id, label: `${ct.name} (${ct.company})` }))]} onChange={setContactId} />
      <Field label="Due Date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} placeholder="2026-09-30" autoCapitalize="none" />
      <Choice label="Priority" value={priority} options={[{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }]} onChange={setPriority} />
      <Choice label="Task Type" value={type} options={[{ value: 'follow-up', label: 'Follow-up Message' }, { value: 'coffee', label: 'Coffee / Meeting' }, { value: 'intro', label: 'Warm Intro' }, { value: 'prep', label: 'Call Prep' }, { value: 'other', label: 'Other' }]} onChange={setType} />
    </ModalShell>
  );
}
