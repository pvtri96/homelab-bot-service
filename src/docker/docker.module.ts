import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DockerService } from './docker.service';

@Module({
  imports: [ConfigModule.forRoot({})],
  providers: [DockerService, ConfigModule],
})
export class DockerModule implements OnModuleInit {
  constructor(private dockerService: DockerService) {}

  onModuleInit(): void {
    this.dockerService.stats();
  }
}
