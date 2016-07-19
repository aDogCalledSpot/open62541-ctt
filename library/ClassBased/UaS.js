/* Includes: 
    UaSignatureData.New()
    SecurityAlgorithms.getAlgorithms()
    SecurityAlgorithms.getKeyLength()
    UaStatusCode.fromString()
    UaStatusCode.ToHexString()
    UaSubscriptionDiagnosticsDataType.FindSubscription( args )
*/

/* creates the signature that accompanies a user x509 certificate
   parameters:
       - Session: 
       - RequestedSecurityPolicyUri
       - CertificateSetting */
UaSignatureData.New = function( args ) {
    var s = new UaSignatureData()
    if( isDefined( args ) && isDefined( args.Session ) ) {
        // other parameter checks..
        if( !isDefined( args.RequestedSecurityPolicyUri ) ) args.RequestedSecurityPolicyUri = args.Session.Channel.Channel.RequestedSecurityPolicyUri;
        if( isDefined ( args.RequestedSecurityPolicyUri.length ) ) args.RequestedSecurityPolicyUri = SecurityPolicy.policyFromString( args.RequestedSecurityPolicyUri );
        // check if the security policy is #none or empty, if so then it may be defaulting to what is defined in the channel
        if( args.RequestedSecurityPolicyUri == SecurityPolicy.None ) {
            args.RequestedSecurityPolicyUri = args.Session.Session.Channel.RequestedSecurityPolicyUri;
            if( args.RequestedSecurityPolicyUri == SecurityPolicy.None ) addWarning( "UaSignature.New() SecurityPolicy.None detected in requested EndpoinDescription.\nAlso checked the RequestedSecurityPolicy in the SecureChannel and it is also None.\nThis will prevent a UaSiganture from being created properly." );
        }
        if( !isDefined( args.CertificateSetting ) ) args.CertificateSetting = UserCertificateSetting.Trusted;
        // load our pki provider and configure it
        var pkiProvider = new UaPkiUtility();
        pkiProvider.CertificateTrustListLocation = Settings.Advanced.Certificates.TrustListLocation;
        pkiProvider.CertificateRevocationListLocation = Settings.Advanced.Certificates.RevocationListLocation;
        pkiProvider.PkiType = PkiType.OpenSSL;
        // load the users private key
        var userPrivateKey = new UaByteString();
        var result = null;
        print( "SignatureData for '" + UserCertificateSetting.toString( args.CertificateSetting ) + "' requested." );
        switch( args.CertificateSetting ) {
            case UserCertificateSetting.Trusted:     result = pkiProvider.loadPrivateKeyFromFile( Settings.Advanced.Certificates.UserPrivate, userPrivateKey ); break;
            case UserCertificateSetting.Untrusted:   result = pkiProvider.loadPrivateKeyFromFile( Settings.Advanced.Certificates.UserCertNotTrustedPrivateKey,  userPrivateKey ); break;
            case UserCertificateSetting.NotYetValid: result = pkiProvider.loadPrivateKeyFromFile( Settings.Advanced.Certificates.UserCertNotYetValidPrivateKey, userPrivateKey ); break;
            case UserCertificateSetting.Expired:     result = pkiProvider.loadPrivateKeyFromFile( Settings.Advanced.Certificates.UserCertExpiredPrivateKey,     userPrivateKey ); break;
            case UserCertificateSetting.Issued:      result = pkiProvider.loadPrivateKeyFromFile( Settings.Advanced.Certificates.UserCertIssuedPrivateKey,      userPrivateKey ); break;
            case UserCertificateSetting.Revoked:     result = pkiProvider.loadPrivateKeyFromFile( Settings.Advanced.Certificates.UserCertRevokedPrivateKey,     userPrivateKey ); break;
            case UserCertificateSetting.Invalid:     result = pkiProvider.loadPrivateKeyFromFile( Settings.Advanced.Certificates.UserCertInvalidPrivateKey,     userPrivateKey ); break;
            case UserCertificateSetting.ApplicationInstanceCertificate: result = pkiProvider.loadPrivateKeyFromFile( Settings.Advanced.Certificates.PrivateKey, userPrivateKey ); break;
            default: throw( "Invalid UserCertificateSetting value '" + setting + "' in call to UaSignatureData.New()" );
        }

        if( result.isGood() ) {
            // now to create the signature based on the private key
            // first, add the serverCertificate + nonce (if not null)
            var dataToSign = new UaByteString();
            dataToSign.append( args.Session.Channel.Channel.ServerCertificate.clone() );
            if( args.Session.Response.ServerNonce.length > 0 ) dataToSign.append( args.Session.Response.ServerNonce );
            // now to sign
            var cryptoProvider = new UaCryptoProvider( args.RequestedSecurityPolicyUri );
            s.Algorithm = SignatureAlgorithm.signatureAlgorithmToString( SignatureAlgorithm.AlgorithmUri_Signature_RsaSha1 );
            s.Signature.length = cryptoProvider.MaximumAsymmetricKeyLength;
            result = cryptoProvider.asymmetricSign( dataToSign, userPrivateKey, s.Signature );
            // DEBUG DATA
            print( "\n\tRESULT: " + result );
            // END DEBUG
            if( result.isBad() ) throw( "Unable to sign the SignatureData (required for user X509 authentication)" +
                   "\nUaSignatureData.New:\n\tRequestedSecurityPolicyUri: " + args.RequestedSecurityPolicyUri +
                   "\n\tdataToSign (length): " + dataToSign.length + "\n\tuserPrivateKey (length): " + userPrivateKey.length + "\n\tError: " + result );
        } // private key loaded ok?
        else throw( "Unable to load user's privatey key (x509). Error: " + result, result );
    }
    return( s );
}

