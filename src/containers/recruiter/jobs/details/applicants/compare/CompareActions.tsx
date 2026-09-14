import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import {
  MdArrowForward,
  MdCheckCircle,
  MdEventAvailable,
  MdMoreVert,
  MdOpenInNew,
  MdPerson,
  MdThumbDown,
  MdUndo,
} from 'react-icons/md';
import { useIntl } from 'react-intl';

import { APPLICATION_PIPELINE } from '@/constants/applications';
import type { ApplicationStage, RecruiterApplication } from '@/types/application.types';

type CompareActionsProps = {
  application: RecruiterApplication;
  onMove: (stage: ApplicationStage) => void;
  onOpenProfile: () => void;
  onSchedule: () => void;
  onViewCv: () => void;
  openingCv: boolean;
};

/** The decisions a recruiter can make for one compared candidate, kept in reach at the bottom of the column. */
export function CompareActions({
  application,
  onMove,
  onOpenProfile,
  onSchedule,
  onViewCv,
  openingCv,
}: CompareActionsProps) {
  const { $t } = useIntl();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const { stage } = application;
  const name = application.candidate.full_name || application.candidate.email;
  const nextStage = stage === 'rejected' ? undefined : APPLICATION_PIPELINE[APPLICATION_PIPELINE.indexOf(stage) + 1];

  const closeMenuAnd = (action: () => void) => () => {
    setMenuAnchor(null);
    action();
  };

  return (
    <Box className="tw-flex tw-items-center tw-gap-2 tw-p-3">
      {stage === 'rejected' ? (
        <Button variant="outlined" startIcon={<MdUndo />} onClick={() => onMove('applied')} className="tw-flex-1">
          {$t({ id: 'compare.reconsider' })}
        </Button>
      ) : nextStage ? (
        <Button
          variant="contained"
          endIcon={<MdArrowForward className="rtl:tw-rotate-180" />}
          onClick={() => onMove(nextStage)}
          className="tw-min-w-0 tw-flex-1"
        >
          <Box component="span" className="tw-truncate">
            {$t({ id: 'compare.moveTo' }, { stage: $t({ id: `application.stage.${nextStage}` }) })}
          </Box>
        </Button>
      ) : (
        <Button variant="contained" color="success" startIcon={<MdCheckCircle />} disabled className="tw-flex-1">
          {$t({ id: 'application.stage.hired' })}
        </Button>
      )}

      {stage !== 'rejected' && stage !== 'hired' && (
        <Tooltip title={$t({ id: 'compare.reject' })}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onMove('rejected')}
            aria-label={`${$t({ id: 'compare.reject' })} ${name}`}
            className="tw-min-w-0 tw-px-2.5"
          >
            <MdThumbDown size={18} />
          </Button>
        </Tooltip>
      )}

      <IconButton
        onClick={(event) => setMenuAnchor(event.currentTarget)}
        aria-label={$t({ id: 'compare.moreActions' })}
        aria-haspopup="menu"
      >
        <MdMoreVert />
      </IconButton>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={closeMenuAnd(onOpenProfile)}>
          <ListItemIcon>
            <MdPerson />
          </ListItemIcon>
          {$t({ id: 'compare.openProfile' })}
        </MenuItem>
        <MenuItem onClick={closeMenuAnd(onSchedule)}>
          <ListItemIcon>
            <MdEventAvailable />
          </ListItemIcon>
          {$t({ id: 'interview.dialog.title' })}
        </MenuItem>
        {application.cv_path && (
          <MenuItem onClick={closeMenuAnd(onViewCv)} disabled={openingCv}>
            <ListItemIcon>
              <MdOpenInNew />
            </ListItemIcon>
            {$t({ id: 'applicants.viewCv' })}
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}
