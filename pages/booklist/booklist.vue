<template>
	<view>
		<view>
			<uni-nav-bar :border="navBorder" dark fixed="true" background-color="#343232" status-bar left-icon="back"
				@clickLeft="back" />
		</view>

		<uni-section title="猜你想找" type="line" padding>
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
							<view class="slot-text" @click="gotoBookInfo(index)">
								<text class="slot-text-bookName" >{{item.name}}</text>
								<text class="slot-text-author" >作者: {{item.author}}</text>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
		</uni-section>
	</view>
</template>

<script>
	import { searchBookName } from '../../api/book';
	export default {
		data() {
			return {
				openid: '',
				sourceId: '',
				bookList: [],
				navBorder: false,
				defaultImg: '../../static/nodata.jpg',
				page: 1,
			}
		},
		onLoad(option) {
			uni.showLoading({
				title: "客官请稍后"
			});
			let that = this;
			const redirectObj = JSON.parse(decodeURIComponent(option.item));
			that.openid = redirectObj.openid;
			that.sourceId = redirectObj.sourceId;
			that.bookName = redirectObj.bookName;
			
			searchBookName({sourceId: that.sourceId, name: that.bookName, page: that.page}).then(res  => {
				that.bookList = res.data;
				that.bookList.forEach(item => {
					this.$set(item, 'isLoaded', false);
				});
				uni.hideLoading();
			});
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				});
			},
			onReachBottom() {
				let that = this;
				uni.showLoading({
					title: "客官请稍后"
				});
				searchBookName({sourceId: that.sourceId, name: that.bookName, page: that.page + 1}).then(res  => {
					uni.hideLoading();
					if (res.data.length > 0) {
						res.data.forEach(item => {
							this.$set(item, 'isLoaded', false);
						});
						that.page = that.page + 1;
						that.bookList.push(...res.data);
					} else {
						uni.showToast({
							icon: "none",
							title: "已经到底了"
						})
					}
				});
			},
			toChapter(e) {
				let info = this.shelfList[e];
			},
			gotoBookInfo: function(index) {
				let redirectObj = {
					openid: this.openid,
					sourceId: this.sourceId,
					bookName: this.bookList[index].name,
					author: this.bookList[index].author,
					bookLink: this.bookList[index].link
				}
				uni.$u.route('/pages/bookInfo/bookInfo', {
					item: encodeURIComponent(JSON.stringify(redirectObj))
				});
			},
			handleImageLoad(index) {
				this.$set(this.bookList[index], 'isLoaded', true);
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
		position: relative;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
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

	.slot-text-author {
		font-size: 11px;
		color: rgba(0, 0, 0, 0.7);
	}
</style>
