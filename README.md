# twitter-activity-eventsource-cdk
[AWS CDK](https://aws.amazon.com/cdk/) construct to publish [Twitter activity](https://developer.twitter.com/en/docs/accounts-and-users/subscribe-account-activity/overview) to [AWS EventBridge](https://aws.amazon.com/eventbridge/)

For more detail, see the [wiki](https://github.com/pofallon/twitter-activity-eventsource-cdk/wiki)

## Usage

1.  Visit the [Twitter Developer site](https://developer.twitter.com) and create an App with Consumer API keys as well as an Access token and secret.

1.  Next, create an Account Activity API sandbox for your application (the free tier is fine for this use case).

1.  Store this App's credentials as SecureStrings in [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) under the following names:

    * `/twitter/consumer_api_key` 
    * `/twitter/consumer_api_secret_key`
    * `/twitter/access_token` 
    * `/twitter/access_token_secret`

1.  [Install node.js](https://nodejs.org/en/download/) and create a new CDK stack project with `npx cdk init app --language typescript`.

1.  Install this project as a dependency with `npm install --save twitter-activity-eventsource-cdk`.

1.  Edit the main file for your stack, import this new dependency and create the resource in your stack constructor:

    ```typescript
    import * as activity from 'twitter-activity-eventsource-cdk'
    
    // Inside stack constructor:
    const source = new activity.EventSource(this, 'ActivityEventSource')
    ```

1.  If this is the first time using CDK in your AWS account, run `npx cdk bootstrap` before deploying.

1.  Finally, run `npx cdk deploy` and enjoy!

## To Do

* Write tests! :neutral_face:
