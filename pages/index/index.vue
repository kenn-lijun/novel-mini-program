<template>
	<view>

		<!-- 标题 -->
		<view v-if="bottomIcon === 0">
			<!-- leftWidth和rightWidth保持一致标题居中 -->
			<picker @change="changeSource" :value="index" :range="sourceList.map(item=>item.name)">
				<uni-nav-bar :border="navBorder" dark fixed="true" background-color="#343232" status-bar
					left-icon="bottom" leftWidth="200rpx" rightWidth="200rpx" :left-text="sourceList[sourceIndex].name"
					title="爱宁呦" />
			</picker>
		</view>
		<view v-else>
			<view>
				<!-- leftWidth和rightWidth保持一致标题居中 -->
				<uni-nav-bar :border="navBorder" dark fixed="true" background-color="#343232" status-bar title="爱宁呦" />
			</view>
		</view>

		<!-- 首页 -->
		<view v-if="bottomIcon === 0">
			<view class="search-input">
				<uni-search-bar radius="100" placeholder="在这搜索呦" bgColor="#EEEEEE" @confirm="search" />
			</view>

			<uni-section title="搜索历史" type="line" padding>
				<view class="search-history-content">
					<view class="tag-view" v-for="(tag,index) in tagInfo">
						<u-tag :text="tag.info" size="mini" :type="tagColor[index % (tagColor.length)]"
							@click="showTag(tag.info)">
						</u-tag>
					</view>
				</view>
			</uni-section>

			<uni-section title="书城" type="line" v-if="hasExplore">
				<view class="uni-common-mt">
					<uni-segmented-control :current="bookTypeTagCurrent" :values="bookTypes" style-type="text"
						active-color="#007aff" @clickItem="onClickItem" />
				</view>

				<view>
					<uni-list>
						<uni-list-item class="book-box" v-for="(item,index) in bookList">
							<template v-slot:header>
								<view>
									<image v-show="!item.isLoaded" class="slot-image" :src="defaultImg" :lazy-load="true" />
									<image v-show="item.isLoaded" class="slot-image" :src="item.imgLink" :lazy-load="true" @load="handleImageLoad(index)" />
								</view>
							</template>
							<template v-slot:body>
								<view @click="gotoBookInfo(index)" class="slot-text">
									<view class="slot-text-bookName">{{item.name}}</view>
									<view class="slot-text-author">作者: {{item.author}}</view>
								</view>
							</template>
						</uni-list-item>
					</uni-list>
				</view>
			</uni-section>
		</view>

		<!-- 书架 -->
		<view v-else-if="bottomIcon === 1">
			<uni-section title="我的书架" type="line" padding>
				<uni-swipe-action ref="swipeAction">
					<uni-swipe-action-item v-for="(item,index) in shelfList" :right-options="shelfOption" :key="item.id"
						@click="removeShelf(index)">
						<view class="book-box" @click="toRead(index)">
							<view @click.stop>
								<image class="shelf-image" :src="item.img" :lazy-load="true" @error="handleImageError(index)" />
							</view>
							<view class="slot-text">
								<view class="sheft-text-bookName">{{item.bookName}}</view>
								<view class="slot-text-author">作者: {{item.author}}</view>
								<view class="slot-text-author">书源: {{sourceList.find(x=>x.id === item.sourceId).name}}</view>
							</view>
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</uni-section>
		</view>

		<!-- 我的 -->
		<view v-else>
			<view style="height: 100px;">
				<view style="position: relative;float: left;width: 20%;left: 20px;top: 20px;">
					<u-avatar :src="avatar" size="60"></u-avatar>
				</view>
				<view style="position: relative;left:20px;top: 25px; float: left;width: 80%;height: 50px;">
					<view style="position: relative;float: right;top: 10px; right: 50px;height: 50px;color: #67a7a3;" @click="login">
						授权登录
					</view>
					<view style="font-size: 18px;font-weight: 500;">游客</view><br><br>
					<view style="color: #655a5a;">ID: 56236413</view>
				</view>
			</view>
			<view
				style="position: relative;top: 20px; left: 5%; width: 90%;height: 500px; background-color: #ffffff; border-radius: 10px;">
				<u-cell-group>
					<u-cell icon="clock" size="large" title="浏览历史" titleStyle="position: relative;left: 20px"
						:isLink="true" @click="toBrowse"></u-cell>
					<u-cell icon="chat" size="large" title="问题反馈" titleStyle="position: relative;left: 20px"
						:isLink="true" @click="toProblemSubmit"></u-cell>
					<u-cell icon="info-circle" size="large" title="关于我们" titleStyle="position: relative;left: 20px"
						:isLink="true" @click="toRelationUs"></u-cell>
					<u-cell icon="man-add" size="large" title="设置" titleStyle="position: relative;left: 20px"
						:isLink="true" @click="toSet"></u-cell>
				</u-cell-group>
			</view>
		</view>

		<!-- 与包裹页面所有内容的元素u-page同级，且在它的下方 -->
		<u-tabbar :value="bottomIcon" @change="changeBottom" :fixed="true" :placeholder="true"
			:safeAreaInsetBottom="true">
			<u-tabbar-item text="首页" icon="home" @click="changeBottom"></u-tabbar-item>
			<u-tabbar-item text="书架" icon="bookmark" @click="changeBottom"></u-tabbar-item>
			<u-tabbar-item text="我的" icon="account" @click="changeBottom"></u-tabbar-item>
		</u-tabbar>

		<!-- 置顶 -->
		<u-back-top ref="backToTop" :scroll-top="scrollTop" top="300" bottom="200"></u-back-top>

		<!-- 书架删除提示窗示例 -->
		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog :type="msgType" cancelText="关闭" confirmText="同意" content="确认移除!"
				@confirm="removeShelfConfirm"></uni-popup-dialog>
		</uni-popup>
	</view>

