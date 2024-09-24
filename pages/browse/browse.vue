<template>
	<view>
		<view>
			<!-- leftWidth和rightWidth保持一致标题居中 -->
			<uni-nav-bar dark fixed="true" shadow background-color="#6d6d6d" status-bar left-icon="back"
				@clickLeft="back" title="爱宁呦" />
		</view>

		<uni-section title="浏览历史" type="line" padding>
			<uni-swipe-action ref="swipeAction">
				<uni-swipe-action-item v-for="(item,index) in browseList" :right-options="option" :key="item.id"
					@click="remove(index)">
					<view class="book-box" @click="toRead(index)">
						<image class="slot-image" :src="item.img" :lazy-load="true" @error="handleImageError(index)" />
						<view class="slot-text">
							<view class="slot-text-bookName">{{item.bookName}}</view>
							<view class="slot-text-author">作者: {{item.author}}</view>
							<view class="slot-text-author">书源: {{sourceList.find(x=>x.id === item.sourceId).name}}</view>
						</view>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
		</uni-section>

		<!-- 提示窗示例 -->
		<uni-popup ref="alertDialog" type="dialog">
			<uni-popup-dialog :type="msgType" cancelText="关闭" confirmText="同意" content="确认移除!" @confirm="removeConfirm">
			</uni-popup-dialog>
		</uni-popup>

	</view>
</template>

<script>
	import { getResource, getBrowseHistories, deleteBrowseHistory, saveBrowseHistory, getCache } from '../../api/book';
	export default {
		data() {
			return {
				openid: '',
				// 书架要移除的书籍索引
				removeIndex: 0,
				browseList: [],
				sourceList: [],
				option: [{
					text: '删除',
					style: {
						backgroundColor: '#F56C6C'
					}
				}],
				pageNum: 1,
				pageSize: 10,
				total: 0,
				defaultImg: '../../static/nodata.jpg',
			}
		},
		onLoad(option) {
			uni.showLoading({
				title: "客官请稍后"
			});
			this.openid = option.openid;
			let that = this;
			// 获取书源
			getResource().then(res => {
				that.sourceList = res.data;
			});
			this.getList().then(function(data) {
				that.browseList = data;
				uni.hideLoading();
			});
		},
		methods: {
			// 获取我的浏览历史列表
			getList() {
				let that = this;
				return new Promise(async resolve => {
					let params = {
						openid: that.openid,
						pageNum: that.pageNum,
						pageSize: that.pageSize
					}
					
					getBrowseHistories(params).then(res => {
						that.total = res.data.total;
						resolve(res.data.rows);
					});
				});
			},
			remove(e) {
				this.$refs.alertDialog.open();
				this.removeIndex = e;
			},
			removeConfirm() {
				let _this = this;
				let removeId = _this.browseList[_this.removeIndex].id;
				uni.showLoading({
					title: '客官请稍后'
				});
				deleteBrowseHistory({id: removeId}).then(res => {
					_this.pageNum = 1;
					_this.getList().then(function(data) {
						_this.browseList = data;
						uni.hideLoading();
					});
				});
			},
			// 详情页面 点击目录跳转到阅读页
			toRead: function(e) {
				// 获取之前阅读的进度
				getCache({
					openid: this.openid,
					key: "progress_" + this.browseList[e].sourceId + "_" + this.browseList[e].bookName
				}).then(res => {
					let chapterIndex = 0;
					if (res.msg) {
						chapterIndex = parseInt(res.msg);
					}
					let redirectObj = {
						"sourceId": this.browseList[e].sourceId,
						"bookName": this.browseList[e].bookName,
						"bookLink": this.browseList[e].bookLink,
						"chapterIndex": chapterIndex,
					}
					
					let saveParam = {
						openid: this.openid,
						sourceId: this.browseList[e].sourceId,
						bookName: this.browseList[e].bookName,
						bookLink: this.browseList[e].bookLink,
						img: this.browseList[e].img,
						author: this.browseList[e].author,
					};
					saveBrowseHistory(saveParam);
					
					this.rediretToRead(redirectObj);
				});
			},
			rediretToRead(redirectObj) {
				getCache({
					openid: this.openid,
					key: "turn_page_radio"
				}).then(res => {
					let tempUrl = '/pages/read/read';
					if (res.msg && res.msg == '点击翻页') {
						tempUrl = '/pages/read/read2';
					}
					
					uni.$u.route(tempUrl, {
						item: encodeURIComponent(JSON.stringify(redirectObj))
					});
				});
			},
			back() {
				uni.navigateBack({
					delta: 1
				});
			},
			onReachBottom() {
				if (this.browseList.length < this.total) {
					this.pageNum += 1;
					let that = this;
					let tempList = this.getList().then(function(data) {
						that.browseList.push(...data);
					});
				} else {
					uni.showToast({
						icon: "none",
						title: "已经到底了"
					});
				}
			},
			handleImageError(index) {
				this.browseList[index].img = this.defaultImg;
			},
		}
	}
</script>

<style lang="scss">
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
		padding-right: 20px;
	}
	
	.slot-text {
		display: flex;
		flex-direction: column;
	}

	.slot-text-bookName {
		font-size: 15px;
		color: rgb(0, 0, 0);
		margin-bottom: 25px;
	}

	.slot-text-author {
		font-size: 11px;
		color: rgba(0, 0, 0, 0.7);
	}
</style>
