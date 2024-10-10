import './BlueSquare.css';
import hasPermission from 'utils/permissions';
import { connect } from 'react-redux';
import { formatCreatedDate, formatDate } from 'utils/formatDate';

// const BlueSquare = props => {
//   const canAddInfringements = props.hasPermission('addInfringements');
//   const canEditInfringements = props.hasPermission('editInfringements');
//   const canDeleteInfringements = props.hasPermission('deleteInfringements');
//   const isInfringementAuthorizer = canAddInfringements || canEditInfringements || canDeleteInfringements
//   const { blueSquares, handleBlueSquare } = props;

//   return (
//     <div className="blueSquareContainer">
//       <div className={`blueSquares ${blueSquares?.length > 0 ? '' : 'NoBlueSquares'}`}>
//         {blueSquares?.length > 0
//           ? blueSquares
//               .sort((a, b) => (a.date > b.date ? 1 : -1))
//               .map((blueSquare, index) => (
//                 <div
//                   key={index}
//                   role="button"
//                   id="wrapper"
//                   data-testid="blueSquare"
//                   className="blueSquareButton"
//                   onClick={() => {
//                     if (!blueSquare._id) {
//                       handleBlueSquare(isInfringementAuthorizer, 'message', 'none');
//                     } else if (canEditInfringements || canDeleteInfringements) {
//                       handleBlueSquare(
//                         canEditInfringements || canDeleteInfringements,
//                         'modBlueSquare',
//                         blueSquare._id,
//                       );
//                     // } else if(canEditInfringements) {
//                     //   handleBlueSquare(
//                     //     canEditInfringements,
//                     //     'editBlueSquare',
//                     //     blueSquare._id,
//                     //   );
//                     // } else if (canDeleteInfringements){
//                     //   handleBlueSquare(
//                     //     canDeleteInfringements,
//                     //     'deleteBlueSquare',
//                     //     blueSquare._id,
//                     //   );

//                     }else{
//                       handleBlueSquare(
//                         true,
//                         'viewBlueSquare',
//                         blueSquare._id,
//                       );
//                     }
//                   }}
//                 >
//                   <div className="report" data-testid="report">
//                     <div className="title">{formatDate(blueSquare.date)}</div>
//                     {blueSquare.description !== undefined && (
//                       <div className="summary">
//                         {blueSquare.createdDate !== undefined && blueSquare.createdDate !== null
//                           ? `${formatCreatedDate(blueSquare.createdDate)}: ${
//                               blueSquare.description
//                             }`
//                           : blueSquare.description}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ))
//           : <div>No blue squares.</div>}
//         {canAddInfringements && (
//           <div
//             onClick={() => {
//               handleBlueSquare(true, 'addBlueSquare', '');
//             }}
//             className="blueSquareButton"
//             color="primary"
//             data-testid="addBlueSquare"
//           >
//             +
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


/*
Consolidated destructuring for props.
Simplified handleOnClick by reducing repeated conditions.
Moved formatting logic inside JSX.
Removed redundant conditions and comments for cleaner code.
*/

const BlueSquare = (props) => {
  const {
    blueSquares,
    handleBlueSquare,
    hasPermission
  } = props;

  const canAddInfringements = hasPermission('addInfringements');
  const canEditInfringements = hasPermission('editInfringements');
  const canDeleteInfringements = hasPermission('deleteInfringements');
  const isInfringementAuthorizer = canAddInfringements || canEditInfringements || canDeleteInfringements;

  const handleOnClick = (blueSquare) => {
    if (!blueSquare._id) {
      handleBlueSquare(isInfringementAuthorizer, 'message', 'none');
    } else if (canEditInfringements || canDeleteInfringements) {
      handleBlueSquare(true, 'modBlueSquare', blueSquare._id);
    } else {
      handleBlueSquare(true, 'viewBlueSquare', blueSquare._id);
    }
  };

  return (
    <div className="blueSquareContainer">
      <div className={`blueSquares ${blueSquares?.length ? '' : 'NoBlueSquares'}`}>
        {blueSquares?.length ? (
          blueSquares
            .sort((a, b) => (a.date > b.date ? 1 : -1))
            .map((blueSquare, index) => (
              <div
                key={index}
                role="button"
                id="wrapper"
                data-testid="blueSquare"
                className="blueSquareButton"
                onClick={() => handleOnClick(blueSquare)}
              >
                <div className="report" data-testid="report">
                  <div className="title">{formatDate(blueSquare.date)}</div>
                  {blueSquare.description && (
                    <div className="summary">
                      {blueSquare.createdDate ? `${formatCreatedDate(blueSquare.createdDate)}: ` : ''}
                      {blueSquare.description}
                    </div>
                  )}
                </div>
              </div>
            ))
        ) : (
          <div>No blue squares.</div>
        )}
        {canAddInfringements && (
          <div
            onClick={() => handleBlueSquare(true, 'addBlueSquare', '')}
            className="blueSquareButton"
            color="primary"
            data-testid="addBlueSquare"
          >
            +
          </div>
        )}
      </div>
    </div>
  );
};



export default connect(null, { hasPermission })(BlueSquare);