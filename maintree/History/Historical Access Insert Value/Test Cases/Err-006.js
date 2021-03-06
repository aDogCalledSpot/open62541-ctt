/*  Test prepared by nathan.pocock@opcfoundation.org
    Description: invalid nodeid */

function hainsertval() {
    var haparams = { 
          Debug: CUVariables.Debug,
          HistoryUpdateDetails: UaUpdateDataDetails.New(
                                  { NodeId: MonitoredItem.fromSettings( Settings.Advanced.NodeIds.Invalid.Invalids )[0],
                                    PerformInsertReplace: PerformUpdateType.Insert,
                                    UpdateValues: [
                                        UaDataValue.New( { 
                                            Value: CUVariables.Items[0].Value[0].Value,
                                            StatusCode: StatusCode.Good,
                                            SourceTimestamp: UaDateTime.utcNow(),
                                            SourcePicoseconds: 0,
                                            ServerTimestamp: UaDateTime.utcNow(),
                                            ServerPicoseconds: 0 } )
                                         ] } ),
          OperationResults: [ new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid ) ] };

    return( HistoryUpdateHelper.Execute( haparams ) );
}

Test.Execute( { Procedure: hainsertval } );