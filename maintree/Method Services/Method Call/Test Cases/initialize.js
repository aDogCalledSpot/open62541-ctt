include( "./library/Base/safeInvoke.js" );

var CUVariables = new Object();

// Connect to the UA Server using default parameters (settings)
if( !Test.Connect() ) { 
    addError( "Unable to connect to Server. Aborting tests." ); 
    stopCurrentUnit(); 
}
else CUVariables.Debug = true;

function init_GetMethodParent( methodNodeId ) {
    // array of types that COULD be used to reference a method
    var referenceTypes = [ new UaNodeId( Identifier.HasComponent ),
                           new UaNodeId( Identifier.HasOrderedComponent ),
                           new UaNodeId( Identifier.Organizes ) ];
    var parentObject = null;
    methodNodeId.BrowseDirection = BrowseDirection.Inverse;
    if( BrowseHelper.Execute( { NodesToBrowse: methodNodeId, SuppressMessaging: true } ) ) {   // browse our method node for inverse references
        for( var t=0; t<referenceTypes.length; t++ ) {                                         // iterate thru each of our acceptable reference types
            for( var i=0; i<BrowseHelper.Response.Results.length; i++ ) {                          // iterate thru all browse results
                if( BrowseHelper.Response.Results[i].StatusCode.isGood() ) {                       // we care for good results only
                    for( var r=0; r<BrowseHelper.Response.Results[i].References.length; r++ ) {    // iterate thru all returned references for *this* result
                        if( BrowseHelper.Response.Results[i].References[r].ReferenceTypeId.equals( referenceTypes[t] ) ) { // HasComponent?
                           parentObject = MonitoredItem.fromNodeIds( BrowseHelper.Response.Results[i].References[r].NodeId.NodeId )[0]; // capture the parent object
                            break;                                                                       // exit this inner loop; outer loop exited next.
                        }	
                    }// for r...
                }// is good
                if( parentObject !== null ) break;                                                       // escape the loop if the object is defined
            }//for i...
        }//for r...
    }// browse
    return( parentObject );
}