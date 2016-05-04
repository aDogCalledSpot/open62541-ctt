/*  Test prepared by Development; compliance@opcfoundation.org
    Description: add a node using typical parameters. */

function addNodesTest() {
    // add a variable and specify all attributes that are currently listed as supported (in settings)
    var parameters = { 
        Debug: CUVariables.Debug,
        NodesToAdd: [
                UaAddNodesItem.New( { 
                        BrowseName: BrowseName.New( { NodeClass: NodeClass.Variable } ),
                        RequestedNewNodeId: CUVariables.RequestedNewNodeId(),
                        NodeAttributes: UaVariableAttributes.New( {
                                AccessLevel: AccessLevel.CurrentReadOrWrite, 
                                BrowseName: BrowseName.New( { NodeClass: NodeClass.Variable } ),
                                DataType: new UaNodeId( BuiltInType.Double ),
                                Description: "My test variable",
                                DisplayName: "variable_double",
                                Historizing: false,
                                MinimumSamplingInterval: 100,
                                SpecifiedAttributes: CUVariables.SupportedAttributes.Value,
                                UserAccessLevel: AccessLevel.CurrentReadOrWrite, 
                                UserWriteMask: 0,
                                Value: UaVariant.New( { Value: 16.1234, Type: BuiltInType.Double} ),
                                ValueRank: ValueRank.Scalar,
                                WriteMask: 0,
                                ToExtensionObject: true } ), 
                        ParentNodeId: CUVariables.RootNode.NodeId, 
                        TypeDefinition:  new UaNodeId( Identifier.BaseDataVariableType ), 
                        ReferenceTypeId: new UaNodeId( Identifier.Organizes ), 
                        NodeClass: NodeClass.Variable } )
            ],
        OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.Good ) ],
        ServiceResult: new ExpectedAndAcceptedResults( StatusCode.Good ) };

    var result = AddNodeIdsHelper.Execute( parameters );

    return( result );
}

Test.Execute( { Procedure: addNodesTest } );