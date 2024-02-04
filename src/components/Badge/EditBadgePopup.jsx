import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  FormFeedback,
  UncontrolledTooltip,
} from 'reactstrap';
import { connect } from 'react-redux';
import './Badge.css';
import { updateBadge, closeAlert } from '../../actions/badgeManagement';
import { badgeTypes } from './BadgeTypes';
import { boxStyle } from 'styles';

const EditBadgePopup = props => {
  const [badgeValues, setBadgeValues] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [badgeName, setBadgeName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [ranking, setRanking] = useState(0);

  const [type, setType] = useState('Custom');
  const [showCategory, setShowCategory] = useState(false);
  const [category, setCategory] = useState('Unspecified');
  const [showTotalHrs, setShowTotalHrs] = useState(false);
  const [totalHrs, setTotalHrs] = useState(0);
  const [showWeeks, setShowWeeks] = useState(false);
  const [weeks, setWeeks] = useState(0);
  const [showMonths, setShowMonths] = useState(false);
  const [months, setMonths] = useState(0);
  const [showMultiple, setShowMultiple] = useState(false);
  const [multiple, setMultiple] = useState(0);
  const [showPeople, setShowPeople] = useState(false);
  const [people, setPeople] = useState(0);

  useEffect(() => {
    setBadgeValues(props.badgeValues);
    setBadgeId(props.badgeValues ? props.badgeValues._id : null);
    setBadgeName(props.badgeValues ? props.badgeValues.badgeName : '');
    setImageUrl(props.badgeValues ? props.badgeValues.imageUrl : '');
    setDescription(props.badgeValues ? props.badgeValues.description : '');
    setRanking(props.badgeValues ? props.badgeValues.ranking : 0);
    setType(props.badgeValues ? props.badgeValues.type : 'Custom');
    setCategory(props.badgeValues ? props.badgeValues.category : 'Unspecified');
    setTotalHrs(props.badgeValues ? props.badgeValues.totalHrs : 0);
    setWeeks(props.badgeValues ? props.badgeValues.weeks : 0);
    setMonths(props.badgeValues ? props.badgeValues.months : 0);
    setMultiple(props.badgeValues ? props.badgeValues.multiple : 0);
    setPeople(props.badgeValues ? props.badgeValues.people : 0);
    displayTypeRelatedFields(props.badgeValues ? props.badgeValues.type : 'Custom');
  }, [props.badgeValues]);

  const validRanking = ranking => {
    const pattern = /^[0-9]*$/;
    return pattern.test(ranking);
  };

  const enableButton =
    badgeName.length === 0 ||
    imageUrl.length === 0 ||
    description.length === 0 ||
    !validRanking(ranking);

  const resetTypeFieldDisplay = () => {
    setShowCategory(false);
    setShowTotalHrs(false);
    setShowWeeks(false);
    setShowMonths(false);
    setShowMultiple(false);
    setShowPeople(false);
  };

  const displayTypeRelatedFields = targetType => {
    resetTypeFieldDisplay();
    switch (targetType) {
      case 'No Infringement Streak':
        setShowMonths(true);
        break;
      case 'Minimum Hours Multiple':
        setShowMultiple(true);
        break;
      case 'X Hours for X Week Streak':
        setShowTotalHrs(true);
        setShowWeeks(true);
        break;
      case 'Lead a team of X+':
        setShowPeople(true);
        break;
      case 'Total Hrs in Category':
        setShowTotalHrs(true);
        setShowCategory(true);
        break;
      default:
        return;
    }
  };

  const closePopup = () => {
    props.setEditPopup(false);
  };

  const handleChange = event => {
    switch (event.target.id) {
      case 'badgeName':
        setBadgeName(event.target.value);
        break;
      case 'imageUrl':
        setImageUrl(event.target.value);
        break;
      case 'badgeDescription':
        setDescription(event.target.value);
        break;
      case 'category':
        const selectedCategoryValue = event.target.value;
        if (selectedCategoryValue.length === 0) {
          setCategory('Unspecified');
        } else {
          setCategory(selectedCategoryValue);
        }
        break;
      case 'badgeType':
        const selectedType = event.target.value;
        setType(selectedType);
        if (selectedType.length === 0) {
          setType('Custom');
        }
        displayTypeRelatedFields(selectedType);
        break;
      case 'badgeRanking':
        setRanking(Number(event.target.value));
        break;
      case 'badgeTotalHrs':
        setTotalHrs(Number(event.target.value));
        break;
      case 'badgeWeeks':
        setWeeks(Number(event.target.value));
        break;
      case 'badgeMonths':
        setMonths(Number(event.target.value));
        break;
      case 'badgeMultiple':
        setMultiple(Number(event.target.value));
        break;
      case 'badgePeople':
        setPeople(Number(event.target.value));
        break;
      default:
        return;
    }
  };

  const handleSubmit = () => {
    const badgeData = {
      badgeName: badgeName,
      imageUrl: imageUrl,
      description: description,
      ranking: ranking,
      type: type,
      category: category,
      totalHrs: totalHrs,
      weeks: weeks,
      months: months,
      multiple: multiple,
      people: people,
    };
    props.updateBadge(badgeId, badgeData).then(() => {
      closePopup();
    });
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Edit Badge</ModalHeader>
      <ModalBody>
        <Form id="badgeEdit">
          <FormGroup>
            <Label for="badgeName">Name</Label>
            <Input
              type="name"
              name="name"
              id="badgeName"
              value={badgeName}
              onChange={handleChange}
              placeholder="Badge Name"
              invalid={badgeName.length === 0}
            />
            <FormFeedback>Badge name is required and must be unique.</FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label for="imageUrl">Image URL</Label>
            <Input
              type="url"
              name="url"
              id="imageUrl"
              value={imageUrl}
              onChange={handleChange}
              placeholder="Image URL"
              invalid={imageUrl.length === 0}
            />
            <FormText color="muted">
              For Dropbox URL that ends with &quot;dl=0&quot;, please replace with
              &quot;raw=1&quot;.
            </FormText>
          </FormGroup>
          <FormGroup>
            <Label for="badgeDescription">Description</Label>
            <Input
              type="textarea"
              name="text"
              id="badgeDescription"
              value={description}
              onChange={handleChange}
              invalid={description.length === 0}
            />
          </FormGroup>

          <FormGroup>
            <Label for="badgeType">Type</Label>
            <i className="fa fa-info-circle ml-1" id="TypeInfo" />
            <UncontrolledTooltip placement="right" target="TypeInfo" className="badgeTooltip">
              <p className="badge_info_icon_text">
                Choosing a type is optional but generally the best thing to do. If no type is
                chosen, the type will automatically be marked as &quot;Custom&quot;, the least cool
                option of all as no autoassignment will happen.
              </p>
            </UncontrolledTooltip>
            <Input
              type="select"
              name="selectType"
              id="badgeType"
              value={type}
              onChange={handleChange}
            >
              <option value={'Custom'}>{'Custom'}</option>
              {badgeTypes.map((element, i) => (
                <option key={i}>{element}</option>
              ))}
            </Input>
          </FormGroup>

          {showCategory ? (
            <FormGroup>
              <Label for="category">Category</Label>
              <i className="fa fa-info-circle ml-1" id="CategoryInfo" />
              <UncontrolledTooltip placement="right" target="CategoryInfo" className="badgeTooltip">
                <p className="badge_info_icon_text">
                  Choosing a category is necessary if type is Total Hrs in Category in order to
                  autoassign the badge. If no category is chosen, the category will automatically be
                  marked as &quot;unspecified&quot;, the least cool option of all.
                </p>
              </UncontrolledTooltip>
              <Input
                type="select"
                name="selectCategory"
                id="category"
                value={category}
                onChange={handleChange}
              >
                <option value={''}>{''}</option>
                <option>Food</option>
                <option>Energy</option>
                <option>Housing</option>
                <option>Education</option>
                <option>Society</option>
                <option>Economics</option>
                <option>Stewardship</option>
                <option>Unassigned</option>
              </Input>
            </FormGroup>
          ) : (
            ''
          )}

          {showTotalHrs ? (
            <FormGroup>
              <Label for="badgeTotalHrs">Hours</Label>
              <i className="fa fa-info-circle ml-1" id="TotalHrsInfo" />
              <UncontrolledTooltip placement="right" target="TotalHrsInfo" className="badgeTooltip">
                <p className="badge_info_icon_text">
                  Choosing a the amount of Hours necessary for .
                </p>
              </UncontrolledTooltip>
              <Input
                type="number"
                min="1"
                name="totalHrs"
                id="badgeTotalHrs"
                value={totalHrs}
                onChange={handleChange}
                placeholder="Please Enter a Number"
              />
            </FormGroup>
          ) : (
            ''
          )}

          {showWeeks ? (
            <FormGroup>
              <Label for="badgeWeeks">Weeks</Label>
              <i className="fa fa-info-circle ml-1" id="WeeksInfo" />
              <UncontrolledTooltip placement="right" target="WeeksInfo" className="badgeTooltip">
                <p className="badge_info_icon_text">
                  Choosing a the amount of Weeks necessary for .
                </p>
              </UncontrolledTooltip>
              <Input
                type="number"
                min="1"
                name="weeks"
                id="badgeWeeks"
                value={weeks}
                onChange={handleChange}
                placeholder="Please Enter a Number"
              />
            </FormGroup>
          ) : (
            ''
          )}

          {showMonths ? (
            <FormGroup>
              <Label for="badgeMonths">Months </Label>
              <i className="fa fa-info-circle ml-1" id="MonthsInfo" />
              <UncontrolledTooltip placement="right" target="MonthsInfo" className="badgeTooltip">
                <p className="badge_info_icon_text">
                  Choosing a the amount of Months necessary for .
                </p>
              </UncontrolledTooltip>
              <Input
                type="number"
                min="1"
                name="months"
                id="badgeMonths"
                value={months}
                onChange={handleChange}
                placeholder="Please Enter a Number"
              />
            </FormGroup>
          ) : (
            ''
          )}

          {showMultiple ? (
            <FormGroup>
              <Label for="badgeMultiple">Multiple </Label>
              <i className="fa fa-info-circle ml-1" id="MultipleInfo" />
              <UncontrolledTooltip placement="right" target="MultipleInfo" className="badgeTooltip">
                <p className="badge_info_icon_text">
                  Choosing a the amount of Multiple necessary for .
                </p>
              </UncontrolledTooltip>
              <Input
                type="number"
                min="1"
                name="multiple"
                id="badgeMultiple"
                value={multiple}
                onChange={handleChange}
                placeholder="Please Enter a Number"
              />
            </FormGroup>
          ) : (
            ''
          )}

          {showPeople ? (
            <FormGroup>
              <Label for="badgePeople">People</Label>
              <i className="fa fa-info-circle ml-1" id="PeopleInfo" />
              <UncontrolledTooltip placement="right" target="PeopleInfo" className="badgeTooltip">
                <p className="badge_info_icon_text">
                  Choosing a the amount of People necessary for .
                </p>
              </UncontrolledTooltip>
              <Input
                type="number"
                min="1"
                name="people"
                id="badgePeople"
                value={people}
                onChange={handleChange}
                placeholder="Please Enter a Number"
              />
            </FormGroup>
          ) : (
            ''
          )}

          <FormGroup>
            <Label for="badgeRanking">Ranking</Label>
            <i className="fa fa-info-circle ml-1" id="RankingInfo" />
            <UncontrolledTooltip placement="right" target="RankingInfo" className="badgeTooltip">
              <p className="badge_info_icon_text">
                Ranking number MUST be non-negative and whole number. Seriously, how could anything
                be ranked -1.1? Also, the default value is &quot;0&quot;, which would be the lowest
                rank, 1 though is the highest rank. Confused yet?
              </p>
              <p className="badge_info_icon_text">
                Good news is, everything else is really simple! The lower the number (other than
                zero) the higher the badge ranking and the higher a badge will show up on a
                person&apos;s dashboard. Want to see a badge at the top of someone&apos;s list, make
                it #1!
              </p>
              <p className="badge_info_icon_text">
                All badges of the same number in ranking sort alphabetically by their names.
              </p>
            </UncontrolledTooltip>
            <Input
              type="number"
              min={0}
              valid={validRanking(ranking)}
              invalid={!validRanking(ranking)}
              name="ranking"
              id="badgeRanking"
              value={ranking}
              onChange={handleChange}
              placeholder="Please Enter a Number"
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="info" onClick={handleSubmit} disabled={enableButton} style={boxStyle}>
          Update
        </Button>{' '}
        <Button color="primary" onClick={closePopup} style={boxStyle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const mapStateToProps = state => ({
  allProjects: state.allProjects.projects,
  message: state.badge.message,
  alertVisible: state.badge.alertVisible,
  color: state.badge.color,
});

const mapDispatchToProps = dispatch => ({
  fetchAllProjects: () => dispatch(fetchAllProjects()),
  updateBadge: (badgeId, badgeData) => dispatch(updateBadge(badgeId, badgeData)),
  closeAlert: () => dispatch(closeAlert()),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditBadgePopup);
