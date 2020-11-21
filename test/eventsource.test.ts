import { expect as expectCDK, haveResource } from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as activity from '../lib/index'

test('EventSource Created', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack")
  // WHEN
  // tslint:disable-next-line: no-unused-expression
  new activity.EventSource(stack, 'TestEventSource')
  // THEN
  expectCDK(stack).to(haveResource("AWS::Events::EventBus"))
})