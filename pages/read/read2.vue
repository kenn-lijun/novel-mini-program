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
				<text :style="{color: chapterColor}">{{pageIndex}}/{{pageNum}}</text>
			</view>
			
			<view class="content"
				:style="{width: (pageNum * 100) + '%',height: windows.pageHeight + 'px',WebkitColumnCount: pageNum,columnCount: pageNum,left: leftValue + 'px',fontSize: fontSize + 'rpx',lineHeight: lineHeight + 'px',color: fontColor}"
				@touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" v-html="content">
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
	import { getFirstLink, getBookInfo, cache, getCache } from '../../api/book';
	var isMoving = 0;
	var hasRunTouchMove = false;
	export default {
		data() {
			return {
				backColor: '#343232',
				fontColor: '#f8f8f2',
				chapterColor: '#d19766',
				chapterName: '',
				firstChapterLink: '',
				navBorder: false,
				popupShow: false,
				linghtProgress: 0,
				fontSizeProgress: 0,
				lineHeightProgress: 0,
				currentBgColorIndex: 1,
				content: '',
				fontSize: 36, //单位rpx
				lineHeight: 26, //单位rpx
				chapterLink: '',
				bookLink: '',
				nextLink: '',
				beforeLink: '',
				bookName: '',
				source: '',
				windows: {
					windowsHeight: 0,
					windowsWidth: 0,
					pixelRatio: 1,
					pageHeight: 0
				},
				touches: {
					lastX: 0,
					lastY: 0
				},
				moveDirection: 0, //0代表左滑动，1代表右滑动
				leftValue: 0,
				pageIndex: 1,
				pageNum: 0,
				scrollTop: 0,
				windowHeight: '',
				currentChapterIndex: 0,
			}
		},
		methods: {
			countPageNum: function(str, fontSize, lineHeight, windowW, windowH, pixelRatio) {
				var fontSize = fontSize;
				var lineHeight = lineHeight;
				//将str根据’\n‘截成数组
				var strArray = str.split(/\n+/);
				var splitArray = []; //换行符的个数集合

				// i 执行对大小写不敏感的匹配。
				// g 执行全局匹配查找所有匹配而非在找到第一个匹配后停止
				// m 执行多行匹配
				// \n+ 匹配任何包含至少一个 \n 的字符串
				var reg = new RegExp('\n+', 'igm');
				var result = '';
				// 这里写一个for循环去记录每处分隔符的\n的个数，这将会影响到计算换行的高度
				// reg.exec===>匹配目标字符串，结果为第一条结果所有信息的数组
				while ((result = reg.exec(str)) != null) {
					splitArray.push(result.toString().match(/\n/img).length);
				}
				var totalHeight = 0;
				strArray.forEach(function(item, index) {
					var wrapNum = 0;
					//splitArray的长度比strArray小1
					if (splitArray.length < index) {
						wrapNum = splitArray[index] - 1;
					}
					//Math.ceil向上取整
					totalHeight += Math.ceil(item.length / Math.floor((windowW - 120 / pixelRatio) / (
						fontSize / pixelRatio))) * lineHeight + wrapNum * lineHeight;
				});
				return Math.ceil(totalHeight / (windowH)) + 3;
			},
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
				
				uni.getSystemInfo({
					success: (res) => {
						this.windowHeight = (res.windowHeight - 100) + 'px';
						that.windows.windowsHeight = res.screenHeight;
						that.windows.pageHeight = res.windowHeight;
						that.windows.windowsWidth = res.windowWidth;
						that.windows.pixelRatio = res.pixelRatio;
					}
				})
				//动态设置标题
				const redirectObj = JSON.parse(decodeURIComponent(option.item));
				that.source = redirectObj.source;
				that.chapterLink = redirectObj.chapterLink;
				that.bookLink = redirectObj.bookLink;
				that.bookName = redirectObj.bookName;

				// 获取第一章链接
				that.getFirstLinkByCache().then(function(data) {
					that.firstChapterLink = data;
					// loadPageIndex表示从缓存加载pageIndex
					if (!that.chapterLink || that.chapterLink == '') {
						that.initChapters(that.firstChapterLink, false, false);
					} else {
						that.initChapters(that.chapterLink, false, true);
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
			// isLeftChapter表示是否为上一章 loadPageIndex表示是否从缓存获取pageIndex
			initChapters: function(link, isLeftChapter, loadPageIndex) {
				var that = this;
				
				that.chapterName = '加载中';
				uni.pageScrollTo({
					scrollTop: 0,
				});
				
				uni.showLoading({
					title: '客官请稍后',
					mark: true
				});
				getBookInfo({link: link, source: that.source}).then(res => {
					let content = res.data.info.trim();
					let name = (res.data.name || '').trim();
					let nextLink = res.data.nextInfoLink;
					let beforeLink = res.data.beforeInfoLink;
					
					content = content.replace(/&nbsp;/g, " ");
					content = content.replace("</a></p>", "");
					content = content.replace("</a></p>", "");
					content = content.replace("<div id=\"content\">", "");
					content = content.replace("</div>", "");
					if (content.match(/<p style(.*)/)) {
						let footP = content.match(/<p style(.*)/)[0]
						if (footP) {
							content = content.replace(footP, "");
						}
					}
					let pageNum = that.countPageNum(content, that.fontSize, that.lineHeight,
						that.windows.windowsWidth, that.windows.windowsHeight, that.windows
						.pixelRatio);
					
					// 读取用户设置 获取缓存内容
					getCache({
						openid: uni.getStorageSync('openid'),
						key: "pageindex_" + that.source + "_" + that.bookName
					}).then(res => {
						let pageIndex = res.msg;
						if (pageIndex == '' || !loadPageIndex) {
							pageIndex = 1;
						}
						// pageindex为当前页数 pageNum为总页数（总页数由文章内容以及字体大小等因素判断的来）
						// 上一章loadPageIndex为true 下一章为false
						if (isLeftChapter) {
							pageIndex = pageNum;
						}
						let windth = that.windows.windowsWidth;
						// 根据leftValue的值起到翻页的效果
						let leftValue = windth * (pageIndex - 1)
						//重新排版
						that.content = content;
						that.chapterName = name;
						that.chapterLink = link;
						that.nextLink = nextLink;
						that.beforeLink = beforeLink;
						that.pageNum = pageNum;
						that.pageIndex = pageIndex;
						that.leftValue = -leftValue;
						that.moveDirection = 0;
						that.touches.lastX = 0;
						that.touches.lastY = 0;
						that.setPageIndex();
						uni.hideLoading();
					});
				})
				that.setReadProgress(link);
			},
			handleTouchMove: function(e) {
				let that = this;
				if (isMoving == 1) {
					return;
				}
				let currentX = e.touches[0].pageX;
				let currentY = e.touches[0].pageY;
				// 判断没有滑动而是点击屏幕的动作
				hasRunTouchMove = true;
				let direction = 0;
				if ((currentX - that.touches.lastX) < 0) {
					direction = 0;
				} else if (((currentX - that.touches.lastX) > 0)) {
					direction = 1;
				}

				//需要减少或者增加的值
				//将当前坐标进行保存以进行下一次计算
				that.touches.lastX = currentX;
				that.touches.lastY = currentY;
				that.moveDirection = direction;
			},
			handleTouchStart: function(e) {
				let that = this;
				// 判断用户的点击事件，如果不是滑动，将不会执行touchmove
				hasRunTouchMove = false;
				let width = that.windows.windowsWidth;
				let direction = 0;
				if (e.touches[0].pageX < (that.windows.windowsWidth / 2)) {
					direction = 1;
				}
				if (isMoving == 0) {
					that.touches.lastX = e.touches[0].pageX;
					that.touches.lastY = e.touches[0].pageY;
					that.moveDirection = direction;
				}
			},
			setReadProgress(data) {
				cache({
					openid: uni.getStorageSync('openid'),
					key: "progress_" + this.source + "_" + this.bookName,
					info: data
				});
			},
			setPageIndex() {
				// 缓存当前书籍的pageIndex
				cache({
					openid: uni.getStorageSync('openid'),
					key: "pageindex_" + this.source + "_" + this.bookName,
					info: this.pageIndex
				});
			},
			// 触摸接触调用的函数
			handleTouchEnd: function() {
				let that = this;
				// 判断用户的点击事件，决定是否显示控制栏
				if (hasRunTouchMove == false) {
					let y = that.touches.lastY;
					let x = that.touches.lastX;
					let h = that.windows.windowsHeight / 2;
					let w = that.windows.windowsWidth / 2;
					// 触碰中间区域显示目录页面
					if (x && y && y >= (h - 50) && y <= (h + 50) && x >= (w - 60) && x <= (w + 60)) {
						that.clickInfo();
						return;
					}
				}
				//左滑动和右滑动的操作
				let currentIndex = that.pageIndex; //当前页数
				// isMoving 表示正在移动中
				if (isMoving == 0) {
					// 0左滑 1右滑
					if (that.moveDirection == 0) {
						// 判断单曲页数小于章节总页数的时候翻页 否则为获取下一章
						if (currentIndex < that.pageNum) {
							isMoving = 1;
							let windth = that.windows.windowsWidth;
							++currentIndex;
							let leftValue = windth * (currentIndex - 1)
							that.pageIndex = currentIndex;
							that.leftValue = -leftValue;
							that.setPageIndex();
						} else {
							that.initChapters(that.nextLink, false, false);
						}
					} else {
						//前一页和后一页相差其实是2个-320px
						if (currentIndex > 1) {
							isMoving = 1;
							let windth = that.windows.windowsWidth;
							--currentIndex;
							let leftValue = windth * (currentIndex - 1)
							that.pageIndex = currentIndex;
							that.leftValue = -leftValue;
							that.setPageIndex();
						} else {
							if (that.chapterLink == that.firstChapterLink) {
								wx.showToast({
									title: '亲,到顶了:）',
									icon: 'success',
									duration: 2000
								})
							} else {
								that.initChapters(that.beforeLink, true, false);
							}
						}
					}
					isMoving = 0;
				}
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
		width: 70%;
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
