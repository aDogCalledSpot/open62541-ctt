/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Check the ServerDiagnostics.EnabledFlag . */

Test.Execute( { Procedure: function test() {
    // first, read the enabledFlag state. We don't care about the value at this point...
    if( ReadHelper.Execute( { NodesToRead: [ _enabledFlagNode, _cumulSessionCountNode ] } ) ) {
        _enabledFlagNode.InitialValue = _enabledFlagNode.Value.Value.clone();
        _cumulSessionCountNode.InitialValue = _cumulSessionCountNode.Value.Value.clone();
        // now invert the value; hopefully this will work; if not then exit gracefully
        UaVariant.Increment( { Value: _enabledFlagNode.Value.Value } );
        if( WriteHelper.Execute( { NodesToWrite: _enabledFlagNode, OperationResults: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadUserAccessDenied, StatusCode.BadNotWritable ] ) } ) ) {
            if( WriteHelper.Response.Results[0].isGood() ) {

                // toggle the value again
                UaVariant.Increment( { Value: _enabledFlagNode.Value.Value } );
                WriteHelper.Execute( { NodesToWrite: _enabledFlagNode } );

                // get the value of the diags
                ReadHelper.Execute( { NodesToRead: [ _enabledFlagNode, _cumulSessionCountNode ] } );
                _enabledFlagNode.InitialValue = _enabledFlagNode.Value.Value.clone();
                _cumulSessionCountNode.InitialValue = _cumulSessionCountNode.Value.Value.clone();



                // close the session and create a new one.
                CloseSessionHelper.Execute( { Session: Test.Session } );
                Test.Session = new CreateSessionService( { Channel: Test.Channel } );
                Test.Session.Execute();
                ActivateSessionHelper.Execute( Test.Session );
                InstanciateHelpers( { Session: Test.Session.Session, DiscoverySession: Test.DiscoverySession } );

                // get the value of the diags
                ReadHelper.Execute( { NodesToRead: [ _enabledFlagNode, _cumulSessionCountNode ] } );
                Assert.GreaterThan( _enabledFlagNode.InitialValue, _enabledFlagNode.Value.Value, "EnabledFlag expected to be 'x'" );
                Assert.GreaterThan( _cumulSessionCountNode.InitialValue, _cumulSessionCountNode.Value.Value, "CumulativeSessionCount expected to have grown" );

            }
            else addSkipped( "Unable to write to the EnabledFlag node. Aborting test." );
        }//write
    }
    return( true );
} } );