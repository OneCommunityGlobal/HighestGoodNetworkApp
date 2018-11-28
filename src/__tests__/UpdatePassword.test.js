import React from 'react'
import {
    shallow,
    mount
} from 'enzyme'
import UpdatePassword from '../components/UpdatePassword'
let userProfileService = require('../services/userProfileService')


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
                        let value = "";
                        let Input = {
                            name: "currentpassword",
                            "value": value
                        };
                        let mockEventcurrentpassword = {
                            currentTarget: Input
                        }
                        mountedPage.find("#currentpassword").simulate('change', mockEventcurrentpassword)
                        expect(mountedPage.instance().state.errors["currentpassword"]).toEqual('"Current Password" is not allowed to be empty');

                    })
                    it("should show error if new password is left blank", () => {
                        let value = "";
                        let Input = {
                            name: "newpassword",
                            "value": value
                        };
                        let mockEventconfirmpassword = {
                            currentTarget: Input
                        }
                        mountedPage.find("#newpassword").simulate('change', mockEventconfirmpassword)
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
                            let Input = {
                                name: "newpassword",
                                value
                            };
                            let mockEventconfirmpassword = {
                                currentTarget: Input
                            }
                            mountedPage.find("#newpassword").simulate('change', mockEventconfirmpassword)
                            expect(mountedPage.instance().state.errors["newpassword"]).toEqual('"New Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character');

                        });


                    })
                    it("should show error if confirm new password is left blank", () => {
                        let value = "";
                        let Input = {
                            name: "confirmnewpassword",
                            "value": value
                        };
                        let mockEventconfirmnewpassword = {
                            currentTarget: Input
                        }
                        mountedPage.find("#confirmnewpassword").simulate('change', mockEventconfirmnewpassword)
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
                            let Input = {
                                name: "confirmnewpassword",
                                value
                            };
                            let mockEventconfirmnewpassword = {
                                currentTarget: Input
                            }
                            mountedPage.find("#confirmnewpassword").simulate('change', mockEventconfirmnewpassword)
                            expect(mountedPage.instance().state.errors["confirmnewpassword"]).toEqual('"Confirm Password" should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character');

                        });

                    })

                    it("should show error if new and confirm passwords are not same", () => {
                        window.alert = jest.fn();
                        let mockEventcurrentpassword = {
                            currentTarget: {
                                name: "currentpassword",
                                value: "abcde"
                            }
                        }
                        let mockEventnewpassword = {
                            currentTarget: {
                                name: "newpassword",
                                value: "ABCDabc123"
                            }
                        }
                        let mockEventconfirmnewpassword = {
                            currentTarget: {
                                name: "confirmnewpassword",
                                value: "ABCDabc1234"
                            }
                        }
                        mountedPage.find("#currentpassword").simulate('change', mockEventcurrentpassword)
                        mountedPage.find("#newpassword").simulate('change', mockEventnewpassword)
                        mountedPage.find("#confirmnewpassword").simulate('change', mockEventconfirmnewpassword)
                        mountedPage.find("form").simulate("submit", {
                            preventDefault: (() => {})
                        });
                        expect(mountedPage.instance().state.errors["confirmnewpassword"]).toEqual('Confirm Password must match New Password')
                    })

                    it("should show error if old,new, and confirm passwords are same", () => {
                        window.alert = jest.fn();
                        let value = "ABCdef@123"
                        let mockEventcurrentpassword = {
                            currentTarget: {
                                name: "currentpassword",
                                value
                            }
                        }
                        let mockEventnewpassword = {
                            currentTarget: {
                                name: "newpassword",
                                value
                            }
                        }
                        let mockEventconfirmnewpassword = {
                            currentTarget: {
                                name: "confirmnewpassword",
                                value
                            }
                        }
                        mountedPage.find("#currentpassword").simulate('change', mockEventcurrentpassword)
                        mountedPage.find("#newpassword").simulate('change', mockEventnewpassword)
                        mountedPage.find("#confirmnewpassword").simulate('change', mockEventconfirmnewpassword)
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
                        let mockEventcurrentpassword = {
                            currentTarget: {
                                name: "currentpassword",
                                value: "popppp"
                            }
                        }
                        let mockEventnewpassword = {
                            currentTarget: {
                                name: "newpassword",
                                value: value
                            }
                        }
                        let mockEventconfirmnewpassword = {
                            currentTarget: {
                                name: "confirmnewpassword",
                                value: value
                            }
                        }
                        mountedPage.find("#currentpassword").simulate('change', mockEventcurrentpassword)
                        mountedPage.find("#newpassword").simulate('change', mockEventnewpassword)
                        mountedPage.find("#confirmnewpassword").simulate('change', mockEventconfirmnewpassword)
                        mountedPage.find("form").simulate("submit", {
                            preventDefault: (() => {})
                        });
                        expect(spy).toHaveBeenCalled()

                    })

                    it("should show error if api returned error", () => {


                        userProfileService.updatePassword = jest.fn(() => {
                            let response = {
                                status: 400,
                                data: {error: "Some Error"}
                            }
                            throw ({response});
                        })


                        const spy = jest.spyOn(userProfileService, 'updatePassword');
                        let value = "ABCdef@123"
                        let mockEventcurrentpassword = {
                            currentTarget: {
                                name: "currentpassword",
                                value: "popppp"
                            }
                        }
                        let mockEventnewpassword = {
                            currentTarget: {
                                name: "newpassword",
                                value: value
                            }
                        }
                        let mockEventconfirmnewpassword = {
                            currentTarget: {
                                name: "confirmnewpassword",
                                value: value
                            }
                        }
                        mountedPage.find("#currentpassword").simulate('change', mockEventcurrentpassword)
                        mountedPage.find("#newpassword").simulate('change', mockEventnewpassword)
                        mountedPage.find("#confirmnewpassword").simulate('change', mockEventconfirmnewpassword)
                        mountedPage.find("form").simulate("submit", {
                            preventDefault: (() => {})
                        });
                       expect(mountedPage.instance().state.errors["currentpassword"]).toEqual("Some Error")
                       

                    })

                    xit("should navigate to login if api call is successfull", () => {


                        userProfileService.updatePassword = jest.fn(() => {
                            let response = {
                                status: 200,
                                data: {message: "updated"}
                            }
                            return ({response});
                        })


                        window.location.assign = jest.fn();
                        let value = "ABCdef@123"
                        let mockEventcurrentpassword = {
                            currentTarget: {
                                name: "currentpassword",
                                value: "popppp"
                            }
                        }
                        let mockEventnewpassword = {
                            currentTarget: {
                                name: "newpassword",
                                value: value
                            }
                        }
                        let mockEventconfirmnewpassword = {
                            currentTarget: {
                                name: "confirmnewpassword",
                                value: value
                            }
                        }
                        mountedPage.find("#currentpassword").simulate('change', mockEventcurrentpassword)
                        mountedPage.find("#newpassword").simulate('change', mockEventnewpassword)
                        mountedPage.find("#confirmnewpassword").simulate('change', mockEventconfirmnewpassword)
                        mountedPage.find("form").simulate("submit", {
                            preventDefault: (() => {})
                        });
                        var util = require('util')
                       console.log(util.inspect(window.location.assign))
                        expect(window.location.assign).toHaveBeenCalled();
                       

                    })
                })
            })