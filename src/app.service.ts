import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import * as Fs from 'node:fs';
import * as Path from 'node:path';
import * as process from 'process';
import { DockerService } from './docker/docker.service';
import { TelegramBotService } from './telegram-bot/telegram-bot.service';

@Injectable()
export class AppService {
  logger = new Logger(AppService.name);
  constructor(
    private configService: ConfigService,
    private dockerService: DockerService,
    private telegramBotService: TelegramBotService,
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
    const healthCheckPathEnv = this.configService.get('HEALTHCHECK_CONFIG_PATH');
    if (!healthCheckPathEnv) {
      return;
    }
    const healthCheckPath = Path.join(healthCheckPathEnv);
    if (!Fs.existsSync(healthCheckPath)) {
      throw new Error(`File "${healthCheckPath}" not found! Given HEALTHCHECK_CONFIG_PATH=${healthCheckPathEnv}`);
    }
    const healthCheckConfig = JSON.parse(Fs.readFileSync(healthCheckPath, { encoding: 'utf-8' })) as HealthcheckConfig;

    const stats = await this.dockerService.stats();

    for (const stat of stats) {
      if (!healthCheckConfig[stat.name]) {
        continue;
      }
      const url = healthCheckConfig[stat.name].url;
      this.logger.log(`Sending healthcheck signal for ${stat.name}`);
      await fetch(url);
    }
  }
}

interface HealthcheckConfig {
  [key: string]: {
    url: string;
  };
}
