/* eslint-disable sort-keys-fix/sort-keys-fix */
import { TaskStatus } from '@nx/workspace/src/tasks-runner/tasks-runner'
import { defaultTasksRunner } from '@nx/devkit'
import { config as dotEnvConfig } from 'dotenv'

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

// Code from https://github.com/bojanbass/nx-aws/blob/master/packages/nx-aws-cache/src/tasks-runner/runner.ts
export const tasksRunner = (
  tasks: Parameters<typeof defaultTasksRunner>[0],
  options: Parameters<typeof defaultTasksRunner>[1] & AwsNxCacheOptions,
  // eslint-disable-next-line no-magic-numbers
  context: Parameters<typeof defaultTasksRunner>[2]
) => {
  const awsOptions: AwsNxCacheOptions = getOptions(options)
  const logger = new Logger()

  try {
    if (process.env.NX_AWS_DISABLE === 'true') {
      logger.note('Using Local Cache (NX_AWS_DISABLE is set to true)')

      return defaultTasksRunner(tasks, options, context)
    }

    logger.note('Using AWS S3 Remote Cache')

    const messages = new MessageReporter(logger)
    const remoteCache = new AwsCache(awsOptions, messages)

    const runner: Promise<{ [id: string]: TaskStatus }> = defaultTasksRunner(
      tasks,
      {
        ...options,
        remoteCache,
      },
      context
    ) as Promise<{ [id: string]: TaskStatus }>

    runner.finally(async () => {
      await remoteCache.waitForStoreRequestsToComplete()
      messages.printMessages()
    })

    return runner
  } catch (err) {
    logger.warn((err as Error).message)
    logger.note('Using Local Cache')

    return defaultTasksRunner(tasks, options, context)
  }
}

export default tasksRunner
