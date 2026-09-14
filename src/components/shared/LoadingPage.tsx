import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export function LoadingPage() {
  return (
    <Box className="flex min-h-[60vh] w-full items-center justify-center">
      <CircularProgress />
    </Box>
  );
}
