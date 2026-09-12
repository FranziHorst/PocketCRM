import React from 'react';
import { ContactDetailModal } from './ContactDetailModal';
import { AddTaskModal } from './AddTaskModal';
import { AccountModal } from './AccountModal';
import { NotificationsModal } from './NotificationsModal';

export function Modals() {
  return (
    <>
      <ContactDetailModal />
      <AddTaskModal />
      <AccountModal />
      <NotificationsModal />
    </>
  );
}
