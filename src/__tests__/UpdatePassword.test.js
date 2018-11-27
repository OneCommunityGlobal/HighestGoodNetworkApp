import React from 'react'
import {shallow, mount} from 'enzyme'
import UpdatePassword from '../components/UpdatePassword'

describe("Update Password Page", () => {
    let mountedPage;
    beforeEach(()=> {
        mountedPage = shallow(<UpdatePassword  match={{params: {userId: 1}}}/>)
    })

    describe("Structure", ()=> {
        it("should have 3 input fields", ()=> {

            const inputs = mountedPage.find('Input')
            expect(inputs.length).toBe(3)
           
        })
        it("should have 1 button fields", ()=> {
    
            const button = mountedPage.find('button')
            expect(button.length).toBe(1)
           
        })
        it("should have submit button in disabled state by default", ()=> {
            const button = mountedPage.find('button');
            expect(button.props()).toHaveProperty("disabled")
        })
    
        it("should have userId as a prop", ()=> {
             expect(mountedPage.instance().props.match.params).toHaveProperty("userId")
        })

        it("should show error if old password is left blank", ()=> {
            
        })
    })

    describe("For incorrect user inputs", ()=> {
        it ("should show error if current password is left blank", ()=> {
            let value =   "";            
            let Input =  {name: "currentpassword", "value": value};
            let mockEvent = {currentTarget: Input}
            mountedPage.instance().handleChange(mockEvent); 
            expect(mountedPage.instance().state.errors["currentpassword"]).toEqual('"currentpassword" is not allowed to be empty'); 

        })
        it ("should show error if new password is left blank", ()=> {
            let value =   "";            
            let Input =  {name: "newpassword", "value": value};
            let mockEvent = {currentTarget: Input}
            mountedPage.instance().handleChange(mockEvent); 
            expect(mountedPage.instance().state.errors["newpassword"]).toEqual('"New Password" is not allowed to be empty'); 

        })

        it ("should show error if new password is not as per specifications", ()=> {
            let errorValues = [
                "a", //less than 8
                "abcdefgh123", //no upper case
                "ABCDERF12344", //no lower case
                "ABCDEFabc",// no numbers or special characters              

            ]
           errorValues.forEach(value => {          
                let Input =  {name: "newpassword", value};
                let mockEvent = {currentTarget: Input}
                mountedPage.instance().handleChange(mockEvent); 
               expect(mountedPage.instance().state.errors["newpassword"]).toEqual('"New Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character'); 
                
           });
      

        })
        it ("should show error if confirm new password is left blank", ()=> {
            let value =   "";            
            let Input =  {name: "confirmnewpassword", "value": value};
            let mockEvent = {currentTarget: Input}
            mountedPage.instance().handleChange(mockEvent); 
            expect(mountedPage.instance().state.errors["confirmnewpassword"]).toEqual('"Confirm Password" is not allowed to be empty'); 

        })

        it ("should show error if confirm new password is not as per specifications", ()=> {
            let errorValues = [
                "a", //less than 8
                "abcdefgh123", //no upper case
                "ABCDERF12344", //no lower case
                "ABCDEFabc",// no numbers or special characters              

            ]
           errorValues.forEach(value => {          
                let Input =  {name: "confirmnewpassword", value};
                let mockEvent = {currentTarget: Input}
                mountedPage.instance().handleChange(mockEvent); 
               expect(mountedPage.instance().state.errors["confirmnewpassword"]).toEqual('"Confirm Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character'); 
                
           });      

        })

        it ("should show error if new and confirm passwords are not same", ()=> {
            let mockEventcurrentpassword = {currentTarget : {name : "currentpassword", value : "abcde"}}
            let mockEventnewpassword = {currentTarget : {name : "newpassword", value : "ABCDabc123"}}
            let mockEventconfirmnewpassword = {currentTarget : {name : "confirmnewpassword", value : "ABCDabc1234"}}
            mountedPage.instance().handleChange(mockEventcurrentpassword); 
            mountedPage.instance().handleChange(mockEventnewpassword); 
            mountedPage.instance().handleChange(mockEventconfirmnewpassword); 
            mountedPage.instance().doSubmit();
            })

            it ("should show error if old,, new and confirm passwords are same", ()=> {
                let value = "ABCDabcd@123"
                let mockEventcurrentpassword = {currentTarget : {name : "currentpassword", value}}
                let mockEventnewpassword = {currentTarget : {name : "newpassword", value }}
                let mockEventconfirmnewpassword = {currentTarget : {name : "confirmnewpassword", value}}
                mountedPage.instance().handleChange(mockEventcurrentpassword); 
                mountedPage.instance().handleChange(mockEventnewpassword); 
                mountedPage.instance().handleChange(mockEventconfirmnewpassword); 
                mountedPage.instance().doSubmit();
                })
        
    })
})