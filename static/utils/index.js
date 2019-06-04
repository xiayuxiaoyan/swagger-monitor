module.exports = {
  urlToFileName : (url) => {
    return url.replace(/:|\//g, '');
  }
}