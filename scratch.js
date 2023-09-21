<Col
md={props.edit ? '10' : '12'}
style={{
  backgroundColor: '#e9ecef',
  border: '1px solid #ced4da',
  marginBottom: '10px',
}}
>
<span className="projects-span">Projects</span>
</Col>
{

props.edit && props.role && (
<Col md="2">
  { 
  hasPermission(props.role, 'assignUserInProject', roles, userPermissions) ? (
    <>
            <Button
              className="btn-addproject"
              color="primary"
              onClick={() => {
                props.onButtonClick();
              }}
            >
              Assign Project
            </Button>
        <Col md="5" style={{padding: '0'}}>
          {
            canAssignProjectToUsers && props.disabled ? (
            
              <div
                className="div-addproject"
                title="Please save changes before assign project"
              >
                <Button className="btn-addproject" color="primary" disabled>
                  Assign Project
                </Button>
              </div>
            ) : (
              <Button
                className="btn-addproject"
                color="primary"
                onClick={() => {
                  props.onButtonClick();
                }}
                style={boxStyle}
              >
                Assign Project
              </Button>
            )
          
        }
       </Col> 
      
</>


)

} 
</Col>


)}