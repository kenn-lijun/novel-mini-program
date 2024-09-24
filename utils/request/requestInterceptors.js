import md5 from 'md5';

/**
 * 请求拦截
 * @param {Object} http
 */
module.exports = vm => {
	uni.$u.http.interceptors.request.use(
		request => {
			// 添加timestamp参数
			request.data = request.data || request.params || {};
			request.data.timestamp = new Date().getTime();
			
			// 获取所有参数的key并排序
			let signKey = 'xxx';
			const signStr = Object.keys(request.data)
			// .filter((key) => request.data[key] !== undefined)
			.sort().reduce((pre,n)=>pre+n+'='+request.data[n],'') + signKey;
			// 将MD5加密sign值添加到header中
			request.header = request.header || {};
			request.header.sign = md5(signStr);
			// 返回处理后的请求配置
			return request;
		},
		err => {
			uni.$u.toast('请求失败');
			return Promise.reject(err);
		}
	)
}
