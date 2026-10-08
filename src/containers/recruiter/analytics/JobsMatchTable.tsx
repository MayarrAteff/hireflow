import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { createLink } from '@tanstack/react-router';
import { useIntl } from 'react-intl';

import type { JobStats } from '@/utils/hiringAnalytics';

const MuiRouterLink = createLink(Link);

type JobsMatchTableProps = {
  jobs: JobStats[];
};

/** Jobs ranked by how well their applicants' skills fit, alongside how many were interviewed and hired. */
export function JobsMatchTable({ jobs }: JobsMatchTableProps) {
  const { $t, formatNumber } = useIntl();

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{$t({ id: 'analytics.jobs.column.job' })}</TableCell>
            <TableCell className="min-w-56">{$t({ id: 'analytics.jobs.column.match' })}</TableCell>
            <TableCell align="right">{$t({ id: 'analytics.jobs.column.applicants' })}</TableCell>
            <TableCell align="right">{$t({ id: 'analytics.jobs.column.interviewed' })}</TableCell>
            <TableCell align="right">{$t({ id: 'analytics.jobs.column.hired' })}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map(({ jobId, title, applicants, match, interviewed, hired }) => (
            <TableRow key={jobId} hover>
              <TableCell>
                <MuiRouterLink
                  to="/recruiter/jobs/$jobId"
                  params={{ jobId }}
                  underline="hover"
                  color="text.primary"
                  fontWeight={600}
                >
                  {title}
                </MuiRouterLink>
              </TableCell>
              <TableCell>
                {match === null ? (
                  <Typography variant="body2" color="text.disabled">
                    {$t({ id: 'analytics.jobs.noSkills' })}
                  </Typography>
                ) : (
                  <Box className="flex items-center gap-3">
                    <Box className="h-2 flex-1 overflow-hidden rounded-full" sx={{ bgcolor: 'action.hover' }}>
                      <Box
                        className="h-full rounded-full"
                        sx={{ bgcolor: 'primary.main', width: `${Math.round(match * 100)}%` }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={700} className="w-10 text-end tabular-nums">
                      {formatNumber(match, { style: 'percent', maximumFractionDigits: 0 })}
                    </Typography>
                  </Box>
                )}
              </TableCell>
              <TableCell align="right" className="tabular-nums">
                {formatNumber(applicants)}
              </TableCell>
              <TableCell align="right" className="tabular-nums">
                {formatNumber(interviewed)}
              </TableCell>
              <TableCell align="right" className="tabular-nums">
                {formatNumber(hired)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
