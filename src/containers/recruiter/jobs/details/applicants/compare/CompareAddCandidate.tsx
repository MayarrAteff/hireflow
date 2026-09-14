import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { MdPersonAdd } from 'react-icons/md';
import { useIntl } from 'react-intl';

import type { RecruiterApplication } from '@/types/application.types';
import { getSkillMatch } from '@/utils/skillMatch';

import { ApplicantAvatar } from '../ApplicantAvatar';

type CompareAddCandidateProps = {
  jobSkills: string[];
  options: RecruiterApplication[];
  max: number;
  /** False when the comparison is full or nobody is left to add. */
  canAdd: boolean;
  onAdd: (applicationId: string) => void;
};

/** Header button that opens a searchable list of the job's other applicants. */
export function CompareAddCandidate({ jobSkills, options, max, canAdd, onAdd }: CompareAddCandidateProps) {
  const { $t, formatNumber } = useIntl();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <Tooltip title={canAdd ? '' : $t({ id: 'applicants.compareFull' }, { max })}>
        <span>
          <Button
            variant="outlined"
            startIcon={<MdPersonAdd />}
            disabled={!canAdd}
            onClick={(event) => setAnchor(event.currentTarget)}
          >
            {$t({ id: 'compare.addCandidate' })}
          </Button>
        </span>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { className: 'tw-mt-2 tw-w-80 tw-max-w-[calc(100vw-32px)] tw-rounded-2xl tw-p-3' } }}
      >
        <Typography variant="caption" color="text.secondary" className="tw-mb-2 tw-block tw-px-1">
          {$t({ id: 'compare.addCandidateHint' }, { max })}
        </Typography>
        <Autocomplete
          size="small"
          openOnFocus
          options={options}
          value={null}
          getOptionLabel={(option) => option.candidate.full_name || option.candidate.email}
          onChange={(_event, option) => {
            if (!option) return;
            onAdd(option.id);
            setAnchor(null);
          }}
          noOptionsText={$t({ id: 'applicants.noMatches' })}
          renderOption={({ key, ...props }, option) => (
            <Box component="li" key={key} {...props} className={`${props.className} tw-flex tw-gap-2`}>
              <ApplicantAvatar candidate={option.candidate} size={28} />
              <Typography variant="body2" noWrap className="tw-min-w-0 tw-flex-1">
                {option.candidate.full_name || option.candidate.email}
              </Typography>
              {jobSkills.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {formatNumber(getSkillMatch(jobSkills, option.candidate.skills ?? []).percent / 100, {
                    style: 'percent',
                  })}
                </Typography>
              )}
            </Box>
          )}
          renderInput={(params) => (
            <TextField {...params} autoFocus placeholder={$t({ id: 'compare.searchApplicants' })} />
          )}
        />
      </Popover>
    </>
  );
}
