import React from 'react';
import { connect } from 'react-redux';

export class MonthlyEffort extends React.Component {
  state = {};

  async componentDidMount() {
    let userID = this.props.auth.user.userid;
    this.setState({ userID });
  }
  render() {
    return (
      <div className="card-body text-white">
        <h5 className="card-title">Monthly Efforts</h5>
        <div></div>
      </div>
    );
  }
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {})(MonthlyEffort);
