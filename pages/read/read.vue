<template>
	<view @touchmove="touchmove">
		<view>
			<!-- leftWidth和rightWidth保持一致标题居中 -->
			<uni-nav-bar :border="navBorder" dark fixed="true" :background-color="backColor" :color="fontColor"
				status-bar left-icon="back" @clickLeft="back" :title="chapterName" />
		</view>

		<view class="container" :style="{background: backColor}">
			<view class="header">
				<text class="chapter" :style="{color: chapterColor}">{{chapterName}}</text>
			</view>

			<view class="content">
				<view>
					<view class="content-text" v-html="content"
						:style="{fontSize: fontSize + 'rpx',lineHeight: lineHeight + 'px',color: fontColor}"
						@click="clickInfo">
					</view>
					<!-- 底部按钮 -->
					<view v-html="'<br><br>'"></view>
					<button class="leftButton" type="default" size="mini" @click="leftChapter">上一章</button>
					<button class="rightButton" type="default" size="mini" @click="rightChapter">下一章</button>
					<view v-html="'<br><br><br><br><br>'"></view>
				</view>
			</view>
		</view>

		<u-popup :show="popupShow" @close="closePopup">
			<view @touchmove.stop>
				<view v-html="'<br><br>'"></view>
				<view class="popupItem">
					<view class="popupItemPosition popupItemTitle">
						亮度
					</view>
					<view class="popupItemPosition popupItemProgress">
						<u-slider v-model="linghtProgress" :min="0" :max="100" :showValue="true" activeColor="#deab8a" blockColor="#f47920" inactiveColor="#c0c4cc"
							:change="changeLight(linghtProgress)"></u-slider>
					</view>
					<view class="popupItemPosition popupItemIcon">
						<uni-icons custom-prefix="iconfont" type="icon-bright1" size="18"></uni-icons>
					</view>
				</view>
				<view class="popupItem">
					<view class="popupItemPosition popupItemTitle">
						字号
					</view>
					<view class="popupItemPosition popupItemProgress">
						<u-slider v-model="fontSizeProgress" :min="22" :max="56" :showValue="true"
							:change="changeFontSize(fontSizeProgress)"></u-slider>
					</view>
					<view class="popupItemPosition popupItemIcon">
						<uni-icons custom-prefix="iconfont" type="icon-zihao" size="18"></uni-icons>
					</view>
				</view>
				<view class="popupItem">
					<view class="popupItemPosition popupItemTitle">
						间距
					</view>
					<view class="popupItemPosition popupItemProgress">
						<u-slider v-model="lineHeightProgress" :min="22" :max="38" :showValue="true" activeColor="#f29e99" blockColor="#e43d33" inactiveColor="#c0c4cc"
							:change="changeLineHeight(lineHeightProgress)"></u-slider>
					</view>
					<view class="popupItemPosition popupItemIcon">
						<uni-icons custom-prefix="iconfont" type="icon-wenzijianju" size="18"></uni-icons>
					</view>
				</view>
				<view class="popupItem">
					<view class="popupItemPosition popupItemTitle">
						背景
					</view>
					<view class="popupItemPosition popupItemOther">
						<view @click="styleButton1" class="styleButton styleButton1">
							<uni-icons class="styleIcon" v-if="currentBgColorIndex === 1" type="checkmarkempty" size="18" color="#f8f8f2"></uni-icons>
						</view>
					</view>
					<view class="popupItemPosition popupItemOther">
						<view @click="styleButton2" class="styleButton styleButton2">
							<uni-icons class="styleIcon" v-if="currentBgColorIndex === 2" type="checkmarkempty" size="18" color="#f8f8f2"></uni-icons>
						</view>
					</view>
					<view class="popupItemPosition popupItemOther">
						<view @click="styleButton3" class="styleButton styleButton3">
							<uni-icons class="styleIcon" v-if="currentBgColorIndex === 3" type="checkmarkempty" size="18" color="#655a5a"></uni-icons>
						</view>
					</view>
					<view class="popupItemPosition popupItemOther">
						<view @click="styleButton4" class="styleButton styleButton4">
							<uni-icons class="styleIcon" v-if="currentBgColorIndex === 4" type="checkmarkempty" size="18" color="#f8f8f2"></uni-icons>
						</view>
					</view>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<script>
	import { getFirstLink, getBookInfo, cache } from '../../api/book';
	export default {
		data() {
			return {
				backColor: '#343232',
				fontColor: '#f8f8f2',
				chapterColor: '#d19766',
				chapterName: '',
				content: '<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>',
				tempContent: '<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>',
				chapterList: [],
				fontSize: 36, //单位rpx
				lineHeight: 30, //单位rpx
				chapterLink: '',
				firstChapterLink: '',
				bookLink: '',
				nextLink: '',
				beforeLink: '',
				bookName: '',
				source: '',
				currentChapterIndex: 0,
				navBorder: false,
				popupShow: false,
				linghtProgress: 0,
				fontSizeProgress: 0,
				lineHeightProgress: 0,
				currentBgColorIndex: 1,
			}
		},
		methods: {
			onLoad(option) {
				var that = this;
				// 初始化页面配置
				let fontSize = uni.getStorageSync('fontSize');
				let lineHeight = uni.getStorageSync('lineHeight');
				let backColor = uni.getStorageSync('backColor');
				let fontColor = uni.getStorageSync('fontColor');
				let chapterColor = uni.getStorageSync('chapterColor');
				let currentBgColorIndex = uni.getStorageSync('currentBgColorIndex');
				that.fontSizeProgress = fontSize ? fontSize : 38;
				that.lineHeightProgress = lineHeight ? lineHeight : 30;
				if (backColor) {
					that.backColor = backColor;
				}
				if (fontColor) {
					that.fontColor = fontColor;
				}
				if (chapterColor) {
					that.chapterColor = chapterColor;
				}
				if (currentBgColorIndex) {
					that.currentBgColorIndex = currentBgColorIndex;
				}

				//动态设置标题
				const redirectObj = JSON.parse(decodeURIComponent(option.item));
				
				that.source = redirectObj.source;
				that.chapterLink = redirectObj.chapterLink;
				that.bookLink = redirectObj.bookLink;
				that.bookName = redirectObj.bookName;

				// 获取第一章链接
				that.getFirstLinkByCache().then(function(data) {
					let firstChapterLink = data;

					if (!that.chapterLink || that.chapterLink == '') {
						that.initChapters(firstChapterLink);
					} else {
						that.initChapters(that.chapterLink);
					}
				});
			},
			// 获取书籍第一章链接地址
			getFirstLinkByCache() {
				let that = this;
				// 使用Promise解决异步问题
				return new Promise(async resolve => {
					let param = {
						source: that.source,
						link: that.bookLink
					};
					getFirstLink(param).then(res => {
						that.firstChapterLink = res.msg;
						resolve(res.msg);
					});
				});
			},
			getScreenBrightness() {
				//注意uni.getScreenBrightness为异步接口，所以需要使用Promise封装为异步执行
				return new Promise(async resolve => {
					uni.getScreenBrightness({
						success: function(res) {
							resolve(res.value)
						}
					});
				})
			},
			//修改屏幕亮度
			updateScreenBrightness(light) {
				uni.setScreenBrightness({
					value: light
				});
			},
			// 初始化章节
			initChapters: function(link) {
				var that = this;
				that.content = that.tempContent;
				that.chapterName = '加载中';
				uni.pageScrollTo({
					scrollTop: 0,
				});
				
				uni.showLoading({
					title: '客官请稍后',
					mark: true
				});
				getBookInfo({link: link, source: that.source}).then(res => {
					//重新排版
					that.content = res.data.info;
					that.chapterName = (res.data.name || '').trim();
					that.chapterLink = link;
					that.nextLink = res.data.nextInfoLink;
					that.beforeLink = res.data.beforeInfoLink;
					uni.hideLoading();
				})
				that.setReadProgress(link);
			},
			setReadProgress(data) {
				cache({
					openid: uni.getStorageSync('openid'),
					key: "progress_" + this.source + "_" + this.bookName,
					info: data
				});
			},
			leftChapter: function(e) {
				if (this.chapterLink == this.firstChapterLink) {
					wx.showToast({
						title: '亲,到顶了:）',
						icon: 'success',
						duration: 2000
					})
				} else {
					this.initChapters(this.beforeLink);
				}
			},
			rightChapter: function(e) {
				this.initChapters(this.nextLink);
			},
			back() {
				// 重定向页面
				uni.navigateBack({
					delta: 1
				});
			},
			clickInfo() {
				let that = this;
				that.getScreenBrightness().then(function(data) {
					that.linghtProgress = Math.ceil(data * 100);
				});
				that.popupShow = true;
			},
			closePopup() {
				this.popupShow = false;
			},
			styleButton1() {
				this.backColor = '#343232';
				this.fontColor = '#f8f8f2';
				this.chapterColor = '#d19766';
				this.currentBgColorIndex = 1;
				uni.setStorageSync('backColor', this.backColor);
				uni.setStorageSync('fontColor', this.fontColor);
				uni.setStorageSync('chapterColor', this.chapterColor);
				uni.setStorageSync('chapterColor', this.chapterColor);
				uni.setStorageSync('currentBgColorIndex', this.currentBgColorIndex);
			},
			styleButton2() {
				this.backColor = '#826f51';
				this.fontColor = '#f8f8f2';
				this.chapterColor = '#343232';
				this.currentBgColorIndex = 2;
				uni.setStorageSync('backColor', this.backColor);
				uni.setStorageSync('fontColor', this.fontColor);
				uni.setStorageSync('chapterColor', this.chapterColor);
				uni.setStorageSync('currentBgColorIndex', this.currentBgColorIndex);
			},
			styleButton3() {
				this.backColor = '#f8f8f2';
				this.fontColor = '#343232';
				this.chapterColor = '#826f51';
				this.currentBgColorIndex = 3;
				uni.setStorageSync('backColor', this.backColor);
				uni.setStorageSync('fontColor', this.fontColor);
				uni.setStorageSync('chapterColor', this.chapterColor);
				uni.setStorageSync('currentBgColorIndex', this.currentBgColorIndex);
			},
			styleButton4() {
				this.backColor = '#66664d';
				this.fontColor = '#f8f8f2';
				this.chapterColor = '#343232';
				this.currentBgColorIndex = 4;
				uni.setStorageSync('backColor', this.backColor);
				uni.setStorageSync('fontColor', this.fontColor);
				uni.setStorageSync('chapterColor', this.chapterColor);
				uni.setStorageSync('currentBgColorIndex', this.currentBgColorIndex);
			},
			changeLight(value) {
				if (value > 0) {
					this.updateScreenBrightness(value / 100);
				}
			},
			changeFontSize(value) {
				if (value > 0) {
					this.fontSize = value;
					uni.setStorageSync('fontSize', this.fontSize);
				}
			},
			changeLineHeight(value) {
				if (value > 0) {
					this.lineHeight = value;
					uni.setStorageSync('lineHeight', this.lineHeight);
				}
			},
			touchmove() {
				if (this.popupShow) {
					this.popupShow = false;
				}
			}
		}
	}
