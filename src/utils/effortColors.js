import _ from 'lodash';
<<<<<<< HEAD
export const getcolor = effort => {
=======

//For progress bar that shows the percentage of the completion
//Set 'invert' to true when used for the bars of TASK
export const getProgressColor = (effort,commit,invert=false) => {
  let color = 'white';
  let percentage = 0;
  if (commit>0){
    percentage = Math.round(effort*100/commit);
  }
  if (!invert){
    if (_.inRange(percentage, 0, 20)) color = 'danger'; //red
    if (_.inRange(percentage, 20, 40)) color = 'orange'; //orange
    if (_.inRange(percentage, 40, 60)) color = 'success'; //green
    if (_.inRange(percentage, 60, 80)) color = 'primary'; //blue
    if (_.inRange(percentage, 80, 100)) color = 'super'; //indigo
    if (percentage >= 100) color = 'super-awesome'; //purple
  }else{
    if (_.inRange(percentage, 0, 20)) color =  'super-awesome'; //purple 
    if (_.inRange(percentage, 20, 40)) color = 'super'; //indigo
    if (_.inRange(percentage, 40, 60)) color = 'primary'; //blue
    if (_.inRange(percentage, 60, 80)) color = 'success'; //green
    if (_.inRange(percentage, 80, 90)) color = 'orange'; //orange
    if (_.inRange(percentage, 90, 100)) color = 'almost-red'; 
    if (percentage >= 100) color = color = 'bright-red'; //bright red
  }
  return color;
};

//For (progress) bar that is designed for the exact hours in LEADERBOARD
export const getcolor = (effort) => {
>>>>>>> 5deba340a91154510269bd1dee465e56dd351ed4
  let color = 'super-awesome'; //purple
  if (_.inRange(effort, 0, 5)) color = 'danger'; //red
  if (_.inRange(effort, 5, 10)) color = 'orange'; //orange
  if (_.inRange(effort, 10, 20)) color = 'success'; //green
  if (_.inRange(effort, 20, 30)) color = 'primary'; //blue
  if (_.inRange(effort, 30, 40)) color = 'super'; //indigo
  if (_.inRange(effort, 40, 50)) color = 'awesome'; //violet
  return color;
};

<<<<<<< HEAD
export const getprogress = effort => {
=======
//For progress bar that shows the percentage of the completion
export const getProgressValue = (effort,commit) => {
  let percentage = 0;
  if (commit>0){
    percentage = Math.round(effort*100/commit)
    if (percentage>100) percentage = 100;
  }
  return percentage;
};

//For (progress) bar that is designed for the exact hours in LEADERBOARD
export const getprogress = (effort) => {
>>>>>>> 5deba340a91154510269bd1dee465e56dd351ed4
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
