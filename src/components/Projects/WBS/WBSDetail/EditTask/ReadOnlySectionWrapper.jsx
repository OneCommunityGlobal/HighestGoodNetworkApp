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
  //Need to remove HTML tags from Editor field
  function stripHtml(html) {
    if (html === null || html === undefined) {
      return ''
    }
    let doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  if (editable){
    return WrappedComponent
  } 

  let displayValue = stripHtml(value)

  if(option){
    if (option.componentOnly){
      return displayValue
    }
  }
  return (
    <td style={{backgroundColor: '#e9ecef'}}>
      <span>{displayValue}</span>
    </td>
  )
}