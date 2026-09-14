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
          <Typography className="whitespace-pre-line leading-relaxed">{description}</Typography>
        </SectionCard>
      )}

      {requirements.length > 0 && (
        <SectionCard icon={MdRule} color="amber" titleId="jobs.field.requirements">
          <Box component="ul" className="m-0 flex list-none flex-col gap-2.5 p-0">
            {requirements.map((requirement, index) => (
              <Box component="li" key={index} className="flex items-start gap-2.5">
                <Box component={MdCheckCircle} className="mt-0.5 shrink-0" sx={{ color: ACCENT_COLORS.amber }} />
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
          <Box className="flex flex-wrap gap-2">
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
