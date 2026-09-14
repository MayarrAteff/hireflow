import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import type { AccentColor } from '@/styles/themes/accents';

type SectionCardProps = {
  icon: IconType;
  color: AccentColor;
  titleId: string;
  action?: ReactNode;
  children: ReactNode;
};

/** A content card with a coloured icon header, used for the parts of a job page. */
export function SectionCard({ icon, color, titleId, action, children }: SectionCardProps) {
  const { $t } = useIntl();

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <Box className="mb-4 flex flex-wrap items-center gap-3">
          <IconTile icon={icon} color={color} size="sm" />
          <Typography variant="h5" className="flex-1">
            {$t({ id: titleId })}
          </Typography>
          {action}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}
