/*  Test prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description: Write to the same node multiple times in the same call. This is done for each core data type: 
            Bool, Byte, SByte, ByteString, DateTime, Decimal, Double, Float, Guid, Int16, UInt16, Int32, UInt32,  Int64, UInt64, String */

Test.Execute( { Procedure: function test() {
    var items = MonitoredItem.fromSettings( Settings.ServerTest.NodeIds.Static.AllProfiles.Scalar.Settings );
    if( !isDefined( items ) ) { addError( "No Scalar items defined. Check settings. Aborting test." ); return( false ); }

    ReadHelper.Execute( { NodesToRead: items, TimestampsToReturn: TimestampsToReturn.Server } );

    // now to iterate thru each data-type and issue 5 instructions within the single call; this will 
    // involve cloning the item and then changing the value 
    for( var t=0; t<items.length; t++ ){
        addLog( "Testing type: " + BuiltInType.toString( UaNodeId.GuessType( items[t].NodeSetting ) ) );

        // first, create our list of items to write, and values.
        var values = [];
        var itemsByType = [];
        for( var i=0; i<5; i++ ){ // i=item
            itemsByType.push( MonitoredItem.Clone( items[t], { IncludeValue: true } ) );
            for( var v=i; v<5; v++ ) {
                if( itemsByType[i].DataType === BuiltInType.ByteString || itemsByType[i].DataType === BuiltInType.XmlElement ) UaVariant.Increment( { Value: itemsByType[i].Value } );
                else {
                    if( isNaN( itemsByType[i].Value.Value ) ) UaVariant.SetValueMin( { Value: itemsByType[i].Value } );
                    else UaVariant.Increment( { Value: itemsByType[i].Value } );
                }
            }
            values.push( itemsByType[i].Value.Value );
        }

        // second, write the values. Read them back...
        WriteHelper.Execute( { NodesToWrite: itemsByType, ReadVerification: false } );
        ReadHelper.Execute( { NodesToRead: itemsByType, TimestampsToReturn: TimestampsToReturn.Server, MaxAge: 0 } );

        // compare the value received is the same for all values
        var firstValue = itemsByType[0].Value.Value;
        Assert.ValueInValues( firstValue, values, "Expected a value that was previously written." );

        addLog( "Checking that all returned values match: " + firstValue );
        for( var i=1; i<ReadHelper.Response.Results.length; i++ ) {
            if( !firstValue.equals( ReadHelper.Response.Results[i].Value ) ) addError( "Read.Response.Results[" + i + "].Value mismatch." );
        }//for i...

    }
    return( true );
} } );