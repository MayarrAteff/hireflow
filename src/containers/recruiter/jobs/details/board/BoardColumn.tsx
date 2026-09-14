import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useIntl } from 'react-intl';

import { APPLICATION_STAGE_COLOR } from '@/constants/applications';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { ApplicationStage, RecruiterApplication } from '@/types/application.types';

import { BoardCard } from './BoardCard';

type BoardColumnProps = {
  stage: ApplicationStage;
  applications: RecruiterApplication[];
  matchById: Map<string, number>;
  onOpenApplicant: (applicationId: string) => void;
};

export function BoardColumn({ stage, applications, matchById, onOpenApplicant }: BoardColumnProps) {
  const { $t, formatNumber } = useIntl();
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const color = ACCENT_COLORS[APPLICATION_STAGE_COLOR[stage]];

  return (
    <Box
      component="section"
      aria-label={$t({ id: `application.stage.${stage}` })}
      className="flex w-[272px] shrink-0 flex-col rounded-2xl"
      sx={(theme) => ({
        bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.1 : 0.06),
        border: `1px solid ${alpha(color, isOver ? 0.6 : 0.18)}`,
        transition: theme.transitions.create('border-color'),
      })}
    >
      <Box className="flex items-center gap-2 px-3 pb-2 pt-3">
        <Box className="h-2.5 w-2.5 rounded-full" sx={{ bgcolor: color }} />
        <Typography fontWeight={700} className="flex-1">
          {$t({ id: `application.stage.${stage}` })}
        </Typography>
        <Typography
          variant="caption"
          fontWeight={700}
          className="rounded-full px-2 py-0.5"
          sx={{ bgcolor: alpha(color, 0.16), color }}
        >
          {formatNumber(applications.length)}
        </Typography>
      </Box>

      <SortableContext items={applications.map((application) => application.id)} strategy={verticalListSortingStrategy}>
        <Box ref={setNodeRef} className="flex min-h-[140px] flex-1 flex-col gap-2 px-2 pb-2">
          {applications.map((application) => (
            <BoardCard
              key={application.id}
              application={application}
              matchPercent={matchById.get(application.id) ?? 0}
              onOpen={() => onOpenApplicant(application.id)}
            />
          ))}
          {applications.length === 0 && (
            <Box
              className="flex flex-1 items-center justify-center rounded-xl p-4 text-center"
              sx={{ border: `2px dashed ${alpha(color, 0.3)}` }}
            >
              <Typography variant="caption" color="text.secondary">
                {$t({ id: 'board.dropHere' })}
              </Typography>
            </Box>
          )}
        </Box>
      </SortableContext>
    </Box>
  );
}
