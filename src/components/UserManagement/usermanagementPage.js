import React, { Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import axios from 'axios';
import { Row } from 'reactstrap';


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
                <Row>
                    
                </Row>
                <Row>
                <ReactTable 
                    data={userlist}
                    minRows={0}
                    columns={this.state.columns}
                />
                </Row>
            </div>
        );
    }
}
export default UserManagement;
