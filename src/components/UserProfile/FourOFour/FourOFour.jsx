import React from 'react'


const divStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  margin: '40px'
}

const title = {
  fontSize: '50px',
  fontWeight: 'bold'
}

const FourOFour = () => {
  return(
    <div style={divStyle}>
      <h1 style={title}>404</h1>
      <h3>Page not found</h3>
    </div>
  )
}

export default FourOFour;
