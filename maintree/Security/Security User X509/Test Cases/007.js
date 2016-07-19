/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Activate a session using an application instance certificate in place of a user certificate */

Test.Execute( { Debug: true, Procedure: function() {
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    if( !Test.Session.Execute() ) return( false );
    if( ActivateSessionHelper.Execute( {  Session: Test.Session,
                                          UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                                              Session: Test.Session,
                                              UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
                                              CertificateSetting: UserCertificateSetting.ApplicationInstanceCertificate } ),
                                          UserTokenSignature: UaSignatureData.New( { 
                                              Session: Test.Session,
                                              RequestedSecurityPolicyUri: _endpoint_userx509.SecurityPolicyUri,
                                              CertificateSetting: UserCertificateSetting.ApplicationInstanceCertificate } ),
                                          ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadIdentityTokenInvalid, StatusCode.BadIdentityTokenRejected, StatusCode.BadSecurityChecksFailed ] ) } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session.Session,
                                      ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSessionNotActivated ) } );
    }
    else CloseSessionHelper.Execute( { Session: Test.Session } );
    return( true );
} } );