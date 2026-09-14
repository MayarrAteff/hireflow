import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { MdLightbulb } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { ACCENT_COLORS } from '@/styles/themes/accents';

const DAY_MS = 24 * 60 * 60 * 1000;

type TipCardProps = {
  tipIds: string[];
};

/** Shows a different tip from the list each day. */
export function TipCard({ tipIds }: TipCardProps) {
  const { $t } = useIntl();
  const tipId = tipIds[Math.floor(Date.now() / DAY_MS) % tipIds.length];

  return (
    <Card
      className="tw-h-full"
      sx={{
        background: `linear-gradient(135deg, ${alpha(ACCENT_COLORS.amber, 0.16)} 0%, ${alpha(ACCENT_COLORS.pink, 0.1)} 100%)`,
      }}
    >
      <CardContent className="tw-flex tw-h-full tw-flex-col tw-gap-3">
        <IconTile icon={MdLightbulb} color="amber" />
        <Typography variant="overline" color="text.secondary" className="tw-leading-none">
          {$t({ id: 'dashboard.tip.title' })}
        </Typography>
        <Typography fontWeight={500}>{$t({ id: tipId })}</Typography>
      </CardContent>
    </Card>
  );
}
