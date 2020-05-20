import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as events from '@aws-cdk/aws-events'
import * as ssm from '@aws-cdk/aws-ssm'
import * as apigateway from '@aws-cdk/aws-apigatewayv2'
import * as path from 'path'

export interface WebhookProps {
  readonly eventBus: events.IEventBus
}

export class Webhook extends cdk.Construct {

  public webhookUrl: string

  constructor(scope: cdk.Construct, id: string, props: WebhookProps) {
    super(scope, id)

    const handler = new lambda.Function(this, 'WebhookLambda', {
      logRetention: 7,
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      environment: {
        EVENTBUS_NAME: props.eventBus.eventBusName,
        EVENT_SOURCE: cdk.Aws.STACK_NAME
      },
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/webhook-lambda'))
    })
    events.EventBus.grantPutEvents(handler.role!)

    const parameter = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'ConsumerSecretParameter', {
      parameterName: '/twitter/consumer_api_secret_key',
      version: 1
    })
    parameter.grantRead(handler.role!)

    const httpApi = new apigateway.HttpApi(this, 'HttpApi', {
      defaultIntegration: new apigateway.LambdaProxyIntegration({ handler }),
      createDefaultStage: true
    })

    this.webhookUrl = httpApi.url!

  }
}