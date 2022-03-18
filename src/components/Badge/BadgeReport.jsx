import React, { useState, useEffect } from 'react';
import { changeBadgesByUserID } from '../../actions/badgeManagement';
import {
  Table,
  Button,
  Input,
  Card,
  CardTitle,
  CardBody,
  CardImg,
  CardText,
  UncontrolledPopover,
  Modal,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import moment from 'moment';
import 'moment-timezone';
import { connect } from 'react-redux';
import { getUserProfile } from '../../actions/userProfile';
import { toast } from 'react-toastify';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
const BadgeReport = (props) => {
  let [sortBadges, setSortBadges] = useState(props.badges.slice() || []);
  let [numFeatured, setNumFeatured] = useState(0);
  let [showModal, setShowModal] = useState(false);
  let [badgeToDelete, setBadgeToDelete] = useState(null);

  async function imageToUri(url, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let base_image = new Image();
    base_image.crossOrigin = 'anonymous';
    base_image.src = url.replace('dropbox.com', 'dl.dropboxusercontent.com');
    base_image.src = base_image.src.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    base_image.onload = function () {
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
      imageToUri(badges[i].badge.imageUrl, function (uri) {
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
    FormatReportForPdf(badges, (formattedReport) => {
      const html = htmlToPdfmake(formattedReport, {
        tableAutoSize: true,
      });
      let docDefinition = {
        content: [html],
        pageBreakBefore: function (currentNode) {
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
    badges = badges.filter((badge) => {
      if (badge.featured) {
        return true;
      } else {
        return false;
      }
    });

    FormatReportForPdf(badges, (formattedReport) => {
      const html = htmlToPdfmake(formattedReport, { tableAutoSize: true });
      let docDefinition = {
        content: [html],
        pageBreakBefore: function (currentNode) {
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
    setSortBadges(props.badges.slice() || []);
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
    console.log(numFeatured);
    setSortBadges(newBadges);
  }, [props.badges]);

  const countChange = (badge, index, newValue) => {
    let newBadges = sortBadges.slice();
    newBadges[index].count = newValue;
    setSortBadges(newBadges);
  };

  const featuredChange = (badge, index, e) => {
    console.log(numFeatured);

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

  const handleDeleteBadge = (index) => {
    setShowModal(true);
    setBadgeToDelete(index);
  };

  const handleCancel = () => {
    setShowModal(false);
    setBadgeToDelete(null);
  };

  const deleteBadge = () => {
    let newBadges = sortBadges.slice();
    newBadges.splice(badgeToDelete, 1);
    setSortBadges(newBadges);
    setShowModal(false);
    setBadgeToDelete(null);
  };

  const saveChanges = async () => {
    let newBadgeCollection = sortBadges.slice();
    for (let i = 0; i < newBadgeCollection.length; i++) {
      newBadgeCollection[i].badge = newBadgeCollection[i].badge._id;
    }
    console.log(newBadgeCollection);
    await props.changeBadgesByUserID(props.userId, newBadgeCollection);
    await props.getUserProfile(props.userId);
    //close the modal
    props.close();
    //Reload the view profile page with updated bages
    window.location.reload();
  };

  return (
    <div>
      <Table>
        <thead>
          <tr>
            <th style={{ width: '93px' }}>Badge</th>
            <th>Name</th>
            <th style={{ width: '110px' }}>Modified</th>
            <th style={{ width: '90px' }}>Count</th>
            {props.isAdmin ? <th>Delete</th> : []}
            <th style={{ width: '70px' }}>Featured</th>
          </tr>
        </thead>
        <tbody>
          {sortBadges &&
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
                    ? value.lastModified.substring(0, 10)
                    : value.lastModified.toLocaleString().substring(0, 10)}
                </td>
                <td>
                  {props.isAdmin ? (
                    <Input
                      type="number"
                      value={Math.round(value.count)}
                      min={0}
                      step={1}
                      onChange={(e) => {
                        countChange(value, index, e.target.value);
                      }}
                    ></Input>
                  ) : (
                    Math.round(value.count)
                  )}
                </td>
                {props.isAdmin ? (
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={(e) => handleDeleteBadge(index)}
                    >
                      Delete
                    </button>
                  </td>
                ) : (
                  []
                )}
                <td style={{ textAlign: 'center' }}>
                  <Input
                    type="checkbox"
                    id={value.badge._id}
                    checked={value.featured}
                    onChange={(e) => {
                      featuredChange(value, index, e);
                    }}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      <Button
        className="btn--dark-sea-green float-right"
        style={{ margin: 5 }}
        onClick={(e) => {
          saveChanges();
        }}
      >
        Save Changes
      </Button>
      <Button
        className="btn--dark-sea-green float-right"
        style={{ margin: 5 }}
        onClick={pdfDocGenerator}
      >
        Export All Badges to PDF
      </Button>
      <Button
        className="btn--dark-sea-green float-right"
        style={{ margin: 5 }}
        onClick={pdfFeaturedDocGenerator}
      >
        Export Selected/Featured Badges to PDF
      </Button>
      <Modal isOpen={showModal}>
        <ModalBody>
          <p>Woah, easy tiger! Are you sure you want to delete this badge?</p>
          <br />
          <p>
            Note: Even if you click "Yes, Delete", this won't be fully deleted until you click the
            "Save Changes" button below.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => handleCancel()}>Cancel</Button>
          <Button color="danger" onClick={() => deleteBadge()}>
            Yes, Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  changeBadgesByUserID: (userId, badges) => dispatch(changeBadgesByUserID(userId, badges)),
  getUserProfile: (userId) => dispatch(getUserProfile(userId)),
});

export default connect(null, mapDispatchToProps)(BadgeReport);
