import { createFileRoute } from '@tanstack/react-router';

import { Forbidden } from '@/components/shared/StatusPage';

export const Route = createFileRoute('/forbidden')({
  component: Forbidden,
});
