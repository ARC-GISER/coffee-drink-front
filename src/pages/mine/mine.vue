<template>
	<layout>
		<view class="container">
			<!-- 咖啡渐变头部背景 -->
			<view class="profile-header">
				<view class="header-bg"></view>
				<view class="header-beans">
					<view class="bean b1"></view>
					<view class="bean b2"></view>
					<view class="bean b3"></view>
				</view>
				<view class="header-content">
					<!-- 头像 -->
					<view class="avatar-wrap">
						<image class="avatar-img"
							:src="isLogin && member.avatar ? member.avatar : '/static/images/mine/default.png'"
							mode="aspectFill" />
						<view class="level-badge" v-if="isLogin">
							Lv.2 咖啡爱好者
						</view>
					</view>
					<!-- 昵称 -->
					<view class="user-name" v-if="isLogin"
						@tap="serv({type:'pages',pages:'/pages/components/pages/mine/userinfo'})">
						{{ member.nickname }}
						<text class="iconfont iconarrow-right"></text>
					</view>
					<view class="user-name" v-else @tap="login">游客登录 ></view>
					<!-- 数据看板 -->
					<view class="stats-row">
						<view class="stat-item" @tap="serv({type:'pages', pages:'/pages/components/pages/coupons/coupons'})">
							<text class="stat-value">{{ isLogin ? member.couponCount : 0 }}</text>
							<text class="stat-label">优惠券</text>
						</view>
						<view class="stat-item"
							@tap="serv({type:'pages', pages:'/pages/components/pages/balance/bill?cate=1'})">
							<text class="stat-value">{{ isLogin ? member.integral : 0 }}</text>
							<text class="stat-label">积分</text>
						</view>
						<view class="stat-item">
							<text class="stat-value">{{ isLogin ? member.nowMoney : 0 }}</text>
							<text class="stat-label">余额</text>
						</view>
						<view class="stat-item"
							@tap="serv({type:'pages', pages:'/pages/components/pages/balance/bill?cate=0'})">
							<text class="stat-value">{{ isLogin ? member.sumMoney : 0 }}</text>
							<text class="stat-label">累计消费</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 我的服务 -->
			<view class="section">
				<view class="section-title">我的服务</view>
				<view class="service-cards">
					<uv-cell-group>
						<block v-for="(item, index) in services" :key='index'>
							<uv-cell :isLink="true" :title="item.name" @tap="serv(item)"
								v-if="item.type == 'pages' || item.type == 'menu' || item.type == 'content'"
								@click="item.type == 'call' ? makePhoneCall(item.phone) : ''">
								<template #icon>
									<image :src="item.image" style="width: 40rpx;height: 40rpx;" class="mr-1"></image>
								</template>
							</uv-cell>
							<uv-cell :isLink="true" :title="item.name" v-else-if="item.type == 'call'"
								@click="makePhoneCall(item.phone)">
								<template #icon>
									<image :src="item.image" style="width: 40rpx;height: 40rpx;" class="mr-1"></image>
								</template>
							</uv-cell>
						</block>
					</uv-cell-group>
				</view>
			</view>

			<!-- 咖啡小知识 -->
			<view class="section">
				<view class="coffee-trivia">
					<view class="trivia-icon">☕</view>
					<view class="trivia-content">
						<view class="trivia-title">今日咖啡小知识</view>
						<view class="trivia-text">拿铁（Latte）在意大利语中是"牛奶"的意思。正宗的意式拿铁由一份浓缩咖啡和三份蒸汽牛奶组成，口感顺滑香浓。</view>
					</view>
				</view>
			</view>
		</view>
	</layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMainStore } from '@/store/store'
import { storeToRefs } from 'pinia'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { userGetUserInfo, mineService } from '@/api/user'

const main = useMainStore()
const { member, isLogin } = storeToRefs(main)

const title = ref('个人中心')
const services = ref([])

const growthValue = computed(() => {
	if (!isLogin.value) return 0
	const { currentValue, needValue } = member.value
	return currentValue / (currentValue + needValue) * 100
})

onLoad(() => { getServices() })
onShow(() => { getUserInfo() })

const getUserInfo = async () => {
	if (isLogin.value) {
		let data = await userGetUserInfo()
		if (data) { main.SET_MEMBER(data) }
	}
}

