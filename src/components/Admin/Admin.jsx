import React, { useEffect } from 'react';
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

  useEffect(() => {
    const mode = localStorage.getItem('mode');
    document.body.className = mode;

  }, []);

  return (
    <>
      <div className="container mt-3">
        {props.popupEditor.popupItems.map((item, index) => (
          <PopupText key={index} title={item.popupName} content={item.popupContent} id={item._id} />
        ))}
      </div>
    </>
  );
};
export default connect(state => state, { fetchAllPopupEditor })(Admin);
