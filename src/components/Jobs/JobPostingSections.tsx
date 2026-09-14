import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { MdCheckCircle, MdDescription, MdExtension, MdRule } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { Job } from '@/types/job.types';

import { SectionCard } from './SectionCard';

type JobPostingSectionsProps = {
  job: Pick<Job, 'description' | 'requirements' | 'skills'>;
  /** Skills to highlight as matched, e.g. the ones on the viewing candidate's profile. */
  matchedSkills?: Set<string>;
};

/** Description, requirements and skills of a job, as both candidates and recruiters read it. Empty parts are skipped. */
export function JobPostingSections({ job, matchedSkills }: JobPostingSectionsProps) {
  const { $t } = useIntl();
  const description = job.description.trim();
  const requirements = job.requirements.filter((requirement) => requirement.trim());

  return (
    <>
      {description && (
        <SectionCard icon={MdDescription} color="violet" titleId="jobs.details.aboutRole">
          <Typography className="tw-whitespace-pre-line tw-leading-relaxed">{description}</Typography>
        </SectionCard>
      )}

      {requirements.length > 0 && (
        <SectionCard icon={MdRule} color="amber" titleId="jobs.field.requirements">
          <Box component="ul" className="tw-m-0 tw-flex tw-list-none tw-flex-col tw-gap-2.5 tw-p-0">
            {requirements.map((requirement, index) => (
              <Box component="li" key={index} className="tw-flex tw-items-start tw-gap-2.5">
                <Box component={MdCheckCircle} className="tw-mt-0.5 tw-shrink-0" sx={{ color: ACCENT_COLORS.amber }} />
                <Typography>{requirement}</Typography>
              </Box>
            ))}
          </Box>
        </SectionCard>
      )}

      {job.skills.length > 0 && (
        <SectionCard
          icon={MdExtension}
          color="emerald"
          titleId="jobs.field.skills"
          action={
            matchedSkills &&
            matchedSkills.size > 0 && (
              <Typography variant="body2" color="text.secondary">
                {$t({ id: 'jobs.details.skillsMatched' }, { matched: matchedSkills.size, total: job.skills.length })}
              </Typography>
            )
          }
        >
          <Box className="tw-flex tw-flex-wrap tw-gap-2">
            {job.skills.map((skill) =>
              matchedSkills?.has(skill) ? (
                <Chip key={skill} color="success" icon={<MdCheckCircle />} label={skill} />
              ) : (
                <Chip key={skill} variant="outlined" label={skill} />
              ),
            )}
          </Box>
        </SectionCard>
      )}
    </>
  );
}
