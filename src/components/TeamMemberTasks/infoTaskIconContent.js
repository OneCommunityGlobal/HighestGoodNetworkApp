export const infoTaskIconContent = `Red Bell Icon: When clicked, this will show any task changes\n
  Green Checkmark Icon: When clicked, this will mark the task as completed\n
  X Mark Icon: When clicked, this will remove the user from that task`
  .split('\n')
  .map(item => <p key={item.trim()}>{item}</p>);

export default infoTaskIconContent;
