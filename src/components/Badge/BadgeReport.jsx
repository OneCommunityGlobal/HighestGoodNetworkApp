import React, { useState, useEffect } from 'react';
import { changeBadgesByUserID } from '../../actions/badgeManagement';
import {
  Table,
  Button,
  ButtonGroup,
  Input,
  Card,
  CardTitle,
  CardBody,
  CardImg,
  CardText,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  FormGroup,
  UncontrolledDropdown,
  UncontrolledPopover,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import moment from 'moment';
import 'moment-timezone';
import { connect } from 'react-redux';
import { getUserProfile } from '../../actions/userProfile';
import { toast } from 'react-toastify';
import hasPermission from '../../utils/permissions';
import './BadgeReport.css';
import { boxStyle } from 'styles';
import { formatDate } from 'utils/formatDate';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
const BadgeReport = props => {
  let [sortBadges, setSortBadges] = useState(JSON.parse(JSON.stringify(props.badges)) || []);
  let [numFeatured, setNumFeatured] = useState(0);
  let [showModal, setShowModal] = useState(false);
  let [badgeToDelete, setBadgeToDelete] = useState([]);
  

  const canDeleteBadges = props.hasPermission('deleteBadges');
  const canUpdateBadges = props.hasPermission('updateBadges');
  const canAssignBadges = props.hasPermission('assignBadges');
  const canModifyBadgeAmount = props.hasPermission('modifyBadgeAmount');

  async function imageToUri(url, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let base_image = new Image();
    base_image.crossOrigin = 'anonymous';
    base_image.src = url.replace('dropbox.com', 'dl.dropboxusercontent.com');
    base_image.src = base_image.src.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    base_image.onload = function() {
      canvas.width = base_image.width;
      canvas.height = base_image.height;

      ctx.drawImage(base_image, 0, 0);
      let uri = canvas.toDataURL('image/png');
      callback(uri);

      canvas.remove();
    };
  }

  const FormatReportForPdf = (badges, callback) => {
    let bgReport = [];
    bgReport[0] = `<h3>Badge Report (Page 1 of ${Math.ceil(badges.length / 4)})</h3>
    <div style="margin-bottom: 20px; color: orange;"><h4>For ${props.firstName} ${
      props.lastName
    }</h4></div>
    <div style="color:#DEE2E6; margin:10px 0px 20px 0px; text-align:center;">_______________________________________________________________________________________________</div>`;
    for (let i = 0; i < badges.length; i++) {
      imageToUri(badges[i].badge.imageUrl, function(uri) {
        bgReport[i + 1] = `
        <table>
          <thead>
            <tr>
              <th>Badge Image</th>
              <th>Badge Name, Count Awarded & Badge Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width:160px">
                <div><img height="150" width="150" src=${uri}/></div>
              </td>
              <td style="width:500px">
                <div><b>Name:</b> <span class="name">${badges[i].badge.badgeName}</span></div>
                <div><b>Count:</b> ${badges[i].count}</div>
                <div><b>Description:</b> ${badges[i].badge.description}</div>
              </td>
            </tr>
          </tbody>
      </table>
      ${
        (i + 1) % 4 == 0 && i + 1 !== badges.length
          ? `</br></br></br>
      <h3>Badge Report (Page ${1 + Math.ceil((i + 1) / 4)} of ${Math.ceil(badges.length / 4)})</h3>
    <div style="margin-bottom: 20px; color: orange;"><h4>For ${props.firstName} ${
              props.lastName
            }</h4></div>
    <div style="color:#DEE2E6; margin:10px 0px 20px 0px; text-align:center;">_______________________________________________________________________________________________</div>
      `
          : ''
      }`;
        if (i == badges.length - 1) {
          setTimeout(() => {
            callback(bgReport.join('\n'));
          }, 100);
        }
      });
    }
  };

  const pdfDocGenerator = async () => {
    let CurrentDate = moment().format('MM-DD-YYYY-HH-mm-ss');
    let badges = sortBadges.slice();
    FormatReportForPdf(badges, formattedReport => {
      const html = htmlToPdfmake(formattedReport, {
        tableAutoSize: true,
      });
      let docDefinition = {
        content: [html],
        pageBreakBefore: function(currentNode) {
          return currentNode.style && currentNode.style.indexOf('pdf-pagebreak-before') > -1;
        },
        styles: {
          'html-div': { margin: [0, 4, 0, 4] },
          name: {
            background: 'white',
          },
        },
      };
      pdfMake.createPdf(docDefinition).download(`Badge-Report-${CurrentDate}`);
    });
  };

  const pdfFeaturedDocGenerator = async () => {
    let CurrentDate = moment().format('MM-DD-YYYY-HH-mm-ss');
    let badges = sortBadges.slice();
    badges = badges.filter(badge => {
      if (badge.featured) {
        return true;
      } else {
        return false;
      }
    });

    FormatReportForPdf(badges, formattedReport => {
      const html = htmlToPdfmake(formattedReport, { tableAutoSize: true });
      let docDefinition = {
        content: [html],
        pageBreakBefore: function(currentNode) {
          return currentNode.style && currentNode.style.indexOf('pdf-pagebreak-before') > -1;
        },
        styles: {
          'html-div': { margin: [0, 4, 0, 4] },
          name: {
            background: 'white',
          },
        },
      };
      pdfMake.createPdf(docDefinition).download(`Featured-Badge-Report-${CurrentDate}`);
    });
  };

  useEffect(() => {
    setSortBadges(JSON.parse(JSON.stringify(props.badges)) || []);
    let newBadges = sortBadges.slice();
    newBadges.sort((a, b) => {
      if (a.badge.ranking === 0) return 1;
      if (b.badge.ranking === 0) return -1;
      if (a.badge.ranking > b.badge.ranking) return 1;
      if (a.badge.ranking < b.badge.ranking) return -1;
      if (a.badge.badgeName > b.badge.badgeName) return 1;
      if (a.badge.badgeName < b.badge.badgeName) return -1;
      return 0;
    });
    setNumFeatured(0);
    newBadges.forEach((badge, index) => {
      if (badge.featured) {
        setNumFeatured(++numFeatured);
      }

      if (typeof newBadges[index] === 'string') {
        newBadges[index].lastModified = new Date(newBadges[index].lastModified);

      }
    });
    setSortBadges(newBadges);
  }, [props.badges]);

  const countChange = (badge, index, newValue) => {
    let newBadges = sortBadges.slice();
    let value = newValue.length === 0 ? 0 : parseInt(newValue);
    const oldBadge = JSON.parse(JSON.stringify(badge));
    newBadges[index].count = newValue.length === 0 ? 0 : parseInt(newValue);
    if (value === 0 || newValue.length === 0) {
        if(canModifyBadgeAmount && (!canUpdateBadges || !canDeleteBadges)){
          newValue = 1;
        }else{
        // upon reaching 0, show delete modal
        handleDeleteBadge(oldBadge);
      }
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    // Add 1 beacuse the month start at zero
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    mm < 10 ? (mm = '0' + mm) : mm;
    dd < 10 ? (dd = '0' + dd) : dd;
    const formatedDate = `${yyyy}-${mm}-${dd}`;

    newBadges.map((bdg, i) => {
      if (newValue > bdg.count && i === index) {
        bdg.earnedDate.push(formatedDate);
      } else if (newValue < bdg.count && i === index) {
        bdg.earnedDate.pop();
      }
    });

    newBadges[index].count = newValue;
    setSortBadges(newBadges);
  };

  const featuredChange = (badge, index, e) => {
    let newBadges = sortBadges.slice();
    if ((e.target.checked && numFeatured < 5) || !e.target.checked) {
      let count = 0;
      setNumFeatured(count);
      newBadges[index].featured = e.target.checked;
      newBadges.forEach((badge, index) => {
        if (badge.featured) {
          setNumFeatured(++count);
        }
      });
    } else {
      e.target.checked = false;
      toast.error('Unfortunately, you may only select five badges to be featured.');
    }
    setSortBadges(newBadges);
  };

  const handleDeleteBadge = oldBadge => {
    setShowModal(true);
    setBadgeToDelete(oldBadge);
  };

  const handleCancel = () => {
    setShowModal(false);
    if (badgeToDelete) {
      const index = sortBadges.findIndex(badge => badge.badge._id === badgeToDelete.badge._id);
      countChange(badgeToDelete, index, badgeToDelete.count);
    }
    setBadgeToDelete([]);
  };

  const deleteBadge = () => {
    let newBadges = sortBadges.filter(badge => badge.badge._id !== badgeToDelete.badge._id);
    if (badgeToDelete.featured) {
      setNumFeatured(--numFeatured);
    }
    setSortBadges(newBadges);
    setShowModal(false);
    setBadgeToDelete([]);
  };

  const saveChanges = async () => {
    let newBadgeCollection = JSON.parse(JSON.stringify(sortBadges));
    for (let i = 0; i < newBadgeCollection.length; i++) {
      newBadgeCollection[i].badge = newBadgeCollection[i].badge._id;
    }

    await props.changeBadgesByUserID(props.userId, newBadgeCollection);
    await props.getUserProfile(props.userId);

    props.setUserProfile(prevProfile => {
      return { ...prevProfile, badgeCollection: sortBadges };
    });
    props.setOriginalUserProfile(prevProfile => {
      return { ...prevProfile, badgeCollection: sortBadges };
    });
    props.handleSubmit();
    //close the modal
    props.close();
  };

  return (
    <div>
      <div className="desktop">
        <div style={{ overflowY: 'scroll', height: '75vh' }}>
          <Table>
            <thead style={{ zIndex: '10' }}>
              <tr style={{ zIndex: '10' }}>
                <th style={{ width: '93px' }}>Badge</th>
                <th>Name</th>
                <th style={{ width: '110px' }}>Modified</th>
                <th style={{ width: '110px' }}>Earned Dates</th>
                <th style={{ width: '90px' }}>Count</th>
                {canDeleteBadges ? <th>Delete</th> : []}
                <th style={{ width: '70px', zIndex: '1' }}>Featured</th>
              </tr>
            </thead>
            <tbody>
              {sortBadges && sortBadges.length ? (
                sortBadges.map((value, index) => (
                  <tr key={index}>
                    <td className="badge_image_sm">
                      {' '}
                      <img src={value.badge.imageUrl} id={'popover_' + index.toString()} />
                    </td>
                    <UncontrolledPopover trigger="hover" target={'popover_' + index.toString()}>
                      <Card className="text-center">
                        <CardImg className="badge_image_lg" src={value?.badge?.imageUrl} />
                        <CardBody>
                          <CardTitle
                            style={{
                              fontWeight: 'bold',
                              fontSize: 18,
                              color: '#285739',
                              marginBottom: 15,
                            }}
                          >
                            {value.badge?.badgeName}
                          </CardTitle>
                          <CardText>{value.badge?.description}</CardText>
                        </CardBody>
                      </Card>
                    </UncontrolledPopover>
                    <td>{value.badge.badgeName}</td>
                    <td>
                      {typeof value.lastModified == 'string'
                        // ? formatDate(value.lastModified.substring(0, 10))
                        ? formatDate(value.lastModified)
                        : value.lastModified.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
                    </td>
                    <td>
                      {' '}
                      <UncontrolledDropdown className="me-2" direction="down">
                        <DropdownToggle caret color="primary" style={boxStyle}>
                          Dates
                        </DropdownToggle>
                        <DropdownMenu>
                          {value.earnedDate.map((date, i) => {
                            return <DropdownItem key={i}>{date}</DropdownItem>;
                          })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </td>
                    <td>
                      {canUpdateBadges || canModifyBadgeAmount ? (
                        <Input
                          type="number"
                          value={Math.round(value.count)}
                          min={0}
                          step={1}
                          onChange={e => {
                            countChange(value, index, e.target.value);
                          }}
                        ></Input>
                      ) : (
                        Math.round(value.count)
                      )}
                    </td>
                    {canDeleteBadges ? (
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={e => handleDeleteBadge(sortBadges[index])}
                          style={boxStyle}
                        >
                          Delete
                        </button>
                      </td>
                    ) : (
                      []
                    )}
                    <td style={{ textAlign: 'center' }}>
                      <FormGroup check inline style={{ zIndex: '0' }}>
                        <Input
                          /* alternative to using the formgroup
                          style={{ position: 'static' }} 
                          */
                          type="checkbox"
                          id={value.badge._id}
                          checked={value.featured}
                          onChange={e => {
                            featuredChange(value, index, e);
                          }}
                          disabled={canModifyBadgeAmount && !(canUpdateBadges || canAssignBadges)}
                        />
                      </FormGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    {`${props.isUserSelf ? 'You have' : 'This person has'} no badges.`}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <Button
          className="btn--dark-sea-green float-right"
          style={{ ...boxStyle, margin: 5 }}
          onClick={e => {
            saveChanges();
          }}
        >
          Save Changes
        </Button>
        <Button
          className="btn--dark-sea-green float-right"
          style={{ ...boxStyle, margin: 5 }}
          onClick={pdfDocGenerator}
        >
          Export All Badges to PDF
        </Button>
        <Button
          className="btn--dark-sea-green float-right"
          style={{ ...boxStyle, margin: 5 }}
          onClick={pdfFeaturedDocGenerator}
        >
          Export Selected/Featured Badges to PDF
        </Button>
        <Modal isOpen={showModal}>
          <ModalBody>
            <p>Woah, easy tiger! Are you sure you want to delete this badge?</p>
            <br />
            <p>
              Note: Even if you click &quot;Yes, Delete&quot;, this won&apos;t be fully deleted
              until you click the &quot;Save Changes&quot; button below.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleCancel()} style={boxStyle}>
              Cancel
            </Button>
            <Button color="danger" onClick={() => deleteBadge()} style={boxStyle}>
              Yes, Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      <div className="tablet">
        <div style={{ overflow: 'auto', height: '68vh' }}>
          <Table>
            <thead style={{ zIndex: '10' }}>
              <tr style={{ zIndex: '10' }}>
                <th style={{ width: '93px' }}>Badge</th>
                <th>Name</th>
                <th style={{ width: '110px' }}>Modified</th>
                <th style={{ width: '100%', zIndex: '10' }}>Earned</th>
              </tr>
            </thead>
            <tbody>
              {sortBadges && sortBadges.length ? (
                sortBadges.map((value, index) => (
                  <tr key={index}>
                    <td className="badge_image_sm">
                      {' '}
                      <img src={value.badge.imageUrl} id={'popover_' + index.toString()} />
                    </td>
                    <UncontrolledPopover trigger="hover" target={'popover_' + index.toString()}>
                      <Card className="text-center">
                        <CardImg className="badge_image_lg" src={value?.badge?.imageUrl} />
                        <CardBody>
                          <CardTitle
                            style={{
                              fontWeight: 'bold',
                              fontSize: 18,
                              color: '#285739',
                              marginBottom: 15,
                            }}
                          >
                            {value.badge?.badgeName}
                          </CardTitle>
                          <CardText>{value.badge?.description}</CardText>
                        </CardBody>
                      </Card>
                    </UncontrolledPopover>
                    <td>{value.badge.badgeName}</td>
                    <td>
                      {typeof value.lastModified == 'string'
                        ? formatDate(value.lastModified)
                        : value.lastModified.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}
                    </td>

                    <td>
                      <ButtonGroup style={{ marginLeft: '8px' }}>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            caret
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '80px',
                            }}
                          >
                            Options
                          </DropdownToggle>

                          <DropdownMenu>
                            <DropdownItem
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                whiteSpace: 'now-rap',
                                gap: '8px',
                                height: '60px',
                              }}
                              toggle={false}
                            >
                              <span style={{ fontWeight: 'bold' }}>Count:</span>
                              {canUpdateBadges ? (
                                <Input
                                  type="number"
                                  value={Math.round(value.count)}
                                  min={0}
                                  step={1}
                                  onChange={e => {
                                    countChange(value, index, e.target.value);
                                  }}
                                  style={{ width: '70px' }}
                                ></Input>
                              ) : (
                                Math.round(value.count)
                              )}
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                whiteSpace: 'now-rap',
                                gap: '8px',
                                height: '60px',
                              }}
                              toggle={false}
                            >
                              <span style={{ fontWeight: 'bold' }}>Featured:</span>
                              <FormGroup check inline style={{ zIndex: '0' }}>
                                <Input
                                  /* alternative to using the formgroup
                                  style={{ position: 'static' }} 
                                  */
                                  type="checkbox"
                                  id={value.badge._id}
                                  checked={value.featured}
                                  onChange={e => {
                                    featuredChange(value, index, e);
                                  }}
                                />
                              </FormGroup>
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '60px',
                              }}
                            >
                              {canDeleteBadges ? (
                                <div
                                  className="btn btn-danger"
                                  onClick={e => handleDeleteBadge(sortBadges[index])}
                                >
                                  Delete
                                </div>
                              ) : (
                                []
                              )}
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    {`${props.isUserSelf ? 'You have' : 'This person has'} no badges.`}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Button
            className="btn--dark-sea-green float-right"
            style={{ margin: 5 }}
            onClick={e => {
              saveChanges();
            }}
          >
            <span>Save Changes</span>
          </Button>
          <Button
            className="btn--dark-sea-green float-right"
            style={{ margin: 5 }}
            onClick={pdfDocGenerator}
          >
            <span>Export All Badges to PDF</span>
          </Button>
          <Button
            className="btn--dark-sea-green float-right"
            style={{ margin: 5 }}
            onClick={pdfFeaturedDocGenerator}
          >
            <span>Export Selected/Featured Badges to PDF</span>
          </Button>
        </div>
        <Modal isOpen={showModal}>
          <ModalBody>
            <p>Woah, easy tiger! Are you sure you want to delete this badge?</p>
            <br />
            <p>
              Note: Even if you click &quot;Yes, Delete&quot;, this won&apos;t be fully deleted
              until you click the &quot;Save Changes&quot; button below.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleCancel()} style={boxStyle}>
              Cancel
            </Button>
            <Button color="danger" onClick={() => deleteBadge()} style={boxStyle}>
              Yes, Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return { state };
};

const mapDispatchToProps = dispatch => ({
  changeBadgesByUserID: (userId, badges) => dispatch(changeBadgesByUserID(userId, badges)),
  getUserProfile: userId => dispatch(getUserProfile(userId)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BadgeReport);
