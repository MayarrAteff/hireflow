import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { Link, type LinkProps } from '@tanstack/react-router';
import type { IconType } from 'react-icons';
import { MdArrowForward } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import type { AccentColor } from '@/styles/themes/accents';

export type Feature = {
  icon: IconType;
  labelId: string;
  color: AccentColor;
  /** Available features link to their page; the rest show a "Coming next" chip. */
  to?: LinkProps['to'];
};

export function FeatureCard({ icon, labelId, color, to }: Feature) {
  const { $t } = useIntl();

  const content = (
    <CardContent className="flex h-full flex-col gap-3">
      <IconTile icon={icon} color={color} />
      <Typography fontWeight={600} className="flex-1">
        {$t({ id: labelId })}
      </Typography>
      {to ? (
        <Typography color="primary" fontWeight={600} className="flex items-center gap-1">
          {$t({ id: 'dashboard.openFeature' })}
          <MdArrowForward className="rtl:rotate-180" />
        </Typography>
      ) : (
        <Chip size="small" variant="outlined" label={$t({ id: 'dashboard.comingSoon' })} className="w-fit" />
      )}
    </CardContent>
  );

  return (
    <Card className="h-full transition-transform hover:-translate-y-1">
      {to ? (
        <CardActionArea component={Link} to={to} className="h-full">
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}
