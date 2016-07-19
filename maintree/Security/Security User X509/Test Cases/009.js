/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Activate a session using an invalid certificate */

Test.Execute( { Debug: true, Procedure: function() {
    addLog( "Make sure UserX509 certificate is trusted. See setting '/Advanced/Certificates/UserCertificate_Invalid" );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    if( !Test.Session.Execute() ) return( false );
    if( ActivateSessionHelper.Execute( {  Session: Test.Session,
                                          UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                                              Session: Test.Session,
                                              UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
                                              CertificateSetting: UserCertificateSetting.Invalid } ),
                                          UserTokenSignature: UaSignatureData.New( { 
                                              Session: Test.Session,
                                              RequestedSecurityPolicyUri: _endpoint_userx509.SecurityPolicyUri,
                                              CertificateSetting: UserCertificateSetting.Invalid } ),
                                          ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadIdentityTokenRejected ) } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session.Session,
                                      ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSessionNotActivated ) } );
    }
    else CloseSessionHelper.Execute( { Session: Test.Session } );
    return( true );
} } );