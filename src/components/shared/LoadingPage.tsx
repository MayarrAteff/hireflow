import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export function LoadingPage() {
  return (
    <Box className="tw-flex tw-min-h-[60vh] tw-w-full tw-items-center tw-justify-center">
      <CircularProgress />
    </Box>
  );
}
