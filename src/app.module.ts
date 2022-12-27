import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { DockerService } from './docker/docker.service';
import { HealthcheckService } from './healthcheck/healthcheck.service';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { DockerModule } from './docker/docker.module';
import { FormatterModule } from './formatter/formatter.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { TelegramBotService } from './telegram-bot/telegram-bot.service';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    ScheduleModule.forRoot(),
    TelegramBotModule,
    DockerModule,
    FormatterModule,
    HealthcheckModule,
  ],
  providers: [AppService, DockerService, TelegramBotService, HealthcheckService],
})
export class AppModule implements OnModuleInit {
  constructor(private appService: AppService, private configService: ConfigService) {}
  async onModuleInit() {
    if (this.configService.get('DEBUG')) {
      await Promise.all([this.appService.analyzeStats(), this.appService.healthCheck()]);
    }
  }
}
