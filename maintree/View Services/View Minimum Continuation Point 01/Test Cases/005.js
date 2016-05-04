/*    Test 5.7.2-1 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has at least three forward references
            And RequestedMaxReferencesPerNode is 1
            And Browse has been called
          When BrowseNext is called
            And ReleaseContinuationPoints is true
          Then the server returns no references
            And ContinuationPoint is empty

          Validation is accomplished by first browsing all references on a node,
          then performing the test and comparing the second reference to the 
          reference returned by the BrowseNext call. So this test only validates
          that Browse two references is consistent with Browse one reference
          followed by BrowseNext.
*/

/*global include, TestBrowseNextWhenMoreReferencesExist */

include( "./library/ServiceBased/ViewServiceSet/BrowseNext/release_continuationpoints_test.js" );

function browseNext572001() {
    TestBrowseNextWhenMoreReferencesExist( Test.Session.Session, true );
    return( true );
}

Test.Execute( { Procedure: browseNext572001 } );