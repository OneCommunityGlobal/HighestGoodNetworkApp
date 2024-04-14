// eslint-disable-next-line react/function-component-definition
const Loading = () => {
  return (
    <div className="container-fluid" data-testid="loading">
      <div className="fa-5x">
        <i className="fa fa-spinner fa-pulse" data-testid="loading-spinner" />
      </div>
    </div>
  );
};

export default Loading;
