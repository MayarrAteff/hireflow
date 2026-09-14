import {
  type Announcements,
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MdPanTool } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { EmptyJobsIllustration } from '@/components/UI/Illustrations';
import { APPLICATION_PIPELINE } from '@/constants/applications';
import { type ApplicationMove, useApplicationMoves, useStageChangeFollowUp } from '@/hooks/useApplicationMutations';
import type { ApplicationStage, RecruiterApplication } from '@/types/application.types';
import type { Job } from '@/types/job.types';
import { getSkillMatch } from '@/utils/skillMatch';

import { BoardCardContent } from './BoardCard';
import { BoardColumn } from './BoardColumn';

const BOARD_STAGES: ApplicationStage[] = [...APPLICATION_PIPELINE, 'rejected'];

type Columns = Record<ApplicationStage, string[]>;

function toColumns(applications: RecruiterApplication[]): Columns {
  const columns = Object.fromEntries(BOARD_STAGES.map((stage) => [stage, [] as string[]])) as Columns;
  [...applications]
    .sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at))
    .forEach((application) => columns[application.stage].push(application.id));
  return columns;
}

const isStage = (id: UniqueIdentifier): id is ApplicationStage => BOARD_STAGES.includes(id as ApplicationStage);

type HiringBoardProps = {
  job: Job;
  applications: RecruiterApplication[];
  onOpenApplicant: (applicationId: string) => void;
  /** Called when a card lands in Interview without an upcoming interview, to offer scheduling one. */
  onSuggestInterview: (application: RecruiterApplication) => void;
  /** Called when a card lands in Offer without a draft or pending offer, to open the offer dialog. */
  onSuggestOffer: (application: RecruiterApplication) => void;
};

export function HiringBoard({
  job,
  applications,
  onOpenApplicant,
  onSuggestInterview,
  onSuggestOffer,
}: HiringBoardProps) {
  const { $t } = useIntl();
  const moves = useApplicationMoves(job.id);
  const followUp = useStageChangeFollowUp({ onSuggestInterview, onSuggestOffer });

  const [columns, setColumns] = useState<Columns>(() => toColumns(applications));
  const [activeId, setActiveId] = useState<string | null>(null);
  const columnsAtDragStart = useRef<Columns | null>(null);

  // Follow server/cache changes, but never while the user is holding a card.
  useEffect(() => {
    if (!activeId) setColumns(toColumns(applications));
  }, [applications, activeId]);

  const byId = useMemo(() => new Map(applications.map((application) => [application.id, application])), [applications]);
  const matchById = useMemo(
    () =>
      new Map(
        applications.map((application) => [
          application.id,
          getSkillMatch(job.skills, application.candidate.skills ?? []).percent,
        ]),
      ),
    [applications, job.skills],
  );

  const sensors = useSensors(
    // A small distance lets a plain click reach the card's buttons instead of starting a drag.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Press-and-hold on touch so the board can still be scrolled sideways with a finger.
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const findStage = (id: UniqueIdentifier, source: Columns = columns): ApplicationStage | undefined =>
    isStage(id) ? id : BOARD_STAGES.find((stage) => source[stage].includes(String(id)));

  const nameOf = (id: UniqueIdentifier) => {
    const candidate = byId.get(String(id))?.candidate;
    return candidate?.full_name || candidate?.email || '';
  };
  const stageLabel = (id: UniqueIdentifier | undefined) => {
    const stage = id === undefined ? undefined : findStage(id);
    return stage ? $t({ id: `application.stage.${stage}` }) : '';
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) =>
      $t({ id: 'board.a11y.pickedUp' }, { name: nameOf(active.id), stage: stageLabel(active.id) }),
    onDragOver: ({ active, over }) =>
      over ? $t({ id: 'board.a11y.over' }, { name: nameOf(active.id), stage: stageLabel(over.id) }) : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? $t({ id: 'board.a11y.dropped' }, { name: nameOf(active.id), stage: stageLabel(over.id) })
        : $t({ id: 'board.a11y.cancelled' }, { name: nameOf(active.id) }),
    onDragCancel: ({ active }) => $t({ id: 'board.a11y.cancelled' }, { name: nameOf(active.id) }),
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    columnsAtDragStart.current = columns;
  };

  // Moving between columns happens while hovering, so the card visibly slots into the new list.
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = findStage(active.id);
    const to = findStage(over.id);
    if (!from || !to || from === to) return;

    setColumns((current) => {
      const target = current[to];
      const overIndex = target.indexOf(String(over.id));
      const insertAt = overIndex >= 0 ? overIndex : target.length;
      return {
        ...current,
        [from]: current[from].filter((id) => id !== active.id),
        [to]: [...target.slice(0, insertAt), String(active.id), ...target.slice(insertAt)],
      };
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const before = columnsAtDragStart.current;
    setActiveId(null);
    columnsAtDragStart.current = null;

    const stage = findStage(active.id);
    if (!over || !stage || !before) {
      if (before) setColumns(before);
      return;
    }

    let next = columns;
    const overIndex = columns[stage].indexOf(String(over.id));
    const activeIndex = columns[stage].indexOf(String(active.id));
    if (overIndex >= 0 && overIndex !== activeIndex) {
      next = { ...columns, [stage]: arrayMove(columns[stage], activeIndex, overIndex) };
      setColumns(next);
    }

    // Save only rows whose stage or position actually changed.
    const changes: ApplicationMove[] = BOARD_STAGES.flatMap((columnStage) =>
      next[columnStage].flatMap((id, position) => {
        const application = byId.get(id);
        if (!application || (application.stage === columnStage && application.position === position)) return [];
        return [{ id, payload: { position, ...(application.stage !== columnStage && { stage: columnStage }) } }];
      }),
    );
    if (changes.length === 0) return;
    moves.mutate(changes);

    const moved = byId.get(String(active.id));
    if (moved && moved.stage !== stage) followUp(moved, stage);
  };

  const handleDragCancel = () => {
    if (columnsAtDragStart.current) setColumns(columnsAtDragStart.current);
    columnsAtDragStart.current = null;
    setActiveId(null);
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <EmptyJobsIllustration className="mb-3 w-44" />
          <Typography variant="h4" className="mb-1">
            {$t({ id: 'applicants.empty.title' })}
          </Typography>
          <Typography color="text.secondary" className="max-w-md">
            {$t({ id: 'board.empty' })}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const activeApplication = activeId ? byId.get(activeId) : undefined;

  return (
    <Box className="flex flex-col gap-3">
      <Typography variant="body2" color="text.secondary" className="flex items-center gap-1.5 px-1">
        <MdPanTool />
        {$t({ id: 'board.hint' })}
      </Typography>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={{
          announcements,
          screenReaderInstructions: { draggable: $t({ id: 'board.a11y.instructions' }) },
        }}
      >
        <Box className="flex items-stretch gap-3 overflow-x-auto pb-3">
          {BOARD_STAGES.map((stage) => (
            <BoardColumn
              key={stage}
              stage={stage}
              applications={columns[stage].map((id) => byId.get(id)).filter(Boolean) as RecruiterApplication[]}
              matchById={matchById}
              onOpenApplicant={onOpenApplicant}
            />
          ))}
        </Box>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
          {activeApplication && (
            <Box className="w-[256px]">
              <BoardCardContent
                application={activeApplication}
                matchPercent={matchById.get(activeApplication.id) ?? 0}
                overlay
              />
            </Box>
          )}
        </DragOverlay>
      </DndContext>
    </Box>
  );
}
