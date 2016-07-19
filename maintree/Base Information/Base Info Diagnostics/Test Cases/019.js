/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Sessions are added to SessionsDiagnosticsSummary. */

Test.Execute( { Procedure: function test() { 
    // get a baseline of the number of sessions currently in the diagnostics
    _sessionsSummaryNode.BrowseDirection = BrowseDirection.Forward;
    _sessionsSummaryNode.ReferenceTypeId = new UaNodeId( Identifier.HasComponent );
    if( BrowseHelper.Execute( { NodesToBrowse: _sessionsSummaryNode } ) ) {
        var initialSessionCount = BrowseHelper.Response.Results[0].References.length;


        // create another session and read the number of session in the diagnostics
        var session2 = new CreateSessionService( { Channel: Test.Channel } );
        if( session2.Execute() ) {
            if( ActivateSessionHelper.Execute( { Session: session2 } ) ) {

                // count the sessions in diags now (should be +1)
                BrowseHelper.Execute( { NodesToBrowse: _sessionsSummaryNode } );
                Assert.Equal( 1 + initialSessionCount, BrowseHelper.Response.Results[0].References.length, "Expected the # of sessions to increment by one" );

                // close the new session and read again
                CloseSessionHelper.Execute( { Session: session2 } );
                BrowseHelper.Execute( { NodesToBrowse: _sessionsSummaryNode } );
                Assert.Equal( initialSessionCount, BrowseHelper.Response.Results[0].References.length, "Expected the # of sessions to decrement by one" );

                // in a loop of 5, create sessions and check the diagnostics
                var sessions = [];
                for( var t=0; t<5; t++ ) {
                    sessions[t] = new CreateSessionService( { Channel: Test.Channel } );
                    if( sessions[t].Execute() ) {
                        if( ActivateSessionHelper.Execute( { Session: sessions[t] } ) ) {
                            // count the sessions in diags now (should be +1)
                            BrowseHelper.Execute( { NodesToBrowse: _sessionsSummaryNode } );
                            Assert.Equal( ( 1 + t ) + initialSessionCount, BrowseHelper.Response.Results[0].References.length, "Expected the # of sessions to increment with each new session added", "# of sessions in diagnostics grew to: "+ BrowseHelper.Response.Results[0].References.length );
                        }
                    }
                    else break;
                }//for t...
                for( var s=0; s<sessions.length; s++ ) CloseSessionHelper.Execute( { Session: sessions[s] } );
            }
        }
    }
    return( true );
} } );