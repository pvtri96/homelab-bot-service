import { DockerService } from './docker.service';

export type DockerInstanceStats = Awaited<ReturnType<InstanceType<typeof DockerService>['stats']>>;
