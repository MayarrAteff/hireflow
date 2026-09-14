import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { MdCheck } from 'react-icons/md';
import { useIntl } from 'react-intl';

import { ProgressRing } from '@/components/UI/ProgressRing';
import { ACCENT_COLORS } from '@/styles/themes/accents';
import type { Company } from '@/types/auth.types';
import { companySectionId, getCompanyCompleteness } from '@/utils/companyCompleteness';

type CompanyStrengthProps = {
  company: Company;
};

/** Completion ring plus the checklist behind it; unfinished items scroll to their section. */
export function CompanyStrength({ company }: CompanyStrengthProps) {
  const { $t, formatNumber } = useIntl();
  const { items, percent, isComplete } = getCompanyCompleteness(company);

  return (
    <Card>
      <CardContent className="p-5">
        <Box className="mb-4 flex items-center gap-4">
          <Box className="relative shrink-0">
            <ProgressRing value={percent} size={72} stroke={7} />
            <Typography variant="h6" component="span" className="absolute inset-0 flex items-center justify-center">
              {formatNumber(percent / 100, { style: 'percent' })}
            </Typography>
          </Box>
          <Box className="min-w-0">
            <Typography fontWeight={700}>
              {$t({ id: isComplete ? 'company.strength.complete.title' : 'company.strength.title' })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {$t({ id: isComplete ? 'company.strength.complete.body' : 'company.strength.body' })}
            </Typography>
          </Box>
        </Box>

        <Box component="ul" className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-1 p-0">
          {items.map((item) => {
            const content = (
              <>
                <Box
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  sx={
                    item.done
                      ? { bgcolor: ACCENT_COLORS.emerald, color: '#fff' }
                      : { border: 2, borderColor: 'divider' }
                  }
                >
                  {item.done && <MdCheck size={14} />}
                </Box>
                <Typography variant="body2" color={item.done ? 'text.primary' : 'text.secondary'} noWrap>
                  {$t({ id: `company.strength.item.${item.id}` })}
                </Typography>
              </>
            );

            return (
              <li key={item.id}>
                {item.done ? (
                  <Box className="flex items-center gap-2 px-1 py-1">{content}</Box>
                ) : (
                  <ButtonBase
                    onClick={() =>
                      document.getElementById(companySectionId(item.section))?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="flex w-full justify-start gap-2 rounded-lg px-1 py-1 text-start"
                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    {content}
                  </ButtonBase>
                )}
              </li>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