</script>

<style>
	.container {
		height: 100%;
		overflow: hidden;
		position: relative;
	}

	.container .header {
		height: 20px;
		margin: 0 20px;
		line-height: 20px;
		font-size: 12px;
		display: flex;
		justify-content: space-between;
	}

	.chapter {
		font-family: '楷体';
		/* color: #d19766; */
		font-size: 15px;
		word-wrap: break-word;
		/*强制换行*/
		overflow: hidden;
		/*超出隐藏*/
		text-overflow: ellipsis;
		/*隐藏后添加省略号*/
		white-space: nowrap;
		/*强制不换行*/
	}

	.content .content-text {
		font-family: '楷体';
	}

	.container .content {
		display: block;
		overflow-x: hidden;
		height: 100%;
		box-sizing: border-box;
		column-gap: 60rpx;
		padding: 20rpx 18rpx 0 42rpx;
		position: relative;
	}

	.scroll-Y {
		height: 100%;
	}

	.leftButton {
		position: relative;
		float: left;
		left: 70px;
	}

	.rightButton {
		position: relative;
		float: right;
		right: 70px;
	}

	.popupItem {
		height: 38px;
		padding: 15px;
	}

	.popupItemPosition {
		height: 38px;
		position: relative;
		float: left;
	}

	.popupItemTitle {
		color: #655a5a;
		left: 20px;
		width: 20%;
		line-height: 38px;
	}

	.popupItemProgress {
		width: 70%;
	}

	.popupItemOther {
		width: 20%;
	}

	.popupItemIcon {
		width: 10%;
		left: 10px;
		top: 25%
	}
	
	.styleButton {
		position: relative;
		left: 15px;
		height: 30px;
		width: 30px;
		background-color: #343232;
		border: #343232; 
		border-radius: 2px;
	}
	
	.styleButton1 {
		background-color: #343232;
		border: #343232;
	}
	
	.styleButton2 {
		background-color: #826f51;
		border: #826f51;
	}
	
	.styleButton3 {
		background-color: #f8f8f2;
		border: #f8f8f2;
	}
	
	.styleButton4 {
		background-color: #47473a;
		border: #47473a;
	}
	
	.styleIcon {
		position: relative;
		top: 25%;
		left: 25%;
	}
</style>
