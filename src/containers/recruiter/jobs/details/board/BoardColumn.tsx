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
      className="tw-flex tw-w-[272px] tw-shrink-0 tw-flex-col tw-rounded-2xl"
      sx={(theme) => ({
        bgcolor: alpha(color, theme.palette.mode === 'dark' ? 0.1 : 0.06),
        border: `1px solid ${alpha(color, isOver ? 0.6 : 0.18)}`,
        transition: theme.transitions.create('border-color'),
      })}
    >
      <Box className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-pb-2 tw-pt-3">
        <Box className="tw-h-2.5 tw-w-2.5 tw-rounded-full" sx={{ bgcolor: color }} />
        <Typography fontWeight={700} className="tw-flex-1">
          {$t({ id: `application.stage.${stage}` })}
        </Typography>
        <Typography
          variant="caption"
          fontWeight={700}
          className="tw-rounded-full tw-px-2 tw-py-0.5"
          sx={{ bgcolor: alpha(color, 0.16), color }}
        >
          {formatNumber(applications.length)}
        </Typography>
      </Box>

      <SortableContext items={applications.map((application) => application.id)} strategy={verticalListSortingStrategy}>
        <Box ref={setNodeRef} className="tw-flex tw-min-h-[140px] tw-flex-1 tw-flex-col tw-gap-2 tw-px-2 tw-pb-2">
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
              className="tw-flex tw-flex-1 tw-items-center tw-justify-center tw-rounded-xl tw-p-4 tw-text-center"
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
