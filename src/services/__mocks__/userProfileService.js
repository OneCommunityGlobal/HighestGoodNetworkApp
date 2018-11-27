export function updatePassword(option) {

    switch (option) {
        case "succes":
         let response = {status: 200, data: {message: "updated password"}}
         return response;    
        default:
            break;
    }

  }