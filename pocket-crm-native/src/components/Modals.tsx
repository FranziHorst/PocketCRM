import React from 'react';
import { ContactDetailModal } from './ContactDetailModal';
import { AddTaskModal } from './AddTaskModal';
import { AccountModal } from './AccountModal';

export function Modals() {
  return (
    <>
      <ContactDetailModal />
      <AddTaskModal />
      <AccountModal />
    </>
  );
}
