import type { QueryClient } from '@tanstack/react-query';

import type { IAuthContext } from '@/utils/context/Auth';

export type RouterContext = {
  auth: IAuthContext;
  queryClient: QueryClient;
};
