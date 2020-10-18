import _ from 'lodash'
export const getcolor = effort => {
	let color = 'super-awesome'
	if (_.inRange(effort, 0, 5)) color = 'danger' //red
	if (_.inRange(effort, 5, 10)) color = 'warning' //orange
	if (_.inRange(effort, 10, 20)) color = 'success' //green
	if (_.inRange(effort, 20, 30)) color = 'primary' //blue
	if (_.inRange(effort, 30, 40)) color = 'super' //indigo
	if (_.inRange(effort, 40, 50)) color = 'awesome' //violet
	return color
}

export const getprogress = effort => {
	let progress = 92
	if (_.inRange(effort, 0, 5)) progress = 5
	if (_.inRange(effort, 5, 10)) progress = 10
	if (_.inRange(effort, 10, 20)) progress = 20
	if (_.inRange(effort, 20, 30)) progress = 45
	if (_.inRange(effort, 30, 40)) progress = 60
	if (_.inRange(effort, 40, 50)) progress = 80
	return progress
}

export default getcolor
