/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Client specifies an expired certificate during connection even with no security! */

Test.Execute( { Procedure: function test() {
    var insecureChannel = new OpenSecureChannelService();
    if( !insecureChannel.Execute( { ClientCertificate: Settings.Advanced.Certificates.ExpiredClientCertificate } ) ) return( false );
    else {
        // did the server return a certificate?
        if( insecureChannel.Channel.ServerCertificate.length > 0 ) addLog( "Server return a Certificate which is not necessary, but acceptable for backward compatibility." );
        CloseSecureChannelHelper.Execute( { Channel: insecureChannel } );
    }
    return( true );
} } );