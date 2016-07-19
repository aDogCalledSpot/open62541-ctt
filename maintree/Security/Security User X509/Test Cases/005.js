/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Activate a session using an expired X509 user certificate. */

Test.Execute( { Debug: true, Procedure: function() {
    addLog( "Make sure UserX509 certificate is TRUSTED. See setting '/Advanced/Certificates/UserCertificate_Expired'" );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    if( !Test.Session.Execute() ) return( false );
    if( ActivateSessionHelper.Execute( {  Session: Test.Session,
                                          UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                                              Session: Test.Session,
                                              UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
                                              CertificateSetting: UserCertificateSetting.Expired } ),
                                          UserTokenSignature: UaSignatureData.New( { 
                                              Session: Test.Session,
                                              RequestedSecurityPolicyUri: _endpoint_userx509.SecurityPolicyUri,
                                              CertificateSetting: UserCertificateSetting.Expired } ),
                                          ServiceResult: new ExpectedAndAcceptedResults( [ StatusCode.BadIdentityTokenRejected, StatusCode.Good ] ) } ) ) {
        if( ActivateSessionHelper.Response.ResponseHeader.ServiceResult.isGood() ) {
            Assert.True( Settings.Advanced.CertificateOverrides.TimeInvalid, "Server accepted a certificate that has expired. This might be the correct behavior. Please check the CTT settings /Advanved/CertificateOverrides/DisableCertificateTimeinvalid" );
        }
        CloseSessionHelper.Execute( { Session: Test.Session.Session,
                                      ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadSessionNotActivated ) } );
    }
    return( true );
} } );