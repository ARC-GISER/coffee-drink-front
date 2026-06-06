<template>
	<uv-navbar :fixed="false" :title="title" left-arrow @leftClick="$onClickLeft" />

	<!-- 门店信息 -->
	<view class="container" v-if="cart.length > 0">
		<view class="store-card">
			<view class="store-icon">🏪</view>
			<view class="store-info">
				<view class="store-name">{{ store.name || '当前门店' }}</view>
				<view class="store-type">{{ orderType === 'takein' ? '自取' : '外卖配送' }}</view>
			</view>
		</view>
	</view>

	<!-- 购物车列表 -->
	<view class="cart-popup">
		<view class="top">
			<text>已点{{ getCartGoodsNumber }}份</text>
			<text class="clear-btn" @tap="handleCartClear">🗑 清空</text>
		</view>
		<scroll-view class="cart-list" scroll-y>
			<view class="wrapper">
				<uv-empty mode="car" v-if="cart.length == 0"></uv-empty>
				<view class="item" v-for="(item, index) in cart" :key="index">
					<view class="left">
						<view class="name">{{ item.name }}</view>
						<view class="props">{{ item.valueStr }}</view>
					</view>
					<view class="center">
						<text class="item-price">￥{{ item.price }}</text>
					</view>
					<view class="right">
						<button type="default" plain size="mini" class="btn" hover-class="none"
							@tap="handleCartItemReduce(index)">
							<view class="iconfont iconsami-select"></view>
						</button>
						<view class="number">{{ item.number }}</view>
						<button type="primary" class="btn" size="min" hover-class="none"
							@tap="handleCartItemAdd(index)">
							<view class="iconfont iconadd-select"></view>
						</button>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>

	<!-- 备注 + 优惠券 -->
	<view class="extra-rows" v-if="cart.length > 0">
		<view class="extra-row" @tap="addRemark">
			<text class="extra-label">📝 备注</text>
			<text class="extra-value">点击添加备注 ></text>
		</view>
		<view class="extra-row" @tap="selectCoupon">
			<text class="extra-label">🎫 优惠券</text>
			<text class="extra-value">选择优惠券 ></text>
		</view>
	</view>

	<!-- 底部结算栏 -->
	<view class="fixed-bottom" v-if="cart.length > 0">
		<view class="bottom-left">
			<text class="total-label">合计</text>
			<text class="total-price">￥{{ getCartGoodsPrice }}</text>
		</view>
		<view class="bottom-right">
			<button type="primary" class="checkout-btn" @tap="toPay">去结算 →</button>
		</view>
	</view>

	<uv-toast ref="uToast"></uv-toast>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMainStore } from '@/store/store'
import { storeToRefs } from 'pinia'
import { onShow } from '@dcloudio/uni-app'

const main = useMainStore()
const { orderType, address, store, location, isLogin } = storeToRefs(main)
const title = ref('购物车')
const cart = ref([])
const uToast = ref()

onShow(() => {
	cart.value = uni.getStorageSync('cart')
})

const getCartGoodsNumber = computed(() => {
	if (cart.value.length == 0) return 0
	return cart.value.reduce((acc, cur) => acc + cur.number, 0)
})

const getCartGoodsPrice = computed(() => {
	if (cart.value.length == 0) return 0
	let price = cart.value.reduce((acc, cur) => acc + cur.number * cur.price, 0)
	return parseFloat(price).toFixed(2)
})

const handleCartItemAdd = (index) => {
	cart.value[index].number += 1
	uni.setStorageSync('cart', JSON.parse(JSON.stringify(cart.value)))
}

const handleCartItemReduce = (index) => {
	if (cart.value[index].number === 1) {
		cart.value.splice(index, 1)
	} else {
		cart.value[index].number -= 1
	}
	uni.setStorageSync('cart', JSON.parse(JSON.stringify(cart.value)))
}

const handleCartClear = () => {
	uni.showModal({
		title: '提示',
		content: '确定清空购物车么',
		success: ({ confirm }) => {
			if (confirm) {
				cart.value = []
				uni.setStorageSync('cart', JSON.parse(JSON.stringify(cart.value)))
			}
		}
	})
}

const addRemark = () => {
	uni.navigateTo({ url: '/pages/components/pages/remark/remark' })
}

const selectCoupon = () => {
	uni.navigateTo({ url: '/pages/components/pages/packages/index' })
}

