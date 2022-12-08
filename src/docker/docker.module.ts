import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FormatterModule } from '../formatter/formatter.module';
import { DockerService } from './docker.service';

@Module({
  imports: [ConfigModule.forRoot({}), FormatterModule],
  providers: [DockerService],
  exports: [DockerService],
})
export class DockerModule {}
