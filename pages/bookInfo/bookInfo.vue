<template>
	<view>
		<view>
			<!-- leftWidth和rightWidth保持一致标题居中 -->
			<uni-nav-bar :border="navBorder" dark fixed="true" background-color="#343232" status-bar left-icon="back"
				@clickLeft="back" :title="bookName" />
		</view>

		<uni-section title="书籍详情" type="line" padding>
			<view class='row'>
				<image class='rowIcon' :src="img ? img : defaultImg" @error="handleImageError"></image>
				<view class='rowDesc'>
					<text style="font-size: 15px;font-weight: bold;">{{bookName}}</text>
					<text>{{item.book.bookStatus}}</text>
					<text style="color: #992200;">作者：{{author}}</text>
					<text></text>
				</view>
			</view>
			<view class='btnGroup'>
				<button class='blue-btn' type='default' plain="true" @tap="readNow()">立即阅读</button>
				<button class="blue-btn" type='default' plain="true" :disabled="shelftButtonDisable"
					@tap="addBookshelf()">{{shelfInfo}}</button>
			</view>
			<view class="desc">
				<view class="lab" style="font-weight: bold"> 内容简介</view>
				<view class="content" :class="showMoreDesc ? 'autoHeight' : 'limitHeight'">{{introduce}}</view>
				<view class="blue-link" @tap="showDesc()">{{showMoreDesc ? '收起介绍' : '更多介绍'}}</view>
			</view>

			<view class="linePanel">
				<view><text style="color: #6c2a21;" @click="showChapter">查看目录</text></view>
			</view>

			<u-popup :show="chapterShow" mode="bottom" @close="closeChapter" @open="openChapter">
				<view style="height: 600px;">
					<view class="catelog-header" >
						<view class='catelog-header-col'>共{{chapterTotal}}章</view>
						<view class='catelog-header-col1' @click="sortchapterList">{{isReverse ? '逆序' : '正序'}}</view>
					</view>
					<view v-if="chapterTotal < 3000">
						<scroll-view class="catelog" :scroll-into-view="locateIndex" scroll-y="true">
							<view class="column" v-for="(item,index) in chapterList">
								<view :id="getBindId(index)" class="row_item"
									:class="index == currentIndex ? 'hoverText' : ''" @tap="toRead(index)"
									style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
									{{item.name}}
								</view>
							</view>
							<view v-html="'<br><br>'"></view>
						</scroll-view>
					</view>
					<view v-else>
						<view class="column" v-for="(item, index) in groupChapterList[pageNum - 1]">
							<view :id="getBindId(index)" class="row_item"
								:class="((pageNum - 1) * 15 + index) == currentIndex ? 'hoverText' : ''" @tap="toRead(index)"
								style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">
								{{item.name}}
							</view>
						</view>
						
						<view style="height: 40px;position: relative; top: 30px;">
							<uni-pagination :current="pageNum" :pageSize="pageSize" :total="chapterTotal" @change="changeChapter"/>
						</view>
					</view>
				</view>
			</u-popup>
		
		</uni-section>
	</view>
</template>

