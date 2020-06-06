# twitter-activity-cdk
[AWS CDK](https://aws.amazon.com/cdk/) construct to publish [Twitter activity](https://developer.twitter.com/en/docs/accounts-and-users/subscribe-account-activity/overview) to [AWS EventBridge](https://aws.amazon.com/eventbridge/)

For more detail, see the [wiki](https://github.com/pofallon/twitter-activity-cdk/wiki)

## Getting Started

1.  Visit the [Twitter Developer site](https://developer.twitter.com) and create an app with consumer API keys as well as an access token and secret.

1.  Create a Twitter Account Activity API sandbox for your application (the free tier is fine for this use case).

1.  Store this App's credentials as SecureStrings in [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) under the following names:

    * `/twitter/consumer_api_key` 
    * `/twitter/consumer_api_secret_key`
    * `/twitter/access_token` 
    * `/twitter/access_token_secret`

## Usage

See the [examples](examples) directory for TypeScript and C# example stacks that use this construct.

## To Do

* Write tests! :neutral_face:
