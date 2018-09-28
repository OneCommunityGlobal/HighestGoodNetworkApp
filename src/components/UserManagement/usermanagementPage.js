import React, { Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import axios from 'axios';

    


// const Data=[{isActive: false, weeklyComittedHours: 9, _id: "5a6232cce1787e3f80a78bd5", email: "azure@hgn.net", firstName: "America12345"},
//  {isActive: false, weeklyComittedHours: 0, _id: "5b13bc7564f3732b5c337c64", role: "Volunteer", firstName: "time"},
//  {isActive: false, weeklyComittedHours: 10, _id: "5b3013287275b6002e3b2de4", role: "Volunteer", firstName: "Dipti"}
//         ]


class UserManagement extends Component {
    constructor() {
        super()
        this.state = {
            userlist:[],
            columns: [
                {
                    Header: 'isActive',
                    accessor: 'isActive',
                    show: true,
                },
                {
                    Header: 'firstName',
                    accessor: 'firstName',
                    show: true,
                },
                {
                    Header: 'lastName',
                    accessor: 'lastName',
                    show: true,
                },
                {
                    Header: 'role',
                    accessor: 'role',
                    show: true,
                },
                {
                    Header: 'email',
                    accessor: 'email',
                    show: true
                },
                {
                    Header: 'weeklyComittedHours',
                    accessor: 'weeklyComittedHours',
                    show: true
                },
            ]
        }
    }
    componentDidMount(){
        axios({
            method:'get',
            baseURL:"http://localhost:4500/api",
            url:'/userprofile',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem('token')
            }
          })
          .then((users)=>{
            
            this.setState({
                userlist:[...users.data]
            })
            
             })
          .catch((error)=>{return error})
    }
    render() {
        const {userlist} = this.state;
        console.log(userlist);
        return (
            <div>
                <ReactTable 
                    data={userlist}
                    minRows={0}
                    columns={this.state.columns}
                />
            </div>
        );
    }
}
export default UserManagement;
