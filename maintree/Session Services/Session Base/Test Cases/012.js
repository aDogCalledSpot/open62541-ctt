/*  Test prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description: Open the max # of sessions the server supports */

Test.Execute( { Procedure: function test() {
    var maxSessions = Settings.ServerTest.Capabilities.MaxSupportedSessions == 0 ? 1000 : Settings.ServerTest.Capabilities.MaxSupportedSessions;
    var sessions = [];
    for( var i=0; i<maxSessions; i++ ) {
        var session = new CreateSessionService( { Channel: Test.Channel } );
        if( session.Execute() ) {
            if( ActivateSessionHelper.Execute( { Session: session } ) ) sessions.push( session );
            else break;
        }
        else break;
    }//for i...

    addLog( "Max Supported Sessions #" + maxSessions );
    Assert.Equal( maxSessions, sessions.length, "Server unable to open as many sessions as claimed. Please check Setting /Capabilities/Max Supported Sessions" );

    for( var i=0; i<sessions.length; i++ ) CloseSessionHelper.Execute( { Session: sessions[i] } );

    return( true );
} } );