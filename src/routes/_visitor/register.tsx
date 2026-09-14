import { createFileRoute } from '@tanstack/react-router';

import { Register } from '@/containers/Auth/Register';

export const Route = createFileRoute('/_visitor/register')({
  component: Register,
});
