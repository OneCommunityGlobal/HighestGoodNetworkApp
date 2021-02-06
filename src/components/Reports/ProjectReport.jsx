import React , { Component }from 'react';
import '../Teams/Team.css';
import { connect } from 'react-redux'

class ProjectReport extends Component{

  state = {

  }


  async componentDidMount() {
    // if (this.props.match) {
    //   this.props.getUserProfile(this.props.match.params._id)
    //
    //   this.setState({
    //       projectId: this.props.match.params._id,
    //       isLoading: false,
    //       userProfile: {
    //         ...this.props.userProfile,
    //         privacySettings: {
    //           email: true,
    //           phoneNumber: true,
    //           blueSquares: true,
    //         },
    //
    //       },
    //       infringments : this.props.userProfile.infringments
    //     }
    //   )
    // }


  }

  render() {
    return(
      <div>
        projectProfile
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

})(ProjectReport);
