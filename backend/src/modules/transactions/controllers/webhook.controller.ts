import {
  Controller,
  Post,
  Body,
  HttpCode,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { TransactionsService } from '../transactions.service';
import { WompiService } from '../../wompi/wompi.service';
import { WompiWebhookDto } from '../models/dto/wompi-webhook.dto';

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly wompiService: WompiService,
  ) {}

  @Post('wompi')
  @HttpCode(200)
  async handleWompiEvent(
    @Body() dto: WompiWebhookDto,
  ): Promise<{ received: boolean }> {
    const isValid = this.wompiService.validateWebhookSignature(
      dto.signature.properties,
      dto.data as unknown as Record<string, unknown>,
      dto.timestamp,
      dto.signature.checksum,
    );

    if (!isValid) {
      this.logger.warn('Invalid Wompi webhook signature received');
      throw new BadRequestException('Invalid webhook signature');
    }

    if (dto.event !== 'transaction.updated') {
      return { received: true };
    }

    const { id, status } = dto.data.transaction;
    const result = await this.transactionsService.handleWompiWebhook(id, status);

    if (!result.isSuccess) {
      this.logger.warn(`Webhook handling failed: ${result.error}`);
    }

    return { received: true };
  }
}