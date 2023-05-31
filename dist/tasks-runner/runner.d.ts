import { defaultTasksRunner } from '@nx/devkit';
import { AwsNxCacheOptions } from './aws-cache';
export declare const tasksRunner: (tasks: Parameters<typeof defaultTasksRunner>[0], options: Parameters<typeof defaultTasksRunner>[1] & AwsNxCacheOptions, context: Parameters<typeof defaultTasksRunner>[2]) => any;
export default tasksRunner;
//# sourceMappingURL=runner.d.ts.map