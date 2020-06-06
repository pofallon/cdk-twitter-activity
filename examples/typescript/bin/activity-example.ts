#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ActivityExampleStack } from '../lib/activity-example-stack';

const app = new cdk.App();
new ActivityExampleStack(app, 'ActivityExampleStack');
