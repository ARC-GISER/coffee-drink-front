<template>
	<uv-navbar :fixed="false" :title="title" left-arrow @leftClick="$onClickLeft" />

	<view class="container">
		<view class="tabs-wrapper">
			<uv-tabs :list="tabList" :current="current" @change="change" keyName="name" :scrollable="false"></uv-tabs>
		</view>

		<view class="orders-list" v-if="orders.length > 0">
			<view class="order-card" v-for="(item, index) in orders" :key="index">
				<!-- 订单头部 -->
				<view class="order-header">
					<view class="shop-info">
						<view class="shop-icon">🏪</view>
						<view class="shop-detail">
							<view class="shop-name">{{ item.shop.name }}</view>
							<view class="pickup-number">
								<text class="pickup-label">取餐号</text>
								<text class="pickup-value">#{{ item.numberId }}</text>
							</view>
							<view class="order-id">订单编号：{{ item.orderId }}</view>
						</view>
					</view>
					<view class="order-status" :class="statusClass(item.status, item.paid)">
						{{ item.statusDto.title }}
					</view>
				</view>

				<!-- 订单商品 -->
				<view class="order-goods">
					<view class="good-item" v-for="(good, idx) in item.cartInfo" :key="idx">
						<image :src="good.image" mode="aspectFill" class="good-image"></image>
						<view class="good-info">
							<view class="good-name">{{ good.title }}</view>
							<view class="good-spec" v-if="good.spec">{{ good.spec }}</view>
							<view class="good-price">×{{ good.number }}  ¥{{ good.price }}</view>
						</view>
					</view>
				</view>

				<!-- 订单底部 -->
				<view class="order-footer">
					<view class="order-meta">
						<text class="order-time">{{ formatDateTime(item.createTime) }}</text>
						<text class="order-total">共{{ goodsNum(item.cartInfo) }}件 实付 <text class="total-price">¥{{ item.payPrice }}</text></text>
					</view>
					<view class="order-actions">
						<button v-if="item.status === 4" class="action-btn reorder-btn" size="mini" plain @tap="reorder(item)">
							🔄 再来一单
						</button>
						<button v-if="item.paid > 0 && item.status < 2 && item.refundStatus == 0" class="action-btn receive-btn" size="mini" @tap.stop="receive(item)">
							确认收到餐
						</button>
						<button class="action-btn detail-btn" size="mini" @tap="detail(item.orderId)">
							订单详情
						</button>
					</view>
				</view>
			</view>
		</view>

		<uv-empty v-if="orders.length == 0" mode="order"></uv-empty>
	</view>
</template>


<script setup>
import { ref, computed } from 'vue'
import { useMainStore } from '@/store/store'
import { storeToRefs } from 'pinia'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { formatDateTime, kmUnit } from '@/utils/util'
import { orderGetOrders, orderReceive } from '@/api/order'

const main = useMainStore()
const { isLogin } = storeToRefs(main)
const title = ref('我的订单')

const page = ref(1)
const pageSize = ref(10)
const orders = ref([])
const tabList = ref([
	{ type: -1, name: '全部' },
	{ type: 0,  name: '待支付' },
	{ type: 1,  name: '进行中' },
	{ type: 4,  name: '已完成' },
	{ type: -3, name: '退款单' }
])
const current = ref(0)
const type = ref(-1)

const goodsNum = computed(() => {
	return (goods) => {
		let num = 0
		goods.forEach(good => num += parseInt(good.number))
		return num
	}
})

const statusClass = (status, paid) => {
	if (status === 4) return 'status-done'
	if (paid === 0) return 'status-pending'
	if (status < 2) return 'status-active'
	return ''
}

onLoad(() => {
	if (!isLogin.value) {
		uni.navigateTo({ url: '/pages/components/pages/login/login' })
	}
	getOrders(false)
})
onPullDownRefresh(() => { getOrders(false) })
onReachBottom(() => { getOrders(false) })

const change = (e) => {
	type.value = e.type
	getOrders(true)
}

