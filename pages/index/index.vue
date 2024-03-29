<template>
	<view>

		<!-- 标题 -->
		<view v-if="bottomIcon === 0">
			<!-- leftWidth和rightWidth保持一致标题居中 -->
			<picker @change="changeSource" :value="index" :range="source">
				<uni-nav-bar :border="navBorder" dark fixed="true" background-color="#343232" status-bar
					left-icon="bottom" leftWidth="200rpx" rightWidth="200rpx" :left-text="source[sourceIndex]"
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
						<u-tag :text="tag" size="mini" :type="tagColor[index % (tagColor.length)]"
							@click="showTag(tag)">
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
						<uni-list-item v-for="(item,index) in bookList">
							<template v-slot:header>
								<view class="book-box">
									<image class="slot-image"
										:src="item.imgLink ? item.imgLink : defaultImg"
										@click="toBigImg(item.imgLink)" mode="widthFix" :lazy-load = "true" />
								</view>
							</template>
							<template v-slot:body>
								<view class="book-box slot-text" @click="gotoBookInfo(index)">
									<text class="slot-text-bookName">{{item.name}}-</text>
									<text class="slot-text-author">{{item.author}}</text>
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
						@click="removeShelf(index)" class="shelfItem">
						<view class="slot-box" @click="toRead(index)">
							<view style="width: 80px; height: 97px;" @click.stop @click="toBigImg(item.img)">
								<image class="slot-image fadeIn" :src="item.img ? item.img : defaultImg" mode="widthFix" :lazy-load = "true" />
							</view>
							<view>
								<text class="slot-text-bookName">{{item.bookName}}-</text>
								<text class="slot-text-author">{{item.author}}</text>
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
		<u-back-top :scroll-top="old.scrollTop" top="300" @click="gotoTop" bottom="200"></u-back-top>

		<u-overlay :show="imgShow" @click="imgShow = false">
			<view class="warp">
				<view class="rect" @tap.stop>
					<image class="bigImg" :src="bigImg ? bigImg : defaultImg" mode="widthFix"></image>
				</view>
			</view>
		</u-overlay>

		<!-- 书架删除提示窗示例 -->
		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog :type="msgType" cancelText="关闭" confirmText="同意" content="确认移除!"
				@confirm="removeShelfConfirm"></uni-popup-dialog>
		</uni-popup>
	</view>

</template>

