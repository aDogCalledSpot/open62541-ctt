/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Connect using a Revoked certificate. */

Test.Execute( { Procedure: function test() {
    if( epSecureEncrypt === null ) { 
        addSkipped( "A secure channel is not available." ); 
        return( false ); 
    }
    var result = true;
    if( !Test.Connect( { OpenSecureChannel: {
                                RequestedSecurityPolicyUri: SecurityPolicy.policyFromString( epSecureEncrypt.SecurityPolicyUri ),
                                MessageSecurityMode: epSecureEncrypt.SecurityMode, 
                                ClientCertificate: readSetting( "/Advanced/Certificates/ClientCertificate_Revoked" ).toString(),
                                ClientCertificatePrivateKey: readSetting( "/Advanced/Certificates/ClientCertificate_RevokedPrivateKey" ).toString(),
                                ServiceResult: new ExpectedAndAcceptedResults( StatusCode.BadCertificateRevoked ) },
                         SkipCreateSession: true } ) ) {
         Test.Disconnect( { SkipCloseSession: true } );
         result = false;
    }
    return( result );
} } );