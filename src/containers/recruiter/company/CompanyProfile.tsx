import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { MdBusiness } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { useAuth } from '@/utils/hooks/useAuth';

import { CompanySetupCard } from '../jobs/CompanySetupCard';
import { CompanyPreviewCard } from './CompanyPreviewCard';
import { CompanyStrength } from './CompanyStrength';
import { CompanyAboutSection } from './sections/CompanyAboutSection';
import { CompanyBrandSection } from './sections/CompanyBrandSection';

const appear = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.05 + index * 0.06 },
});

/** The recruiter's company as candidates see it: logo, basics and the story behind every job post. */
export function CompanyProfile() {
  const { $t } = useIntl();
  const { profile } = useAuth();
  const company = profile?.company;

  if (!profile?.company_id || !company) return <CompanySetupCard />;

  return (
    <Box className="mx-auto max-w-6xl">
      <Box className="mb-8 flex items-center gap-4">
        <IconTile icon={MdBusiness} size="lg" />
        <Box className="min-w-0">
          <Typography variant="h2" className="mb-1">
            {$t({ id: 'company.title' })}
          </Typography>
          <Typography color="text.secondary">{$t({ id: 'company.subtitle' })}</Typography>
        </Box>
      </Box>

      <Box className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Box className="flex flex-col gap-6">
          <motion.div {...appear(0)}>
            {/* Keyed by company so the forms pick up values saved elsewhere (e.g. the setup card). */}
            <CompanyBrandSection key={company.id} company={company} />
          </motion.div>
          <motion.div {...appear(1)}>
            <CompanyAboutSection key={company.id} company={company} />
          </motion.div>
        </Box>

        <Box component="aside" className="flex flex-col gap-4 lg:sticky lg:top-24">
          <CompanyPreviewCard company={company} />
          <CompanyStrength company={company} />
        </Box>
      </Box>
    </Box>
  );
}
