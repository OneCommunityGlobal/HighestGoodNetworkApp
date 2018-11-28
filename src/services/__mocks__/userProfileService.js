export function updatePassword(option) {
let response;
console.log("hererre")
    switch (option) {
        case "succes":
          response = {status: 200, data: {message: "updated password"}}
         
        case "error":
         let response = {status: 400, data: {error: "SomeError"}}
        default:
        let response = {status: 400, data: {error: "SomeError"}}
    }
    return response;

  }