import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { MdCheck } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ProgressRing } from '@/components/UI/ProgressRing';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import { useAuth } from '@/utils/hooks/useAuth';
import { getProfileCompleteness, type ProfileChecklistItem } from '@/utils/profileCompleteness';

type ProfileStrengthProps = {
  /** When given, unfinished checklist items become buttons (e.g. to scroll to their section). */
  onItemClick?: (item: ProfileChecklistItem) => void;
};

/** Completion ring, an encouraging message and the checklist behind the percentage. */
export function ProfileStrength({ onItemClick }: ProfileStrengthProps) {
  const { $t, formatNumber } = useIntl();
  const { profile } = useAuth();
  const { items, percent } = getProfileCompleteness(profile);
  const levelId = percent === 100 ? 'complete' : percent >= 50 ? 'good' : 'start';

  return (
    <Box>
      <Box className="mb-5 flex items-center gap-5">
        <Box className="relative shrink-0">
          <ProgressRing value={percent} />
          <Typography
            variant="h3"
            component="span"
            className="absolute inset-0 flex items-center justify-center"
          >
            {formatNumber(percent / 100, { style: 'percent' })}
          </Typography>
        </Box>
        <Box className="min-w-0">
          <Typography fontWeight={700}>{$t({ id: `candidate.profile.level.${levelId}.title` })}</Typography>
          <Typography variant="body2" color="text.secondary">
            {$t({ id: `candidate.profile.level.${levelId}.body` })}
          </Typography>
        </Box>
      </Box>

      <Box component="ul" className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-1 p-0">
        {items.map((item) => {
          const content = (
            <>
              <Box
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                sx={
                  item.done ? { bgcolor: ACCENT_COLORS.emerald, color: '#fff' } : { border: 2, borderColor: 'divider' }
                }
              >
                {item.done && <MdCheck size={14} />}
              </Box>
              <Typography variant="body2" color={item.done ? 'text.primary' : 'text.secondary'} noWrap>
                {$t({ id: `candidate.profile.item.${item.id}` })}
              </Typography>
            </>
          );

          return (
            <li key={item.id}>
              {onItemClick && !item.done ? (
                <ButtonBase
                  onClick={() => onItemClick(item)}
                  className="flex w-full justify-start gap-2 rounded-lg px-1 py-1 text-start"
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  {content}
                </ButtonBase>
              ) : (
                <Box className="flex items-center gap-2 px-1 py-1">{content}</Box>
              )}
            </li>
          );
        })}
      </Box>
    </Box>
  );
}
