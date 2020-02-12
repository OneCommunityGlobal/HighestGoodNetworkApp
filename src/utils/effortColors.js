import _ from 'lodash'
const getcolor = effort => {
	let color = 'purple'
	if (_.inRange(effort, 0, 5)) color = 'red'
	if (_.inRange(effort, 5, 10)) color = 'orange'
	if (_.inRange(effort, 10, 20)) color = 'green'
	if (_.inRange(effort, 20, 30)) color = 'blue'
	if (_.inRange(effort, 30, 40)) color = 'indigo'
	if (_.inRange(effort, 40, 50)) color = 'violet'
	return color
}

export default getcolor
