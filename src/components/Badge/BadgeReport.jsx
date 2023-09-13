import { useState, useEffect } from 'react';
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
import moment from 'moment';
import 'moment-timezone';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { boxStyle } from 'styles';
import hasPermission from '../../utils/permissions';
import { changeBadgesByUserID } from '../../actions/badgeManagement';
import './BadgeReport.css';
import { getUserProfile } from '../../actions/userProfile';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
function BadgeReport(props) {
  const { badges, userId, firstName, lastName, close } = props;
  const [sortBadges, setSortBadges] = useState(badges.slice() || []);
  let [numFeatured, setNumFeatured] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [badgesToDelete, setBadgesToDelete] = useState([]);

  const canDeleteBadges = props.hasPermission('deleteBadges');
  const canUpdateBadges = props.hasPermission('updateBadges');

  async function imageToUri(url, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const baseImage = new Image();
    baseImage.crossOrigin = 'anonymous';
    baseImage.src = url.replace('dropbox.com', 'dl.dropboxusercontent.com');
    baseImage.src = baseImage.src.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    baseImage.onload = ()=>{
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      ctx.drawImage(baseImage, 0, 0);
      const uri = canvas.toDataURL('image/png');
      callback(uri);
      canvas.remove();
    };
  }

  const FormatReportForPdf = (badgesArr, callback) => {
    const bgReport = [];
    bgReport[0] = `<h3>Badge Report (Page 1 of ${Math.ceil(badges.length / 4)})</h3>
    <div style="margin-bottom: 20px; color: orange;"><h4>For ${firstName} ${lastName
      }</h4></div>
    <div style="color:#DEE2E6; margin:10px 0px 20px 0px; text-align:center;">_______________________________________________________________________________________________</div>`;
    for (let i = 0; i < badgesArr.length; i++) {
      imageToUri(badgesArr[i].badge.imageUrl, function (uri) {
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
                <div><b>Name:</b> <span class="name">${badgesArr[i].badge.badgeName}</span></div>
                <div><b>Count:</b> ${badgesArr[i].count}</div>
                <div><b>Description:</b> ${badgesArr[i].badge.description}</div>
              </td>
            </tr>
          </tbody>
      </table>
      ${(i + 1) % 4 === 0 && i + 1 !== badgesArr.length
            ? `</br></br></br>
      <h3>Badge Report (Page ${1 + Math.ceil((i + 1) / 4)} of ${Math.ceil(badgesArr.length / 4)})</h3>
    <div style="margin-bottom: 20px; color: orange;"><h4>For ${firstName} ${lastName
            }</h4></div>
    <div style="color:#DEE2E6; margin:10px 0px 20px 0px; text-align:center;">_______________________________________________________________________________________________</div>
      `
            : ''
          }`;
        if (i === badgesArr.length - 1) {
          setTimeout(() => {
            callback(bgReport.join('\n'));
          }, 100);
        }
      });
    }
  };

  const pdfDocGenerator = async () => {
    const CurrentDate = moment().format('MM-DD-YYYY-HH-mm-ss');
    const sortedBadges = sortBadges.slice();
    FormatReportForPdf(sortedBadges, formattedReport => {
      const html = htmlToPdfmake(formattedReport, {
        tableAutoSize: true,
      });
      const docDefinition = {
        content: [html],
        pageBreakBefore(currentNode) {
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
    const CurrentDate = moment().format('MM-DD-YYYY-HH-mm-ss');
    let sortedBadges = sortBadges.slice();
    sortedBadges = sortedBadges.filter(badge => {
      if (badge.featured) {
        return true;
      }
      return false;

    });

    FormatReportForPdf(sortedBadges, formattedReport => {
      const html = htmlToPdfmake(formattedReport, { tableAutoSize: true });
      const docDefinition = {
        content: [html],
        pageBreakBefore(currentNode) {
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
    setSortBadges(badges.slice() || []);
    const newBadges = sortBadges.slice();
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
  }, [badges]);

  const countChange = (badge, index, newValue) => {
    const newBadges = sortBadges.slice();
    const value = newValue.length === 0 ? 0 : parseInt(newValue);
    newBadges[index].count = newValue.length === 0 ? 0 : parseInt(newValue);
    if (
      (value === 0 && badgesToDelete.indexOf(index) === -1) ||
      (newValue.length === 0 && badgesToDelete.indexOf(index) === -1)
    ) {
      setBadgesToDelete(prevBadges => [...prevBadges, index]);
    }
    if (value > 0) {
      setBadgesToDelete(prevBadges => prevBadges.filter(prevBadge => prevBadge !== index));
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    // Add 1 beacuse the month start at zero
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    mm < 10 ? (mm = `0${  mm}`) : mm;
    dd < 10 ? (dd = `0${  dd}`) : dd;
    const formatedDate = `${yyyy}-${mm}-${dd}`;

    newBadges.map((bdg, i) => {
      if (newValue > bdg.count && i === index) {
        bdg.earnedDate.push(formatedDate);
      } else if (newValue < bdg.count && i === index) {
        bdg.earnedDate.pop();
      }
      return null;
    });

    newBadges[index].count = newValue;
    setSortBadges(newBadges);
  };

  const featuredChange = (badge, index, e) => {
    const newBadges = sortBadges.slice();
    if ((e.target.checked && numFeatured < 5) || !e.target.checked) {
      let count = 0;
      setNumFeatured(count);
      newBadges[index].featured = e.target.checked;
      newBadges.forEach(newBadge => {
        if (newBadge.featured) {
          setNumFeatured(++count);
        }
      });
    } else {
      e.target.checked = false;
      toast.error('Unfortunately, you may only select five badges to be featured.');
    }
    setSortBadges(newBadges);
  };

  const handleDeleteBadge = index => {
    setShowModal(true);
    setBadgesToDelete(index);
  };

  const handleCancel = () => {
    setShowModal(false);
    setBadgesToDelete([]);
  };

  const handleDeleteAfterSave = () => {
    const newBadges = sortBadges;
    let indexToDelete = badgesToDelete;
    badgesToDelete.forEach(i => {
      indexToDelete = indexToDelete.filter(index => index !== null);
      newBadges.splice(indexToDelete[0], 1);
      indexToDelete = indexToDelete.map(index => (index === 0 ? null : index - 1));
      indexToDelete.shift();
    });
    setSortBadges(newBadges);
  };

  const deleteBadge = () => {
    const newBadges = sortBadges.slice();
    const [deletedBadge] = newBadges.splice(badgesToDelete, 1);
    if (deletedBadge.featured) {
      setNumFeatured(--numFeatured);
    }
    setSortBadges(newBadges);
    setShowModal(false);
    setBadgesToDelete([]);
  };

  const saveChanges = async () => {
    badgesToDelete.length > 0 && handleDeleteAfterSave();
    const newBadgeCollection = JSON.parse(JSON.stringify(sortBadges));
    for (let i = 0; i < newBadgeCollection.length; i++) {
      newBadgeCollection[i].badge = newBadgeCollection[i].badge._id;
    }

    await props.changeBadgesByUserID(userId, newBadgeCollection);
    await props.getUserProfile(userId);

    props.setUserProfile(prevProfile => {
      return { ...prevProfile, badgeCollection: sortBadges };
    });
    props.setOriginalUserProfile(prevProfile => {
      return { ...prevProfile, badgeCollection: sortBadges };
    });
    props.handleSubmit();
    // close the modal
    close();
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
              {sortBadges &&
                sortBadges.map((value, index) => (
                  <tr key={value._id}>
                    <td className="badge_image_sm">
                      {' '}
                      <img src={value.badge.imageUrl} id={`popover_${index.toString()}`} alt=""/>
                    </td>
                    <UncontrolledPopover trigger="hover" target={`popover_${index.toString()}`}>
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
                      {typeof value.lastModified === 'string'
                        ? value.lastModified.substring(0, 10)
                        : value.lastModified.toLocaleString().substring(0, 10)}
                    </td>
                    <td>
                      {' '}
                      <UncontrolledDropdown className="me-2" direction="down">
                        <DropdownToggle caret color="primary" style={boxStyle}>
                          Dates
                        </DropdownToggle>
                        <DropdownMenu>
                          {value.earnedDate.map(date => {
                            return <DropdownItem>{date}</DropdownItem>;
                          })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
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
                        />
                      ) : (
                        Math.round(value.count)
                      )}
                    </td>
                    {canDeleteBadges ? (
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteBadge(index)}
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
                ))}
            </tbody>
          </Table>
        </div>
        <Button
          className="btn--dark-sea-green float-right"
          style={{ ...boxStyle, margin: 5 }}
          onClick={saveChanges}
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
              {sortBadges &&
                sortBadges.map((value, index) => (
                  <tr key={value._id}>
                    <td className="badge_image_sm">
                      {' '}
                      <img src={value.badge.imageUrl} id={`popover_${index.toString()}`} alt="" />
                    </td>
                    <UncontrolledPopover trigger="hover" target={`popover_${index.toString()}`}>
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
                      {typeof value.lastModified === 'string'
                        ? value.lastModified.substring(0, 10)
                        : value.lastModified.toLocaleString().substring(0, 10)}
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
                                />
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
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => handleDeleteBadge(index)}
                                >
                                  Delete
                                </button>
                              ) : (
                                []
                              )}
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Button
            className="btn--dark-sea-green float-right"
            style={{ margin: 5 }}
            onClick={saveChanges}
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
}

const mapStateToProps = state => {
  return { state };
};

const mapDispatchToProps = dispatch => ({
  changeBadgesByUserID: (userId, badges) => dispatch(changeBadgesByUserID(userId, badges)),
  getUserProfile: userId => dispatch(getUserProfile(userId)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(BadgeReport);
