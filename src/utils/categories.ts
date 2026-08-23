import type { RequestTypeValue } from '@/types/vertex';

export const requestTypes: { value: RequestTypeValue; label: string; emoji: string }[] = [
  { value: 'cash-advance', label: 'Cash Advance', emoji: '💵' },
  { value: 'budget', label: 'Budget Request', emoji: '📊' },
  { value: 'purchase', label: 'Purchase Request', emoji: '🛒' },
  { value: 'travel', label: 'Travel Request', emoji: '✈️' },
];

export const requestTypeLabels: Record<RequestTypeValue, string> = {
  'cash-advance': 'Cash Advance',
  budget: 'Budget',
  purchase: 'Purchase',
  travel: 'Travel',
};

const requestTypeCategoryNames: Record<RequestTypeValue, string> = {
  'cash-advance': 'Other',
  budget: 'Other',
  purchase: 'Office Supplies',
  travel: 'Transportation',
};

export function categoryFromRequestType(requestType: RequestTypeValue): string {
  return requestTypeCategoryNames[requestType];
}