<template>
  <layout>
    <!-- 导航栏 -->
    <uv-navbar :fixed="false" :safeAreaInsetTop="true" bgColor="transparent" leftIcon="" />

    <view class="container">
      <!-- 咖啡问候卡片 -->
      <view class="greeting-card">
        <view class="greeting-bg">
          <view class="greeting-content">
            <view class="greeting-emoji">☕</view>
            <view class="greeting-title">早安，咖啡时间到！</view>
            <view class="greeting-subtitle">今日精选 · 新鲜烘焙 · 即刻享用</view>
            <view class="greeting-action" @tap="takein">
              <text>立即探索</text>
              <text class="iconfont iconarrow-right"></text>
            </view>
          </view>
          <view class="greeting-beans">
            <view class="bean bean-1"></view>
            <view class="bean bean-2"></view>
            <view class="bean bean-3"></view>
          </view>
        </view>
      </view>

      <!-- 轮播广告 -->
      <view class="banner" v-if="listAds.length > 0">
        <uv-swiper class="bg" height="300" imgMode="aspectFill" keyName="image" :list="listAds" indicatorMode="dot" indicatorStyle="bottom" radius="12"></uv-swiper>
      </view>

      <!-- 取餐方式选择 -->
      <view class="section-title">选择取餐方式</view>
      <view class="order-type-row">
        <view class="order-type-card" @tap="takein">
          <view class="order-type-icon takein-icon">🏪</view>
          <view class="order-type-name">自取</view>
          <view class="order-type-desc">下单免排队</view>
        </view>
        <view class="order-type-card" @tap="takeout">
          <view class="order-type-icon takeout-icon">🛵</view>
          <view class="order-type-name">外卖</view>
          <view class="order-type-desc">美食送到家</view>
        </view>
      </view>

      <!-- 我的卡券 + 积分商城 -->
      <view class="section-title">福利中心</view>
      <view class="info-cards">
        <view class="info-card" @tap="coupons">
          <view class="info-card-left">
            <view class="info-card-icon coupon-icon">🎫</view>
            <view class="info-card-text">
              <view class="info-card-title">我的卡券</view>
              <view class="info-card-sub">可抵扣商品价格哦</view>
            </view>
          </view>
          <view class="info-card-right">
            <view class="info-card-value">{{ member.couponCount }}</view>
            <view class="info-card-link">去领券 →</view>
          </view>
        </view>
        <view class="info-card" @tap="goScore">
          <view class="info-card-left">
            <view class="info-card-icon score-icon">🎁</view>
            <view class="info-card-text">
              <view class="info-card-title">积分商城</view>
              <view class="info-card-sub">兑换好礼与周边</view>
            </view>
          </view>
          <view class="info-card-right">
            <view class="info-card-link">逛一逛 →</view>
          </view>
        </view>
      </view>
    </view>
  </layout>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { menuAds } from '@/api/market'
import { storeToRefs } from 'pinia'
import { useMainStore } from '@/store/store'

const main = useMainStore()
const { member, store, isLogin } = storeToRefs(main)
const listAds = ref([])

const handGetListAds = async () => {
  let shop_id = store.id ? store.id : 0
  let data = await menuAds({ shop_id: shop_id })
  if (data) {
    listAds.value = data.list
    uni.setStorage({ key: 'isActive', data: data.isActive })
    if (data.list.length > 0) {
      uni.setStorage({ key: 'shopAd', data: data.list[0].image })
    }
  }
}

const takein = () => {
  main.SET_ORDER_TYPE('takein')
  uni.switchTab({ url: '/pages/menu/menu' })
}

const takeout = () => {
  main.SET_ORDER_TYPE('takeout')
  uni.switchTab({ url: '/pages/menu/menu' })
}

const coupons = () => {
  if (!main.isLogin) {
    uni.navigateTo({ url: '/pages/components/pages/login/login' })
    return
  }
  uni.navigateTo({ url: '/pages/components/pages/coupons/coupons' })
}

const goScore = () => {
  uni.navigateTo({ url: '/pages/components/pages/scoreproduct/list' })
}

onLoad(() => {
  handGetListAds()
})
</script>

<style lang="scss">
page {
  background-color: $bg-color;
  height: auto;
  min-height: 100%;
}

.container {
  padding: 0 $spacing-sm 80rpx;
}

// ======== 问候卡片 ========
.greeting-card {
  margin-top: $spacing-sm;
  margin-bottom: $spacing-md;
}

.greeting-bg {
  background: linear-gradient(135deg, $color-primary-dark 0%, $color-primary 50%, #8B5E3C 100%);
  border-radius: $radius-lg;
  padding: 40rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8rpx 30rpx rgba(74, 44, 26, 0.2);
}

.greeting-content {
  position: relative;
  z-index: 1;
}

.greeting-emoji {
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.greeting-title {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.greeting-subtitle {
  font-size: $font-size-sm;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24rpx;
}

.greeting-action {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  border-radius: $radius-xl;
  padding: 12rpx 28rpx;
  color: #FFFFFF;
  font-size: $font-size-sm;
  backdrop-filter: blur(10rpx);
  .iconfont { margin-left: 6rpx; font-size: 22rpx; }
}

// 装饰咖啡豆
.greeting-beans {
  position: absolute;
  right: 20rpx;
  bottom: -10rpx;
  opacity: 0.15;
}
.bean {
  position: absolute;
  width: 80rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #FFF;
}
.bean-1 { right: 40rpx; bottom: 20rpx; transform: rotate(-30deg); }
.bean-2 { right: 100rpx; bottom: 10rpx; transform: rotate(15deg); width: 60rpx; height: 76rpx; }
.bean-3 { right: 0; bottom: 50rpx; transform: rotate(-45deg); width: 50rpx; height: 64rpx; }

// ======== 轮播 ========
.banner {
  margin-bottom: $spacing-md;
  border-radius: $radius-base;
  overflow: hidden;
  box-shadow: $box-shadow;
}

// ======== 区块标题 ========
.section-title {
  font-size: $font-size-md;
  font-weight: $font-weight-semibold;
  color: $text-color-base;
  margin-bottom: $spacing-sm;
  margin-top: $spacing-md;
}

// ======== 取餐方式 ========
.order-type-row {
  display: flex;
  gap: $spacing-sm;
}

.order-type-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: $radius-base;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: $box-shadow;
  transition: all 0.3s;
  &:active { transform: scale(0.97); }
}

.order-type-icon {
  font-size: 52rpx;
  margin-bottom: 12rpx;
}

.order-type-name {
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-color-base;
  margin-bottom: 4rpx;
}

.order-type-desc {
  font-size: $font-size-xs;
  color: $text-color-assist;
}

// ======== 福利卡片 ========
.info-cards {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.info-card {
  background: #FFFFFF;
  border-radius: $radius-base;
  padding: 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: $box-shadow;
}

.info-card-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.info-card-icon {
  font-size: 44rpx;
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
}

.coupon-icon { background: #FFF8E1; }
.score-icon { background: #FFF0E5; }

.info-card-title {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-color-base;
  margin-bottom: 4rpx;
}

.info-card-sub {
  font-size: $font-size-xs;
  color: $text-color-assist;
}

.info-card-right {
  text-align: right;
}

.info-card-value {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-accent;
}

.info-card-link {
  font-size: $font-size-xs;
  color: $color-primary;
  margin-top: 4rpx;
}
</style>
