/*  Test 3; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description: Attempt to open an insecure channel while providing client certificates, but do not pass a ClientNonce.
    Expectation: Connection is successful.
        IMPORTANT: This script uses the Login Name and Password defined in the CTT Settings. */

function securityNone003() {
    if( epSecureChNone === null ) {
        addSkipped( "An insecure channel is not available." );
        return( false );
    }
    // establish a non-secure connection to the server, while specifying certs and nonces
    var channelOverrides = {
            RequestedSecurityPolicyUri: SecurityPolicy.None,
            MessageSecurityMode: MessageSecurityMode.None,
            ProvideCertificate: true,
            ProvideNonce: true
        };
    if( Assert.True( Test.Connect( { OpenSecureChannel: channelOverrides } ), "Expected SecureChannel." ) ) {
        Test.Disconnect();
    }
    return( true );
}

Test.Execute( { Procedure: securityNone003 } );