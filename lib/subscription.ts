import * as cr from '@aws-cdk/custom-resources'
import * as cfn  from '@aws-cdk/aws-cloudformation'
import * as lambda from '@aws-cdk/aws-lambda'
import * as ssm from '@aws-cdk/aws-ssm'
import * as cdk from '@aws-cdk/core'
import * as path from 'path'

export interface SubscriptionProps {
  readonly webhookUrl: string,
  readonly environmentName?: string
}

export class Subscription extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: SubscriptionProps) {
    super(scope, id)

    const webhookUrl = props.webhookUrl

    const onEvent = new lambda.Function(this, 'SubscriptionLambda', {
      logRetention: 7,
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(60),
      environment: {
        'ENVIRONMENT_NAME': props.environmentName || 'test'
      },
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-dist/subscription-lambda'))
    })

    ssm.StringParameter.fromSecureStringParameterAttributes(this, 'CredentialParameters', {
      parameterName: '/twitter/*',
      version: 1
    }).grantRead(onEvent.role!)

    const provider = new cr.Provider(this, 'SubscriptionProvider', {
      onEventHandler: onEvent
    })

    // tslint:disable-next-line:no-unused-expression
    new cfn.CustomResource(this, 'SubscriptionResource', { provider, properties: { webhookUrl } })

  }
}
