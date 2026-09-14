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
    <Card className="tw-h-full">
      <CardContent className="tw-flex tw-h-full tw-flex-col tw-p-6">
        <Typography variant="h5" className="tw-mb-4">
          {$t({ id: 'candidate.profile.title' })}
        </Typography>
        <ProfileStrength />
        <Button
          component={Link}
          to="/candidate/profile"
          variant={percent === 100 ? 'outlined' : 'contained'}
          endIcon={<MdArrowForward className="rtl:tw-rotate-180" />}
          className="tw-mt-5 tw-self-start"
        >
          {$t({ id: percent === 100 ? 'candidate.profile.view' : 'candidate.profile.complete' })}
        </Button>
      </CardContent>
    </Card>
  );
}
