#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { TwitterActivityStack } from '../lib/twitter-activity-stack'

const app = new cdk.App()

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
new TwitterActivityStack(app, 'TwitterActivity')