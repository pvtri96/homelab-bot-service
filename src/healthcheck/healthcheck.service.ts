import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Fs from 'node:fs';
import * as Path from 'node:path';
import { DockerContainerInstanceStats } from '../docker/docker.interface';

@Injectable()
export class HealthcheckService {
  logger = new Logger(HealthcheckService.name);
  config: HealthcheckConfig;
  constructor(private configService: ConfigService) {
    this.config = this.getConfig();
  }

  public async initiateChecks() {
    const apiKey = this.configService.get('HEALTHCHECK_API_KEY');
    if (!apiKey) {
      this.logger.log('No HEALTHCHECK_API_KEY found! Skip initialization step.');
      return;
    }
    const checks = await this.getChecks(apiKey);
    const missingChecks: string[] = [];
    for (const service of Object.keys(this.config.services)) {
      const check = checks.find((check) => check.name === service);
      if (!check) {
        missingChecks.push(service);
      }
    }

    for (const checkName of missingChecks) {
      this.logger.log(`Check for "${checkName}" not found, creating one.`);
      await this.createCheck(apiKey, checkName);
    }

    const orphanChecks: string[] = [];
    for (const check of checks) {
      if (!this.config.services[check.name]) {
        orphanChecks.push(check.update_url);
      }
    }

    for (const url of orphanChecks) {
      this.logger.log(`Check "${url}" is no longer listed, removing it.`);
      await this.removeCheck(apiKey, url);
    }
  }

  private async getChecks(apiKey: string) {
    const response: { checks: Check[] } = await fetch(`https://healthchecks.io/api/v2/checks/`, {
      headers: { 'X-Api-Key': apiKey },
    }).then((res) => res.json());
    return response.checks;
  }

  private async createCheck(apiKey: string, name: string) {
    await fetch(`https://healthchecks.io/api/v2/checks/`, {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: JSON.stringify({ name, schedule: '0 * * * *' }),
    }).then((res) => res.json());
  }

  private async removeCheck(apiKey: string, url: string) {
    await fetch(url, { method: 'DELETE', headers: { 'X-Api-Key': apiKey } }).then((res) => res.json());
  }

  public async check(stats: DockerContainerInstanceStats) {
    const url = `${this.config.baseUrl}/${this.config.pingKey}`;

    for (const stat of stats) {
      if (!this.config.services[stat.name]) {
        continue;
      }
      this.logger.log(`Sending healthcheck signal for "${stat.name}"`);

      await fetch(`${url}/${stat.name}`, {
        method: 'POST',
        body: `CPU usage: ${stat.cpuUsage}\nMemory usage: ${stat.memory.percentage}`,
      });
    }
  }

  private getConfig(): HealthcheckConfig {
    const healthCheckPathEnv = this.configService.get('HEALTHCHECK_CONFIG_PATH');
    if (!healthCheckPathEnv) {
      return;
    }
    const healthCheckPath = Path.join(healthCheckPathEnv);
    if (!Fs.existsSync(healthCheckPath)) {
      throw new Error(`File "${healthCheckPath}" not found! Given HEALTHCHECK_CONFIG_PATH=${healthCheckPathEnv}`);
    }
    return JSON.parse(Fs.readFileSync(healthCheckPath, { encoding: 'utf-8' }));
  }
}

interface HealthcheckConfig {
  baseUrl: string;
  pingKey: string;
  services: {
    [key: string]: {
      url: string;
    };
  };
}

interface Check {
  name: string;
  slug: string;
  desc: string;
  grace: number;
  status: 'new' | 'up' | 'grace' | 'down' | 'paused';
  update_url: string;
}
