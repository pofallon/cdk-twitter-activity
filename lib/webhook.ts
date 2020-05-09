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
  api: apigateway.RestApi
  integration: apigateway.Integration
}

export class Webhook extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: WebhookProps) {
    super(scope, id)

    const properties = Object.assign({}, defaultProps, props)

    const crcLambda = new lambda.Function(this, 'CrcLambda', {
      logRetention: 7,
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: { 'SECRET_PARAMETER_NAME': properties.secretParameterName },
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/crc-lambda'))
    })
    const parameter = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'secretParameter', {
      parameterName: properties.secretParameterName,
      version: 1
    })
    parameter.grantRead(crcLambda.role!)

    const crcIntegration = new apigateway.LambdaIntegration(crcLambda, {})
    props.api.root.addMethod('GET', crcIntegration, {
      requestParameters: { 'method.request.querystring.crc_token': true },
      methodResponses: [ { statusCode: '200' } ]
    })

    const authLambda = new lambda.Function(this, 'AuthLambda', {
      logRetention: 7,
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: { 'SECRET_PARAMETER_NAME': properties.secretParameterName },
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/authorizer-lambda'))
    })
    parameter.grantRead(authLambda.role!)

    const auth = new apigateway.RequestAuthorizer(this, 'webhookAuthorizer', {
      handler: authLambda,
      identitySources: [
        apigateway.IdentitySource.header('X-Twitter-Webhooks-Signature')
      ],
    })

    props.api.root.addMethod('POST', props.integration, { 
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: auth,
      methodResponses: [ { statusCode: '200' } ]
    })

  }
}