/*    Test 5.7.1-Err-10 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the View request parameter is set to a non-empty ViewDescription
            And the ViewDescription.ViewId is an existent node
            And the ViewDescription.ViewId is not the node ID of a view
          When Browse is called
          Then the server returns an operation result of BadViewIdUnknown */

include( "./library/ServiceBased/ViewServiceSet/Browse/invalid_view_test.js" );

function Test571Err10() {
    var nodeId = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has Inverse And Forward References" ).toString() );
    if( nodeId === undefined || nodeId === null ) {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting ''." );
        return( false );
    }
    TestBrowseNodeWithInvalidView( nodeId, nodeId, 0, Test.Session.Session );
    TestBrowseNodeWithInvalidView( nodeId, nodeId, 0x3ff, Test.Session.Session );
    return( true );
}

Test.Execute( { Procedure: Test571Err10 } );