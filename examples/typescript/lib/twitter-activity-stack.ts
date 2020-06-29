import * as cdk from '@aws-cdk/core';
import * as activity from '../../../lib/index'

export class TwitterActivityStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // tslint:disable-next-line: no-unused-expression
    new activity.EventSource(this, 'ActivityEventSource')

  }
}
