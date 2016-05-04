/*  Test prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a subscription (no monitored items) with a requestedPublishingInterval of 1000 and a requestedMaxKeepAliveCount of 5.
        call Publish(). call Publish() again. */

function createSubscription5101025() {
    var subscription = new Subscription2( {
            PublishingInterval:1000,
            RequestedMaxKeepAliveCount:5 } );
    if( CreateSubscriptionHelper.Execute( { Subscription: subscription } ) )
    {
        // test #1
        PublishHelper.Execute( { FirstPublish: true } );

        // test #1 expectations state: publish #1 is a keepalive and sequenceNumber=1
        Assert.False( PublishHelper.CurrentlyContainsData(), "Expected a KeepAlive only. We have not added any monitored items to the subscription!" );
        Assert.Equal( subscription.SubscriptionId, PublishHelper.Response.SubscriptionId, "Received Publish response in relation to an unexpected Subscription." );
        Assert.Equal( 1, PublishHelper.Response.NotificationMessage.SequenceNumber, "The first sequence number should always be 1." );


        // test #2
        PublishHelper.Execute();

        // test #2 expectations state: publish #1 is a keepalive and sequenceNumber=1
        Assert.False( PublishHelper.CurrentlyContainsData(), "Expected a KeepAlive only. We have not added any monitored items to the subscription!" );
        Assert.Equal( subscription.SubscriptionId, PublishHelper.Response.SubscriptionId, "Received Publish response in relation to an unexpected Subscription." );
        Assert.Equal( 1, PublishHelper.Response.NotificationMessage.SequenceNumber, "The first sequence number should always be 1." );
    }
    // Since we need to call deleteSubscriptions anyway, let's just use it to
    // validate if the subscription expired or not (i.e., the operation result
    // should be BadSubscriptionIdInvalid if the subscription expired before
    // its expected lifetime).
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: subscription } );
    return( true );
}

Test.Execute( { Procedure: createSubscription5101025 } );