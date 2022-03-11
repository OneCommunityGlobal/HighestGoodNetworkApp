import _ from 'lodash';
export const getcolor = (effort) => {
  let color = 'super-awesome'; //purple
  if (_.inRange(effort, 0, 5)) color = 'danger'; //red
  if (_.inRange(effort, 5, 10)) color = 'orange'; //orange
  if (_.inRange(effort, 10, 20)) color = 'success'; //green
  if (_.inRange(effort, 20, 30)) color = 'primary'; //blue
  if (_.inRange(effort, 30, 40)) color = 'super'; //indigo
  if (_.inRange(effort, 40, 50)) color = 'awesome'; //violet
  return color;
};

export const getprogress = (effort) => {
  let progress = 92;
  if (_.inRange(effort, 0, 5)) progress = 5 + Math.round(5 * (effort / 5));
  else if (_.inRange(effort, 5, 10)) progress = 12 + Math.round(5 * ((effort - 5) / 5));
  else if (_.inRange(effort, 10, 20)) progress = 20 + Math.round(20 * ((effort - 10) / 10));
  else if (_.inRange(effort, 20, 30)) progress = 45 + Math.round(10 * ((effort - 20) / 10));
  else if (_.inRange(effort, 30, 40)) progress = 60 + Math.round(15 * ((effort - 30) / 10));
  else if (_.inRange(effort, 40, 50)) progress = 80 + Math.round(10 * ((effort - 30) / 10));
  else if (_.inRange(effort, 60, 70)) progress = 95;
  else if (effort > 70) progress = 98;

  return progress;
};

export default getcolor;
