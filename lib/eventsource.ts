import * as cdk from '@aws-cdk/core'
import * as events from '@aws-cdk/aws-events'
import { Webhook } from './webhook'
import { Subscription } from './subscription'

export class EventSource extends cdk.Construct {

  public eventBus: events.IEventBus

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id)

    this.eventBus = new events.EventBus(this, 'EventBus', {
      eventBusName: 'twitter-activity'
    })

    const webhook = new Webhook(this, 'Webhook', { eventBus: this.eventBus })

    // tslint:disable-next-line:no-unused-expression
    new Subscription(this, 'Subscription', {
      webhookUrl: webhook.webhookUrl
    })

  }

}