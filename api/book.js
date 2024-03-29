//请求工具参考https://ext.dcloud.net.cn/plugin?id=392
const { http } = uni.$u

// 获取用户openid
export const getOpenid = data => http.post('/weChat/login', data, {header: {'Content-Type': 'application/x-www-form-urlencoded'}})
// 获取书源列表
export const getResource = params => http.get('/book/source/list', { params })
// 获取书源对应的书籍分类列表
export const getResourceSorts = params => http.get('/source/book/type/listBySource', { params })
// 获取书源对应的某个分类下面的书籍列表
export const getBooksByResourceSort = params => http.get('/search/listBySort', { params })
// 获取搜索历史记录
export const getSearchHistories = params => http.get('/search/history/list', { params })
// 保存搜索历史记录
export const saveSearchHistory = data => http.post('/search/history/save', data)
// 保存阅读历史记录
export const saveReadHistory = data => http.post('/browse/history/save', data)
// 获取我的书架列表
export const getShelfList = params => http.get('/bookshelf/list', { params })
// 删除书架
export const deleteShelf = params => http.get('/bookshelf/delete', { params })
// 获取缓存的书籍第一章链接
export const getFirstLink = params => http.get('/search/getFirstLinkByCache', { params })
// 获取章节内容详情
export const getBookInfo = params => http.get('/search/info', { params })
// 获取浏览历史
export const getBrowseHistories = params => http.get('/browse/history/list', { params })
// 删除历史浏览记录
export const deleteBrowseHistory = params => http.get('/browse/history/delete', { params })
// 保存历史浏览记录
export const saveBrowseHistory = data => http.post('/browse/history/save', data)
// 根据书名查询书籍
export const searchBookName = params => http.get('/search/searchByBookName', { params })
// 判断当前书籍是否已经加入书架
export const shelfIsExit = params => http.get('/bookshelf/isExit', { params })
// 添加书架
export const saveShelf = data => http.post('/bookshelf/save', data)
// 搜索章节列表
export const getChapters = params => http.get('/search/getChapter', { params })
// 缓存数据
export const cache = params => http.get('/search/cache', { params })
// 获取缓存数据
export const getCache = params => http.get('/search/getCache', { params })
// 删除缓存
export const deleteCache = params => http.get('/search/deleteCache', { params })