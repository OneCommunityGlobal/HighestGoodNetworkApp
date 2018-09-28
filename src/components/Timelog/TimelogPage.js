import React, {Component} from 'react';

class TimelogPage extends Component {
    render() {
        return (
            <div>
            <div className="jumbotron">
                TimelogPage
            </div>
              <div>
              <nav class="navbar navbar-expand-md navbar-light bg-light mb-3 nav-fill">
                <li class="navbar-brand">Viewing Timelog For:</li>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#timelogsnapshot" aria-controls="navbarSupportedContent"
                  aria-expanded="false" aria-label="Toggle navigation">
                </button>
                <div class="collapse navbar-collapse" id="timelogsnapshot">
                  <ul class="navbar-nav w-100">
                    <li class="nav-item navbar-text mr-3 w-25" id="timelogweeklychart">
                     hello
                    </li>
                    <li class="nav-item  navbar-text">
                      <span class="fa fa-tasks icon-large" data-toggle="modal" data-target="#actionItems">
                        <icon class="badge badge-pill badge-warning badge-notify"></icon>
                      </span>
                    </li>
                    <li class="nav-item navbar-text">
                      <i class="fa fa-envelope icon-large" data-toggle="modal" data-target="#notifications">
                        <icon class="badge badge-pill badge-warning badge-notify">noti</icon>
                      </i>
                    </li>
                    <li class="nav-item navbar-text">
                      <a class="nav-link" >View Profile</a>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
            </div>
        );
    }
}
export default TimelogPage;