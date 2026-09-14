import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import { MdAdd } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { brandGradient } from '@/styles/themes/accents';

type SidebarPromoProps = {
  onNavigate?: () => void;
};

/** Gradient call-to-action pinned to the bottom of the recruiter sidebar. */
export function SidebarPromo({ onNavigate }: SidebarPromoProps) {
  const { $t } = useIntl();

  return (
    <Box
      className="relative m-3 overflow-hidden rounded-2xl p-4 text-white"
      sx={(theme) => ({ background: brandGradient(theme) })}
    >
      <Box aria-hidden className="absolute -end-6 -top-6 h-20 w-20 rounded-full bg-white/15" />
      <Typography fontWeight={700} className="relative mb-1">
        {$t({ id: 'sidebar.promo.title' })} 🚀
      </Typography>
      <Typography variant="body2" className="relative mb-3 text-white/85">
        {$t({ id: 'sidebar.promo.body' })}
      </Typography>
      <Button
        component={Link}
        to="/recruiter/jobs/new"
        onClick={onNavigate}
        size="small"
        fullWidth
        color="inherit"
        startIcon={<MdAdd />}
        sx={{ bgcolor: 'common.white', color: 'primary.main', '&:hover': { bgcolor: alpha('#fff', 0.9) } }}
      >
        {$t({ id: 'jobs.list.postJob' })}
      </Button>
    </Box>
  );
}
