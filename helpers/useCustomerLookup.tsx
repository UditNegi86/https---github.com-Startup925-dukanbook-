import { useQuery } from '@tanstack/react-query';
import { getCustomersLookup, InputType, OutputType } from '../endpoints/customers/lookup_GET.schema';

export const useCustomerLookup = (
  query: InputType,
  options?: { enabled?: boolean }
) => {
  return useQuery<OutputType, Error>({
    queryKey: ['customerLookup', query.mobileNumber],
    queryFn: () => getCustomersLookup(query),
    enabled: options?.enabled ?? true,
  });
};