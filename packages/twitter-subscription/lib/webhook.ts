import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ssm from '@aws-cdk/aws-ssm';
import * as path from 'path';

const defaultProps = {
  secretParameterName: 'consumer_secret',
}

export interface WebhookProps {
  secretParameterName?: string
  resource: apigateway.IResource
}

export class Webhook extends cdk.Construct {

  resource: apigateway.IResource

  constructor(scope: cdk.Construct, id: string, props: WebhookProps) {
    super(scope, id)

    const properties = Object.assign({}, defaultProps, props)
    this.resource = props.resource

    const crcLambda = new lambda.Function(this, 'CrcLambda', {
      logRetention: 7,
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: { 'SECRET_PARAMETER_NAME': properties.secretParameterName },
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../crc-lambda'))
    })
    const parameter = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'secretParameter', {
      parameterName: properties.secretParameterName,
      version: 1
    })
    parameter.grantRead(crcLambda.role!)

    const webhookIntegration = new apigateway.LambdaIntegration(crcLambda, {})
    props.resource.addMethod('GET', webhookIntegration, {
      requestParameters: { 'method.request.querystring.crc_token': true },
      methodResponses: [ { statusCode: '200' } ]
    })

  }
}