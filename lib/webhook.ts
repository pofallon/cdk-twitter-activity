import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda-nodejs'
import * as logs from '@aws-cdk/aws-logs'
import * as events from '@aws-cdk/aws-events'
import * as ssm from '@aws-cdk/aws-ssm'
import * as apigateway from '@aws-cdk/aws-apigatewayv2'
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations'

export interface WebhookProps {
  readonly eventBus: events.IEventBus
}

export class Webhook extends cdk.Construct {

  public webhookUrl: string

  constructor(scope: cdk.Construct, id: string, props: WebhookProps) {
    super(scope, id)

    const handler = new lambda.NodejsFunction(this, 'lambda', {
      environment: {
        'EVENTBUS_NAME': props.eventBus.eventBusName,
        'EVENT_SOURCE': cdk.Aws.STACK_NAME
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
      timeout: cdk.Duration.seconds(60)
    })

    events.EventBus.grantAllPutEvents(handler.role!)

    const parameter = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'ConsumerSecretParameter', {
      parameterName: '/twitter/consumer_api_secret_key',
      version: 1
    })
    parameter.grantRead(handler.role!)

    const httpApi = new apigateway.HttpApi(this, 'HttpApi', {
      defaultIntegration: new LambdaProxyIntegration({ handler }),
      createDefaultStage: true
    })

    this.webhookUrl = httpApi.url!

  }
}