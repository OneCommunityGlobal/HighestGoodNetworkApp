import { connect } from "react-redux";
import PopUpBar from "./PopUpBar";


const mapStateToProps = (state) =>({
    auth: state.auth.user,
    userProfile: state.userProfile
})

const mapDispatchToProps=(dispatch)=>({

})

export default connect(mapStateToProps,mapDispatchToProps)(PopUpBar)