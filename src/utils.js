const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const retry = async(fn, retries = 3, delay = 2000) => {
  try {
    return await fn()
  } catch (e) {
    if (!retries) {
      throw e
    }
    await sleep(delay)
    return await retry(fn, retries - 1, delay)
  }
}

module.exports = {
  sleep,
  retry,
}