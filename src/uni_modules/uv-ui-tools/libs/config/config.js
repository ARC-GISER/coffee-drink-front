// 此版本发布于2023-10-12
const version = '1.1.15'

// 开发环境才提示，生产环境不会提示
if (process.env.NODE_ENV === 'development') {
	console.log(`\n %c uvui V${version} https://www.uvui.cn/ \n\n`, 'color: #ffffff; background: #3c9cff; padding:5px 0; border-radius: 5px;');
}

export default {
    v: version,
    version,
    // 主题名称
    type: [
        'primary',
        'success',
        'info',
        'error',
        'warning'
    ],
    // 颜色部分，本来可以通过scss的:export导出供js使用，但是奈何nvue不支持
    color: {
        'uv-primary': '#6B3A2E',
        'uv-warning': '#E8A838',
        'uv-success': '#5B8C5A',
        'uv-error': '#C0392B',
        'uv-info': '#8B7355',
        'uv-main-color': '#2C1810',
        'uv-content-color': '#5D4037',
        'uv-tips-color': '#8D6E63',
        'uv-light-color': '#BCAAA4'
    },
	// 默认单位，可以通过配置为rpx，那么在用于传入组件大小参数为数值时，就默认为rpx
	unit: 'px'
}