<script>
	import { getOpenid, getResource, getResourceSorts, getBooksByResourceSort, getSearchHistories, saveSearchHistory, getShelfList, deleteShelf, saveReadHistory, getCache, deleteCache } from '../../api/book';
	
	export default {
		data() {
			return {
				// 书源索引
				sourceIndex: 0,
				openid: '',
				source: [],
				tagColor: ['info', 'success', 'warning', 'error'],
				tagInfo: [],
				bookTypes: [],
				bookTypeTagCurrent: 0,
				bookList: [],
				nextPageUrl: '',
				scrollTop: 0,
				old: {
					scrollTop: 0
				},
				bottomIcon: 0,
				navBorder: false,
				imgShow: false,
				bigImg: '',
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
			}
		},
		onLoad() {
			let that = this;
			// 获取书源
			getResource().then(res => {
				that.source = res.data;
				that.refreshSourceCategory();
			});
		},
		onShow() {
			let that = this;
			that.init().then(function(data) {
				let openid = data;
				that.refreshHistorySearch(openid);
			});
		},
		onPageScroll(e) {
			// 传入scrollTop值并触发所有easy-loadimage组件下的滚动监听事件
			this.old.scrollTop = e.scrollTop;
		},
		onReachBottom() {
			this.lower();
		},
		methods: {
			// 初始化方法 获取用户openid
			init() {
				let that = this;
				// 使用Promise解决异步问题
				return new Promise(async resolve => {
					uni.login({
						provider: 'weixin',
						success: function(loginRes) {
							getOpenid({code: loginRes.code}).then(res => {
								that.openid = res.data.openid;
								uni.setStorageSync('openid', res.data.openid);
								resolve(res.data.openid);
							})
						}
					});
				});
			},
			changeSource(e) {
				this.sourceIndex = e.detail.value;
				this.refreshSourceCategory();
				// 书籍类型分段器置首
				this.bookTypeTagCurrent = 0;
				// 滚动条置顶
				this.gotoTop();
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
					"bookName": res.value,
					"source": that.source[that.sourceIndex]
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
				// 刷新书源分类标签
				getResourceSorts({name: this.source[this.sourceIndex]}).then(res => {
					this.bookTypes = res.data;
					this.refreshBookList();
					this.hasExplore = true;
				}).catch(res => this.hasExplore = false);
			},
			refreshBookList() {
				uni.showLoading({
					title: "客官请稍后"
				});
				// 刷新书源分类书籍列表
				let param = {
					source: this.source[this.sourceIndex],
					typeName: this.bookTypes[this.bookTypeTagCurrent]
				};
				getBooksByResourceSort(param).then(res => {
					this.bookList = res.data.bookList;
					this.nextPageUrl = res.data.nextPageUrl;
					uni.hideLoading();
				});
			},
			onClickItem(e) {
				if (this.bookTypeTagCurrent !== e.currentIndex) {
					this.bookTypeTagCurrent = e.currentIndex;
					this.refreshBookList();
				}
			},
			gotoBookInfo: function(index) {
				uni.$u.route('/pages/bookInfo/bookInfo', {
					openid: this.openid,
					bookName: this.bookList[index].name,
					author: this.bookList[index].author,
					bookLink: this.bookList[index].link,
					source: this.source[this.sourceIndex]
				});
			},
			gotoTop() {
				this.scrollTop = this.old.scrollTop;
				this.$nextTick(function() {
					this.scrollTop = 0;
				});
			},
			lower() {
				// 如果有下一页
				if (this.nextPageUrl.trim().length > 0) {
					uni.showLoading({
						title: "客官请稍后"
					});
					// 刷新书源分类书籍列表
					let param = {
						source: this.source[this.sourceIndex],
						typeName: this.bookTypes[this.bookTypeTagCurrent],
						nextPageUrl: this.nextPageUrl
					};
					getBooksByResourceSort(param).then(res => {
						uni.hideLoading();
						// push整个数组
						this.nextPageUrl = res.data.nextPageUrl;
						if (res.data.bookList.length > 0) {
							this.bookList.push(...res.data.bookList);
						} else {
							uni.showToast({
								icon: "none",
								title: "已经到底了"
							})
						}
					});
				} else {
					uni.showToast({
						icon: "none",
						title: "已经到底了"
					});
				}
			},
			changeBottom(index) {
				this.bottomIcon = index;
				if (index == 1) {
					this.refreshShelfList();
				}
			},
			toBigImg(url) {
				this.imgShow = true;
				this.bigImg = url;
			},
			// 书架相关方法------------------
			// 获取我的书架列表
			refreshShelfList() {
				let that = this;
				uni.showLoading({
					title: '客官请稍后',
					mark: true
				});
				getShelfList({openid: that.openid}).then(res => {
					that.shelfList = res.data;
					uni.hideLoading();
				});
			},
			removeShelf(e) {
				this.$refs.alertDialog.open();
				this.removeShelfIndex = e;
			},
			removeShelfConfirm() {
				let removeId = this.shelfList[this.removeShelfIndex].id;
				let source = this.shelfList[this.removeShelfIndex].source;
				let bookName = this.shelfList[this.removeShelfIndex].bookName;
				deleteShelf({id: removeId}).then(res => {
					deleteCache({
						openid: this.openid,
						key: "progress_" + source + "_" + bookName
					});
					this.refreshShelfList();
				});
			},
			// 详情页面 点击目录跳转到阅读页
			toRead: function(e) {
				let source = this.shelfList[e].source;
				let bookName = this.shelfList[e].bookName;
				let bookLink = this.shelfList[e].bookLink;
				// 获取之前阅读的进度
				getCache({
					openid: this.openid,
					key: "progress_" + source + "_" + bookName
				}).then(res => {
					// 保存阅读历史记录
					let param = {
						openid: this.openid,
						bookName: bookName,
						bookLink: bookLink,
						source: source,
						img: this.shelfList[e].img,
						author: this.shelfList[e].author
					};
					saveReadHistory(param);
					
					// 路由跳转到阅读页
					let redirectObj = {
						"source": source,
						"bookName": bookName,
						"bookLink": bookLink,
						"chapterLink": res.msg,
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
			}
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
	}

	.slot-image {
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
		width: 50px;
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		padding-right: 15px;
	}

	.slot-text-bookName {
		font-size: 14px;
		color: #6c2a21;
	}

	.slot-text-author {
		font-size: 11px;
		color: #6c2a21;
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

	.bigImg {
		width: 250px;
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
	
	.shelfItem .slot-box {
		height: 67px;
	}

	.fadeIn {
		-webkit-animation-name: fadeOutDown;
		animation-name: fadeOutDown;
		-webkit-animation-duration: 2000ms;
		animation-duration: 2000ms;
		-webkit-animation-fill-mode: both;
		animation-fill-mode: both;
	 }
	 
	 @-webkit-keyframes fadeOutDown {
		0% {
		   opacity: 0;
		}
		100% {
		   opacity: 1;
		}
	 }
	 
	 @keyframes fadeOutDown {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	 }
</style>
