import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DockerModule } from '../docker/docker.module';
import { TelegramBotService } from './telegram-bot.service';

@Module({
  imports: [ConfigModule.forRoot({}), DockerModule],
  providers: [TelegramBotService, ConfigModule],
})
export class TelegramBotModule implements OnModuleInit {
  onModuleInit(): void {}
}
