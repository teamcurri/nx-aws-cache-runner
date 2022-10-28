/* eslint-disable sort-keys-fix/sort-keys-fix */
import { TaskStatus } from '@nrwl/workspace/src/tasks-runner/tasks-runner'
import defaultTaskRunner from '@nrwl/workspace/tasks-runners/default'
import { config as dotEnvConfig } from 'dotenv'
import { from, Observable, Subject } from 'rxjs'

import { AwsCache, AwsNxCacheOptions } from './aws-cache'
import { Logger } from './logger'
import { MessageReporter } from './message-reporter'

dotEnvConfig()

function getOptions(options: AwsNxCacheOptions) {
  return {
    awsAccessKeyId: process.env.NX_AWS_ACCESS_KEY_ID ?? options.awsAccessKeyId,
    awsSecretAccessKey:
      process.env.NX_AWS_SECRET_ACCESS_KEY ?? options.awsSecretAccessKey,

    awsBucket: process.env.NX_AWS_BUCKET ?? options.awsBucket,
    awsRegion: process.env.NX_AWS_REGION ?? options.awsRegion,
    awsProfile: process.env.NX_AWS_PROFILE ?? options.awsProfile,
    awsEndpoint: process.env.NX_AWS_ENDPOINT ?? options.awsEndpoint,
  }
}

export const tasksRunner = (
  tasks: Parameters<typeof defaultTaskRunner>[0],
  options: Parameters<typeof defaultTaskRunner>[1] & AwsNxCacheOptions,
  context: Parameters<typeof defaultTaskRunner>[2]
) => {
  const awsOptions: AwsNxCacheOptions = getOptions(options)
  const logger = new Logger()

  try {
    if (process.env.NX_AWS_DISABLE === 'true') {
      logger.note('Using Local Cache (NX_AWS_DISABLE is set to true)')

      return defaultTaskRunner(tasks, options, context)
    }

    logger.note('Using AWS S3 Remote Cache')

    const messages = new MessageReporter(logger)
    const remoteCache = new AwsCache(awsOptions, messages)
    const runnerWrapper = new Subject<{ [id: string]: TaskStatus }>()
    const runner = defaultTaskRunner(
      tasks,
      {
        ...options,
        remoteCache,
      },
      context
    ) as Observable<{ [id: string]: TaskStatus }>

    from(runner).subscribe({
      next(value) {
        return runnerWrapper.next(value)
      },
      error(err) {
        return runnerWrapper.error(err)
      },
      async complete() {
        await remoteCache.waitForStoreRequestsToComplete()
        messages.printMessages()
        runnerWrapper.complete()
      },
    })

    return runnerWrapper.toPromise()
  } catch (err) {
    logger.warn((err as Error).message)
    logger.note('Using Local Cache')

    return defaultTaskRunner(tasks, options, context)
  }
}

export default tasksRunner
