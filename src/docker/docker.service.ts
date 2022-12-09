import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Dockerode from 'dockerode';
import * as SI from 'systeminformation';
import * as Docker from 'dockerode';
import * as Fs from 'node:fs';
import * as Path from 'node:path';
import { FormatterService } from '../formatter/formatter.service';

@Injectable()
export class DockerService {
  private instance: Docker;
  constructor(private configService: ConfigService, private formatterService: FormatterService) {
    this.instance = new Docker({
      host: configService.getOrThrow('TARGET_DOCKER_HOST'),
      port: configService.getOrThrow('TARGET_DOCKER_PORT'),
    });
  }

  public async stats() {
    const containers = await this.instance.listContainers();
    const result = await Promise.all(
      containers.map(async (c) => {
        const container = await this.instance.getContainer(c.Id);
        const instanceStats = await container.stats({ stream: false });

        return {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          id: instanceStats.id,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          name: instanceStats.name.replace('/', ''),
          memory: {
            usage: this.formatterService.formatByte(instanceStats.memory_stats.usage, false),
            limit: this.formatterService.formatByte(instanceStats.memory_stats.limit),
            percentage: this.formatterService.formatPercentage(
              instanceStats.memory_stats.usage,
              instanceStats.memory_stats.limit,
            ),
          },
          cpuUsage: this.formatterService.formatPercentage(
            this.getCpuDelta(instanceStats),
            this.getSystemDelta(instanceStats),
          ),
          raw: instanceStats,
        };
      }),
    );

    const raw = result.map((res) => res.raw);
    Fs.writeFileSync(Path.join(process.cwd(), 'dist', 'stats.json'), JSON.stringify(raw));
    return result;
  }

  public getCpuDelta(stat: Dockerode.ContainerStats) {
    return stat.cpu_stats.cpu_usage.total_usage - stat.precpu_stats.cpu_usage.total_usage;
  }

  public getSystemDelta(stat: Dockerode.ContainerStats) {
    return stat.cpu_stats.system_cpu_usage - stat.precpu_stats.system_cpu_usage;
  }

  public async temperature() {
    const temperature = await SI.cpuTemperature();

    console.log('temp 2', temperature);
    if (!temperature.main) {
      return 'Unknown';
    }
    return temperature.main + '°C';
  }
}
