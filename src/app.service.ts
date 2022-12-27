import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { DockerService } from './docker/docker.service';
import { HealthcheckService } from './healthcheck/healthcheck.service';
import { TelegramBotService } from './telegram-bot/telegram-bot.service';

@Injectable()
export class AppService {
  logger = new Logger(AppService.name);
  constructor(
    private configService: ConfigService,
    private dockerService: DockerService,
    private telegramBotService: TelegramBotService,
    private healthcheckService: HealthcheckService,
  ) {}

  @Cron('0 1 * * *')
  async analyzeStats() {
    const stats = await this.dockerService.stats();
    stats.sort((a, b) => a.name.localeCompare(b.name));
    const temperature = await this.dockerService.temperature();
    await this.telegramBotService.sendStats(stats, temperature);
  }

  @Cron('0 * * * *')
  async healthCheck() {
    const stats = await this.dockerService.stats();
    await this.healthcheckService.check(stats);
  }
}
