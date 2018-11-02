let getCurrentUser_result;
let getCurrentUseroptions = 
    {
        "userPresent" : {foo: "bar" , baz : "masklsd"},
        "userNotPresent" : null
    };

getCurrentUser.__setValue = (option) => {

    getCurrentUser_result = getCurrentUseroptions[option];
    
}

export function getCurrentUser()
{
    return getCurrentUser_result  ;   
    
}

export function login(credentials)
{
    console.log("Invoking fake login method of loginService")
    return "Suvccess"
    

}