import React from 'react';
import { NewContactSheet } from './NewContactSheet';
import { AddTaskModal } from './AddTaskModal';
import { AccountModal } from './AccountModal';
import { ScanLinkedInModal } from './ScanLinkedInModal';

export function Modals() {
  return (
    <>
      <NewContactSheet />
      <AddTaskModal />
      <AccountModal />
      <ScanLinkedInModal />
    </>
  );
}
