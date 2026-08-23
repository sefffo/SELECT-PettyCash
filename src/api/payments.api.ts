import { execute } from './axios';

export interface SubmitPaymentParams {
  RequestId: string;
  ReceiptUrl: string;
  Notes?: string;
}

export async function submitPayment(params: SubmitPaymentParams): Promise<null> {
  return execute<null>({
    action: 'PettyCash/SubmitPayment',
    parameters: {
      RequestId: params.RequestId,
      ReceiptUrl: params.ReceiptUrl,
      Notes: params.Notes,
    },
  });
}

export interface ResubmitParams {
  RequestId: string;
  ReceiptUrl: string;
  Notes?: string;
}

export async function resubmitProof(params: ResubmitParams): Promise<null> {
  return execute<null>({
    action: 'PettyCash/Resubmit',
    parameters: {
      RequestId: params.RequestId,
      ReceiptUrl: params.ReceiptUrl,
      Notes: params.Notes,
    },
  });
}
