/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Specify a valid/trusted user certificate and server-specified policyId. */

Test.Execute( { Debug: true, Procedure: function() {
    addLog( "Make sure UserX509 certificate is TRUSTED. See setting '/Advanced/Certificates/UserCertificate'" );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    if( !Test.Session.Execute() ) return( false );
    if( ActivateSessionHelper.Execute( {  Session: Test.Session,
                                          UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                                              Session: Test.Session,
                                              UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ) } ),
                                          UserTokenSignature: UaSignatureData.New( { 
                                              Session: Test.Session,
                                              RequestedSecurityPolicyUri: _endpoint_userx509.SecurityPolicyUri } ) } ) ) {
    }
    else CloseSessionHelper.Execute( { Session: Test.Session.Session } );
    return( true );
} } );