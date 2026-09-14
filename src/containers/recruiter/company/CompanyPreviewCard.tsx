import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { MdOpenInNew, MdVisibility } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { CompanyLogo } from '@/components/Jobs/CompanyLogo';
import { brandGradient } from '@/styles/themes/accents';
import type { Company } from '@/types/auth.types';

type CompanyPreviewCardProps = {
  company: Company;
};

/** The saved company as candidates see it on every job page. */
export function CompanyPreviewCard({ company }: CompanyPreviewCardProps) {
  const { $t } = useIntl();

  return (
    <Card className="overflow-hidden">
      <Box className="relative h-20" sx={(theme) => ({ background: brandGradient(theme) })}>
        <Chip
          size="small"
          icon={<MdVisibility />}
          label={$t({ id: 'company.preview.title' })}
          className="absolute end-3 top-3"
          sx={{ bgcolor: alpha('#fff', 0.2), color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
        />
      </Box>
      <CardContent className="-mt-10 flex flex-col gap-3">
        <CompanyLogo
          name={company.name}
          logoUrl={company.logo_url}
          size={72}
          sx={{ border: 4, borderColor: 'background.paper' }}
        />
        <Box>
          <Typography variant="h5" className="break-words">
            {company.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {[company.industry, company.size && $t({ id: 'jobs.details.companySize' }, { size: company.size })]
              .filter(Boolean)
              .join(' · ') || $t({ id: 'company.preview.noDetails' })}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color={company.about ? 'text.primary' : 'text.disabled'}
          className="line-clamp-6 whitespace-pre-line"
        >
          {company.about || $t({ id: 'company.preview.noAbout' })}
        </Typography>
        {company.website && (
          <Link
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            fontWeight={600}
            className="flex items-center gap-1"
          >
            {company.website.replace(/^https?:\/\//, '')}
            <MdOpenInNew />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
