import { DockerService } from './docker.service';

export type DockerContainerInstanceStats = Awaited<ReturnType<InstanceType<typeof DockerService>['stats']>>;

export type DockerContainerInstanceState =
  | 'created'
  | 'restarting'
  | 'running'
  | 'removing'
  | 'paused'
  | 'exited'
  | 'dead';
