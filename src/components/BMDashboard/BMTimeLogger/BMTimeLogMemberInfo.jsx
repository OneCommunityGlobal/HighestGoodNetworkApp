import { useSelector } from 'react-redux';

function BMTimeLogMemberInfo({ setMemberList }) {
  const projectInfo = useSelector(state => state.bmProjectMembers);

  setMemberList(projectInfo.members);

  return <div />;
}

export default BMTimeLogMemberInfo;
