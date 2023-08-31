import { useEffect } from 'react';
import { connect } from 'react-redux';
import PopupText from './PopupText';
import { fetchAllPopupEditor } from '../../actions/popupEditorAction';
import './style.css';

function Admin({ props }) {
  useEffect(() => {
    // console.log('props', props);
    props.fetchAllPopupEditor();
  }, [1]);
  return (
    <div className="container mt-3">
      {props.popupEditor.popupItems.map(item => (
        <PopupText key={item.id} title={item.popupName} content={item.popupContent} id={item._id} />
      ))}
    </div>
  );
}
export default connect(state => state, { fetchAllPopupEditor })(Admin);
