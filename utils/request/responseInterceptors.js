/**
 * 响应拦截
 * @param {Object} http
 */
module.exports = vm => {
  uni.$u.http.interceptors.response.use(
    async res => {
      const code = res.data.code || 0;
      const msg = res.data.msg;
	  if (code === 200) {
		  return res.data;
	  } else {
		  uni.$u.toast(msg);
		  return Promise.reject(res);
	  }
    },
    err => {
	  uni.hideLoading();
      let { message } = err;
      uni.$u.toast(message);
      return Promise.reject(err);
    }
  )
}
