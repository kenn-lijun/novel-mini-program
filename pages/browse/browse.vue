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
					<view class="slot-box" @click="toRead(index)">
						<image class="slot-image" :src="item.img ? item.img : defaultImg" mode="widthFix"></image>
						<text class="slot-text-bookName">{{item.bookName}}-</text>
						<text class="slot-text-author">{{item.author}}</text>
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
	import { getBrowseHistories, deleteBrowseHistory, saveBrowseHistory, getCache } from '../../api/book';
	export default {
		data() {
			return {
				openid: '',
				// 书架要移除的书籍索引
				removeIndex: 0,
				browseList: [],
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
				let removeId = this.browseList[this.removeIndex].id;
				uni.showLoading({
					title: '客官请稍后'
				});
				deleteBrowseHistory({id: removeId}).then(res => {
					this.browseList.splice(this.removeIndex, 1);
					uni.hideLoading();
				});
			},
			// 详情页面 点击目录跳转到阅读页
			toRead: function(e) {
				// 获取之前阅读的进度
				getCache({
					openid: this.openid,
					key: "progress_" + this.browseList[e].source + "_" + this.browseList[e].bookName
				}).then(res => {
					let redirectObj = {
						"source": this.browseList[e].source,
						"bookName": this.browseList[e].bookName,
						"bookLink": this.browseList[e].bookLink,
						"chapterLink": res.msg,
					}
					
					let saveParam = {
						openid: this.openid,
						bookName: this.browseList[e].bookName,
						bookLink: this.browseList[e].bookLink,
						source: this.browseList[e].source,
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
		}
	}
</script>

<style lang="scss">
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

	.slot-image {
		/* #ifndef APP-NVUE */
		display: block;
		/* #endif */
		margin-right: 15px;
		margin-left: 15px;
		width: 50px;
	}

	.slot-text-bookName {
		font-size: 14px;
		color: #6c2a21;
	}

	.slot-text-author {
		font-size: 11px;
		color: #6c2a21;
	}
</style>
