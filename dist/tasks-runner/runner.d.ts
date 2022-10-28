import defaultTaskRunner from '@nrwl/workspace/tasks-runners/default';
import { AwsNxCacheOptions } from './aws-cache';
export declare const tasksRunner: (tasks: Parameters<typeof defaultTaskRunner>[0], options: Parameters<typeof defaultTaskRunner>[1] & AwsNxCacheOptions, context: Parameters<typeof defaultTaskRunner>[2]) => any;
export default tasksRunner;
//# sourceMappingURL=runner.d.ts.map