import { createFileRoute, redirect } from '@tanstack/react-router';

import { homePathFor } from '@/utils/authCheck';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    throw redirect({ href: homePathFor(context.auth) });
  },
});
