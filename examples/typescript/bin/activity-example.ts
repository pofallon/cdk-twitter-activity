#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { TwitterActivityStack } from '../lib/twitter-activity-stack'

const app = new cdk.App()

// tslint:disable-next-line: no-unused-expression
new TwitterActivityStack(app, 'TwitterActivity')