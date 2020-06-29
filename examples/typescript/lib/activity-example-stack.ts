import * as cdk from '@aws-cdk/core';
import * as activity from '../../../lib/index'

export class ActivityExampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const source = new activity.EventSource(this, 'ActivityEventSource')

  }
}
