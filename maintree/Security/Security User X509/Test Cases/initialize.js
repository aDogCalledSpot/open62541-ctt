const CU_NAME = "Security User X509";

var _endpoint_userx509 = null;


include( "./library/ServiceBased/Helpers.js" );


// check the x509 user policy exists at the server
function x509policyExists() {
    for( var e=0; e<gServerCapabilities.Endpoints.length; e++ ) {    // iterate thru each endpoint (currently cached)
        var uaed = UaEndpointDescription.FindTokenType( { Endpoint: gServerCapabilities.Endpoints[e], TokenType: UserTokenType.Certificate } );
        if( uaed !== null ) {
            _endpoint_userx509 = uaed;
            return( true );
        }
    }//for e..
    addSkipped( "No X509 User policy found in the the Server's list of endpoints." );
    return( false );
}


// make sure the settings are good
if( !Assert.GreaterThan( 0, Settings.Advanced.Certificates.User.length, "UserX509 setting '/Advanced/Certificates/User' is not configured" ) ) stopCurrentUnit();
else {
    // Connect to the server
    if( !Test.Connect( { SkipCreateSession: true } ) || !x509policyExists() ) stopCurrentUnit();

    print( "\n\n\n***** CONFORMANCE UNIT '" + CU_NAME + "' INITIALIZATION COMPLETE - TESTS STARTING ******\n" );
}