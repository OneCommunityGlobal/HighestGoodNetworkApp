import { useEffect } from 'react';
import { connect } from 'react-redux';
import PopupText from './PopupText';
import { fetchAllPopupEditor } from '../../actions/popupEditorAction';
import './style.css';

function Admin(props) {
  const { popupEditor } = props;
  useEffect(() => {
    fetchAllPopupEditor();
  }, [1]);

  return (
    <div className="container mt-3">
      {popupEditor.popupItems.length === 0 ? (
        <p style={{ textAlign: 'center' }}>
          A popup is needed for this. Help us make the app better by sharing with the Admin what you
          did to get this screen.
        </p>
      ) : (
        popupEditor.popupItems.map(item => (
          <PopupText
            key={item._id}
            title={item.popupName}
            content={item.popupContent}
            id={item._id}
          />
        ))
      )}
    </div>
  );
}

export default connect(state => state, { fetchAllPopupEditor })(Admin);