const getServices = async () => {
	let data = await mineService()
	if (data) { services.value = data }
}

const makePhoneCall = (phoneNumber) => {
	uni.makePhoneCall({ phoneNumber: phoneNumber })
}

const login = () => {
	uni.navigateTo({ url: '/pages/components/pages/login/login' })
}

const serv = (item) => {
	switch (item.type) {
		case 'pages':
			if (!isLogin.value) { login(); return }
			uni.navigateTo({ url: item.pages })
			break
		case 'miniprogram':
			uni.navigateToMiniProgram({ appId: item.app_id })
			break
		case 'menu':
			uni.navigateTo({ url: '/pages/components/pages/mine/service?id=' + item.id + '&name=' + item.name })
			break
		case 'content':
			uni.navigateTo({ url: '/pages/components/pages/mine/content?id=' + item.id + '&name=' + item.name })
			break
	}
}
</script>

<style lang="scss" scoped>
page {
	height: auto;
	min-height: 100%;
	background: $bg-color;
}

.container {
	padding-bottom: 80rpx;
}

// ======== 头部渐变 ========
.profile-header {
	position: relative;
	overflow: hidden;
}
.header-bg {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 560rpx;
	background: linear-gradient(180deg, $color-primary-dark 0%, $color-primary 40%, #8B5E3C 100%);
}
.header-beans {
	position: absolute;
	top: 40rpx;
	right: -20rpx;
	opacity: 0.08;
	.bean {
		position: absolute;
		width: 100rpx;
		height: 120rpx;
		border-radius: 50%;
		background: #FFF;
	}
	.b1 { right: 60rpx; top: 40rpx; transform: rotate(-30deg); }
	.b2 { right: 140rpx; top: 80rpx; transform: rotate(15deg); width: 80rpx; height: 96rpx; }
	.b3 { right: 20rpx; top: 120rpx; transform: rotate(-45deg); width: 60rpx; height: 72rpx; }
}
.header-content {
	position: relative;
	z-index: 1;
	padding: 60rpx 30rpx 30rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

// 头像
.avatar-wrap {
	position: relative;
	margin-bottom: 16rpx;
}
.avatar-img {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	border: 4rpx solid rgba(255, 255, 255, 0.4);
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
}
.level-badge {
	margin-top: 12rpx;
	background: $color-accent;
	color: #FFFFFF;
	font-size: 20rpx;
	padding: 6rpx 20rpx;
	border-radius: $radius-xl;
	text-align: center;
}

// 昵称
.user-name {
	font-size: $font-size-lg;
	font-weight: $font-weight-semibold;
	color: #FFFFFF;
	margin-bottom: 28rpx;
	display: flex;
	align-items: center;
	.iconfont { font-size: 26rpx; margin-left: 6rpx; opacity: 0.8; }
}

// 数据看板
.stats-row {
	display: flex;
	width: 100%;
	background: rgba(255, 255, 255, 0.15);
	backdrop-filter: blur(10rpx);
	border-radius: $radius-base;
	padding: 24rpx 0;
}
.stat-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}
.stat-value {
	font-size: $font-size-xl;
	font-weight: $font-weight-bold;
	color: #FFFFFF;
}
.stat-label {
	font-size: $font-size-xs;
	color: rgba(255, 255, 255, 0.7);
}

// ======== 区块 ========
.section {
	margin: $spacing-md $spacing-sm;
}

.section-title {
	font-size: $font-size-md;
	font-weight: $font-weight-semibold;
	color: $text-color-base;
	margin-bottom: $spacing-sm;
}

.service-cards {
	background: #FFFFFF;
	border-radius: $radius-base;
	overflow: hidden;
	box-shadow: $box-shadow;
}

// ======== 咖啡小知识 ========
.coffee-trivia {
	background: #FFFFFF;
	border-radius: $radius-base;
	padding: 28rpx;
	display: flex;
	gap: 20rpx;
	box-shadow: $box-shadow;
}
.trivia-icon {
	font-size: 48rpx;
	flex-shrink: 0;
}
.trivia-title {
	font-size: $font-size-base;
	font-weight: $font-weight-semibold;
	color: $text-color-base;
	margin-bottom: 8rpx;
}
.trivia-text {
	font-size: $font-size-sm;
	color: $text-color-assist;
	line-height: 1.6;
}
</style>
