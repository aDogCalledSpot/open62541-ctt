/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Client specifies a certificate during connection even with no security! */

Test.Execute( { Procedure: function test() {
    var insecureChannel = new OpenSecureChannelService();
    if( !insecureChannel.Execute( { ClientCertificate: Settings.Advanced.Certificates.Certifcate } ) ) return( false );
    else {
        // did the server return a certificate? if so then this CU is not supported and just skip it.
        if( !insecureChannel.Channel.ServerCertificate.length > 0 ) {
            notSupported( "Server does not return support this backward compatibility. Skipping conformance unit." );
            stopCurrentUnit();
        }
        CloseSecureChannelHelper.Execute( { Channel: insecureChannel } );
    }
    return( true );
} } );