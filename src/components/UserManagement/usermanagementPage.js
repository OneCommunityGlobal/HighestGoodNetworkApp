import React, { Component } from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import axios from 'axios';
import { Container } from 'reactstrap';
import NewUserComp from './NewUserComp';


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
                    //filterable:true,
                    Cell: ({ value }) => (value === true ? 'Active' : 'Inactive'),
                    filterMethod: (filter, row) => {
                      if (filter.value === "all") {
                        return true;
                      }
                      if (filter.value === "true") {
                        return row[filter.id] === true;
                      }
                      return row[filter.id] === false;
                    },
                    Filter: ({ filter, onChange }) =>
                      <select
                        onChange={event => onChange(event.target.value)}
                        style={{ width: "100%" }}
                        value={filter ? filter.value : "all"}
                      >
                        <option value="all">Show All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                   
                    
                },
                {
                    Header: 'firstName',
                    accessor: 'firstName',
                    show: true,
                    filterable:true
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
                    show: true,
                    filterable:true
                },
                {
                    Header: 'weeklyComittedHours',
                    accessor: 'weeklyComittedHours',
                    show: true,
                    filterable:false
                },
            ]
        }
    }
    componentDidMount(){
        axios({
            method:'get',
            baseURL:"http://hgn-rest.azurewebsites.net/api",
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
            <Container>
                <NewUserComp />
                <hr />
                <ReactTable 
                    filterable
                    data={userlist}
                    minRows={0}
                    columns={this.state.columns}
                    className="-highlight"
                    defaultSorted={[
                        {
                          id: "firstName",
                        }
                      ]}
                />
                
            </Container>
        );
    }
}
export default UserManagement;
