import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { DockerService } from './docker/docker.service';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { DockerModule } from './docker/docker.module';
import { TelegramBotService } from './telegram-bot/telegram-bot.service';
import { FormatterModule } from './formatter/formatter.module';

@Module({
  imports: [ConfigModule.forRoot({}), ScheduleModule.forRoot(), TelegramBotModule, DockerModule, FormatterModule],
  providers: [AppService, DockerService, TelegramBotService],
})
export class AppModule implements OnModuleInit {
  constructor(private appService: AppService, private configService: ConfigService) {}
  onModuleInit() {
    if (this.configService.get('DEBUG')) this.appService.analyzeStats();
  }
}
