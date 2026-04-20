import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SelectedRole = 'customer' | 'contractor' | null;

export const ROLE_COLORS: Record<'customer' | 'contractor', string> = {
  customer: '#66BB6A',
  contractor: '#2196F3',
};

interface RoleStore {
  selectedRole: SelectedRole;
  accentColor: string;
  setRole: (role: SelectedRole) => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      selectedRole: null,
      accentColor: '#111827',
      setRole: (role) =>
        set({
          selectedRole: role,
          accentColor: role ? ROLE_COLORS[role] : '#111827',
        }),
    }),
    { name: 'trashgo-role' }
  )
);
