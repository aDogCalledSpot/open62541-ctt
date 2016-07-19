/* Includes:
    UaX509IdentityToken.New = function( args ) 
*/

/* Returns a new X509 user identity token object already encoded as ExtensionObject.
   Parameters include:
    - PolicyId [required]            - policy id for crypto provider to use
    - CertificateData [optional]     - certificate data to pre-populate into the object
    - CertificateSetting [optional]  - certificate setting to load for pki-provider */
UaX509IdentityToken.New = function( args ) {
    var uidToken = new UaX509IdentityToken();
    if( isDefined( args ) ) {
        // policy id
        if( isDefined( args.PolicyId ) ) uidToken.PolicyId = args.PolicyId;
        // certificate data
        if( isDefined( args.CertificateData ) ) uidToken.CertificateData = args.CertificateData;
        else {
            // prepare a pki provider for loading the certificate
            var pkiProvider = new UaPkiUtility();
            pkiProvider.CertificateTrustListLocation = readSetting( "/Advanced/Certificates/CertificateTrustListLocation" );
            pkiProvider.CertificateRevocationListLocation = readSetting( "/Advanced/Certificates/CertificateRevocationListLocation" );
            pkiProvider.PkiType = PkiType.OpenSSL;

            // settings that outline the certificate-data to embed... set to TRUSTED, by default
            if( !isDefined( args.CertificateSetting ) ) args.CertificateSetting = UserCertificateSetting.Trusted;
            var userCertificate = new UaByteString();
            var uaStatus = null;
            print( "UserX509 certificate for setting '" + UserCertificateSetting.toString( args.Setting ) + "' requested." );
            switch( args.CertificateSetting ) {
                case UserCertificateSetting.Trusted:     uaStatus = pkiProvider.loadCertificateFromFile( Settings.Advanced.Certificates.User, userCertificate ); break;
                case UserCertificateSetting.Untrusted:   uaStatus = pkiProvider.loadCertificateFromFile( Settings.Advanced.Certificates.UserCertNotTrusted,  userCertificate ); break;
                case UserCertificateSetting.NotYetValid: uaStatus = pkiProvider.loadCertificateFromFile( Settings.Advanced.Certificates.UserCertNotYetValid, userCertificate ); break;
                case UserCertificateSetting.Expired:     uaStatus = pkiProvider.loadCertificateFromFile( Settings.Advanced.Certificates.UserCertExpired, userCertificate ); break;
                case UserCertificateSetting.Issued:      uaStatus = pkiProvider.loadCertificateFromFile( Settings.Advanced.Certificates.UserCertIssued,  userCertificate ); break;
                case UserCertificateSetting.Revoked:     uaStatus = pkiProvider.loadCertificateFromFile( Settings.Advanced.Certificates.UserCertRevoked, userCertificate ); break;
                case UserCertificateSetting.Invalid:     uaStatus = pkiProvider.loadCertificateFromFile( Settings.Advanced.Certificates.UserCertInvalid, userCertificate ); break;
                case UserCertificateSetting.ApplicationInstanceCertificate: uaStatus = pkiProvider.loadCertificateFromFile( Settings.Advanced.Certificates.Certificate, userCertificate ); break;
                default: throw( "Invalid UserCertificateSetting value '" + setting + "' in call to buildUserX509IdentityToken" );
            }
            if( uaStatus.isBad() ) throw( "Error '" + uaStatus + "' loading UserCertifiate" );
            else uidToken.CertificateData = userCertificate;
        }
    }
    var obj = new UaExtensionObject();
    obj.setX509IdentityToken( uidToken );
    return( obj );
}