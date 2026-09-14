import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { MdBusinessCenter, MdPersonSearch } from 'react-icons/md';
import { useIntl } from 'react-intl';

import type { RegisterPayload } from '@/types/auth.types';

type Role = RegisterPayload['role'];

const roles: { value: Role; icon: typeof MdBusinessCenter }[] = [
  { value: 'candidate', icon: MdPersonSearch },
  { value: 'recruiter', icon: MdBusinessCenter },
];

type RoleSelectorProps = {
  value: Role;
  onChange: (role: Role) => void;
};

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  const { $t } = useIntl();

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" className="mb-2">
        {$t({ id: 'auth.register.iAm' })}
      </Typography>
      <ToggleButtonGroup
        exclusive
        fullWidth
        color="primary"
        value={value}
        onChange={(_, next: Role | null) => next && onChange(next)}
        className="gap-3"
      >
        {roles.map(({ value: role, icon: Icon }) => (
          <ToggleButton
            key={role}
            value={role}
            className="flex flex-col items-start gap-1 p-4 text-start"
            sx={{ border: 1, borderColor: 'divider', '&&': { borderRadius: 3 } }}
          >
            <Icon size={24} />
            <Typography fontWeight={600}>{$t({ id: `role.${role}` })}</Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: `role.${role}.description` })}
            </Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
