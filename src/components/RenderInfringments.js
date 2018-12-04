import React from 'react';

const RenderInringments = ({infringments, isUserAdmin}) => {
    
    return (
            <React.Fragment>
            {infringments.map( item => 
            <div>
            <td class = "fa fa-square infringement m-1" 
            data-toggle="tooltip" data-placement="bottom" 
            title = {`Date: ${item.date} \nDescription: ${item.description}`}>
            </td>
            <tr>
            <td class="fa fa-pencil m-1"></td>    
            </tr>
            <tr>
            <td class="fa fa-trash m-1"></td>    
            </tr>
            </div> )}
          
                                        
            
            </React.Fragment>
        
        
    );
}
 
export default RenderInringments;

