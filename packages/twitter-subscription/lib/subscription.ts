import * as cr from '@aws-cdk/custom-resources'
import * as cfn  from '@aws-cdk/aws-cloudformation'
import * as lambda from '@aws-cdk/aws-lambda'
import * as ssm from '@aws-cdk/aws-ssm'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as cdk from '@aws-cdk/core'
import * as path from 'path'
import { Webhook } from './webhook'
import { Duration } from '@aws-cdk/core'

const defaultProps = {
  keyParameterName: 'consumer_key',
  secretParameterName: 'consumer_secret',
  accessTokenName: 'access_token',
  accessTokenSecretName: 'access_token_secret',
  environmentName: 'test'
}

export interface SubscriptionProps {
  resource: apigateway.IResource
  keyParameterName?: string
  secretParameterName?: string
  accessTokenName?: string
  accessTokenSecretName?: string
  environmentName?: string
}

export class Subscription extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: SubscriptionProps) {
    super(scope, id)

    const webhookUrl = props.resource.restApi.urlForPath(props.resource.path)
    const properties = Object.assign({}, defaultProps, props)

    const webhook = new Webhook(this, 'SubscriptionWebhook', {
      secretParameterName: properties.secretParameterName,
      resource: properties.resource
    })

    const onEvent = new lambda.Function(this, 'SubscriptionLambda', {
      logRetention: 7,
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: Duration.seconds(10),
      environment: {
        'KEY_PARAMETER_NAME': properties.keyParameterName,
        'SECRET_PARAMETER_NAME': properties.secretParameterName,
        'ACCESS_TOKEN_NAME': properties.accessTokenName,
        'ACCESS_TOKEN_SECRET_NAME': properties.accessTokenSecretName,
        'ENVIRONMENT_NAME': properties.environmentName
      },
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../subscription-lambda'))
    })

    ssm.StringParameter.fromSecureStringParameterAttributes(this, 'keyParameter', {
      parameterName: properties.keyParameterName,
      version: 1
    }).grantRead(onEvent.role!)

    ssm.StringParameter.fromSecureStringParameterAttributes(this, 'secretParameter', {
      parameterName: properties.secretParameterName,
      version: 1
    }).grantRead(onEvent.role!)

    ssm.StringParameter.fromSecureStringParameterAttributes(this, 'accessToken', {
      parameterName: properties.accessTokenName,
      version: 1
    }).grantRead(onEvent.role!)

    ssm.StringParameter.fromSecureStringParameterAttributes(this, 'accessTokenSecret', {
      parameterName: properties.accessTokenSecretName,
      version: 1
    }).grantRead(onEvent.role!)

    const provider = new cr.Provider(this, 'SubscriptionProvider', {
      onEventHandler: onEvent
    })

    const customResource = new cfn.CustomResource(this, 'Subscription', { provider, properties: { webhookUrl }})
    customResource.node.addDependency(webhook)  // Don't create the subscription until the webhook is ready

  }
}
