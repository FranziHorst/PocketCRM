import React from 'react';
import { NewContactSheet } from './NewContactSheet';
import { AddTaskModal } from './AddTaskModal';
import { ScanLinkedInModal } from './ScanLinkedInModal';

export function Modals() {
  return (
    <>
      <NewContactSheet />
      <AddTaskModal />
      <ScanLinkedInModal />
    </>
  );
}
