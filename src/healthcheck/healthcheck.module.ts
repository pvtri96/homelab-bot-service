import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthcheckService } from './healthcheck.service';

@Module({
  imports: [ConfigModule.forRoot({})],
  providers: [HealthcheckService],
  exports: [HealthcheckService],
})
export class HealthcheckModule implements OnModuleInit {
  constructor(private healthCheckService: HealthcheckService) {}
  async onModuleInit() {
    await this.healthCheckService.initiateChecks();
  }
}
