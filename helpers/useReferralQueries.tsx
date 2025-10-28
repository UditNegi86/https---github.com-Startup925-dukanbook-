import { useQuery } from '@tanstack/react-query';
import { getValidate } from '../endpoints/referral/validate_GET.schema';

export const useValidateReferral = (referralCode: string) => {
  return useQuery({
    queryKey: ['referral', 'validate', referralCode],
    queryFn: () => getValidate({ referralCode }),
    enabled: referralCode.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};