import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';
import { table } from 'table';
import { Stream } from 'stream';
import { DockerInstanceStats } from '../docker/docker.interface';
import { DockerService } from '../docker/docker.service';
import { FormatterService } from '../formatter/formatter.service';

@Injectable()
export class TelegramBotService {
  private logger = new Logger(TelegramBotService.name);

  private bot: TelegramBot;

  constructor(
    private configService: ConfigService,
    private formatterService: FormatterService,
    private dockerService: DockerService,
  ) {
    this.bot = new TelegramBot(configService.getOrThrow('TELEGRAM_BOT_TOKEN'));
  }

  public async sendMessage(message: string, options?: TelegramBot.SendMessageOptions) {
    const result = await this.bot.sendMessage(this.configService.getOrThrow('TELEGRAM_CHANNEL_ID'), message, options);
    this.logger.log('Message has been sent to the Telegram channel');
    return result;
  }

  public async sendPhoto(
    photo: Stream | Buffer,
    options?: TelegramBot.SendPhotoOptions,
    fileOptions?: TelegramBot.FileOptions,
  ) {
    const result = await this.bot.sendPhoto(
      this.configService.getOrThrow('TELEGRAM_CHANNEL_ID'),
      photo,
      options,
      fileOptions,
    );
    this.logger.log('Photo has been sent to the Telegram channel');
    return result;
  }

  public sendStats(stats: DockerInstanceStats) {
    let totalUsage = 0;
    let systemMax = 0;

    let totalCpuDelta = 0;
    let totalSystemDelta = 0;

    for (const stat of stats) {
      totalUsage += stat.raw.memory_stats.usage;
      systemMax = Math.max(stat.raw.memory_stats.limit);
      totalCpuDelta += this.dockerService.getCpuDelta(stat.raw);
      totalSystemDelta += this.dockerService.getSystemDelta(stat.raw);
    }

    const tableStats = [['Name', `CPU`, `Memory`]];
    for (const stat of stats) {
      tableStats.push([stat.name, stat.cpuUsage, stat.memory.percentage]);
    }

    const { formatPercentage, formatByte, toImage } = this.formatterService;
    const memory = `${formatByte(totalUsage, false)}/${formatByte(systemMax)}`;
    const caption = `
      Docker containers summary:
      CPU: ${formatPercentage(totalCpuDelta, totalSystemDelta)}
      Memory: ${formatPercentage(totalUsage, systemMax)} \\- ${memory} 
    `;
    const image = toImage(table(tableStats));

    this.sendPhoto(image, { parse_mode: 'MarkdownV2', caption: this.escape(caption) });
  }

  private escape(message: string) {
    return message.replace(/\./g, '\\.');
  }
}
