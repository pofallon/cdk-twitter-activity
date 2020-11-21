import * as cr from '@aws-cdk/custom-resources'
import * as cfn  from '@aws-cdk/aws-cloudformation'
import * as lambda from '@aws-cdk/aws-lambda-nodejs'
import * as logs from '@aws-cdk/aws-logs'
import * as ssm from '@aws-cdk/aws-ssm'
import * as cdk from '@aws-cdk/core'

export interface SubscriptionProps {
  readonly webhookUrl: string,
  readonly environmentName?: string
}

export class Subscription extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: SubscriptionProps) {
    super(scope, id)

    const webhookUrl = props.webhookUrl

    const onEvent = new lambda.NodejsFunction(this, 'lambda', {
      environment: {
        'ENVIRONMENT_NAME': props.environmentName || 'test'
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      timeout: cdk.Duration.seconds(60)
    })

    ssm.StringParameter.fromSecureStringParameterAttributes(this, 'CredentialParameters', {
      parameterName: '/twitter/*',
      version: 1
    }).grantRead(onEvent.role!)

    const provider = new cr.Provider(this, 'SubscriptionProvider', {
      onEventHandler: onEvent,
      logRetention: logs.RetentionDays.ONE_DAY
    })

    // tslint:disable-next-line:no-unused-expression
    new cfn.CustomResource(this, 'SubscriptionResource', { provider, properties: { webhookUrl } })

  }
}