/* SecurityAlgorithms class.
    Purpose: Query the set of security algorithms used by an OPC UA security policy. */
function SecurityAlgorithms() {
    this.SymmetricSignatureAlgorithm = "";
    this.SymmetricEncryptionAlgorithm = "";
    this.AsymmetricSignatureAlgorithm = "";
    this.AsymmetricKeyWrapAlgorithm= "";
    this.AsymmetricEncryptionAlgorithm = "";
    this.KeyDerivationAlgorithm = "";
}

SecurityAlgorithms.getAlgorithms = function( securityPolicy ) {
    var algorithms = new SecurityAlgorithms();
    switch ( securityPolicy ) {
        case SecurityPolicy.Basic128Rsa15:
            algorithms.SymmetricSignatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
            algorithms.SymmetricEncryptionAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes128-cbc";
            algorithms.AsymmetricSignatureAlgorithm = SignatureAlgorithm.signatureAlgorithmToString( SignatureAlgorithm.AlgorithmUri_Signature_RsaSha1 );
            algorithms.AsymmetricKeyWrapAlgorithm = "http://www.w3.org/2001/04/xmlenc#rsa-1_5";
            algorithms.AsymmetricEncryptionAlgorithm = EncryptionAlgorithm.encryptionAlgorithmToString( EncryptionAlgorithm.AlgorithmUri_Encryption_Rsa15 );
            algorithms.KeyDerivationAlgorithm = "http://docs.oasis-open.org/ws-sx/ws-secureconversation/200512/dk/p_sha1";
            break;
        case SecurityPolicy.Basic256:
            algorithms.SymmetricSignatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#hmac-sha1";
            algorithms.SymmetricEncryptionAlgorithm = "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
            algorithms.AsymmetricSignatureAlgorithm = SignatureAlgorithm.signatureAlgorithmToString( SignatureAlgorithm.AlgorithmUri_Signature_RsaSha1 );
            algorithms.AsymmetricKeyWrapAlgorithm = "http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p";
            algorithms.AsymmetricEncryptionAlgorithm = EncryptionAlgorithm.encryptionAlgorithmToString( EncryptionAlgorithm.AlgorithmUri_Encryption_RsaOaep );
            algorithms.KeyDerivationAlgorithm = "http://docs.oasis-open.org/ws-sx/ws-secureconversation/200512/dk/p_sha1";
            break;            
    }
    return algorithms;
}

SecurityAlgorithms.getKeyLength = function( securityPolicy ) {
    var len = 0;
    switch( securityPolicy )
    {
        case SecurityPolicy.Basic128Rsa15:
            len = 128 / 8;
            break;
        case SecurityPolicy.Basic192Rsa15: 
            len = 192 / 8;
            break;
        case SecurityPolicy.Basic256Rsa15: 
            len = 256 / 8;
            break;
    }
    return( len );
}


UaStatusCode.ToHexString = function( number ) {
    if (number < 0) number = 0xFFFFFFFF + number + 1;
    return "0x" + number.toString(16).toUpperCase();
}

/* Find subscription(s) in a a collection of SubscriptionDiagnostics
   Parameters: 
       - Diagnostics: ExtensionObject array containing UaSubscriptionDiagnosticsDataType collection
       - SubscriptionId: single object of either (a) integers (b) subscription objects */
UaSubscriptionDiagnosticsDataType.FindSubscription = function( args ) {
    if( !isDefined( args ) ) throw( "UaSubscriptionDiagnostic.FindSubscription::args not specified" );
    if( !isDefined( args.Diagnostics ) || !isDefined( args.SubscriptionId ) ) throw( "UaSubscriptionDiagnostic.FindSubscription::args.Diagnostics or args.SubscriptionIds not specified" );
    var subid = isNaN( parseInt( args.SubscriptionId ) ) ? args.SubscriptionId.SubscriptionId : parseInt( args.SubscriptionId );
    for( var i=0; i<args.Diagnostics.length; i++ ) { // iterate thru all diagnostics
        var currDiag = args.Diagnostics[i].toSubscriptionDiagnosticsDataType();
        if( currDiag !== null ) if( currDiag.SubscriptionId === subid ) return( i );
    }//for i
    return( -1 );
}

ServiceLevel = {
    "Maintenance" : 0,
    "NoData" :  1,
    "Degraded" : 2,
    "Healthy" : 200 };
ServiceLevel.ToString = function( value ) {
    if( value === 0 ) return( "Maintenance" );
    else if( value === 1 ) return( "NoData" );
    else if( value >= 2 && value <= 199 ) return( "Degraded" );
    else if( value >= 200 && value <= 255 ) return( "Healthy" );
    else throw( "Invalid ServiceLevel value '" + value + "'." );
}