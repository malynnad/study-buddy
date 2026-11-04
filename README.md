# 五年级闯关（study-buddy）

面向深圳小学五年级的语文、数学、英语智能练习应用：AI 出题、自动批改、错题本、薄弱点分析、变式巩固，并统计每次出题消耗的 token 与预估费用。

## 功能

- **三科覆盖**：数学（北师大版）、语文（统编版）、英语（沪教牛津版·深圳），按五年级上下册单元组织知识点。
- **动态出题**：按选中的知识点调用大模型生成新题；数学在未配置 Key 或调用失败时可使用内置示例题库兜底，语文/英语必须使用大模型。
- **自动判分**：支持选择题、填空题、计算题、应用题/简答题；分数、带分数、小数等价判断，英文答案不区分大小写。
- **错题本**：答错自动收录，可标记掌握、按学科筛选、一键再练。
- **学情分析**：按知识点正确率生成薄弱点画像与学习计划，可针对薄弱点再出巩固题。
- **用量与费用**：每次出题、每次分析都会显示输入/输出 tokens 和预估金额；设置页显示累计用量与按学科分项。费用按 DeepSeek 官方公示价估算。

## 环境要求

- Node.js **22 或更高版本**（使用了内置的 `node:sqlite`，已在 Node 26 验证）。
- 无需安装任何 npm 依赖，也没有构建步骤。

## 启动

### macOS

双击根目录的 `启动.command`，会自动启动服务并打开浏览器。

首次运行如果提示无法打开，可在终端执行一次：

```bash
chmod +x 启动.command
```

### Windows

双击根目录的 `启动.bat`，脚本会检查 Node.js、启动服务并打开浏览器。

### 命令行（macOS / Windows / Linux）

```bash
node server.js
# 或者
npm start
```

浏览器访问 <http://localhost:3000>。关闭终端窗口即可停止服务。

## 配置大模型

打开页面右上角的「设置」，填写：

- 接口地址：`https://api.deepseek.com`
- 模型：`deepseek-v4-flash`（也可填 `deepseek-v4-pro`）
- API Key：以 `sk-` 开头的 Key 本体

保存后可点击「测试连接」验证。Key 只保存在本机的 `data/config.json`，不会随代码上传。

## 数据与隐私

运行时会自动创建 `data/`，其中包含：

- `data/app.db`：练习记录、错题、用量统计
- `data/config.json`：模型配置与 API Key
- `data/system-ca.pem`：系统证书缓存

`data/`、`.screenshots/`、`.DS_Store` 已加入 `.gitignore`，不会被提交到仓库。

## 项目结构

```text
.
├── server.js              # HTTP 服务与接口路由
├── public/                # 前端页面（原生 HTML/CSS/JS）
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── server/
│   ├── curriculum.js      # 三科知识点数据
│   ├── db.js              # SQLite 存储、迁移与统计
│   ├── llm.js             # 大模型调用与题目解析
│   ├── localgen.js        # 数学内置示例题库
│   ├── grade.js           # 本地自动判分
│   ├── pricing.js         # token 价格与费用换算
│   ├── tls.js             # macOS 系统证书信任链
│   └── paths.js
├── 启动.command           # macOS 双击启动
├── 启动.bat               # Windows 双击启动
└── package.json
```

## 计费说明

单价定义在 `server/pricing.js`，单位为「元 / 百万 tokens」：

| 模型 | 输入（缓存未命中） | 输入（缓存命中） | 输出 |
| --- | --- | --- | --- |
| deepseek-v4-flash | 1 | 0.02 | 2 |
| deepseek-v4-pro | 3 | 0.025 | 6 |

官方现行价格不分峰谷时段，统一按上表计算。页面显示的是按 token 用量估算的参考金额，实际扣费以服务商账单为准；如果官方价格调整，直接修改该文件即可。

## 常见问题

- **端口被占用**：默认使用 3000，可先关闭占用该端口的程序。
- **macOS 提示无法验证开发者**：右键点击 `启动.command`，选择「打开」。
- **Windows 提示未安装 Node.js**：到 <https://nodejs.org/> 安装 22 以上版本后重新打开 `启动.bat`。
- **连接模型失败**：检查网络/代理；macOS 版会自动合并系统证书，其他系统可尝试关闭代理后重试。
- **语文/英语无法出题**：这两科必须配置可用的 API Key，数学才有无 Key 的示例题库兜底。
