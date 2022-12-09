import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DockerService } from './docker/docker.service';
import { TelegramBotService } from './telegram-bot/telegram-bot.service';

@Injectable()
export class AppService {
  constructor(private dockerService: DockerService, private telegramBotService: TelegramBotService) {}

  // @Cron('0 30 * * * *')
  @Cron('45 * * * * *')
  async analyzeStats() {
    const stats = await this.dockerService.stats();
    const temperature = await this.dockerService.temperature();
    await this.telegramBotService.sendStats(stats, temperature);
  }
}
