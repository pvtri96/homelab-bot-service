import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Docker from 'dockerode';
@Injectable()
export class DockerService {
  private instance: Docker;
  constructor(private configService: ConfigService) {
    this.instance = new Docker({
      host: configService.getOrThrow('TARGET_DOCKER_HOST'),
      port: configService.getOrThrow('TARGET_DOCKER_PORT'),
    });
  }

  public async stats() {
    const containers = await this.instance.listContainers();
    const result = await Promise.all(
      containers.map(async (c, i) => {
        const container = await this.instance.getContainer(c.Id);
        const instanceStats = await container.stats({ stream: false, 'one-shot': true });
        if (i === 0) {
          console.log('1', instanceStats);
        }

        return { memory: instanceStats.memory_stats.usage, memoryMax: instanceStats.memory_stats.max_usage };
      }),
    );
    console.log('stats1', result);
    return result;
  }
}
