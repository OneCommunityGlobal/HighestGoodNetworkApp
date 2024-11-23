import { connect } from 'react-redux';

export function MonthlyEffort() {
  return (
    <div className="card-body text-white">
      <h5 className="card-title">Monthly Efforts</h5>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {})(MonthlyEffort);
