/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Creates a Subscription (default parameters);
        Call CreateMonitoredItems passing in all configured Static Scalar nodes.
        In a loop:
            (1) Change the monitoringMode = SAMPLING
            (2) Change the monitoringMode = REPORTING
            (3) Change the monitoringMode = DISABLED
            (4) REPEAT
        Finally, DeleteMonitoredItems and also the Subscription and closes the connection.

    Settings used:
        /Server Test/NodeIds/Static/All Profiles/Scalar

    Revision History
        04-Jan-2010 NP: Initial version.
*/

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/SetMonitoringMode.js" );

// this is the function that will be called repetitvely
function setMonitoringModeToggle()
{
    // change the value of the currentMode parameter
    switch( currentMonitoringMode )
    {
        case MonitoringMode.Disabled:  currentMonitoringMode = MonitoringMode.Sampling; break;
        case MonitoringMode.Sampling:  currentMonitoringMode = MonitoringMode.Reporting; break;
        case MonitoringMode.Reporting: currentMonitoringMode = MonitoringMode.Disabled; break;
    }
    // invoke the call to change the monitoringMode
    SetMonitoringHelper.Execute( currentMonitoringMode, originalScalarItems, testSubscription );
}

function initialize()
{
    createSubscriptionResult = CreateSubscriptionHelper.Execute( { Subscription: testSubscription } );
    if( !createSubscriptionResult )
    {
        return;
    }
    if( !CreateMonitoredItemsHelper.Execute( { ItemsToCreate: originalScalarItems, TimestampsToReturn: TimestampsToReturn.Both, SubscriptionId: testSubscription } ) )
    {
        return;
    }
    SetMonitoringHelper = new SetMonitoringModeService( Test.Session.Session );
}

function disconnectOverride()
{
    DeleteMonitoredItemsHelper.Execute( { ItemsToDelete: originalScalarItems, SubscriptionId: testSubscription } );
    DeleteSubscriptionsHelper.Execute( { SubscriptionIds: testSubscription } );
    disconnect( g_channel, Test.Session.Session );
}

// Get a list of items to read from settings
var originalScalarItems = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings );
if( originalScalarItems === null || originalScalarItems.length === 0 ){ return; }

// Setup our monitoringMode value 
var currentMonitoringMode = MonitoringMode.Disabled;

// Set all items to be mode=Disabled
for( var i=0; i<originalScalarItems.length; i++ )
{
    originalScalarItems[i].MonitoringMode = currentMonitoringMode;
}

// Create our Subscription 
var testSubscription = new Subscription();
var createSubscriptionResult;

// Create service call helper(s)
var SetMonitoringHelper;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/MonitoredItemServicesCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initialize, setMonitoringModeToggle, loopCount, undefined, disconnectOverride );

// clean-up
originalScalarItems = null;
SetMonitoringHelper = null;