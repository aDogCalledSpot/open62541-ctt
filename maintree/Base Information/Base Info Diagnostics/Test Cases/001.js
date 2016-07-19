/*  Test prepared by Nathan Pocock: nathan.pocock@opcfoundation.org
    Description: Invoke a Read() of the BrowseName for the ServerDiagnostics node. [ServerDiagnosticsAvailable]. */

Test.Execute( { Procedure: function test() {
    _diagsNode.AttributeId = Attribute.BrowseName;
    if( ReadHelper.Execute( { NodesToRead: _diagsNode } ) ) {
        Assert.Equal( "ServerDiagnostics", _diagsNode.Value.Value.toQualifiedName().Name );
    }
    return( true );
} } );