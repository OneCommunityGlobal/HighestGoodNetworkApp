import React, {useState, useEffect} from 'react';
import { changeBadgesByUserID } from '../../actions/badgeManagement';
import {
  Table, Button, Input,  Card, CardTitle, CardBody, CardImg, CardText, UncontrolledPopover
} from 'reactstrap';
import { connect } from 'react-redux';
import { getUserProfile } from '../../actions/userProfile';

const BadgeReport = (props) => {
  let [sortBadges, setSortBadges] = useState(props.badges.slice() || []);
  let [numFeatured, setNumFeatured] = useState(0);
  useEffect(()=>{

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
    newBadges.forEach((badge, index)=> {
      if (badge.featured) {
        setNumFeatured(++numFeatured);
      }

      if (typeof (newBadges[index]) === "string") {
        newBadges[index].lastModified = new Date(newBadges[index].lastModified)
      }
      
    })
    console.log(numFeatured);
    setSortBadges(newBadges);
  },[props.badges]);

 


  
  const countChange = (badge, index, newValue) => {
    let newBadges = sortBadges.slice();
    newBadges[index].count = newValue;
    setSortBadges(newBadges);
  }

  const featuredChange = (badge, index, e) => {
    console.log(numFeatured);

    let newBadges = sortBadges.slice();
    if (e.target.checked && numFeatured < 5) {
      newBadges[index].featured = e.target.checked;
      setNumFeatured(++numFeatured);
    } else if (!e.target.checked) {
      newBadges[index].featured = e.target.checked;
      setNumFeatured(--numFeatured);
    } else {
      e.target.checked = false;
      window.alert("Unfortunately, you may only select five badges to be featured.")
    }
    setSortBadges(newBadges);
  }

  const deletedBadge = (badge, index) => {
    if (window.confirm("Are you sure you want to delete this badge? Note, this won't be fully deleted until you click the save button below.")) {
      let newBadges = sortBadges.slice();
      newBadges.splice(index, 1);
      setSortBadges(newBadges);
    }
  }

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
  }

  return (
    <div>
      <Table>
        <thead>
          <tr>
            <th style={{width: '93px'}}>Badge</th>
            <th>Name</th>
            <th style={{width: '110px'}}>Modified</th>
            <th style={{width: '90px'}}>Count</th>
            {props.isAdmin ? <th>Delete</th> : []}
            <th style={{width: '70px'}}>Featured</th>
          </tr>
        </thead>
        <tbody>
          {sortBadges && sortBadges.map((value, index) =>
            <tr key={index}>
              <td className="badge_image_sm"> <img src={value.badge.imageUrl} id={"popover_" + index.toString()}/></td>
              <UncontrolledPopover trigger="hover" target={"popover_" + index.toString()}>
                <Card className="text-center">
                  <CardImg className="badge_image_lg" src={value?.badge?.imageUrl} />
                  <CardBody>
                    <CardTitle
                      style={{
                        fontWeight: 'bold',
                        fontSize: 18,
                        color: '#285739',
                        marginBottom: 15
                      }}>{value.badge?.badgeName}</CardTitle>
                    <CardText>{value.badge?.description}</CardText>
                  </CardBody>
                </Card>
              </UncontrolledPopover>
              <td>{value.badge.badgeName}</td>
              <td>{typeof value.lastModified == "string" ? value.lastModified.substring(0,10) : value.lastModified.toLocaleString().substring(0,10)}</td>
              <td>{props.isAdmin ? <Input type="number" value={Math.round(value.count)} min={0} step={1} onChange={(e)=>{countChange(value, index, e.target.value)}}></Input> : Math.round(value.count)}</td>
              {props.isAdmin ?       
              <td><button type="button" className="btn btn-outline-danger"
                onClick={(e) => deletedBadge(value, index)}>Delete</button></td> : []}
              <td><Input type="checkbox" id={value.badge._id} checked={value.featured} onChange={(e)=>{featuredChange(value, index, e)}}/></td>
            </tr>
          )}
        </tbody>
      </Table>
      <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }} 
      onClick={(e)=>{
        saveChanges();
      }}>Save Changes</Button>
      <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }}>Export All Badges to PDF</Button>
      <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }}>Export Featured Badges to PDF</Button>
      
    </div >
  );
};

const mapDispatchToProps = dispatch => ({
  changeBadgesByUserID: (userId, badges) => dispatch(changeBadgesByUserID(userId, badges)),
  getUserProfile: (userId) => dispatch(getUserProfile(userId)),
});

export default connect(null, mapDispatchToProps)(BadgeReport);