</template>

<script>
	import { getOpenid, getResource, getExploreTagList, explore, getSearchHistories, saveSearchHistory, getShelfList, deleteShelf, saveReadHistory, getCache, deleteCache } from '../../api/book';
	
	export default {
		data() {
			return {
				// 书源索引
				sourceIndex: 0,
				openid: '',
				sourceList: [],
				tagColor: ['info', 'success', 'warning', 'error'],
				tagInfo: [],
				bookTypes: [],
				bookTypeTagCurrent: 0,
				bookList: [],
				scrollTop: 0,
				bottomIcon: 0,
				navBorder: false,
				// 书架相关属性
				removeShelfIndex: 0,
				shelfList: [],
				shelfOption: [{
					text: '删除',
					style: {
						backgroundColor: '#F56C6C'
					}
				}],
				avatar: '',
				defaultImg: '../../static/nodata.jpg',
				hasExplore: true,
				// 书城列表pageNum
				explorePage: 1,
			}
		},
		onLoad() {
			let that = this;
			// 获取书源
			getResource().then(res => {
				that.sourceList = res.data;
				that.refreshSourceCategory();
			});
		},
		onShow() {
			let that = this;
			that.init().then(function(data) {
				that.openid = data;
				that.refreshHistorySearch(that.openid);
				// 获取书架信息
				that.refreshShelfList();
			});
		},
		onPageScroll(e) {
			// 传入scrollTop值并触发所有easy-loadimage组件下的滚动监听事件
			this.scrollTop = e.scrollTop;
		},
		onReachBottom() {
			this.lower();
		},
		methods: {
			// 初始化方法 获取用户openid
			init() {
				let that = this;
				// 使用Promise解决异步问题
				// 如果storage有openid就直接使用 否则通过接口获取后并缓存
				return new Promise(async resolve => {
					let openid = uni.getStorageSync('openid');
					if (openid) {
						resolve(openid);
					} else {
						uni.login({
							provider: 'weixin',
							success: function(loginRes) {
								getOpenid({code: loginRes.code}).then(res => {
									uni.setStorageSync('openid', res.data.openid);
									resolve(res.data.openid);
								})
							}
						});
					}
				});
			},
			changeSource(e) {
				this.sourceIndex = e.detail.value;
				// 滚动条置顶
				this.backToTop();
				this.refreshSourceCategory();
			},
			// 刷新搜索历史
			refreshHistorySearch(e) {
				let that = this;
				getSearchHistories({openid: e}).then(res => {
					that.tagInfo = res.data;
				});
			},
			// 搜索触发的方法, notSaveHistory: 是否保存搜索历史，不传或false保存 true不保存
			search(res, notSaveHistory) {
				let that = this;
				
				if (!notSaveHistory) {
					// 保存搜索历史
					let param = {
						openid: that.openid,
						info: res.value
					};
					saveSearchHistory(param);
				}
				
				// 重定向页面
				let redirectObj = {
					"openid": that.openid,
					"sourceId": that.sourceList[that.sourceIndex].id,
					"bookName": res.value
				};
				uni.$u.route('/pages/booklist/booklist', {
					item: encodeURIComponent(JSON.stringify(redirectObj))
				});
			},
			// 点击标签触发的方法
			showTag: function(e) {
				let param = {value: e};
				this.search(param, true);
			},
			refreshSourceCategory() {
				// 刷新书城分类标签
				getExploreTagList({sourceId: this.sourceList[this.sourceIndex].id}).then(res => {
					this.bookTypes = res.data;
					// 书籍类型分段器置首
					this.bookTypeTagCurrent = 0;
					this.explorePage = 1;
					this.refreshBookList();
					this.hasExplore = true;
				}).catch(res => this.hasExplore = false);
			},
			refreshBookList() {
				// 刷新书源分类书籍列表
				uni.showLoading({
					title: "客官请稍后"
				});
				let param = {
					sourceId: this.sourceList[this.sourceIndex].id,
					typeName: this.bookTypes[this.bookTypeTagCurrent],
					page: this.explorePage
				};
				explore(param).then(res => {
					uni.hideLoading();
					this.bookList = res.data;
					this.bookList.forEach(item => {
						this.$set(item, 'isLoaded', false);
					});
				});
			},
			onClickItem(e) {
				if (this.bookTypeTagCurrent !== e.currentIndex) {
					this.bookTypeTagCurrent = e.currentIndex;
					this.explorePage = 1;
					this.refreshBookList();
				}
			},
			gotoBookInfo: function(index) {
				let redirectObj = {
					openid: this.openid,
					sourceId: this.sourceList[this.sourceIndex].id,
					bookName: this.bookList[index].name,
					author: this.bookList[index].author,
					bookLink: this.bookList[index].link
				}
				uni.$u.route('/pages/bookInfo/bookInfo', {
					item: encodeURIComponent(JSON.stringify(redirectObj))
				});
			},
			backToTop() {
				this.$refs.backToTop.backToTop();
			},
			lower() {
				let that = this;
				uni.showLoading({
					title: "客官请稍后"
				});
				// 刷新书源分类书籍列表
				explore({sourceId: that.sourceList[that.sourceIndex].id, typeName: that.bookTypes[that.bookTypeTagCurrent], page: that.explorePage + 1}).then(res  => {
					uni.hideLoading();
					if (res.data.length > 0) {
						res.data.forEach(item => {
						      this.$set(item, 'isLoaded', false);
						});
						that.explorePage = that.explorePage + 1;
						that.bookList.push(...res.data);
					} else {
						uni.showToast({
							icon: "none",
							title: "已经到底了"
						})
					}
				});
			},
			changeBottom(index) {
				this.bottomIcon = index;
			},
			// 书架相关方法------------------
			// 获取我的书架列表
			refreshShelfList() {
				let that = this;
				getShelfList({openid: that.openid}).then(res => {
					that.shelfList = res.data;
				});
			},
			removeShelf(e) {
				this.$refs.alertDialog.open();
				this.removeShelfIndex = e;
			},
			removeShelfConfirm() {
				let removeId = this.shelfList[this.removeShelfIndex].id;
				let sourceId = this.shelfList[this.removeShelfIndex].sourceId;
				let bookName = this.shelfList[this.removeShelfIndex].bookName;
				deleteShelf({id: removeId}).then(res => {
					deleteCache({
						openid: this.openid,
						key: "progress_" + sourceId + "_" + bookName
					});
					this.refreshShelfList();
				});
			},
			// 详情页面 点击目录跳转到阅读页
			toRead: function(e) {
				let sourceId = this.shelfList[e].sourceId;
				let bookName = this.shelfList[e].bookName;
				let bookLink = this.shelfList[e].bookLink;
				// 获取之前阅读的进度
				getCache({
					openid: this.openid,
					key: "progress_" + sourceId + "_" + bookName
				}).then(res => {
					// 保存阅读历史记录
					let param = {
						openid: this.openid,
						sourceId: sourceId,
						bookName: bookName,
						bookLink: bookLink,
						img: this.shelfList[e].img,
						author: this.shelfList[e].author
					};
					saveReadHistory(param);
					
					let chapterIndex = 0;
					if (res.msg) {
						chapterIndex = parseInt(res.msg);
					}
					// 路由跳转到阅读页
					let redirectObj = {
						"sourceId": sourceId,
						"bookName": bookName,
						"bookLink": bookLink,
						"chapterIndex": chapterIndex,
					};
					
					getCache({
						openid: this.openid,
						key: "turn_page_radio"
					}).then(res1 => {
						let tempUrl = '/pages/read/read';
						if (res1.msg && res1.msg == '点击翻页') {
							tempUrl = '/pages/read/read2';
						}
						
						uni.$u.route(tempUrl, {
							item: encodeURIComponent(JSON.stringify(redirectObj))
						});
					});
				});
			},
			toBrowse() {
				uni.$u.route('/pages/browse/browse', {
					openid: this.openid
				});
			},
			toSet() {
				uni.$u.route('/pages/set/set', {
					openid: this.openid
				});
			},
			login() {
				uni.showToast({
					icon: "none",
					title: '暂未开发...'
				})
			},
			toRelationUs() {
				uni.showToast({
					icon: "none",
					title: '暂未开发...'
				})
			},
			toProblemSubmit() {
				uni.showToast({
					icon: "none",
					title: '暂未开发...'
				})
			},
			handleImageLoad(index) {
				this.$set(this.bookList[index], 'isLoaded', true);
			},
			handleImageError(index) {
				this.shelfList[index].img = this.defaultImg;
			},
		}
	}
