import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramBotService {
  private bot: TelegramBot;

  constructor(private configService: ConfigService) {
    this.bot = new TelegramBot(configService.getOrThrow('TELEGRAM_BOT_TOKEN'));
  }

  public sendMessage(message: string) {
    return this.bot.sendMessage(this.configService.getOrThrow('TELEGRAM_CHANNEL_ID'), message);
  }
}