const getOrders = async (isRefresh = false) => {
	uni.showLoading({ title: '加载中' })
	if (isRefresh) {
		orders.value = []
		page.value = 1
	}
	let ordersData = await orderGetOrders({ page: page.value, limit: pageSize.value, type: type.value })
	if (ordersData) {
		orders.value = orders.value.concat(ordersData)
		page.value += 1
	}
	uni.stopPullDownRefresh()
	uni.hideLoading()
}

const detail = (id) => {
	uni.navigateTo({ url: '/pages/components/pages/orders/detail?id=' + id })
}

const receive = async (order) => {
	let data = await orderReceive({ uni: order.orderId })
	if (data) {
		await getOrders(true)
	}
}

const reorder = (item) => {
	let cart = item.cartInfo.map(good => ({
		id: good.id,
		cate_id: good.cate_id || 0,
		name: good.title,
		price: good.price,
		number: good.number,
		image: good.image,
		valueStr: good.spec || ''
	}))
	uni.setStorageSync('cart', cart)
	uni.switchTab({ url: '/pages/menu/menu' })
}
</script>

<style lang="scss" scoped>
.container {
	background: $bg-color;
	min-height: 100vh;
	padding-bottom: 40rpx;
}

.tabs-wrapper {
	background: #FFFFFF;
	margin-bottom: $spacing-sm;
}

// 订单卡片
.orders-list {
	padding: 0 $spacing-sm;
}

.order-card {
	background: #FFFFFF;
	border-radius: $radius-base;
	padding: 28rpx;
	margin-bottom: $spacing-md;
	box-shadow: $box-shadow;
}

// 订单头部
.order-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid $border-color-light;
	margin-bottom: 16rpx;
}

.shop-info { display: flex; }
.shop-icon { font-size: 36rpx; margin-right: 14rpx; }
.shop-name {
	font-size: $font-size-md;
	font-weight: $font-weight-semibold;
	color: $text-color-base;
	margin-bottom: 6rpx;
}
.pickup-number { margin-bottom: 4rpx; }
.pickup-label { font-size: $font-size-xs; color: $text-color-assist; margin-right: 10rpx; }
.pickup-value {
	font-size: $font-size-xl;
	font-weight: $font-weight-bold;
	color: $color-accent;
}
.order-id { font-size: $font-size-xs; color: $text-color-assist; }

.order-status {
	font-size: $font-size-sm;
	font-weight: $font-weight-medium;
	padding: 8rpx 20rpx;
	border-radius: $radius-xl;
	white-space: nowrap;

	&.status-pending { background: #FFF8E1; color: $color-warning; }
	&.status-active  { background: $color-primary-light; color: $color-primary; }
	&.status-done    { background: $color-success-light; color: $color-success; }
}

// 商品列表
.order-goods {
	padding: 8rpx 0;
	border-bottom: 1rpx solid $border-color-light;
	margin-bottom: 16rpx;
}

.good-item {
	display: flex;
	margin-bottom: 14rpx;
	&:last-child { margin-bottom: 6rpx; }
}

.good-image {
	width: 140rpx;
	height: 140rpx;
	border-radius: $radius-sm;
	margin-right: 20rpx;
	flex-shrink: 0;
}

.good-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.good-name { font-size: $font-size-base; color: $text-color-base; margin-bottom: 6rpx; }
.good-spec { font-size: $font-size-xs; color: $text-color-assist; margin-bottom: 4rpx; }
.good-price { font-size: $font-size-sm; color: $text-color-base; }

// 订单底部
.order-footer {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
}

.order-meta {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}
.order-time { font-size: $font-size-xs; color: $text-color-assist; }
.order-total { font-size: $font-size-sm; color: $text-color-base; }
.total-price { font-size: $font-size-md; font-weight: $font-weight-bold; color: $text-color-base; }

.order-actions {
	display: flex;
	gap: 10rpx;
}

.action-btn {
	font-size: 24rpx;
	border-radius: $radius-xl;
	height: 52rpx;
	padding: 0 22rpx;

	&.reorder-btn { color: $color-accent; border-color: $color-accent; }
	&.receive-btn { background: $color-primary !important; color: #FFFFFF !important; border: none; }
	&.detail-btn { color: $color-primary; border-color: $color-primary; }
}
</style>