</script>

<style lang="scss">
	.search-input {
		height: 70px;
		background-color: white;
	}

	.search-history-content {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: flex-end;
		flex-wrap: wrap;
	}

	.tag-view {
		margin-right: 10px;
		padding: 5px;
	}
	
	.book-box {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		height: 110px;
	}

	.slot-image {
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
		height: 88px;
		width: 66px;
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding-right: 20px;
	}
	
	.shelf-image {
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
		height: 88px;
		width: 66px;
		padding-right: 20px;
	}
	
	.slot-text {
		display: flex;
		flex-direction: column;
		width: 260px;
	}

	.slot-text-bookName {
		font-size: 15px;
		color: rgb(0, 0, 0);
		margin-top: 5px;
		margin-bottom: 15px;
	}
	
	.sheft-text-bookName {
		font-size: 15px;
		color: rgb(0, 0, 0);
		margin-bottom: 25px;
	}
	

	.slot-text-author {
		font-size: 11px;
		color: rgba(0, 0, 0, 0.7);
	}

	.uni-common-mt {
		margin-top: 20px;
		padding: 0px 10px;
	}

	.warp {
		height: 100%;
	}

	.rect {
		display: inline-block;
		text-align: left;
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.slot-box {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
		border-bottom-color: #dddddd;
		border-bottom-width: 1px;
		border-bottom-style: solid;
		padding: 15px 0;
		height: 67px !important;
	}
</style>
