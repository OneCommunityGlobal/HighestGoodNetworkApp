/** 
 * Returns either editable or non-editable section in Task view with background color.
 * @param {ReactNode} WrappedComponent - React component to render when editable.
 * @param {Boolean} editable - Indicates permission to edit. Will render the default editable element (e.g., textarea) if true.
 * @param {*} value - component should display for non-editable component
 * @param {Object | undefined} option: Additional options for customization.
 * @param {boolean} [option.componentOnly] - If true, only the component (value) will be rendered, ignoring other styling.
 * 
 * @returns {ReactNode}
*/
export default function ReadOnlySectionWrapper(WrappedComponent, editable, value, option) {
  if (editable){
    return WrappedComponent
  } 
  if(option){
    if (option.componentOnly){
      return value
    }
  }
  return (
    <td style={{backgroundColor: '#e9ecef'}}>
      <span>{value}</span>
    </td>
  )
}