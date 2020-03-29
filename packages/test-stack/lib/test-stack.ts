import * as cdk from '@aws-cdk/core'
import * as apigateway from '@aws-cdk/aws-apigateway'
import { Subscription } from '../../twitter-subscription/lib/subscription'


export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'testApi', { })
    const subscription = new Subscription(this, 'testSubscription', { resource: api.root })

  }
}
