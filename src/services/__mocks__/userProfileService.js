export function updatePassword(option) {

    switch (option) {
        case "succes":
         let response = {status: 200, data: {message: "updated password"}}
         return response; 
        case "error":
         let response = {status: 400, data: {error: "SomeError"}}
        default:
            break;
    }

  }