const toPay = () => {
	if (cart.value.length == 0) {
		uToast.value.show({ message: '请先去点餐哦', type: 'error' })
		return
	}
	if (!isLogin.value) {
		uni.navigateTo({ url: '/pages/components/pages/login/login' })
		return
	}
	if (store.value.status == 0) {
		uToast.value.show({ message: '不在店铺营业时间内', type: 'error' })
		return
	}
	if (orderType.value == 'takeout' && store.value.distance < store.value.far) {
		uToast.value.show({ message: '选中的地址不在配送范围', type: 'error' })
		return
	}
	uni.showLoading({ title: '加载中' })
	uni.setStorageSync('cart', JSON.parse(JSON.stringify(cart.value)))
	uni.navigateTo({ url: '/pages/components/pages/pay/pay' })
	uni.hideLoading()
}
</script>

<style lang="scss" scoped>
.container {
	padding: $spacing-sm $spacing-sm 0;
}

// 门店卡片
.store-card {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	border-radius: $radius-base;
	padding: 24rpx;
	margin-bottom: $spacing-sm;
	box-shadow: $box-shadow;
}
.store-icon { font-size: 40rpx; margin-right: 16rpx; }
.store-name { font-size: $font-size-base; font-weight: $font-weight-medium; color: $text-color-base; }
.store-type { font-size: $font-size-xs; color: $text-color-assist; margin-top: 4rpx; }

// 购物车列表
.cart-popup {
	.top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: $bg-color-warm;
		color: $text-color-base;
		padding: 16rpx 30rpx;
		font-size: 26rpx;
		border-bottom: 1rpx solid $border-color-light;
	}
	.clear-btn { color: $color-error; font-size: 24rpx; }

	.cart-list {
		background-color: #ffffff;
		width: 100%;
		overflow: hidden;
		min-height: 1vh;
		max-height: 50vh;

		.wrapper {
			height: 100%;
			display: flex;
			flex-direction: column;
			padding: 0 30rpx;
			margin-bottom: 20rpx;

			.item {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 28rpx 0;
				position: relative;

				&::after {
					content: ' ';
					position: absolute;
					bottom: 0;
					left: 0;
					width: 100%;
					background-color: $border-color-light;
					height: 2rpx;
					transform: scaleY(0.6);
				}

				.left {
					flex: 1;
					display: flex;
					flex-direction: column;
					overflow: hidden;
					margin-right: 20rpx;
					.name { font-size: $font-size-base; color: $text-color-base; margin-bottom: 4rpx; }
					.props { color: $text-color-assist; font-size: 22rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
				}

				.center {
					margin-right: 60rpx;
					.item-price { font-size: $font-size-base; font-weight: $font-weight-semibold; color: $text-color-base; }
				}

				.right {
					display: flex;
					align-items: center;
					justify-content: space-between;
					.btn { width: 44rpx; height: 44rpx; border-radius: 100%; padding: 0; text-align: center; line-height: 44rpx; }
					.number { font-size: $font-size-base; width: 44rpx; height: 44rpx; text-align: center; line-height: 44rpx; }
				}
			}
		}
	}
}

// 备注 + 优惠券
.extra-rows {
	background: #FFFFFF;
	margin: $spacing-sm;
	border-radius: $radius-base;
	overflow: hidden;
	box-shadow: $box-shadow;
}
.extra-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 28rpx;
	border-bottom: 1rpx solid $border-color-light;
	&:last-child { border-bottom: 0; }
}
.extra-label { font-size: $font-size-base; color: $text-color-base; }
.extra-value { font-size: $font-size-sm; color: $text-color-assist; }

// 底部结算栏
.fixed-bottom {
	position: fixed;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 1030;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: #FFFFFF;
	padding: 20rpx 30rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -2rpx 20rpx rgba(74, 44, 26, 0.06);
}
.bottom-left {
	display: flex;
	align-items: baseline;
	gap: 12rpx;
}
.total-label { font-size: $font-size-sm; color: $text-color-assist; }
.total-price { font-size: $font-size-xl; font-weight: $font-weight-bold; color: $color-error; }
.checkout-btn {
	height: 80rpx;
	padding: 0 56rpx;
	border-radius: 40rpx;
	font-size: $font-size-md;
	font-weight: $font-weight-semibold;
	background: $color-primary !important;
	box-shadow: $shadow-button;
}
</style>
