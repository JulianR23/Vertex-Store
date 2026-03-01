import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  WompiCreateTransactionInput,
  WompiTransactionResponse,
  WompiMerchantResponse,
  WompiTransactionStatus,
} from './models/types/wompi.types';
import { Result, ok, fail } from '../../shared/utils/result.utils';

@Injectable()
export class WompiService {
  private readonly logger = new Logger(WompiService.name);
  private readonly apiUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integrityKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>(
      'WOMPI_API_URL',
      'https://api-sandbox.co.uat.wompi.dev/v1',
    );
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY', '');
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY', '');
    this.integrityKey = this.configService.get<string>(
      'WOMPI_INTEGRITY_KEY',
      '',
    );
  }

  async fetchAcceptanceToken(): Promise<Result<string, string>> {
    try {
      const url = `${this.apiUrl}/merchants/${this.publicKey}`;
      const response = await fetch(url);
      if (!response.ok) {
        return fail('Failed to fetch acceptance token from Wompi');
      }
      const body = (await response.json()) as WompiMerchantResponse;
      return ok(body.data.presigned_acceptance.acceptance_token);
    } catch (err) {
      this.logger.error('Error fetching acceptance token', err);
      return fail('Network error fetching acceptance token');
    }
  }

  async createTransaction(
    input: WompiCreateTransactionInput,
  ): Promise<Result<WompiTransactionResponse, string>> {
    try {
      const response = await fetch(`${this.apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.privateKey}`,
        },
        body: JSON.stringify({
          acceptance_token: input.acceptanceToken,
          amount_in_cents: input.amountInCents,
          currency: input.currency,
          customer_email: input.customerEmail,
          reference: input.reference,
          signature: input.signature,
          payment_method_type: 'CARD',
          payment_method: {
            type: input.paymentMethod.type,
            token: input.paymentMethod.token,
            installments: input.paymentMethod.installments,
          },
          ip: input.customerIp,
        }),
      });
      const body = (await response.json()) as { data: any; error?: any };
      if (!response.ok) {
        const errorMessage = body.error?.messages
          ? JSON.stringify(body.error.messages)
          : 'Wompi transaction creation failed';
        return fail(errorMessage);
      }
      return ok(this.mapTransactionResponse(body.data));
    } catch (err) {
      this.logger.error('Error creating Wompi transaction', err);
      return fail('Network error creating Wompi transaction');
    }
  }

  async fetchTransactionStatus(
    wompiTransactionId: string,
  ): Promise<Result<WompiTransactionStatus, string>> {
    try {
      const response = await fetch(
        `${this.apiUrl}/transactions/${wompiTransactionId}`,
        {
          headers: { Authorization: `Bearer ${this.publicKey}` },
        },
      );
      if (!response.ok) {
        return fail(`Failed to fetch transaction ${wompiTransactionId}`);
      }
      const body = (await response.json()) as {
        data: { status: WompiTransactionStatus };
      };
      return ok(body.data.status);
    } catch (err) {
      this.logger.error('Error fetching Wompi transaction status', err);
      return fail('Network error fetching transaction status');
    }
  }

  generateSignature(
    reference: string,
    amountInCents: number,
    currency: string,
  ): string {
    const data = `${reference}${amountInCents}${currency}${this.integrityKey}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  validateWebhookSignature(
    properties: string[],
    eventData: Record<string, unknown>,
    timestamp: number,
    checksum: string,
  ): boolean {
    const concatenated =
      properties.map((prop) => this.resolveProperty(eventData, prop)).join('') +
      timestamp +
      this.integrityKey;
    const computed = crypto
      .createHash('sha256')
      .update(concatenated)
      .digest('hex');
    return computed === checksum;
  }

  private resolveProperty(data: Record<string, unknown>, path: string): string {
    return (
      (path
        .split('.')
        .reduce(
          (acc: unknown, key: string) =>
            acc && typeof acc === 'object'
              ? (acc as Record<string, unknown>)[key]
              : undefined,
          data,
        ) as string) ?? ''
    );
  }

  private mapTransactionResponse(
    data: Record<string, any>,
  ): WompiTransactionResponse {
    return {
      id: data.id,
      reference: data.reference,
      status: data.status,
      statusMessage: data.status_message,
      amountInCents: data.amount_in_cents,
      currency: data.currency,
      paymentMethodType: data.payment_method_type,
      createdAt: data.created_at,
    };
  }
}
