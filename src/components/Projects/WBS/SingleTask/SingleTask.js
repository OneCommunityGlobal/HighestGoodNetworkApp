
const SingleTask = (props) => {
  console.log("single task props is: ", props)
  const taskId = props.match.params.taskId;
  console.log("task id is: ", taskId)

  return (
    <p>Hello world</p>
  );

}

export default SingleTask;