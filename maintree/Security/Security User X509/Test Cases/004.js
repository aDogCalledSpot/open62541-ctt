/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Activate a session using not-yet-valid X509 user certificate. */

Test.Execute( { Debug: true, Procedure: function() {
    addLog( "Make sure UserX509 certificate is TRUSTED. See setting '/Advanced/Certificates/UserCertificate_NotYetValid'" );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    if( !Test.Session.Execute() ) return( false );
    if( ActivateSessionHelper.Execute( {  Session: Test.Session,
                                          UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                                              Session: Test.Session,
                                              UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
                                              CertificateSetting: UserCertificateSetting.NotYetValid } ),
                                          UserTokenSignature: UaSignatureData.New( { 
                                              Session: Test.Session,
                                              RequestedSecurityPolicyUri: _endpoint_userx509.SecurityPolicyUri,
                                              CertificateSetting: UserCertificateSetting.NotYetValid } ),
                                          ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.Good, StatusCode.BadIdentityTokenRejected ] ) } ) ){
        if( ActivateSessionHelper.Response.ResponseHeader.ServiceResult.isGood() ) {
            Assert.True( Settings.Advanced.CertificateOverrides.TimeInvalid, "Server accepted a certificate that is not yet valid. This might be correct behavior. Please check the CTT settings /Advanved/CertificateOverrides/DisableCertificateTimeinvalid" );
        }
        CloseSessionHelper.Execute( { Session: Test.Session.Session,
                                      ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSessionNotActivated ) } );
    }
    else CloseSessionHelper.Execute( { Session: Test.Session } );
    return( true );
} } );