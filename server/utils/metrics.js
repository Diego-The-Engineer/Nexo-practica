export const average = (values) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

export const completion = (tasks) =>
  tasks.length
    ? Math.round((tasks.filter((task) => task.status === 'done').length / tasks.length) * 100)
    : 0