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
			 * 价格
			 */
			money?: number;

		/**
			 * 手机号
			 */
			phone?: string;

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
			 * 活跃度记录列表
			 */
			vitalityRecordList(data?: any): Promise<any>;

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
		permission: { vitalityRecordList: string; taskConfigData: string; getTaskReward: string; taskListData: string; getBoxReward: string; };

		/**
		 * 权限状态
		 */
		_permission: { vitalityRecordList: boolean; taskConfigData: boolean; getTaskReward: boolean; taskListData: boolean; getBoxReward: boolean; };

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
		 * 权限标识
		 */
		permission: { classifyData: string; config: string; findUs: string; };

		/**
		 * 权限状态
		 */
		_permission: { classifyData: boolean; config: boolean; findUs: boolean; };

		request: Service["request"];
	}

	interface OpenV1Game {
		/**
			 * 根据场馆获取游戏的列表
			 */
			getGameById(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { getGameById: string; };

		/**
		 * 权限状态
		 */
		_permission: { getGameById: boolean; };

		request: Service["request"];
	}

	interface OpenV1Home {
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
		permission: { pageData: string; helpData: string; };

		/**
		 * 权限状态
		 */
		_permission: { pageData: boolean; helpData: boolean; };

		request: Service["request"];
	}

	interface OpenV1Task {
		/**
			 * 定时清理过期的活跃度
			 */
			clearVitalityByNow(data?: any): Promise<any>;

		/**
			 * 创建VIP天/周/月信息
			 */
			generateVipGift(data?: any): Promise<any>;

		/**
			 * 抓取星汇的游戏记录
			 */
			pullXhData(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { clearVitalityByNow: string; generateVipGift: string; pullXhData: string; };

		/**
		 * 权限状态
		 */
		_permission: { clearVitalityByNow: boolean; generateVipGift: boolean; pullXhData: boolean; };

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
		 * 权限标识
		 */
		permission: { createNoWalletUser: string; siteWalletInfo: string; channelList: string; createOrder: string; };

		/**
		 * 权限状态
		 */
		_permission: { createNoWalletUser: boolean; siteWalletInfo: boolean; channelList: boolean; createOrder: boolean; };

		request: Service["request"];
	}

	interface BaseWithdraw {
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
		permission: { applyWithdraw: string; records: string; };

		/**
		 * 权限状态
		 */
		_permission: { applyWithdraw: boolean; records: boolean; };

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

	interface UserInfo {
		/**
			 * 更新用户密码
			 */
			updatePassword(data?: any): Promise<any>;

		/**
			 * 更新用户密码
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
		permission: { updatePassword: string; setPayPassword: string; updatePerson: string; bindPhone: string; miniPhone: string; person: string; logoff: string; };

		/**
		 * 权限状态
		 */
		_permission: { updatePassword: boolean; setPayPassword: boolean; updatePerson: boolean; bindPhone: boolean; miniPhone: boolean; person: boolean; logoff: boolean; };

		request: Service["request"];
	}

	interface UserLogin {
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
		permission: { phoneVerifyCode: string; refreshToken: string; register: string; password: string; captcha: string; smsCode: string; };

		/**
		 * 权限状态
		 */
		_permission: { phoneVerifyCode: boolean; refreshToken: boolean; register: boolean; password: boolean; captcha: boolean; smsCode: boolean; };

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
			 * 领取记录
			 */
			records(data?: any): Promise<any>;

		/**
		 * 权限标识
		 */
		permission: { interestTransferOut: string; interestTransferIn: string; interestRecords: string; interestClaim: string; interestInfo: string; records: string; };

		/**
		 * 权限状态
		 */
		_permission: { interestTransferOut: boolean; interestTransferIn: boolean; interestRecords: boolean; interestClaim: boolean; interestInfo: boolean; records: boolean; };

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

	interface V1User {
		/**
			 * 钱包记录
			 */
			accountPageList(data?: any): Promise<any>;

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
		permission: { accountPageList: string; personalReport: string; gamePageList: string; totalMoneyIn: string; getVipReward: string; thirdWallet: string; getVipInfo: string; vipList: string; };

		/**
		 * 权限状态
		 */
		_permission: { accountPageList: boolean; personalReport: boolean; gamePageList: boolean; totalMoneyIn: boolean; getVipReward: boolean; thirdWallet: boolean; getVipInfo: boolean; vipList: boolean; };

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
			v1: {
				game: OpenV1Game;
				home: OpenV1Home;
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
			info: UserInfo;
			login: UserLogin;
		};
		v1: {
			activity: V1Activity;
			finance: V1Finance;
			game: V1Game;
			notice: V1Notice;
			user: V1User;
		};
	};

	type DictKey = "brand" | "occupation" | "smsApi" | "gameApi" | "gameClassify" | "specialActivity" | "recharge_channel" | "site_wallet_keyword" | "activityTaskType";
}
