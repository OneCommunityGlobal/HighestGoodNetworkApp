import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PopupText from './PopupText/';
import { fetchAllPopupEditor } from './../../actions/popupEditorAction';
import './style.css';

const Admin = props => {
  useEffect(() => {
    console.log('props', props);
    props.fetchAllPopupEditor();
  }, [1]);

  const [keyword, setKeyword] = useState('');
  const [data, setData] = useState();

  const search = () => {
    if (keyword.length > 0) {
      setData(data.filter(d => d.title.includes(keyword) || d.content.includes(keyword)));
    }
  };

  return (
    <>
      <div className="container mt-3">
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">Search</span>
          </div>

          <input
            type="text"
            className="form-control"
            onChange={e => setKeyword(e.target.value)}
            value={keyword}
          />
          <div className="input-group-append">
            <button className="btn btn-outline-primary" type="button" onClick={search}>
              <i className="fa fa-search" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {props.popupEditor.popupItems.map((item, index) => (
          <PopupText key={index} title={item.popupName} content={item.popupContent} id={item._id} />
        ))}
      </div>
    </>
  );
};
export default connect(state => state, { fetchAllPopupEditor })(Admin);
