import React , { Component }from 'react';
import '../Teams/Team.css';
import { connect } from 'react-redux'

class TeamReport extends Component{

  state = {

  }


  async componentDidMount() {


  }

  render() {

    console.log('yueru')
    // console.log(userProfile)
    return(
      <div>
        teamProfile
        {/*<h5*/}
        {/*  style={{ display: 'inline-block', marginRight: 10 }}*/}
        {/*>{`${firstName} ${lastName}`}</h5>*/}
      </div>
    )
  }

}
const mapStateToProps = state => ({

});

export default connect(mapStateToProps, {

})(TeamReport);
