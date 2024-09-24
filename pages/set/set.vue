<template>
	<view>
		<view>
			<!-- leftWidth和rightWidth保持一致标题居中 -->
			<uni-nav-bar dark fixed="true" shadow background-color="#6d6d6d" status-bar left-icon="back"
				@clickLeft="back" title="爱宁呦" />
		</view>

		<uni-section title="设置" type="line" padding>
			<u-collapse>
			    <u-collapse-item
			      title="翻页设置"
			      name="Docs guide"
			    >
					<u-radio-group
					  v-model="pageTurnRadio1"
					  placement="row"
					>
						<u-radio
							:customStyle="{marginBottom: '8px'}"
							v-for="(item, index) in pageTurnRadioList"
							:key="index"
							:label="item.name"
							:name="item.name"
							@change="radioChange"
						>
						</u-radio>
					</u-radio-group>
			    </u-collapse-item>
			  </u-collapse>
		</uni-section>
	</view>
</template>

<script>
	import { cache, getCache } from '../../api/book';
	export default {
		data() {
			return {
				openid: '',
				// 基本案列数据
				pageTurnRadioList: [
					{
						name: '滑动翻页',
						disabled: false
					},
					{
						name: '点击翻页',
						disabled: false
					},
				],
				// u-radio-group的v-model绑定的值如果设置为某个radio的name，就会被默认选中
				pageTurnRadio1: '滑动翻页',
			}
		},
		onLoad(option) {
			this.openid = option.openid;
			getCache({
				openid: this.openid,
				key: "turn_page_radio"
			}).then(res => {
				if (res.msg && res.msg != '') {
					this.pageTurnRadio1 = res.msg;
				}
			})
		},
		methods: {
			back() {
				uni.navigateBack({
					delta: 1
				});
			},
			radioChange(e) {
				this.setPageTurnRadio(e);
			},
			setPageTurnRadio(data) {
				if(data && data != '') {
					cache({
						openid: this.openid,
						key: "turn_page_radio",
						info: data
					})
				}
			},
		}
	}
</script>

<style lang="scss">
	.u-radio__text {
		margin-right: 30px;
	}
</style>
