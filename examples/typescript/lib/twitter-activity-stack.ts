import * as cdk from '@aws-cdk/core';
import * as activity from '../../../lib/index'

export class TwitterActivityStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const eventSource = new activity.EventSource(this, 'ActivityEventSource')

    // Share the ARN of this EventBus so other stacks can leverage it
    // tslint:disable-next-line: no-unused-expression
    new cdk.CfnOutput(this, 'EventBusOutput', {
      description: 'Twitter Activity EventBus ARN',
      exportName: 'twitter-activity-eventbus-arn',
      value: eventSource.eventBus.eventBusArn
    })

  }
}
