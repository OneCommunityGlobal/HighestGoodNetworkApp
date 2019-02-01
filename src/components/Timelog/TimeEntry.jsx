import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import {store} from '../../store';
import ModalA from '../common/modal';
import ModalBody from './TimeEntryModalBody';
import Form from '../common/form';
import Tabs from '../common/Tabs';

class TimeEntry extends Form {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  render() {
    let Modal
    let tModal = <ModalA
    header="Add Time Entry"
    buttonLabel="Add Time Entry"
    color="primary"
    body={(
      <ModalBody/>
    )}
  />
    if (store.getState().user.role === 'Administrator') {
      Modal = tModal
    } else if (store.getState().user.role !== 'Administrator' && store.getState().userProfile._id === store.getState().user.userid) {
      Modal = tModal
    } else if (store.getState().user.role !== 'Administrator' && store.getState().userProfile._id !== store.getState().user.userid) {
      Modal = null
    }
    return (
      <Container>
        <Row>
          <Col>
            <h1>Time Entry</h1>
          </Col>
          <Col>
            {Modal}
          </Col>
        </Row>
        <Row>
          <Col>
            <Tabs />
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = state => ({ state });

export default connect(mapStateToProps)(TimeEntry);
