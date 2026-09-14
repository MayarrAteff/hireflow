import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import type { AccentColor } from '@/styles/themes/accents';

function CountUp({ value }: { value: number }) {
  const { formatNumber } = useIntl();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, { duration: 0.9, ease: 'easeOut', onUpdate: (v) => setDisplay(Math.round(v)) });
    return () => controls.stop();
  }, [value]);

  return <>{formatNumber(display)}</>;
}

type StatCardProps = {
  icon: IconType;
  color: AccentColor;
  labelId: string;
  value: number;
  loading?: boolean;
};

export function StatCard({ icon, color, labelId, value, loading }: StatCardProps) {
  const { $t } = useIntl();

  return (
    <Card className="h-full">
      <CardContent className="flex items-center gap-4">
        <IconTile icon={icon} color={color} size="lg" />
        <Box className="min-w-0">
          <Typography variant="h3" component="p">
            {loading ? <Skeleton width={40} /> : <CountUp value={value} />}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {$t({ id: labelId })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
