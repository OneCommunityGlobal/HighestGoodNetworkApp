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
  UncontrolledTooltip
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
    let copyOfExisitingBadges = [...sortBadges];
    newValue = newValue === null || newValue === undefined ? -1 : parseInt(newValue);
    if( newValue < 0 || !copyOfExisitingBadges || copyOfExisitingBadges.length === 0){
      toast.error('Error: Invalid badge count or the badge is not exist in the badge records. Please fresh the page. If the problem persists, please contact the administrator.');
      return;
    }
    
    const recordBeforeUpdate = props.badges.filter(item => item.badge._id === badge.badge._id);
    // New requirement: We want to keep to the earned date so that there's still a record
    // that badges were earned. hasBadgeDeletionImpact indicates a deletion has occured.
    // The original code which remove the earned date is deleted.
    if(recordBeforeUpdate.length !== 0){
      const badgePrevState = badge;
      if(newValue === 0) {
        // Prev states before onChange event
        handleDeleteBadge(badgePrevState);
        // let newBadges = sortBadges.filter(badge => badge.badge._id !== badgeToDelete.badge._id);
        // setSortBadges(newBadges);
        return;
      } else{
        // Value of the existing record from the database before frontend udpate commit to db. 
        const badgeCountFromExsitingRecord =  parseInt(recordBeforeUpdate[0].count);
        
        const currentDate = new Date(Date.now());
        const formatedDate = formatDate(currentDate)
        // new > prev && new > exsiting: check impact of deletion and push new date. Case: decrease and increase. Remove temp asterisk.
        // new > prev && new < exsiting: do nothihng
        // new < prev && new < exsiting: set deletion flag to true
        // new < prev && new > exsiting OR new < pre && new === existing: remove earned date. Case: increase then decrease. Remove temp added earned dates. 
        // new > prev && new === exsiting: remove temp asterisk
        copyOfExisitingBadges = copyOfExisitingBadges.map(item => {
          if(item.badge._id === badge.badge._id){
            if(newValue > badgePrevState.count && newValue >= badgeCountFromExsitingRecord){
              debugger;
              if(recordBeforeUpdate[0].hasBadgeDeletionImpact === false){
                item.hasBadgeDeletionImpact = false;
              }
              if(newValue > badgeCountFromExsitingRecord){
                item.earnedDate = [...item.earnedDate, formatedDate]
              }
            }  else if (newValue < badgePrevState.count && newValue < badgeCountFromExsitingRecord && !item.hasBadgeDeletionImpact ){
              item.hasBadgeDeletionImpact = true;
            } else {
              item.earnedDate =  item.earnedDate.slice(0, -1)
            }
            item.count = newValue;
            return item;
          }
          return item;
        });
      }
      setSortBadges(copyOfExisitingBadges);
    } else{
      toast.error('Error: The badge may not exist in the badge records. Please fresh the page. If the problem persists, please contact the administrator.');
      return;
    }
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
    // Update: we will compare the original count with the new count to detect badge deletion


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
                <th style={{ width: '90px' }}>Badge</th>
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
                    <td style={{ display: 'flex', alignItems: 'center' }} >
                      <>
                      {' '}
                      <UncontrolledDropdown className="me-2" direction="down" >
                        <DropdownToggle caret color="primary" style={boxStyle} >
                          Dates
                        </DropdownToggle>
                        <DropdownMenu className='badge_dropdown'>
                          {value.earnedDate.map((date, i) => {
                            return <DropdownItem key={i}>{date}</DropdownItem>;
                          })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                      {value.hasBadgeDeletionImpact && value.hasBadgeDeletionImpact === true ?
                            (<>
                              <span id="mismatchExplainationTooltip" style={{paddingLeft: '3px'}}>
                                {'  '} *
                              </span>
                              <UncontrolledTooltip
                                placement="bottom"
                                target="mismatchExplainationTooltip"
                                style={{ maxWidth: '300px' }}
                              >
                                This record contains a mismatch in the badge count and associated dates. It indicates that a badge has been deleted. 
                                Despite the deletion, we retain the earned date to ensure a record of the badge earned for historical purposes.
                              </UncontrolledTooltip>
                            </>)
                            : null
                        }
                      </>
                    </td>
                    <td>
                      {canUpdateBadges ? (
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

                          <DropdownMenu >
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
