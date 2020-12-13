import React, { useState } from 'react'
import { connect } from 'react-redux';
import { SEARCH } from '../../languages/en/ui';
import PopupText from './PopupText/';
import './style.css'

const Admin = (props) => {
  const tmp = [
    {
      _id: '',
      title: 'Project Confirm Deletion',
      content: 'Are you sure you want to delete "project_name"? This action cannot be undone. Switch them to Inactive If youd like to keep them in the system'
    },
    {
      _id: '',
      title: 'WBS Confirm Deletion',
      content: 'Are you sure you want to delete this'
    },
    {
      _id: '',
      title: 'Import Task',
      content: 'Before importing a Work Breakdown Structure (WBS) to this software, the following steps must be taken: [br] Check all numbers are sequential. [br] 2.Double check the number listed in the popup matches the number of rows being imported.'
    },
  ]

  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState(tmp);

  const search = () => {
    if (keyword.length > 0) {
      setData(data.filter(d => d.title.includes(keyword) || d.content.includes(keyword)));
    } else {
      setData(tmp);
    }

  }




  return <>
    <div className='container'>
      <div className="input-group">

        <div className="input-group-prepend">
          <span className="input-group-text" >Search</span>
        </div>

        <input type="text" className="form-control" onChange={(e) => setKeyword(e.target.value)} value={keyword} />
        <div className="input-group-append">
          <button className="btn btn-outline-primary" type="button" onClick={search}>
            <i className="fa fa-search" aria-hidden="true"></i>
          </button>

        </div>
      </div>

      <div className='bbcode'>
        [br]: produces a line break in text
      </div>


      {data.map((item, index) =>
        <PopupText key={index} title={item.title} content={item.content} />
      )}

    </div>
  </>
}
export default connect(state => state)(Admin)
