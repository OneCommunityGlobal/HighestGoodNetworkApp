
function ErrorAlert({error, message}){
  return (
    error && (
      <div className="alert alert-danger m-2">{message}</div>
    )
  )
}


export default ErrorAlert