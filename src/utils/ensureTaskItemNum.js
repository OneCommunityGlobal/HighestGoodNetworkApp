export const isObject = (x) => typeof x === 'object'
    && !Array.isArray(x)
    && x !== null;

const ensureTasksHaveNum = (tasks) => {
    if (!Array.isArray(tasks) || !tasks.every(isObject)) return tasks;

    return tasks.map((task) => {
        if (!task.num) {
            task.num = "0";
        };

        return task;
    })
}

export default ensureTasksHaveNum;
