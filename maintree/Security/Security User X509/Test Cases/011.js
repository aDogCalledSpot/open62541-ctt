/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Activate a session using an issued X509 user certificate that is TRUSTED. */

Test.Execute( { Debug: true, Procedure: function() {
    addLog( "Make sure UserX509 certificate is trusted. See setting '/Advanced/Certificates/UserCertificate_Issued'" );
    Test.Session = new CreateSessionService( { Channel: Test.Channel } );
    if( !Test.Session.Execute() ) return( false );
    if( ActivateSessionHelper.Execute( {  Session: Test.Session,
                                          UserIdentityToken: UaUserIdentityToken.FromUserCredentials( {
                                              Session: Test.Session,
                                              UserCredentials: new UserCredentials( { Policy: UserTokenType.Certificate } ),
                                              CertificateSetting: UserCertificateSetting.Issued } ),
                                          UserTokenSignature: UaSignatureData.New( { 
                                              Session: Test.Session,
                                              RequestedSecurityPolicyUri: _endpoint_userx509.SecurityPolicyUri,
                                              CertificateSetting: UserCertificateSetting.Issued } ),
                                          ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ) } ) ) {
        CloseSessionHelper.Execute( { Session: Test.Session.Session } );
    }
    else CloseSessionHelper.Execute( { Session: Test.Session } );
    return( true );
} } );