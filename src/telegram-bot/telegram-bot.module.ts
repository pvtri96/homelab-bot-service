import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DockerModule } from '../docker/docker.module';
import { FormatterModule } from '../formatter/formatter.module';
import { TelegramBotService } from './telegram-bot.service';

@Module({
  imports: [ConfigModule.forRoot({}), DockerModule, FormatterModule],
  providers: [TelegramBotService],
})
export class TelegramBotModule {}
