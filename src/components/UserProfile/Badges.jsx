import { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button as ReactStrapButton,
  Table,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from 'reactstrap';
import { clearSelected } from '~/actions/badgeManagement';
import { boxStyle, boxStyleDark } from '~/styles';
import hasPermission from '../../utils/permissions';
import { permissions } from '../../utils/constants';
import BadgeReport from '../Badge/BadgeReport/BadgeReport';
import BadgePopoverCard from '../Badge/BadgePopoverCard';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';
import AssignBadgePopup from './AssignBadgePopup';
import styles from './Badge.module.css';
import FeaturedBadges from './FeaturedBadges';
import { sortBadgeRecords } from '../Badge/badgeListUtils';

const getBadgesEarnedCount = sortedBadges =>
  sortedBadges.reduce((acc, badge) => {
    if (!badge || !badge.badge) return acc;
    if (badge.badge.badgeName === 'Personal Max' || badge.badge.type === 'Personal Max') {
      return acc + 1;
    }
    return acc + (Math.round(Number(badge.count)) || 0);
  }, 0);

const formatLastModified = lastModified => {
  if (!lastModified || Number.isNaN(new Date(lastModified).getTime())) return '—';
  if (typeof lastModified === 'string') return lastModified.substring(0, 10);
  return lastModified.toLocaleString().substring(0, 10);
};

function BadgeHistoryRow({ value, darkMode, showEarnedDates }) {
  return (
    <tr key={value.badge._id}>
      <td className="badge_image_sm">
        {' '}
        <img src={value.badge.imageUrl} id={`popover_${value.badge._id}`} alt="badge" />
      </td>
      <BadgePopoverCard target={`popover_${value.badge._id}`} badge={value.badge} />
      <td>{value.badge.badgeName}</td>
      <td>{formatLastModified(value.lastModified)}</td>
      {showEarnedDates && (
        <td style={{ display: 'flex', alignItems: 'center' }}>
          <>
            {' '}
            <UncontrolledDropdown className="me-2" direction="down">
              <DropdownToggle caret color="primary" style={darkMode ? boxStyleDark : boxStyle}>
                Dates
              </DropdownToggle>
              <DropdownMenu>
                {(Array.isArray(value.earnedDate) ? value.earnedDate : []).map((date, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <DropdownItem key={`date-${value._id}-${index}`}>{date}</DropdownItem>
                ))}
              </DropdownMenu>
            </UncontrolledDropdown>
            {value?.hasBadgeDeletionImpact === true && (
              <>
                <span id="mismatchExplainationTooltip" style={{ paddingLeft: '3px' }}>
                  {'  '} *
                </span>
                <UncontrolledTooltip
                  placement="bottom"
                  target="mismatchExplainationTooltip"
                  style={{ maxWidth: '300px' }}
                >
                  This record contains a mismatch in the badge count and associated dates. It
                  indicates that a badge has been deleted. Despite the deletion, we retain the
                  earned date to ensure a record of the badge earned for historical purposes.
                </UncontrolledTooltip>
              </>
            )}
          </>
        </td>
      )}
      <td>{value.count}</td>
    </tr>
  );
}

function BadgeHistoryTableBody({ sortedBadges, darkMode, authUser, displayUserId, showEarnedDates }) {
  if (sortedBadges.length === 0) {
    return (
      <tr>
        <td colSpan={showEarnedDates ? 5 : 4} style={{ textAlign: 'center' }}>{`${
          authUser.userid === displayUserId ? 'You have' : 'This person has'
        } no badges${showEarnedDates ? ' ' : ''}.`}</td>
      </tr>
    );
  }
  return sortedBadges.map(value => (
    <BadgeHistoryRow
      key={value.badge._id}
      value={value}
      darkMode={darkMode}
      showEarnedDates={showEarnedDates}
    />
  ));
}

function BadgeHistoryModal({
  isOpen,
  toggleBadge,
  darkMode,
  sortedBadges,
  authUser,
  displayUserId,
}) {
  return (
    <Modal size="lg" isOpen={isOpen} toggle={toggleBadge} className={darkMode ? 'text-light' : ''}>
      <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Badge Summary</ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div>
          {/* --- DESKTOP VERSION OF MODAL --- */}
          <div className="desktop">
            <div style={{ overflowY: 'scroll', height: '75vh' }}>
              <Table className={darkMode ? 'text-light dark-mode' : ''}>
                <thead style={{ zIndex: '10' }}>
                  <tr style={{ zIndex: '10' }} className={darkMode ? 'bg-space-cadet' : ''}>
                    <th style={{ width: '93px' }}>Badge</th>
                    <th>Name</th>
                    <th style={{ width: '110px' }}>Modified</th>
                    <th style={{ width: '110px' }}>Earned Dates</th>
                    <th style={{ width: '90px' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  <BadgeHistoryTableBody
                    sortedBadges={sortedBadges}
                    darkMode={darkMode}
                    authUser={authUser}
                    displayUserId={displayUserId}
                    showEarnedDates
                  />
                </tbody>
              </Table>
            </div>
          </div>
          {/* --- TABLET VERSION OF MODAL --- */}
          <div className="tablet">
            <div style={{ overflow: 'auto', height: '68vh' }}>
              <Table className={darkMode ? 'text-light dark-mode' : ''}>
                <thead style={{ zIndex: '10' }}>
                  <tr style={{ zIndex: '10' }} className={darkMode ? 'bg-space-cadet' : ''}>
                    <th style={{ width: '25%' }}>Badge</th>
                    <th style={{ width: '25%' }}>Name</th>
                    <th style={{ width: '25%' }}>Modified</th>
                    <th style={{ width: '25%', zIndex: '10' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  <BadgeHistoryTableBody
                    sortedBadges={sortedBadges}
                    darkMode={darkMode}
                    authUser={authUser}
                    displayUserId={displayUserId}
                    showEarnedDates={false}
                  />
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div className="badge_summary_viz_footer">
          <ReactStrapButton
            className={`${styles['btn--dark-sea-green']} ${styles['badge_summary_viz_button']}`}
            onClick={toggleBadge}
          >
            Close
          </ReactStrapButton>
        </div>
      </ModalFooter>
    </Modal>
  );
}

function SelectFeaturedControl({ visible, toggle, isOpen, isSavingBadges, darkMode, badgeReportProps }) {
  if (!visible) return null;
  return (
    <>
      <Button
        className={styles['btn--dark-sea-green']}
        onClick={toggle}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        Select Featured
      </Button>
      <Modal
        size="lg"
        isOpen={isOpen}
        keyboard={!isSavingBadges}
        backdrop={isSavingBadges ? 'static' : true}
        toggle={toggle}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader
          toggle={isSavingBadges ? undefined : toggle}
          className={darkMode ? 'bg-space-cadet' : ''}
        >
          Full View of Badge History
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <BadgeReport {...badgeReportProps} />
        </ModalBody>
      </Modal>
    </>
  );
}

function AssignBadgesControl({ visible, assignToggle, isAssignOpen, darkMode, assignPopupProps }) {
  if (!visible) return null;
  return (
    <>
      <Button
        className={`${styles['btn--dark-sea-green']} mr-2`}
        onClick={assignToggle}
        style={darkMode ? boxStyleDark : boxStyle}
      >
        Assign Badges
      </Button>
      <Modal
        size="lg"
        isOpen={isAssignOpen}
        toggle={assignToggle}
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={assignToggle}>
          Assign Badges
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <AssignBadgePopup {...assignPopupProps} />
        </ModalBody>
      </Modal>
    </>
  );
}

function CongratulatoryFooterMessage({ badgesEarned, subject, verb, object, onBadgesClick }) {
  if (!badgesEarned) {
    return (
      <div>
        {subject} {verb} {object}.
      </div>
    );
  }
  return (
    <div>
      Bravo! {subject} earned {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a href="#" onClick={onBadgesClick}>
        {badgesEarned}
      </a>{' '}
      {object}!
    </div>
  );
}

export const Badges = props => {
  const { auth, darkMode, displayUserId, authUser } = props;

  const [isOpen, setOpen] = useState(false);
  const [isAssignOpen, setAssignOpen] = useState(false);

  const canAssignBadges =
    props.hasPermission(permissions.assignBadges) ||
    props.hasPermission(permissions.assignBadgeOthers);

  const canUpdateBadges = props.hasPermission(permissions.updateBadges);
  const sortedBadges = useMemo(() => sortBadgeRecords(props.userProfile.badgeCollection), [
    props.userProfile.badgeCollection,
  ]);
  const [isSavingBadges, setIsSavingBadges] = useState(false);
  const savingBadgesRef = useRef(false);
  const onSavingChange = saving => {
    savingBadgesRef.current = saving;
    setIsSavingBadges(saving);
  };
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);

  // Added restriction: Jae's badges only editable by Jae or Owner
  const isRecordBelongsToJaeAndUneditable =
    props.isRecordBelongsToJaeAndUneditable && props.role !== 'Owner';
  // const canAssignBadges = props.hasPermission(permissions.assignBadges);
  const canModifyBadgeAmount = props.hasPermission(permissions.modifyBadgeAmount);
  const canSelectFeatured =
    props.canEdit ||
    canUpdateBadges ||
    canModifyBadgeAmount ||
    props.hasPermission(permissions.assignBadges);

  const toggle = () => {
    if (!savingBadgesRef.current) setOpen(open => !open);
  };

  const toggleBadge = () => {
    setIsBadgeOpen(!isBadgeOpen);
  };

  // xiaohan: connect to see all badges
  const assignToggle = () => {
    setAssignOpen(isAssignOpen => !isAssignOpen);
  };

  useEffect(() => {
    if (!isOpen && !isAssignOpen) {
      props.clearSelected();
    }
  }, [isOpen, isAssignOpen]);

  // Determines what congratulatory text should displayed.
  const badgesEarned = getBadgesEarnedCount(sortedBadges);

  const subject = props.isUserSelf ? 'You have' : 'This person has';
  const verb = badgesEarned ? `earned ${badgesEarned}` : 'no';
  const object = badgesEarned == 1 ? 'badge' : 'badges';

  return (
    <>
      <Card id="badgeCard" className={`badgeCard ${darkMode ? 'bg-space-cadet' : ''}`}>
        <CardHeader>
          <div
            className={styles['badge-header']}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '5px',
            }}
          >
            <span>Featured Badges</span>
            <span className={styles['badge-header-title']}>
              <EditableInfoModal
                areaName="FeaturedBadgesInfoPoint"
                areaTitle="Featured Badges"
                fontSize={20}
                isPermissionPage={true}
                role={props.role}
                darkMode={darkMode}
              />
            </span>

            <div className="d-flex">
              <SelectFeaturedControl
                visible={canSelectFeatured}
                toggle={toggle}
                isOpen={isOpen}
                isSavingBadges={isSavingBadges}
                darkMode={darkMode}
                badgeReportProps={{
                  canEdit: props.canEdit,
                  onSavingChange,
                  badges: props.userProfile.badgeCollection,
                  userId: props.userProfile._id,
                  role: props.role,
                  firstName: props.userProfile.firstName,
                  lastName: props.userProfile.lastName,
                  close: toggle,
                  setUserProfile: props.setUserProfile,
                  setOriginalUserProfile: props.setOriginalUserProfile,
                  handleSubmit: props.handleSubmit,
                  isUserSelf: props.isUserSelf,
                  isRecordBelongsToJaeAndUneditable,
                  darkMode,
                  personalBestMaxHrs: props.userProfile.personalBestMaxHrs,
                }}
              />
              <AssignBadgesControl
                visible={canAssignBadges}
                assignToggle={assignToggle}
                isAssignOpen={isAssignOpen}
                darkMode={darkMode}
                assignPopupProps={{
                  allBadgeData: props.allBadgeData,
                  userProfile: props.userProfile,
                  setUserProfile: props.setUserProfile,
                  close: assignToggle,
                  handleSubmit: props.handleSubmit,
                  isRecordBelongsToJaeAndUneditable,
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardBody style={{ overflow: 'auto' }}>
          <FeaturedBadges
            personalBestMaxHrs={props.userProfile.personalBestMaxHrs}
            badges={props.userProfile.badgeCollection}
          />
        </CardBody>
        <CardFooter style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: darkMode ? '#fff' : '#285739',
            }}
          >
            <CongratulatoryFooterMessage
              badgesEarned={badgesEarned}
              subject={subject}
              verb={verb}
              object={object}
              onBadgesClick={toggleBadge}
            />
          </span>
          <span className="ml-2">
            <EditableInfoModal
              areaName="NumberOfBadgesInfoPoint"
              areaTitle="Number of Badges"
              role={props.role}
              fontSize={20}
              isPermissionPage={true}
              darkMode={darkMode}
            />
          </span>
        </CardFooter>
      </Card>
      <BadgeHistoryModal
        isOpen={isBadgeOpen}
        toggleBadge={toggleBadge}
        darkMode={darkMode}
        sortedBadges={sortedBadges}
        authUser={authUser}
        displayUserId={displayUserId}
      />
      {/* <UncontrolledTooltip
        placement="right"
        target="FeaturedBadgeInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          Holy Awesome, these are your profiles featured badges !!! Click &quot;Select
          Featured&quot; to bask in the glory of your COMPLETE LIST!
        </p>
        <p className="badge_info_icon_text">
          Have a number bigger than &quot;1&quot; in the bottom righthand corner of a badge?
          That&apos;s how many times you&apos;ve earned the same badge! Do your Happy Dance you
          Champion!!
        </p>
        <p className="badge_info_icon_text">
          No badges in this area? Uh, in that cases, everything said above is a bit premature. Sorry
          about that... Everyone must start somewhere, and in your case, that somewhere is with the
          big empty, desolate, bare and barren badge box below (BEDBABBBB). If we had a BEDBABBBB
          badge, you&apos;d earn it, but we don&apos;t, so this area is blank.
        </p>
        <p className="badge_info_icon_text">
          No worries though, we&apos;re sure there are other areas of your life where you are a
          Champion already. Stick with us long enough and this will be another one.
        </p>
      </UncontrolledTooltip> */}
      {/* <UncontrolledTooltip
        placement="auto"
        target="CountInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          This is the total number of badges you have earned. (Way to go Champion!) It increases if
          you earn the same badge multiple times too!
        </p>
        <p className="badge_info_icon_text">
          There are many things in life to be proud of. Some are even worth bragging about. If your
          number here is large, it definitely falls into the later category.
        </p>
      </UncontrolledTooltip> */}
    </>
  );
};

const mapDispatchToProps = dispatch => ({
  clearSelected: () => dispatch(clearSelected()),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

const mapStateToProps = state => ({
  allBadgeData: state?.badge?.allBadgeData,
  auth: state.auth,
  //darkMode: state.theme.darkMode,
  authUser: state.auth.user,
});

export default connect(mapStateToProps, mapDispatchToProps)(Badges);
