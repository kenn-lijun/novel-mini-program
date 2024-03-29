<template>
	<view>
		<view>
			<uni-nav-bar :border="navBorder" dark fixed="true" background-color="#343232" status-bar left-icon="back"
				@clickLeft="back" />
		</view>

		<uni-section title="猜你想找" type="line" padding>
			<view>
				<uni-list>
					<uni-list-item v-for="(item,index) in bookList">
						<template v-slot:header>
							<view class="slot-box">
								<image class="slot-image" :src="defaultImg" mode="widthFix"></image>
							</view>
						</template>
						<template v-slot:body>
							<view class="slot-box slot-text" @click="gotoBookInfo(index)">
								<text class="slot-text-bookName" >{{item.name}}-</text>
								<text class="slot-text-author" >{{item.author}}</text>
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
				source: '',
				bookList: [],
				navBorder: false,
				defaultImg: '../../static/nodata.jpg',
			}
		},
		onLoad(option) {
			uni.showLoading({
				title: "客官请稍后"
			});
			let that = this;
			const redirectObj = JSON.parse(decodeURIComponent(option.item));
			that.openid = redirectObj.openid;
			that.bookName = redirectObj.bookName;
			that.source = redirectObj.source;
			
			searchBookName({name: that.bookName, source: that.source}).then(res  => {
				that.bookList = res.data;
				uni.hideLoading();
			});
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				});
			},
			toChapter(e) {
				let info = this.shelfList[e];
			},
			gotoBookInfo: function(index) {
				uni.$u.route('/pages/bookInfo/bookInfo', {
					bookName: this.bookList[index].name,
					author: this.bookList[index].author,
					bookLink: this.bookList[index].link,
					source: this.source,
					openid: this.openid
				});
			},
		}
	}
</script>

<style lang="scss">
	.search-input {
		height: 60px;
		background-color: white;
	}

	.example-body {
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

	.slot-box {
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
		margin-right: 10px;
		width: 50px;
		height: 50px;
	}

	.slot-text {
		flex: 1;
	}

	.slot-text-bookName {
		font-size: 16px;
		color: #6c2a21;
	}

	.slot-text-author {
		font-size: 12px;
		color: #6c2a21;
	}
</style>
