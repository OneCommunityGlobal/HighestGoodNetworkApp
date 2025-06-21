import '../styles/AdditionalInfo.css';
import { useSelector } from 'react-redux';
// function AdditionalInfo({ profileData }) {
function AdditionalInfo() {
  const handleEditClick = () => {
    // setEditingIndex(index);
    //  setEditedText(questions[index]?.text || '');
  };

  const profileData = useSelector(state => state.userSkills.profileData);
  const mockData =
    /* {
    skillInfo: {
      followup: {
        additional_info:
          'Administrative Assistant, ABC Company, City, State, 2006 to Present' +
          '- Use a  combination of verbs and nouns to describe job duties and accomplishments that are most relevant to the work you are currently seeking' +
          '- Dont forget to include a variety of targeted keywords' +
          '-List jobs in reverse chronological order; your most recent job goes first',
      },
    },
  }; */
    {
      workExperience: [
        {
          title: 'Administrative Assistant',
          company: 'ABC Company',
          location: 'City, State',
          duration: '2006 to Present',
          responsibilities: [
            'Use a combination of verbs and nouns to describe job duties and accomplishments that are most relevant to the work you are currently seeking',
            'Don’t forget to include a variety of targeted keywords',
            'List jobs in reverse chronological order; your most recent job goes first',
          ],
        },
      ],
    };

  // eslint-disable-next-line no-console
  console.log(profileData);
  // eslint-disable-next-line no-console
  console.log(profileData?.skillInfo);
  // eslint-disable-next-line no-console
  console.log(profileData?.skillInfo?.followup);
  // eslint-disable-next-line no-console
  console.log(profileData?.skillInfo?.followup?.additional_info);
  // eslint-disable-next-line no-console
  console.log(mockData?.skillInfo?.followup?.additional_info);

  return (
    <div>
      <div className="workBox">
        <h3> Work Experience and Additional Info: </h3>
        <button type="button" className="edit-button" onClick={handleEditClick}>
          Edit
        </button>
      </div>
      <hr className="horizontal-separator" />
      <div className="outlined-box">
        <label htmlFor="platform"> What platform are you using for developing?</label>
        <input
          type="text"
          id="platform"
          value={profileData?.skillInfo?.followup?.platform2}
          onChange={e => e.target.value}
          className="edit-input"
        />

        <label htmlFor="mern_work_experience">
          Please describe your professional experience with the MERN stack in 3 to 5 sentences.
        </label>
        <textarea
          id="mern_work_experience"
          value={profileData?.skillInfo?.followup?.mern_work_experience}
          onChange={e => e.target.value}
          className="edit-input"
        />

        <label htmlFor="other">
          Do you have experience in any other technical skills that we might use in future? Like
          data analysis, machine learning etc.
        </label>
        <input
          type="text"
          id="other"
          value={profileData?.skillInfo?.followup?.other}
          onChange={e => e.target.value}
          className="edit-input"
        />
      </div>
    </div>
  );
}
export default AdditionalInfo;
