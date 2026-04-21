import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { NotFound } from '../../common/utils/apiError';
import { WebhookEvent, WebhookStatus } from '@prisma/client';

export class WebhooksService {
  async findAll() {
    return prisma.webhookConfig.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const webhook = await prisma.webhookConfig.findUnique({
      where: { id },
    });
    if (!webhook) throw NotFound('Webhook');
    return webhook;
  }

  async create(dto: any) {
    return prisma.webhookConfig.create({
      data: {
        name: dto.name,
        url: dto.url,
        events: dto.events,
        status: dto.status || WebhookStatus.ACTIVE,
        secret: dto.secret || crypto.randomBytes(20).toString('hex'),
      },
    });
  }

  async update(id: string, dto: any) {
    await this.findById(id);
    return prisma.webhookConfig.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await prisma.webhookConfig.delete({
      where: { id },
    });
  }

  /**
   * ── Trigger Webhooks ──────────────────────────────────────────────────────
   * Finds all active webhooks for a specific event and dispatches them.
   */
  async trigger(event: WebhookEvent, payload: any) {
    const configs = await prisma.webhookConfig.findMany({
      where: {
        events: { has: event },
        status: WebhookStatus.ACTIVE,
      },
    });

    if (configs.length === 0) return;

    const dispatchPromises = configs.map(config => this.dispatch(config, event, payload));
    await Promise.allSettled(dispatchPromises);
  }

  private async dispatch(config: any, event: WebhookEvent, payload: any) {
    const startTime = Date.now();
    const body = JSON.stringify({
      id: crypto.randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    const signature = crypto
      .createHmac('sha256', config.secret)
      .update(body)
      .digest('hex');

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': signature,
          ...(config.headers as Record<string, string> || {}),
        },
        body,
      });

      const responseBody = await response.text();
      const duration = Date.now() - startTime;

      await prisma.webhookDelivery.create({
        data: {
          webhookId: config.id,
          event,
          payload: payload as any,
          statusCode: response.status,
          responseBody: responseBody.slice(0, 1000), // Truncate if too long
          isSuccess: response.ok,
          duration,
        },
      });

      if (!response.ok && config.status === WebhookStatus.ACTIVE) {
        // Basic failure tracking could go here
      }
    } catch (err: any) {
      await prisma.webhookDelivery.create({
        data: {
          webhookId: config.id,
          event,
          payload: payload as any,
          isSuccess: false,
          errorMessage: err.message,
          duration: Date.now() - startTime,
        },
      });
    }
  }
}

export const webhooksService = new WebhooksService();