<script>
	import { shelfIsExit, saveShelf, getChapters, saveBrowseHistory, getCache } from '../../api/book';
	export default {
		data() {
			return {
				shelfInfo: '加入书架',
				openid: '',
				sourceId: '',
				bookName: '',
				bookLink: '',
				author: '',
				img: '',
				introduce: '',
				chapterList: [],
				groupChapterList: [],
				showMoreDesc: false,
				currentIndex: 0,
				locateIndex: '', // 用于章节定位索引
				shelftButtonDisable: true,
				navBorder: false,
				chapterShow: false,
				isReverse: false,
				chapterTotal: 0,
				pageNum: 1,
				pageSize: 15,
				defaultImg: '../../static/nodata.jpg',
			}
		},
		methods: {
			onLoad(option) {
				const redirectObj = JSON.parse(decodeURIComponent(option.item));
				this.openid = redirectObj.openid;
				this.sourceId = redirectObj.sourceId;
				this.bookName = redirectObj.bookName;
				this.bookLink = redirectObj.bookLink;
				this.author = redirectObj.author;
				
				shelfIsExit({sourceId: this.sourceId, openid: this.openid, bookName: this.bookName}).then(res => {
					this.shelftButtonDisable = res.data;
					if (res.data) {
						this.shelfInfo = '已加入书架';
					}
				});
			},
			onShow() {
				// 获取章节信息
				this.refreshCatelog();
			},
			back() {
				uni.navigateBack({
					delta: 1
				});
			},
			showDesc: function() {
				this.showMoreDesc = !this.showMoreDesc;
			},
			showChapter() {
				this.chapterShow = true;	
			},
			openChapter() {
				this.toChapterSite();
			},
			closeChapter() {
				this.locateIndex = 'D0';
				this.chapterShow = false;
				this.isReverse = false;
			},
			readNow() {
				let redirectObj = {
					"sourceId": this.sourceId,
					"bookName": this.bookName,
					"bookLink": this.bookLink,
					"chapterIndex": this.currentIndex,
				}
				
				// 添加浏览历史
				this.addBrowse();
				
				this.rediretToRead(redirectObj);
			},
			// 目录排序： 反转目录列表达到正序 倒序功能
			sortchapterList() {
				this.chapterList = this.chapterList.reverse();
				this.isReverse = !this.isReverse;
			},
			// 添加书架
			addBookshelf: function(e) {
				let that = this;
				
				let param = {
					openid: that.openid,
					sourceId: that.sourceId,
					bookName: that.bookName,
					bookLink: that.bookLink,
					img: that.img,
					author: that.author,
				};
				saveShelf(param).then(res => {
					uni.showModal({
						title: '提示',
						content: '添加书架成功,立即阅读',
						success: function(res) {
							that.shelfInfo = '已加入书架';
							that.shelftButtonDisable = true;
							if (res.confirm) {
								that.readNow(e);
							}
						}
					});
				}).catch(err => {
				});
			},
			// 详情页面 点击目录跳转到阅读页
			toRead: function(e) {
				this.chapterShow = false;
				this.currentIndex = (this.pageNum - 1) * 15 + e;
				let redirectObj = {
					"sourceId": this.sourceId,
					"bookName": this.bookName,
					"bookLink": this.bookLink,
					"chapterIndex": this.currentIndex,
				}
				
				this.addBrowse();
				
				this.rediretToRead(redirectObj);
			},
			refreshCatelog: function() {
				uni.showLoading({
					title: "客官请稍后"
				});
			
				getCache({
					openid: this.openid,
					key: "progress_" + this.sourceId + "_" + this.bookName
				}).then(res => {
					if (res.msg) {
						this.currentIndex = parseInt(res.msg);
					}
					getChapters({sourceId: this.sourceId, link: this.bookLink}).then(res => {
						this.img = res.data.img;
						this.introduce = res.data.introduce;
						this.chapterList = res.data.chapterList;
						this.chapterTotal = res.data.total;
						if (this.chapterTotal > 3000) {
							this.pageNum = Math.floor(this.currentIndex / this.pageSize) + 1;
							this.groupArray(this.chapterList, this.pageSize);
						}
						uni.hideLoading();
					});
				});
			},
			getBindId: function(index) {
				return 'D' + index;
			},
			toChapterSite: function() {
				getCache({
					openid: this.openid,
					key: "progress_" + this.sourceId + "_" + this.bookName
				}).then(res => {
					if (res.msg) {
						this.currentIndex = parseInt(res.msg);
						this.locateIndex = 'D' + this.currentIndex;
					}
				});
			},
			addBrowse() {
				let param = {
					openid: this.openid,
					sourceId: this.sourceId,
					bookName: this.bookName,
					bookLink: this.bookLink,
					img: this.img,
					author: this.author
				};
				saveBrowseHistory(param);
			},
			changeChapter(e) {
				this.pageNum = e.current;
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
			handleImageError(e) {
				this.img = this.defaultImg;
			},
			groupArray(data, groupSize) {
				for (let i = 0; i < data.length; i += groupSize) {
					this.groupChapterList.push(data.slice(i, i + groupSize));
				}
			}
		}
	}
</script>

<style>
	.row {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		width: 100%;
		height: 110px;
		margin: 10rpx;
	}

	.rowIcon {
		width: 180rpx;
		height: 190rpx;
		margin: 0px 20px 0px 0px
	}

	.rowDesc {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		height: 190rpx;
		width: 99%;
		margin: 2rpx;
	}

	.row text {
		font-size: 14px;
		margin-top: 15rpx;
		height: 12px;
	}

	.btnGroup {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		width: 100%;
		height: 100rpx;
		margin-top: 20px;
	}

	.blue-btn {
		width: 40%;
		height: 80rpx;
		font-size: 14px;
		background: #6c2a21;
		border: 0.5rpx solid #6c2a21;
		line-height: 80rpx;
		color: white;
	}

	.blue-btn::after {
		border: 0;
	}

	.blue-link {
		color: #6c2a21;
		width: 100%;
		text-align: center;
		margin: 20rpx 0 10rpx 0;
	}

	.desc {
		font-size: 14px;
		margin: 30rpx;
	}

	.desc .content {
		margin-top: 20rpx;
		line-height: 20px;
	}

	.desc .autoHeight {
		height: auto;
		overflow-y: auto;
	}

	.desc .limitHeight {
		height: 40px;
		overflow-y: hidden;
	}

	.linePanel {
		padding: 15rpx;
		border-bottom: 1rpx solid #eee;
		border-top: 1rpx solid #eee;
		font-size: 14px;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	/* 章节 */
	.catelog {
		height: 560px;
		position: relative;
		bottom: 0px;
		background: #fefefe;
		color: #999;
	}

	.catelog-header {
		left: 0px;
		display: flex;
		height: 40px;
		background-color: #fefefe;
		justify-content: space-between;
		border-bottom: 1px solid #f5f2f0;
	}

	.catelog-header-col {
		height: 40px;
		line-height: 40px;
		margin-left: 20px;
		color: #634102;
		background-color: #fefefe;
		border-bottom: 1px solid #f5f2f0;
	}
	
	.catelog-header-col1 {
		height: 40px;
		line-height: 40px;
		margin-right: 20px;
		color: #634102;
		background-color: #fefefe;
		border-bottom: 1px solid #f5f2f0;
	}


	.column {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.row_item {
		display: flex;
		align-items: center;
		line-height: 30px;
		/* margin-top:5px; */
		border-bottom: 1px solid #f5f2f0;
		margin: 0 20px;
	}

	.hoverText {
		color: #634102;
	}

</style>
