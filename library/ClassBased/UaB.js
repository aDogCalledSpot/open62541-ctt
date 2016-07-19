/* Includes: 
    UaBrowsePath.New()
    BuiltInType.FromNodeId()        : Converts a NodeId into its corresponding BuiltInType
    UaByteString.FromByteArray()    : Converts a Byte[] to a ByteString
    UaByteString.Increment()        : Increments the numeric value of a ByteString by one
    UaByteString.ToByteArray()      : Converts a ByteString to a Byte[]
*/

/* returns a UaBrowsePath object
    Parameters:
        RelativePath [RelativePath]: 
        RelativePathStrings [string[]]: 
        StartingNode [NodeId]: 
        TargetName: */
UaBrowsePath.New = function( args ) {
    var uabp = new UaBrowsePath();
    // was it a NodeId or a MonitoredItemObject received?
    if( isDefined( args.StartingNode ) ) { 
        if( isDefined( args.StartingNode.NodeSetting ) )
            uabp.StartingNode = args.StartingNode.NodeId;
        else
            uabp.StartingNode = args.StartingNode;
    }
    // now to build the relative path(s)
    if( isDefined( args.RelativePath ) ) uabp.RelativePath = args.RelativePath;
    else if( isDefined( args.TargetName ) ) {
        var e = new UaRelativePathElement();
        e.TargetName = args.TargetName;
        uabp.RelativePath.Elements[0] = e;
    }
    else if( isDefined( args.RelativePathStrings ) ) {
        if( !isDefined( args.RelativePathStrings.length ) ) args.RelativePathStrings = [ args.RelativePathStrings ];
        for( var i=0; i<args.RelativePathStrings.length; i++ ) {
            var e = new UaRelativePathElement();
            e.IncludeSubtypes = true;
            e.IsInverse = false;
            e.TargetName.Name = args.RelativePathStrings[i];
            if( isDefined( args.ReferenceTypeId ) ) e.ReferenceTypeId = args.ReferenceTypeId;
            uabp.RelativePath.Elements[i] = e;
        }//for i
    }
    return( uabp );
}// this.GetUaBrowsePath = function( args )

// Searches an array of UaBrowseResult objects for anything that matches
// the search criteria.
// Parameters:
//    - BrowseName [string]: 
//    - Results [UaBrowseResults]: 
UaBrowseResults.Find = function( args ) {
    var matches = [];
    if( isDefined( args ) && isDefined( args.Results ) && isDefined( args.Results.length ) ) {
        for( var i=0; i<args.Results.length; i++ ) {
            for( var r=0; r<args.Results[i].References.length; r++ ) {
                var isMatch = false;
                if( isDefined( args.BrowseName ) && args.Results[i].References[r].BrowseName.Name == args.BrowseName ) isMatch = true;
                if( isMatch ) matches.push( args.Results[i].References[r].clone() );
            }//for r..
        }//for i..
    }
    return( matches );
}

BuiltInType.FromNodeId = function( nodeid ) {
    if( nodeid !== undefined && nodeid !== null ) {
        for( var b in BuiltInType ) {
            if( nodeid.equals( new UaNodeId( BuiltInType[b] ) ) ) return( BuiltInType[b] );
        }
    }
    return( new UaNodeId() );
}

UaByteString.FromByteArray = function( bytes ) {
    if( bytes === undefined || bytes === null ) return( new UaByteString() );
    
    var str = "0x";
    var x = 0;
    for( b in bytes ) {
        x = bytes[b];
        if( x < 16 ) str += "0";      
        str += x.toString(16)
    }
    var y = UaByteString.fromHexString( str );
    return( y );
}//ByteString.FromByteArray = function( bytes )

UaByteString.Increment = function( bs ) {
    var a = UaByteString.ToByteArray( bs );
    var b;
    var aLen = a.length-1;
    var x = 0;
    if( a.length > 0 ) {
        x = parseInt( a[aLen] );
        if( x >= 128 ) x = 1;
        else x= x + 1;
        a[aLen] = x;
        b = UaByteString.FromByteArray( a );
    }
    else b = UaByteString.fromStringData( "0" );
    return( b );
}

UaByteString.ToByteArray = function( bytestring ) {
    if( bytestring === undefined || bytestring === null ) return( [] );
    var by = [];
    for( var i=0; i<bytestring.length; i++ ) by[i] = parseInt( bytestring.getRange( i, i ).toHexString() );
    return( by );
}//ByteString.ToByteArray = function( bytestring )