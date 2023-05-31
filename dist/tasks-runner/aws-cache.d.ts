import { RemoteCache } from '@nx/workspace/src/tasks-runner/default-tasks-runner';
import { MessageReporter } from './message-reporter';
export interface AwsNxCacheOptions {
    awsProfile?: string;
    awsRegion?: string;
    awsBucket?: string;
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    awsEndpoint?: string;
}
export declare class AwsCache implements RemoteCache {
    private messages;
    private readonly bucket;
    private readonly s3;
    private readonly logger;
    private uploadQueue;
    constructor(options: AwsNxCacheOptions, messages: MessageReporter);
    retrieve(hash: string, cacheDirectory: string): Promise<boolean>;
    store(hash: string, cacheDirectory: string): Promise<boolean>;
    waitForStoreRequestsToComplete(): Promise<void>;
    private createAndUploadFile;
    private createTgzFile;
    private extractTgzFile;
    private uploadFile;
    private downloadFile;
    private checkIfCacheExists;
    private createCommitFile;
    private getTgzFileName;
    private getTgzFilePath;
    private getCommitFileName;
}
//# sourceMappingURL=aws-cache.d.ts.map