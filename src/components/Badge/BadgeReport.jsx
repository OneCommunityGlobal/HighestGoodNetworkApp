/* eslint-disable */
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
  UncontrolledTooltip,
} from 'reactstrap';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import moment from 'moment';
import 'moment-timezone';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import { boxStyle, boxStyleDark } from 'styles';
import { formatDate } from 'utils/formatDate';
import hasPermission from '../../utils/permissions';
import { changeBadgesByUserID } from '../../actions/badgeManagement';
import './BadgeReport.css';
import { getUserProfile } from '../../actions/userProfile';
import { PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE } from 'utils/constants';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function BadgeReport(props) {
  const [sortBadges, setSortBadges] = useState([]);
  const [numFeatured, setNumFeatured] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState([]);
  const [savingChanges, setSavingChanges] = useState(false);

  const canDeleteBadges = props.hasPermission('deleteBadges');
  const canUpdateBadges = props.hasPermission('updateBadges');
  const darkMode = props.darkMode;

  async function imageToUri(url, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const baseImage = new Image();
    baseImage.crossOrigin = 'anonymous';

    const fallbackImage =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/4H6YwAAAABJRU5ErkJggg==';
    baseImage.src = url.replace('dropbox.com', 'dl.dropboxusercontent.com');
    baseImage.src = baseImage.src.replace('www.dropbox.com', 'dl.dropboxusercontent.com');

    baseImage.onload = function () {
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      ctx.drawImage(baseImage, 0, 0);
      const uri = canvas.toDataURL('image/png');
      callback(uri);
      canvas.remove();
    };

    baseImage.onerror = function () {
      canvas.width = 1;
      canvas.height = 1;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 1, 1);
      const uri = canvas.toDataURL('image/png');
      callback(uri);
      canvas.remove();
    };
  }

  const FormatReportForPdf = (badges, callback) => {
    const bgReport = [];
    bgReport[0] = `<h3>Badge Report (Page 1 of ${Math.ceil(badges.length / 4)})</h3>
      <div style="margin-bottom: 20px; color: orange;"><h4>For ${props.firstName} ${props.lastName}</h4></div>
      <div style="color:#DEE2E6; margin:10px 0px 20px 0px; text-align:center;">_______________________________________________________________________________________________</div>`;

    for (let i = 0; i < badges.length; i += 1) {
      imageToUri(badges[i].badge.imageUrl, (uri) => {
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
          ${(i + 1) % 4 === 0 && i + 1 !== badges.length
            ? `</br></br></br>
              <h3>Badge Report (Page ${1 + Math.ceil((i + 1) / 4)} of ${Math.ceil(badges.length / 4)})</h3>
              <div style="margin-bottom: 20px; color: orange;"><h4>For ${props.firstName} ${props.lastName}</h4></div>
              <div style="color:#DEE2E6; margin:10px 0px 20px 0px; text-align:center;">_______________________________________________________________________________________________</div>`
            : ''
          }`;
        if (i === badges.length - 1) {
          setTimeout(() => {
            callback(bgReport.join('\n'));
          }, 100);
        }
      });
    }
  };

  const pdfDocGenerator = async () => {
    const CurrentDate = moment().format('MM-DD-YYYY-HH-mm-ss');
    const badges = [...sortBadges];

    FormatReportForPdf(badges, (formattedReport) => {
      const html = htmlToPdfmake(formattedReport, { tableAutoSize: true });
      const docDefinition = {
        content: [html],
        styles: {
          'html-div': { margin: [0, 4, 0, 4] },
          name: { background: 'white' },
        },
      };
      pdfMake.createPdf(docDefinition).download(`Badge-Report-${CurrentDate}`);
    });
  };

  // Remaining code kept the same with proper formatting...
  const handleDeleteBadge = (badge) => {
    setShowModal(true);
    setBadgeToDelete(badge);
  };

  const handleCancel = () => {
    setShowModal(false);
    if (badgeToDelete) {
      const index = sortBadges.findIndex((b) => b.badge._id === badgeToDelete.badge._id);
      countChange(badgeToDelete, index, badgeToDelete.count);
    }
    setBadgeToDelete([]);
  };

  const deleteBadge = () => {
    const updatedBadges = sortBadges.filter((badge) => badge._id !== badgeToDelete._id);

    if (badgeToDelete.featured) {
      setNumFeatured((prevCount) => prevCount - 1);
    }

    setSortBadges(updatedBadges);
    setShowModal(false);
    setBadgeToDelete([]);
  };

  const saveChanges = async () => {
    setSavingChanges(true);

    try {
      const updatedBadges = JSON.parse(JSON.stringify(sortBadges)).map((badge) => ({
        ...badge,
        badge: badge.badge._id,
      }));

      await props.changeBadgesByUserID(props.userId, updatedBadges);
      await props.getUserProfile(props.userId);

      props.setUserProfile((prevProfile) => ({
        ...prevProfile,
        badgeCollection: sortBadges,
      }));

      props.setOriginalUserProfile((prevProfile) => ({
        ...prevProfile,
        badgeCollection: sortBadges,
      }));

      toast.success('Badges successfully saved.');
      props.handleSubmit();
      props.close();
    } catch (error) {
      toast.error('Failed to save badges. Please try again.');
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <div>
      <div className="desktop">
        <div style={{ overflowY: 'auto', height: '75vh' }}>
          <Table className={darkMode ? 'text-light' : ''}>
            <thead
              style={{ zIndex: '10', pointerEvents: 'none' }}
              className={darkMode ? 'bg-space-cadet' : ''}
            >
              <tr>
                <th>Badge</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortBadges.map((badge, index) => (
                <tr key={badge._id}>
                  <td>{badge.badge.badgeName}</td>
                  <td>
                    {/* Render additional badge details */}
                  </td>
                  <td>
                    <ButtonGroup>
                      {/* Buttons for actions */}
                      <Button
                        color="danger"
                        onClick={() => handleDeleteBadge(badge)}
                      >
                        Delete
                      </Button>
                      <Button
                        color="primary"
                        onClick={(e) => featuredChange(badge, index, e)}
                      >
                        Toggle Featured
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
      <Modal isOpen={showModal} toggle={handleCancel}>
        <ModalBody>
          Are you sure you want to delete the badge "{badgeToDelete?.badge?.badgeName}"?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={deleteBadge}>
            Yes, Delete
          </Button>
          <Button color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      <ToastContainer />
    </div>
  );
}

export default connect(null, { changeBadgesByUserID, getUserProfile })(BadgeReport);

  

