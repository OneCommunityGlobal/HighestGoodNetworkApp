import React, { useState } from 'react'
import { connect } from 'react-redux';
import './style.css'

const PopupText = (props) => {
  const [display, setDisplay] = useState(true);
  const [content, setContent] = useState(props.content);

  return <>
    <div className='m-cover'>
      <div className='m-header'>
        {props.title}
      </div>

      <div className='m-body'>
        {display ?
          <div onClick={() => setDisplay(false)}>{content.split('[br]').map(item => <div>{item}</div>)}</div>
          :
          <textarea onBlur={() => setDisplay(true)} onChange={(e) => setContent(e.target.value)}>{content}</textarea>
        }
      </div>

      <div className='m-footer'>
        <button type="button" className="ml-1 p-1 align-middle btn btn-success">Save</button>
      </div>
    </div >
  </>
}
export default connect(state => state)(PopupText)
