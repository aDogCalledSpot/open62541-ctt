/*  Test prepared by Anand Taparia; ataparia@kepware.com
    Description: Script sets monitoring mode to 'Disabled' for an already 'Disabled' monitor item. 
        Calls publish each time to verify that no notifications were received. */

function setMonitoringMode593001() {
    var items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings, 0, undefined, undefined, MonitoringMode.Disabled, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 ) {
        addWarning( "Not enough nodes configured in Static Scalar!" );
        return( false );
    }
    if( !MonitorBasicSubscription.SubscriptionCreated ) {
        addError( "Subscription for Monitor Basic was not created" );
        return( false );
    }

    // Add 1 monitored item (disabled)
    var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
    var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
    Test.Session.Session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

    createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
    createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

    createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
    createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Disabled;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
    createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;
    createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = items[0].NodeId;

    var uaStatus = Test.Session.Session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
    if ( !uaStatus.isGood() ) {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return( false );
    }

    checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );
    print( "Created 1 monitored(disabled) item successfully. Calling publish to verify we do not receive any datachange notification." );

    // wait one publishing cycle before calling publish
    PublishHelper.WaitInterval( { Items: items, Subscription: MonitorBasicSubscription } );

    // call Publish(), we should not receive any notification
    addLog( "Calling Publish() (first call) and initial data collection" );
    PublishHelper.Execute();

    // Make sure we did not receive any datachange notification
    if( Assert.Equal( false, PublishHelper.CurrentlyContainsData(), "NotificationData received (first publish call) when none was expected for the disabled monitored item" ) ) {
        print( "No NotificationData was received as expected. Setting the monitoring mode to 'Disabled' again." );

        // Set the monitoring mode to disabled again
        var setMonitoringModeRequest = new UaSetMonitoringModeRequest ();
        var setMonitoringModeResponse = new UaSetMonitoringModeResponse();
        Test.Session.Session.buildRequestHeader( setMonitoringModeRequest.RequestHeader );

        setMonitoringModeRequest.MonitoringMode = MonitoringMode.Disabled;
        setMonitoringModeRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;    
        setMonitoringModeRequest.MonitoredItemIds[0] = createMonitoredItemsResponse.Results[0].MonitoredItemId;

        uaStatus = Test.Session.Session.setMonitoringMode( setMonitoringModeRequest, setMonitoringModeResponse );        
        if( !uaStatus.isGood() ) {
            addError( "SetMonitoringMode() status " + uaStatus, uaStatus );
        }

        checkSetMonitoringModeValidParameter( setMonitoringModeRequest, setMonitoringModeResponse );
        addLog( "Monitoring mode set to 'Disabled' successfully." );

        // call Publish() again to verify that we still do not receive any notification
        addLog ( "Calling publish again. We should not receive any NotificationData still. Do not acknowledge anything!" );    
        PublishHelper.Execute();

        // Make sure we did not receive any datachange notification
        Assert.Equal( false, PublishHelper.CurrentlyContainsData(), "NotificationData received (second publish call) when none was expected for the disabled monitored item" );
    }
    // delete the items we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    for( var i = 0; i< createMonitoredItemsResponse.Results.length; i++ ) {
        monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
    }
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: monitoredItemsIdsToDelete, SubscriptionId: MonitorBasicSubscription } );
    return( true );
}// function setMonitoringMode593001() 

Test.Execute( { Procedure: setMonitoringMode593001 } );