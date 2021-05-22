import { expect as expectCDK, haveResource } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as activity from '../lib/index'

test('EventSource Created', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack")
  // WHEN
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  new activity.EventSource(stack, 'TestEventSource')
  // THEN
  expectCDK(stack).to(haveResource("AWS::Events::EventBus"))
})