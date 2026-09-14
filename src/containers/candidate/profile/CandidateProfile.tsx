import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { MdPerson } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { IconTile } from '@/components/UI/IconTile';
import { useAuth } from '@/utils/hooks/useAuth';
import { profileSectionId } from '@/utils/profileCompleteness';

import { ProfileStrength } from '../components/ProfileStrength';
import { ProfilePreviewCard } from './ProfilePreviewCard';
import { AboutSection } from './sections/AboutSection';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { ContactSection } from './sections/ContactSection';
import { CvSection } from './sections/CvSection';
import { SkillsSection } from './sections/SkillsSection';

const SECTIONS = [
  { key: 'basics', Component: BasicInfoSection },
  { key: 'about', Component: AboutSection },
  { key: 'contact', Component: ContactSection },
  { key: 'skills', Component: SkillsSection },
  { key: 'cv', Component: CvSection },
];

const appear = (index: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.05 + index * 0.06 },
});

export function CandidateProfile() {
  const { $t } = useIntl();
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <Box className="mx-auto max-w-6xl">
      <Box className="mb-8 flex items-center gap-4">
        <IconTile icon={MdPerson} size="lg" />
        <Box className="min-w-0">
          <Typography variant="h2" className="mb-1">
            {$t({ id: 'profile.title' })}
          </Typography>
          <Typography color="text.secondary">{$t({ id: 'profile.subtitle' })}</Typography>
        </Box>
      </Box>

      <Box className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Box className="flex flex-col gap-6">
          {SECTIONS.map(({ key, Component }, index) => (
            <motion.div key={key} {...appear(index)}>
              <Component profile={profile} />
            </motion.div>
          ))}
        </Box>

        <Box component="aside" className="flex flex-col gap-4 lg:sticky lg:top-24">
          <ProfilePreviewCard profile={profile} />
          <Card>
            <CardContent className="p-5">
              <Typography variant="h6" className="mb-4">
                {$t({ id: 'candidate.profile.title' })}
              </Typography>
              <ProfileStrength
                onItemClick={(item) =>
                  document.getElementById(profileSectionId(item.section))?.scrollIntoView({ behavior: 'smooth' })
                }
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
