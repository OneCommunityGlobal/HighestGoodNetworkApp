import React from 'react'
import {
    shallow,
    mount
} from 'enzyme'
import UpdatePassword from '../components/UpdatePassword'
import sinon from 'sinon'
import {
    toast, ToastContainer
} from 'react-toastify';
import { EventEmitter } from 'events';
let userProfileService = require('../services/userProfileService')

const setField = function (page, name, value) {
    let mockEvent = {
        currentTarget: {
            name,
            value
        }
    }
    page.find(`#${name}`).simulate('change', mockEvent)

}


describe("Update Password Page", () => {
            let mountedPage;
            beforeEach(() => {
                    mountedPage = shallow( < UpdatePassword match = {
                            {
                                params: {
                                    userId: 1
                                }
                            }
                        }
                        />)
                    })

                describe("Structure", () => {
                    it("should have 3 input fields", () => {

                        const inputs = mountedPage.find('Input')
                        expect(inputs.length).toBe(3)

                    })
                    it("should have 1 button fields", () => {

                        const button = mountedPage.find('button')
                        expect(button.length).toBe(1)

                    })
                    it("should have submit button in disabled state by default", () => {
                        const button = mountedPage.find('button');
                        expect(button.props()).toHaveProperty("disabled")
                    })

                    it("should have userId as a prop", () => {
                        expect(mountedPage.instance().props.match.params).toHaveProperty("userId")
                    })


                })

                describe("For incorrect user inputs", () => {
                    it("should show error if current password is left blank", () => {
                        setField(mountedPage, "currentpassword", "");
                        expect(mountedPage.instance().state.errors["currentpassword"]).toEqual('"Current Password" is not allowed to be empty');

                    })
                    it("should show error if new password is left blank", () => {

                        setField(mountedPage, "newpassword", "")

                        expect(mountedPage.instance().state.errors["newpassword"]).toEqual('"New Password" is not allowed to be empty');

                    })

                    it("should show error if new password is not as per specifications", () => {
                        let errorValues = [
                            "a", //less than 8
                            "abcdefgh123", //no upper case
                            "ABCDERF12344", //no lower case
                            "ABCDEFabc", // no numbers or special characters              

                        ]
                        errorValues.forEach(value => {
                            setField(mountedPage, "newpassword", value)
                            expect(mountedPage.instance().state.errors["newpassword"]).toEqual('"New Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character');

                        });


                    })
                    it("should show error if confirm new password is left blank", () => {

                        setField(mountedPage, "confirmnewpassword", "")
                        expect(mountedPage.instance().state.errors["confirmnewpassword"]).toEqual('"Confirm Password" is not allowed to be empty');

                    })

                    it("should show error if confirm new password is not as per specifications", () => {
                        let errorValues = [
                            "aAAA12", //less than 8
                            "abcdefgh123", //no upper case
                            "ABCDERF12344", //no lower case
                            "ABCDEFabc", // no numbers or special characters              

                        ]
                        errorValues.forEach(value => {
                            setField(mountedPage, "confirmnewpassword", value)
                            expect(mountedPage.instance().state.errors["confirmnewpassword"]).toEqual('"Confirm Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character');

                        });

                    })

                    it("should show error if new and confirm passwords are not same", () => {
                        setField(mountedPage, "currentpassword", "abcde")
                        setField(mountedPage, "newpassword", "ABCDabc123")
                        setField(mountedPage, "confirmnewpassword", "ABCDabc1234")

                        mountedPage.find("form").simulate("submit", {
                            preventDefault: (() => {})
                        });
                        expect(mountedPage.instance().state.errors["confirmnewpassword"]).toEqual('Confirm Password must match New Password')
                    })

                    it("should show error if old,new, and confirm passwords are same", () => {
                        setField(mountedPage, "currentpassword", "ABCDabc123")
                        setField(mountedPage, "newpassword", "ABCDabc123")
                        setField(mountedPage, "confirmnewpassword", "ABCDabc123")
                        mountedPage.find("form").simulate("submit", {
                            preventDefault: (() => {})
                        });
                        expect(mountedPage.instance().state.errors["newpassword"]).toEqual('Old and new passwords should not be same')
                    })


                })

                describe("Behavior", () => {

                    it("should call updatePassword on submit", () => {
                        const userProfileService = require('../services/userProfileService')
                        const spy = jest.spyOn(userProfileService, 'updatePassword');
                        let value = "ABCdef@123"
                        setField(mountedPage, "currentpassword", "pop")
                        setField(mountedPage, "newpassword", value)
                        setField(mountedPage, "confirmnewpassword", value)

                        mountedPage.find("form").simulate("submit", {
                            preventDefault: (() => {})
                        });
                        expect(spy).toHaveBeenCalled()

                    })

                    it("should show error if api returned error", () => {


                        userProfileService.updatePassword = jest.fn(() => {
                            let response = {
                                status: 400,
                                data: {
                                    error: "Some Error"
                                }
                            }
                            throw ({
                                response
                            });
                        })

                        let value = "ABCdef@123"
                        setField(mountedPage, "currentpassword", "pop")
                        setField(mountedPage, "newpassword", value)
                        setField(mountedPage, "confirmnewpassword", value)
                        mountedPage.find("form").simulate("submit", {
                            preventDefault: (() => {})
                        });
                        expect(mountedPage.instance().state.errors["currentpassword"]).toEqual("Some Error")


                    })

                    it("should show a toastor error if API response was other than 200 and 400", async () => {

                        toast.error = jest.fn()
                        userProfileService.updatePassword = jest.fn(() => {

                            let response = {
                                status: 433,
                                data: {
                                    message: "updated"
                                }
                            }
                            throw ({
                                response
                            });
                        })


                        let value = "ABCdef@123"
                        setField(mountedPage, "currentpassword", "pop")
                        setField(mountedPage, "newpassword", value)
                        setField(mountedPage, "confirmnewpassword", value)
                        await mountedPage.find("form").simulate("submit", {
                            preventDefault: (() => {})
                        });

                        let message = "Something went wrong. Please contact your administrator.";

                        expect(toast.error).toHaveBeenCalledWith(message);


                    })
                   
                    it("should show call toastr success with correct message and onClose param on success", async () => {

                        toast.success = jest.fn();
                        let response = {
                            status: 200,data: {message: "updated"}}

                        userProfileService.updatePassword = jest.fn(() => response)

                        let value = "ABCdef@123"
                        setField(mountedPage, "currentpassword", "pop")
                        setField(mountedPage, "newpassword", value)
                        setField(mountedPage, "confirmnewpassword", value)
                        await mountedPage.find("form").simulate("submit", {
                            preventDefault: (() => {})
                        });

                        let message = "Your password has been updated. You will be logged out and directed to login page where you can login with your new password.";
                        let options = {onClose: expect.any(Function)};
                        let successParams = [message, options]

                        expect(toast.success).toHaveBeenCalledWith(...successParams);


                    })
                         

                })
            })