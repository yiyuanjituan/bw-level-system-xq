declare namespace Eps {
	type json = any;

	interface DemoGoodsEntity {
		/**
			 * ID
			 */
			id?: number;

		/**
			 * 标题
			 */
			title?: string;

		/**
			 * 价格
			 */
			price?: number;

		/**
			 * 描述
			 */
			description?: string;

		/**
			 * 主图
			 */
			mainImage?: string;

		/**
			 * 分类
			 */
			type?: number;

		/**
			 * 状态
			 */
			status?: number;

		/**
			 * 示例图
			 */
			exampleImages?: json;

		/**
			 * 库存
			 */
			stock?: number;

		/**
			 * 创建时间
			 */
			createTime?: string;

		/**
			 * 更新时间
			 */
			updateTime?: string;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface ServiceInfoEntity {
		/**
			 * ID
			 */
			id?: number;

		/**
			 * 提现类型
			 */
			type?: number;

		/**
			 * 客服图标
			 */
			icon?: string;

		/**
			 * 客服昵称
			 */
			name?: string;

		/**
			 * 客服账号
			 */
			account?: string;

		/**
			 * 在线时间
			 */
			time?: string;

		/**
			 * 跳转链接
			 */
			url?: string;

		/**
			 * 排序
			 */
			weigh?: number;

		/**
			 * 创建时间
			 */
			createTime?: string;

		/**
			 * 更新时间
			 */
			updateTime?: string;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface UserAddressEntity {
		/**
			 * ID
			 */
			id?: number;

		/**
			 * 用户ID
			 */
			userId?: number;

		/**
			 * 联系人
			 */
			contact?: string;

		/**
			 * 手机号
			 */
			phone?: string;

		/**
			 * 省
			 */
			province?: string;

		/**
			 * 市
			 */
			city?: string;

		/**
			 * 区
			 */
			district?: string;

		/**
			 * 地址
			 */
			address?: string;

		/**
			 * 是否默认
			 */
			isDefault?: boolean;

		/**
			 * 创建时间
			 */
			createTime?: string;

		/**
			 * 更新时间
			 */
			updateTime?: string;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface UserInfoEntity {
		/**
			 * ID
			 */
			id?: number;

		/**
			 * 登录唯一ID
			 */
			unionid?: string;

		/**
			 * 用户账号
			 */
			account?: string;

		/**
			 * 头像
			 */
			avatarUrl?: string;

		/**
			 * 昵称
			 */
			nickName?: string;

		/**
			 * 真实姓名
			 */
			realName?: string;

		/**
			 * 币种ID
			 */
			currencyId?: number;

		/**
			 * 余额
			 */
			money?: number;

		/**
			 * 手机号
			 */
			phone?: string;

		/**
			 * 邮箱
			 */
			email?: string;

		/**
			 * 邮箱是否验证
			 */
			emailVerified?: boolean;

		/**
			 * 性别
			 */
			gender?: number;

		/**
			 * 状态
			 */
			status?: number;

		/**
			 * 登录方式
			 */
			loginType?: number;

		/**
			 * 密码
			 */
			password?: string;

		/**
			 * 支付密码
			 */
			pay_password?: string;

		/**
			 * 邀请码
			 */
			invite_code?: string;

		/**
			 * 介绍
			 */
			description?: string;

		/**
			 * 展示类型
			 */
			showAccount?: number;

		/**
			 * 生日
			 */
			birthday?: string;

		/**
			 * 微信号
			 */
			wechat?: string;

		/**
			 * WhatsApp账号
			 */
			whatsapp?: string;

		/**
			 * Telegram账号
			 */
			telegram?: string;

		/**
			 * Telegram用户ID
			 */
			telegramUserId?: string;

		/**
			 * 用户标签
			 */
			user_tag?: string;

		/**
			 * 创建时间
			 */
			createTime?: string;

		/**
			 * 更新时间
			 */
			updateTime?: string;

		/**
		 * 任意键值
		 */
		[key: string]: any;
	}

	interface ActivityData {
		/**
			 * 领取邀请红包
			 */
			receiveSpecialInviteReward(data?: any): Promise<any>;

		/**
			 * 邀请红包活动累计奖励
			 */
			specialInviteSummary(data?: any): Promise<any>;

		/**
			 * 活跃度记录列表
			 */
			vitalityRecordList(data?: any): Promise<any>;

		/**
			 * 邀请红包活动数据
			 */
			specialInviteData(data?: any): Promise<any>;

		/**
			 * 任务配置信息
			 */
			taskConfigData(data?: any): Promise<any>;

		/**
			 * 领取任务奖励
			 */
			getTaskReward(data?: any): Promise<any>;

		/**
			 * 任务列表
			 */
			taskListData(data?: any): Promise<any>;

		/**
			 * 兑换宝箱
			 */
			getBoxReward(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { receiveSpecialInviteReward: string; specialInviteSummary: string; vitalityRecordList: string; specialInviteData: string; taskConfigData: string; getTaskReward: string; taskListData: string; getBoxReward: string; };

		/**
		 * 权限状态
		 */
		_permission: { receiveSpecialInviteReward: boolean; specialInviteSummary: boolean; vitalityRecordList: boolean; specialInviteData: boolean; taskConfigData: boolean; getTaskReward: boolean; taskListData: boolean; getBoxReward: boolean; };

		request: Service["request"];
	}

	interface OpenActivityData {
		/**
			 * 活动列表
			 */
			listData(data?: any): Promise<any>;

		/**
			 * 活动信息
			 */
			infoData(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { listData: string; infoData: string; };

		/**
		 * 权限状态
		 */
		_permission: { listData: boolean; infoData: boolean; };

		request: Service["request"];
	}

	interface OpenDemoCache {
		/**
			 * 设置缓存
			 */
			set(data?: any): Promise<any>;

		/**
			 * 获得缓存
			 */
			get(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { set: string; get: string; };

		/**
		 * 权限状态
		 */
		_permission: { set: boolean; get: boolean; };

		request: Service["request"];
	}

	interface OpenDemoEvent {
		/**
			 * 全局事件，多进程都有效
			 */
			global(data?: any): Promise<any>;

		/**
			 * 普通事件，本进程生效
			 */
			comm(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { global: string; comm: string; };

		/**
		 * 权限状态
		 */
		_permission: { global: boolean; comm: boolean; };

		request: Service["request"];
	}

	interface OpenDemoGoods {
		/**
			 * entity分页查询
			 */
			entityPage(data?: any): Promise<any>;

		/**
			 * sql分页查询
			 */
			sqlPage(data?: any): Promise<any>;

		/**
			 * 删除
			 */
			delete(data?: any): Promise<any>;

		/**
			 * 修改
			 */
			update(data?: any): Promise<any>;

		/**
			 * 单个信息
			 */
			info(data?: any): Promise<DemoGoodsEntity>;

		/**
			 * 列表查询
			 */
			list(data?: any): Promise<DemoGoodsEntity[]>;

		/**
			 * 分页查询
			 */
			page(data?: any): Promise<{
						pagination: { size: number; page: number; total: number; [key: string]: any };
						list: DemoGoodsEntity[];
						[key: string]: any;
					}>;

		/**
			 * 新增
			 */
			add(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { entityPage: string; sqlPage: string; delete: string; update: string; info: string; list: string; page: string; add: string; };

		/**
		 * 权限状态
		 */
		_permission: { entityPage: boolean; sqlPage: boolean; delete: boolean; update: boolean; info: boolean; list: boolean; page: boolean; add: boolean; };

		request: Service["request"];
	}

	interface OpenDemoI18n {
		/**
			 * 自动翻译
			 */
			auto(data?: any): Promise<any>;

		/**
			 * 翻译成英文
			 */
			en(data?: any): Promise<any>;

		/**
			 * 翻译成繁体
			 */
			tw(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { auto: string; en: string; tw: string; };

		/**
		 * 权限状态
		 */
		_permission: { auto: boolean; en: boolean; tw: boolean; };

		request: Service["request"];
	}

	interface OpenDemoPlugin {
		/**
			 * 调用插件
			 */
			invoke(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { invoke: string; };

		/**
		 * 权限状态
		 */
		_permission: { invoke: boolean; };

		request: Service["request"];
	}

	interface OpenDemoQueue {
		/**
			 * addGetter
			 */
			addGetter(data?: any): Promise<any>;

		/**
			 * getter
			 */
			getter(data?: any): Promise<any>;

		/**
			 * 发送队列数据
			 */
			add(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { addGetter: string; getter: string; add: string; };

		/**
		 * 权限状态
		 */
		_permission: { addGetter: boolean; getter: boolean; add: boolean; };

		request: Service["request"];
	}

	interface OpenDemoRpc {
		/**
			 * 分布式事务
			 */
			transaction(data?: any): Promise<any>;

		/**
			 * 集群事件
			 */
			event(data?: any): Promise<any>;

		/**
			 * 远程调用
			 */
			call(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { transaction: string; event: string; call: string; };

		/**
		 * 权限状态
		 */
		_permission: { transaction: boolean; event: boolean; call: boolean; };

		request: Service["request"];
	}

	interface OpenDemoSse {
		/**
			 * 事件流 服务端主动推送
			 */
			call(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { call: string; };

		/**
		 * 权限状态
		 */
		_permission: { call: boolean; };

		request: Service["request"];
	}

	interface OpenDemoTenant {


		/**
		 * 权限标识
		 */
		permission: {  };

		/**
		 * 权限状态
		 */
		_permission: {  };

		request: Service["request"];
	}

	interface OpenDemoTransaction {
		/**
			 * 删除
			 */
			delete(data?: any): Promise<any>;

		/**
			 * 修改
			 */
			update(data?: any): Promise<any>;

		/**
			 * 单个信息
			 */
			info(data?: any): Promise<DemoGoodsEntity>;

		/**
			 * 列表查询
			 */
			list(data?: any): Promise<DemoGoodsEntity[]>;

		/**
			 * 分页查询
			 */
			page(data?: any): Promise<{
						pagination: { size: number; page: number; total: number; [key: string]: any };
						list: DemoGoodsEntity[];
						[key: string]: any;
					}>;

		/**
			 * 新增
			 */
			add(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { delete: string; update: string; info: string; list: string; page: string; add: string; };

		/**
		 * 权限状态
		 */
		_permission: { delete: boolean; update: boolean; info: boolean; list: boolean; page: boolean; add: boolean; };

		request: Service["request"];
	}

	interface OpenServiceInfo {
		/**
			 * 列表查询
			 */
			list(data?: any): Promise<ServiceInfoEntity[]>;

		/**
		 * 权限标识
		 */
		permission: { list: string; };

		/**
		 * 权限状态
		 */
		_permission: { list: boolean; };

		request: Service["request"];
	}

	interface OpenSiteBase {
		/**
			 * 获取所有的分类数据
			 */
			classifyData(data?: any): Promise<any>;

		/**
			 * 网站初始化获取配置
			 */
			config(data?: any): Promise<any>;

		/**
			 * 找到我们的数据
			 */
			findUs(data?: any): Promise<any>;

		/**
			 * 首页的弹窗数据
			 */
			popup(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { classifyData: string; config: string; findUs: string; popup: string; };

		/**
		 * 权限状态
		 */
		_permission: { classifyData: boolean; config: boolean; findUs: boolean; popup: boolean; };

		request: Service["request"];
	}

	interface OpenTelegramBot {
		/**
			 * 接收 Telegram 机器人消息
			 */
			webhook(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { webhook: string; };

		/**
		 * 权限状态
		 */
		_permission: { webhook: boolean; };

		request: Service["request"];
	}

	interface OpenV1Game {
		/**
			 * 根据场馆和分类获取试玩游戏列表
			 */
			getTrialGameList(data?: any): Promise<any>;

		/**
			 * 根据场馆获取游戏的列表
			 */
			getGameById(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { getTrialGameList: string; getGameById: string; };

		/**
		 * 权限状态
		 */
		_permission: { getTrialGameList: boolean; getGameById: boolean; };

		request: Service["request"];
	}

	interface OpenV1Home {
		/**
			 * 获取足球的数据
			 */
			footballData(data?: any): Promise<any>;

		/**
			 * 获取全局的轮播图
			 */
			loadBanner(data?: any): Promise<any>;

		/**
			 * 获取浮窗数据
			 */
			floatData(data?: any): Promise<any>;

		/**
			 * 获取APP状态栏配置
			 */
			appConfig(data?: any): Promise<any>;

		/**
			 * 首页的数据
			 */
			pageData(data?: any): Promise<any>;

		/**
			 * 帮助中心的数据
			 */
			helpData(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { footballData: string; loadBanner: string; floatData: string; appConfig: string; pageData: string; helpData: string; };

		/**
		 * 权限状态
		 */
		_permission: { footballData: boolean; loadBanner: boolean; floatData: boolean; appConfig: boolean; pageData: boolean; helpData: boolean; };

		request: Service["request"];
	}

	interface OpenV1Notify {
		/**
			 * 充值回调消息通知
			 */
			rechargeNotify(data?: any): Promise<any>;

		/**
			 * 提现回调消息通知
			 */
			withdrawNotify(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { rechargeNotify: string; withdrawNotify: string; };

		/**
		 * 权限状态
		 */
		_permission: { rechargeNotify: boolean; withdrawNotify: boolean; };

		request: Service["request"];
	}

	interface OpenV1Task {
		/**
			 * 清理过期活跃度
			 */
			clearVitalityByNow(data?: any): Promise<any>;

		/**
			 * 清理遗留在线会话
			 */
			clearOnlineSession(data?: any): Promise<any>;

		/**
			 * 刷新代理每日数据快照
			 */
			refreshAgentData(data?: any): Promise<any>;

		/**
			 * 创建VIP周月信息
			 */
			generateVipGift(data?: any): Promise<any>;

		/**
			 * 抓取OMG游戏记录
			 */
			pullOmgData(data?: any): Promise<any>;

		/**
			 * 抓取星汇游戏记录
			 */
			pullXhData(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { clearVitalityByNow: string; clearOnlineSession: string; refreshAgentData: string; generateVipGift: string; pullOmgData: string; pullXhData: string; };

		/**
		 * 权限状态
		 */
		_permission: { clearVitalityByNow: boolean; clearOnlineSession: boolean; refreshAgentData: boolean; generateVipGift: boolean; pullOmgData: boolean; pullXhData: boolean; };

		request: Service["request"];
	}

	interface BaseComm {
		/**
			 * 文件上传模式
			 */
			uploadMode(data?: any): Promise<any>;

		/**
			 * 文件上传
			 */
			upload(data?: any): Promise<any>;

		/**
			 * 参数配置
			 */
			param(data?: any): Promise<any>;

		/**
			 * 实体信息与路径
			 */
			eps(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { uploadMode: string; upload: string; param: string; eps: string; };

		/**
		 * 权限状态
		 */
		_permission: { uploadMode: boolean; upload: boolean; param: boolean; eps: boolean; };

		request: Service["request"];
	}

	interface BaseRecharge {
		/**
			 * 创建No钱包
			 */
			createNoWalletUser(data?: any): Promise<any>;

		/**
			 * 绑定的站点钱包的数据
			 */
			siteWalletInfo(data?: any): Promise<any>;

		/**
			 * 所有的充值渠道
			 */
			channelList(data?: any): Promise<any>;

		/**
			 * 创建订单/非站内钱包
			 */
			createOrder(data?: any): Promise<any>;

		/**
			 * 充值记录
			 */
			records(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { createNoWalletUser: string; siteWalletInfo: string; channelList: string; createOrder: string; records: string; };

		/**
		 * 权限状态
		 */
		_permission: { createNoWalletUser: boolean; siteWalletInfo: boolean; channelList: boolean; createOrder: boolean; records: boolean; };

		request: Service["request"];
	}

	interface BaseWithdraw {
		/**
			 * 发起No钱包的提现申请
			 */
			applyNoWalletWithdraw(data?: any): Promise<any>;

		/**
			 * 发起提现申请
			 */
			applyWithdraw(data?: any): Promise<any>;

		/**
			 * 提现记录
			 */
			records(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { applyNoWalletWithdraw: string; applyWithdraw: string; records: string; };

		/**
		 * 权限状态
		 */
		_permission: { applyNoWalletWithdraw: boolean; applyWithdraw: boolean; records: boolean; };

		request: Service["request"];
	}

	interface DictInfo {
		/**
			 * 获得所有字典类型
			 */
			types(data?: any): Promise<any>;

		/**
			 * 获得字典数据
			 */
			data(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { types: string; data: string; };

		/**
		 * 权限状态
		 */
		_permission: { types: boolean; data: boolean; };

		request: Service["request"];
	}

	interface Swagger {
		/**
			 * 获得Swagger JSON数据
			 */
			json(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { json: string; };

		/**
		 * 权限状态
		 */
		_permission: { json: boolean; };

		request: Service["request"];
	}

	interface UserAddress {
		/**
			 * 默认地址
			 */
			default(data?: any): Promise<any>;

		/**
			 * 删除
			 */
			delete(data?: any): Promise<any>;

		/**
			 * 修改
			 */
			update(data?: any): Promise<any>;

		/**
			 * 单个信息
			 */
			info(data?: any): Promise<UserAddressEntity>;

		/**
			 * 列表查询
			 */
			list(data?: any): Promise<UserAddressEntity[]>;

		/**
			 * 分页查询
			 */
			page(data?: any): Promise<{
						pagination: { size: number; page: number; total: number; [key: string]: any };
						list: UserAddressEntity[];
						[key: string]: any;
					}>;

		/**
			 * 新增
			 */
			add(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { default: string; delete: string; update: string; info: string; list: string; page: string; add: string; };

		/**
		 * 权限状态
		 */
		_permission: { default: boolean; delete: boolean; update: boolean; info: boolean; list: boolean; page: boolean; add: boolean; };

		request: Service["request"];
	}

	interface UserComm {
		/**
			 * 获取微信公众号配置
			 */
			wxMpConfig(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { wxMpConfig: string; };

		/**
		 * 权限状态
		 */
		_permission: { wxMpConfig: boolean; };

		request: Service["request"];
	}

	interface UserDevice {
		/**
			 * 获取用户登录设备
			 */
			list(data?: any): Promise<any[]>;

		/**
		 * 权限标识
		 */
		permission: { list: string; };

		/**
		 * 权限状态
		 */
		_permission: { list: boolean; };

		request: Service["request"];
	}

	interface UserInfo {
		/**
			 * 更新提现密码
			 */
			updatePayPassword(data?: any): Promise<any>;

		/**
			 * 更新用户密码
			 */
			updatePassword(data?: any): Promise<any>;

		/**
			 * 设置提现密码
			 */
			setPayPassword(data?: any): Promise<any>;

		/**
			 * 更新用户信息
			 */
			updatePerson(data?: any): Promise<any>;

		/**
			 * 绑定手机号
			 */
			bindPhone(data?: any): Promise<any>;

		/**
			 * 绑定邮箱
			 */
			bindEmail(data?: any): Promise<any>;

		/**
			 * 绑定小程序手机号
			 */
			miniPhone(data?: any): Promise<any>;

		/**
			 * 获取用户信息
			 */
			person(data?: any): Promise<any>;

		/**
			 * 注销
			 */
			logoff(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { updatePayPassword: string; updatePassword: string; setPayPassword: string; updatePerson: string; bindPhone: string; bindEmail: string; miniPhone: string; person: string; logoff: string; };

		/**
		 * 权限状态
		 */
		_permission: { updatePayPassword: boolean; updatePassword: boolean; setPayPassword: boolean; updatePerson: boolean; bindPhone: boolean; bindEmail: boolean; miniPhone: boolean; person: boolean; logoff: boolean; };

		request: Service["request"];
	}

	interface UserLogin {
		/**
			 * 完成 Telegram Web App 登录
			 */
			complete(data?: any): Promise<any>;

		/**
			 * Telegram OIDC回调
			 */
			callback(data?: any): Promise<any>;

		/**
			 * 完成Telegram OIDC登录
			 */
			complete(data?: any): Promise<any>;

		/**
			 * 发起Telegram OIDC登录
			 */
			start(data?: any): Promise<any>;

		/**
			 * 手机验证码登录
			 */
			phoneVerifyCode(data?: any): Promise<any>;

		/**
			 * 刷新token
			 */
			refreshToken(data?: any): Promise<any>;

		/**
			 * 注册账号
			 */
			register(data?: any): Promise<any>;

		/**
			 * 密码登录
			 */
			password(data?: any): Promise<any>;

		/**
			 * 图片验证码
			 */
			captcha(data?: any): Promise<any>;

		/**
			 * 验证码
			 */
			smsCode(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { complete: string; callback: string; start: string; phoneVerifyCode: string; refreshToken: string; register: string; password: string; captcha: string; smsCode: string; };

		/**
		 * 权限状态
		 */
		_permission: { complete: boolean; callback: boolean; start: boolean; phoneVerifyCode: boolean; refreshToken: boolean; register: boolean; password: boolean; captcha: boolean; smsCode: boolean; };

		request: Service["request"];
	}

	interface V1Activity {
		/**
			 * 利息宝转出
			 */
			interestTransferOut(data?: any): Promise<any>;

		/**
			 * 利息宝转入
			 */
			interestTransferIn(data?: any): Promise<any>;

		/**
			 * 利息宝记录
			 */
			interestRecords(data?: any): Promise<any>;

		/**
			 * 利息宝领取收益
			 */
			interestClaim(data?: any): Promise<any>;

		/**
			 * 利息宝信息
			 */
			interestInfo(data?: any): Promise<any>;

		/**
			 * 待领取奖励
			 */
			canReceive(data?: any): Promise<any>;

		/**
			 * 领取记录
			 */
			records(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { interestTransferOut: string; interestTransferIn: string; interestRecords: string; interestClaim: string; interestInfo: string; canReceive: string; records: string; };

		/**
		 * 权限状态
		 */
		_permission: { interestTransferOut: boolean; interestTransferIn: boolean; interestRecords: boolean; interestClaim: boolean; interestInfo: boolean; canReceive: boolean; records: boolean; };

		request: Service["request"];
	}

	interface V1Agent {
		/**
			 * 代理下级投注明细
			 */
			subordinateBettingDetail(data?: any): Promise<any>;

		/**
			 * 代理下级财务统计
			 */
			subordinateFinanceInfo(data?: any): Promise<any>;

		/**
			 * 代理下级领取统计
			 */
			subordinateReceiveInfo(data?: any): Promise<any>;

		/**
			 * 代理下级会员详情
			 */
			subordinateDetail(data?: any): Promise<any>;

		/**
			 * 代理我的业绩
			 */
			performanceInfo(data?: any): Promise<any>;

		/**
			 * 代理下级信息
			 */
			subordinateInfo(data?: any): Promise<any>;

		/**
			 * 代理我的佣金
			 */
			commissionInfo(data?: any): Promise<any>;

		/**
			 * 代理推广配置
			 */
			promoteInfo(data?: any): Promise<any>;

		/**
			 * 代理我的数据
			 */
			dataInfo(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { subordinateBettingDetail: string; subordinateFinanceInfo: string; subordinateReceiveInfo: string; subordinateDetail: string; performanceInfo: string; subordinateInfo: string; commissionInfo: string; promoteInfo: string; dataInfo: string; };

		/**
		 * 权限状态
		 */
		_permission: { subordinateBettingDetail: boolean; subordinateFinanceInfo: boolean; subordinateReceiveInfo: boolean; subordinateDetail: boolean; performanceInfo: boolean; subordinateInfo: boolean; commissionInfo: boolean; promoteInfo: boolean; dataInfo: boolean; };

		request: Service["request"];
	}

	interface V1Finance {
		/**
			 * 校验支付密码是否正确
			 */
			verifyWithdrawalPassword(data?: any): Promise<any>;

		/**
			 * 我的提现卡列表
			 */
			withdrawInfo(data?: any): Promise<any>;

		/**
			 * 设置为默认钱包
			 */
			setDefault(data?: any): Promise<any>;

		/**
			 * 绑定银行卡/绑地址
			 */
			bindCard(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { verifyWithdrawalPassword: string; withdrawInfo: string; setDefault: string; bindCard: string; };

		/**
		 * 权限状态
		 */
		_permission: { verifyWithdrawalPassword: boolean; withdrawInfo: boolean; setDefault: boolean; bindCard: boolean; };

		request: Service["request"];
	}

	interface V1Game {
		/**
			 * 用户余额回归
			 */
			userMoneyIn(data?: any): Promise<any>;

		/**
			 * 获取游戏的链接
			 */
			getGameUrl(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { userMoneyIn: string; getGameUrl: string; };

		/**
		 * 权限状态
		 */
		_permission: { userMoneyIn: boolean; getGameUrl: boolean; };

		request: Service["request"];
	}

	interface V1Moments {
		/**
			 * 设置朋友圈游戏收藏状态
			 */
			setGameFavorite(data?: any): Promise<any>;

		/**
			 * 朋友圈最近游戏
			 */
			recentGames(data?: any): Promise<any>;

		/**
			 * 设置朋友圈帖子收藏状态
			 */
			setFavorite(data?: any): Promise<any>;

		/**
			 * 设置朋友圈关注状态
			 */
			setFollow(data?: any): Promise<any>;

		/**
			 * 朋友圈个人主页
			 */
			profile(data?: any): Promise<any>;

		/**
			 * 发布朋友圈帖子
			 */
			publish(data?: any): Promise<any>;

		/**
			 * 设置朋友圈点赞状态
			 */
			setLike(data?: any): Promise<any>;

		/**
			 * 朋友圈帖子列表
			 */
			list(data?: any): Promise<any[]>;

		/**
		 * 权限标识
		 */
		permission: { setGameFavorite: string; recentGames: string; setFavorite: string; setFollow: string; profile: string; publish: string; setLike: string; list: string; };

		/**
		 * 权限状态
		 */
		_permission: { setGameFavorite: boolean; recentGames: boolean; setFavorite: boolean; setFollow: boolean; profile: boolean; publish: boolean; setLike: boolean; list: boolean; };

		request: Service["request"];
	}

	interface V1Notice {
		/**
			 * 公告列表
			 */
			announcementList(data?: any): Promise<any>;

		/**
			 * 公告详情
			 */
			announcementInfo(data?: any): Promise<any>;

		/**
			 * 提交反馈
			 */
			feedbackSubmit(data?: any): Promise<any>;

		/**
			 * 我的反馈列表
			 */
			feedbackList(data?: any): Promise<any>;

		/**
			 * 跑马灯列表
			 */
			marqueeList(data?: any): Promise<any>;

		/**
			 * 跑马灯详情
			 */
			marqueeInfo(data?: any): Promise<any>;

		/**
			 * 通知列表
			 */
			notifyList(data?: any): Promise<any>;

		/**
			 * 通知详情
			 */
			notifyInfo(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { announcementList: string; announcementInfo: string; feedbackSubmit: string; feedbackList: string; marqueeList: string; marqueeInfo: string; notifyList: string; notifyInfo: string; };

		/**
		 * 权限状态
		 */
		_permission: { announcementList: boolean; announcementInfo: boolean; feedbackSubmit: boolean; feedbackList: boolean; marqueeList: boolean; marqueeInfo: boolean; notifyList: boolean; notifyInfo: boolean; };

		request: Service["request"];
	}

	interface V1Sse {
		/**
			 * SSE消息推送连接
			 */
			connect(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { connect: string; };

		/**
		 * 权限状态
		 */
		_permission: { connect: boolean; };

		request: Service["request"];
	}

	interface V1User {
		/**
			 * 领取返水奖励
			 */
			getOrderInfoDetail(data?: any): Promise<any>;

		/**
			 * 获取系统返水的详情数据
			 */
			getCashBackDetail(data?: any): Promise<any>;

		/**
			 * 钱包记录
			 */
			accountPageList(data?: any): Promise<any>;

		/**
			 * 领取返水奖励
			 */
			receiveCashBack(data?: any): Promise<any>;

		/**
			 * 个人报表
			 */
			personalReport(data?: any): Promise<any>;

		/**
			 * 游戏记录
			 */
			gamePageList(data?: any): Promise<any>;

		/**
			 * 回归所有场馆余额
			 */
			totalMoneyIn(data?: any): Promise<any>;

		/**
			 * 领取VIP的对应的奖励
			 */
			getVipReward(data?: any): Promise<any>;

		/**
			 * 三方钱包余额
			 */
			thirdWallet(data?: any): Promise<any>;

		/**
			 * 获取系统返水信息
			 */
			getCashBack(data?: any): Promise<any>;

		/**
			 * 获取用户的VIP信息
			 */
			getVipInfo(data?: any): Promise<any>;

		/**
			 * VIP 配置列表
			 */
			vipList(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { getOrderInfoDetail: string; getCashBackDetail: string; accountPageList: string; receiveCashBack: string; personalReport: string; gamePageList: string; totalMoneyIn: string; getVipReward: string; thirdWallet: string; getCashBack: string; getVipInfo: string; vipList: string; };

		/**
		 * 权限状态
		 */
		_permission: { getOrderInfoDetail: boolean; getCashBackDetail: boolean; accountPageList: boolean; receiveCashBack: boolean; personalReport: boolean; gamePageList: boolean; totalMoneyIn: boolean; getVipReward: boolean; thirdWallet: boolean; getCashBack: boolean; getVipInfo: boolean; vipList: boolean; };

		request: Service["request"];
	}

	type Service = {
		/**
		 * 基础请求
		 */
		request(options?: {
			url: string;
			method?: "POST" | "GET" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
			data?: any;
			params?: any;
			headers?: {
				authorization?: string;
				[key: string]: any;
			};
			timeout?: number;
			proxy?: boolean;
			[key: string]: any;
		}): Promise<any>;

		activity: {
			data: ActivityData;
		};
		open: {
			activity: {
				data: OpenActivityData;
			};
			demo: {
				cache: OpenDemoCache;
				event: OpenDemoEvent;
				goods: OpenDemoGoods;
				i18n: OpenDemoI18n;
				plugin: OpenDemoPlugin;
				queue: OpenDemoQueue;
				rpc: OpenDemoRpc;
				sse: OpenDemoSse;
				tenant: OpenDemoTenant;
				transaction: OpenDemoTransaction;
			};
			service: {
				info: OpenServiceInfo;
			};
			site: {
				base: OpenSiteBase;
			};
			telegram: {
				bot: OpenTelegramBot;
			};
			v1: {
				game: OpenV1Game;
				home: OpenV1Home;
				notify: OpenV1Notify;
				task: OpenV1Task;
			};
		};
		base: {
			comm: BaseComm;
			recharge: BaseRecharge;
			withdraw: BaseWithdraw;
		};
		dict: {
			info: DictInfo;
		};
		swagger: Swagger;
		user: {
			address: UserAddress;
			comm: UserComm;
			device: UserDevice;
			info: UserInfo;
			login: UserLogin;
		};
		v1: {
			activity: V1Activity;
			agent: V1Agent;
			finance: V1Finance;
			game: V1Game;
			moments: V1Moments;
			notice: V1Notice;
			sse: V1Sse;
			user: V1User;
		};
	};

	type DictKey = "brand" | "occupation" | "smsApi" | "gameApi" | "gameClassify" | "specialActivity" | "recharge_channel" | "site_wallet_keyword" | "activityTaskType" | "withdraw_channel" | "frontJump";
}
