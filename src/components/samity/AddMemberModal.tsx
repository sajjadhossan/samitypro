'use client';

import React from 'react';
import { useSamityStore } from '@/lib/store';
import { MemberFormModal } from '@/components/members/MemberFormModal';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { store, activeTenant, members } = useSamityStore();

  if (!isOpen) return null;

  const handleSave = (memberData: any) => {
    store.addMember(memberData);
    onClose();
  };

  return (
    <MemberFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      activeTenant={activeTenant}
      totalMembersCount={members.length}
    />
  );
}
