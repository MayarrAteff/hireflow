import { createFileRoute } from '@tanstack/react-router';

import { Login } from '@/containers/Auth/Login';

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute('/_visitor/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: Login,
});
