import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import { MdArrowForward } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { useAuth } from '@/utils/hooks/useAuth';
import { getProfileCompleteness } from '@/utils/profileCompleteness';

import { ProfileStrength } from '../components/ProfileStrength';

export function ProfileStrengthCard() {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const { percent } = getProfileCompleteness(profile);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col p-6">
        <Typography variant="h5" className="mb-4">
          {$t({ id: 'candidate.profile.title' })}
        </Typography>
        <ProfileStrength />
        <Button
          component={Link}
          to="/candidate/profile"
          variant={percent === 100 ? 'outlined' : 'contained'}
          endIcon={<MdArrowForward className="rtl:rotate-180" />}
          className="mt-5 self-start"
        >
          {$t({ id: percent === 100 ? 'candidate.profile.view' : 'candidate.profile.complete' })}
        </Button>
      </CardContent>
    </Card>
  );
}
