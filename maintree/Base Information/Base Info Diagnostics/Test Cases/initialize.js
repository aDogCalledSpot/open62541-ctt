include( "./library/Base/safeInvoke.js" );
include( "./library/Information/_Base/NodeContainsSubStructure.js" );
include( "./library/Information/_Base/InformationModelObjectHelper.js" );
include( "./library/ServiceBased/Helpers.js" );

const CU_NAME = "\n\n\n***** CONFORMANCE UNIT 'Base Info Diagnostics' TESTING ";

var _diagsNode = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics ) )[0];
var _currSessionCountNode  = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_ServerDiagnosticsSummary_CurrentSessionCount ) )[0];
var _currSubsCountNode     = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_ServerDiagnosticsSummary_CurrentSubscriptionCount ) )[0];
var _cumulSessionCountNode = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_ServerDiagnosticsSummary_CumulatedSessionCount ) )[0];
var _cumulSubsCountNode    = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_ServerDiagnosticsSummary_CumulatedSubscriptionCount ) )[0];
var _sessionsSummaryNode   = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_SessionsDiagnosticsSummary ) )[0];
var _samplingIntArrayNode  = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_SamplingIntervalDiagnosticsArray ) )[0];
var _subDiagsArrayNode     = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_SubscriptionDiagnosticsArray ) )[0];
var _enabledFlagNode       = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_EnabledFlag ) )[0];
var _enabledDiagnosticsSet = false;

if( !Test.Connect() ) {
    addError( "Unable to connect to Server. Check settings." );
    stopCurrentUnit();
}	
else {
    // make sure each test is correctly reset
    Test.PostTestFunctions[0] = endOfTestCleanup;
    // try reading the EnabledFlag and if NOT set, try to SET it; if fails, then skip tests
    if( ReadHelper.Execute( { NodesToRead: _enabledFlagNode } ) ) {
        // if value is FALSE then try to write TRUE
        if( false === _enabledFlagNode.Value.Value.toBoolean() ) {
            print( "Enabling Diagnostics in the Server." );
            _enabledFlagNode.Value.Value.setBoolean( true );
            if( !WriteHelper.Execute( { NodesToWrite: _enabledFlagNode, ReadVerification: false } ) ) {
                addError( "Diagnostics.EnabledFlag cannot be written to. Diagnostics cannot be activated. Please activate manually and re-run these tests. Aborting conformance unit." );
                stopCurrentUnit();
            }
            else _enabledDiagnosticsSet = true;
        }
        else {
            addLog( "Diagnostics.EnabledFlag is already set to: " + _enabledFlagNode.Value.Value.toBoolean() );
            _enabledDiagnosticsSet = true;
        }
    }
    else stopCurrentUnit();
}

function endOfTestCleanup() {
    PublishHelper.Clear();
}

print( CU_NAME + " BEGINS ******\n" );