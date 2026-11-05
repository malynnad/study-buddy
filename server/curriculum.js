// 深圳小学五年级课程知识点：数学（北师大版）、语文（统编版）、英语（沪教牛津版）、科学（教科版）
export const SUBJECTS = [
  {
    id: 'math',
    name: '数学',
    textbook: '北京师范大学出版社（北师大版）',
    semesters: [
      {
        id: 'g5a',
        name: '五年级上册',
        short: '五上',
        units: [
          {
            id: '5a-u1',
            name: '小数的再认识和加减法',
            kps: [
              { id: '5a-u1-1', name: '小数的意义与读写', desc: '小数的数位、计数单位，小数与分数的联系，正确读写小数' },
              { id: '5a-u1-2', name: '小数的大小比较', desc: '从整数部分到小数部分依次比较，判断小数的大小' },
              { id: '5a-u1-3', name: '小数加减法', desc: '小数点对齐，按整数加减法计算，结果点上小数点' },
              { id: '5a-u1-4', name: '小数加减混合运算', desc: '小数加减混合运算的顺序，以及运用运算律进行简便计算' }
            ]
          },
          {
            id: '5a-u2',
            name: '三角形的再认识',
            kps: [
              { id: '5a-u2-1', name: '三角形的三边关系', desc: '三角形任意两边之和大于第三边，判断三条线段能否围成三角形' },
              { id: '5a-u2-2', name: '三角形的高与底', desc: '认识三角形的底和高，会画指定底边上的高' },
              { id: '5a-u2-3', name: '三角形的分类', desc: '按角分为锐角、直角、钝角三角形；按边分为等腰、等边三角形' },
              { id: '5a-u2-4', name: '三角形的内角和', desc: '三角形内角和是 180°，已知两个角求第三个角' }
            ]
          },
          {
            id: '5a-u9',
            name: '综合实践：小小设计师',
            kps: [
              { id: '5a-u9-1', name: '轴对称与平移的应用', desc: '运用轴对称、平移等方法设计图案，感受图形变换' }
            ]
          },
          {
            id: '5a-u3',
            name: '小数乘法',
            kps: [
              { id: '5a-u3-1', name: '小数乘整数', desc: '小数乘整数的意义与竖式计算，积的小数位数' },
              { id: '5a-u3-2', name: '小数乘小数', desc: '按整数乘法计算，再根据因数中小数位数确定积的小数点' },
              { id: '5a-u3-3', name: '积的近似值', desc: '用四舍五入法求积的近似值，保留指定小数位数' },
              { id: '5a-u3-4', name: '小数乘法混合运算', desc: '小数乘法与加减法的混合运算，运用运算律简便计算' }
            ]
          },
          {
            id: '5a-u4',
            name: '用字母表示（一）',
            kps: [
              { id: '5a-u4-1', name: '用字母表示数', desc: '用字母表示数，理解字母可以表示任意数，书写时省略乘号' },
              { id: '5a-u4-2', name: '用字母表示数量关系', desc: '用含字母的式子表示实际问题中的数量关系' },
              { id: '5a-u4-3', name: '用字母表示公式', desc: '用字母表示周长、面积等计算公式' },
              { id: '5a-u4-4', name: '求含有字母的式子的值', desc: '把字母的值代入式子，求出式子的结果' }
            ]
          },
          {
            id: '5a-u5',
            name: '多边形的面积',
            kps: [
              { id: '5a-u5-1', name: '平行四边形的面积', desc: '平行四边形面积＝底×高（S=ah），注意底与高的对应关系' },
              { id: '5a-u5-2', name: '三角形的面积', desc: '三角形面积＝底×高÷2（S=ah÷2），等底等高三角形面积相等' },
              { id: '5a-u5-3', name: '梯形的面积', desc: '梯形面积＝（上底＋下底）×高÷2（S=(a+b)h÷2）' }
            ]
          },
          {
            id: '5a-u10',
            name: '数学好玩：鸡兔同笼',
            kps: [
              { id: '5a-u10-1', name: '鸡兔同笼问题', desc: '用假设法、列表法解决鸡兔同笼问题，根据腿数差调整只数' }
            ]
          },
          {
            id: '5a-u6',
            name: '图形的位置与运动（一）',
            kps: [
              { id: '5a-u6-1', name: '轴对称', desc: '识别轴对称图形、找对称轴、补全轴对称图形的另一半' },
              { id: '5a-u6-2', name: '图形的平移', desc: '判断图形平移的方向与格数，按指定方向平移图形' }
            ]
          },
          {
            id: '5a-u7',
            name: '倍数与因数',
            kps: [
              { id: '5a-u7-1', name: '倍数与因数', desc: '倍数与因数的意义，找一个数的倍数和因数，因数配对成对寻找' },
              { id: '5a-u7-2', name: '2、3、5的倍数特征', desc: '2、5 的倍数看个位；3 的倍数看各位数字之和是否被 3 整除；奇偶数判断' },
              { id: '5a-u7-3', name: '质数与合数', desc: '质数、合数、1 的分类与判断，20 以内的质数' },
              { id: '5a-u7-4', name: '数的奇偶性', desc: '奇偶数在加减运算中的变化规律，用奇偶性解决实际问题' }
            ]
          },
          {
            id: '5a-u8',
            name: '可能性',
            kps: [
              { id: '5a-u8-1', name: '可能性大小', desc: '判断事件发生的可能性大小，用分数表示可能性' },
              { id: '5a-u8-2', name: '游戏公平性', desc: '比较双方获胜的可能性，判断游戏规则是否公平' }
            ]
          },
          {
            id: '5a-u11',
            name: '综合实践：多少落叶能铺满',
            kps: [
              { id: '5a-u11-1', name: '面积估算与测量', desc: '估计不规则图形的面积，用面积单位换算解决实际问题' }
            ]
          }
        ]
      },
      {
        id: 'g5b',
        name: '五年级下册',
        short: '五下',
        units: [
          {
            id: '5b-u1',
            name: '分数加减法',
            kps: [
              { id: '5b-u1-1', name: '异分母分数加减法', desc: '先通分再加减，结果约成最简分数' },
              { id: '5b-u1-2', name: '分数加减混合运算', desc: '分数加减混合运算的顺序与简便计算' },
              { id: '5b-u1-3', name: '分数与小数的互化', desc: '分数化小数、小数化分数，以及分数与小数的大小比较' }
            ]
          },
          {
            id: '5b-u2',
            name: '长方体（一）',
            kps: [
              { id: '5b-u2-1', name: '长方体的认识', desc: '长方体、正方体的面、棱、顶点特征，棱长总和' },
              { id: '5b-u2-2', name: '展开与折叠', desc: '长方体、正方体展开图的判断，相对面识别' },
              { id: '5b-u2-3', name: '长方体的表面积', desc: '表面积＝（长×宽＋长×高＋宽×高）×2，无盖、通风管等实际问题' }
            ]
          },
          {
            id: '5b-u3',
            name: '分数乘法',
            kps: [
              { id: '5b-u3-1', name: '分数乘法', desc: '分数乘整数、分数乘分数，先约分再相乘，求一个数的几分之几' },
              { id: '5b-u3-2', name: '倒数', desc: '倒数的意义，求分数、整数、小数的倒数' }
            ]
          },
          {
            id: '5b-u4',
            name: '长方体（二）',
            kps: [
              { id: '5b-u4-1', name: '体积与容积、体积单位', desc: '体积与容积的意义，常用体积单位的认识与选择' },
              { id: '5b-u4-2', name: '长方体的体积', desc: '长方体体积＝长×宽×高，正方体体积＝棱长³，底面积×高' },
              { id: '5b-u4-3', name: '体积单位换算与测量', desc: '体积、容积单位之间的进率换算，用排水法测量不规则物体体积' }
            ]
          },
          {
            id: '5b-u5',
            name: '分数除法',
            kps: [
              { id: '5b-u5-1', name: '分数除法', desc: '除以一个不为 0 的数等于乘它的倒数，分数除法计算' },
              { id: '5b-u5-2', name: '分数乘除解决问题', desc: '已知一个数的几分之几是多少，求这个数（用除法或方程）' }
            ]
          },
          {
            id: '5b-u6',
            name: '确定位置',
            kps: [
              { id: '5b-u6-1', name: '用方向和距离确定位置', desc: '以观测点为中心，用方向（如北偏东30°）和距离确定物体位置' },
              { id: '5b-u6-2', name: '描述路线图', desc: '按照先后顺序描述行走路线，注意方向、角度和距离的变化' }
            ]
          },
          {
            id: '5b-u7',
            name: '用方程解决问题',
            kps: [
              { id: '5b-u7-1', name: '列方程解决问题', desc: '找等量关系、设未知数、列方程并求解检验' },
              { id: '5b-u7-2', name: '相遇问题', desc: '相遇问题中的等量关系：路程＝速度和×相遇时间' }
            ]
          },
          {
            id: '5b-u8',
            name: '数据的表示和分析',
            kps: [
              { id: '5b-u8-1', name: '复式统计图', desc: '复式条形统计图、复式折线统计图的读图与数据分析' },
              { id: '5b-u8-2', name: '平均数', desc: '平均数的意义与求法，用平均数比较和作出判断' }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'chinese',
    name: '语文',
    textbook: '人民教育出版社（统编版）',
    semesters: [
      {
        id: 'cn-g5a',
        name: '五年级上册',
        short: '五上',
        units: [
          {
            id: 'cn-5a-u1',
            name: '第一单元',
            kps: [
              { id: 'cn-5a-u1-1', name: '1 桂花雨', desc: '生字词与多音字；借桂花表达思乡之情，体会“摇花乐”的场景描写' },
              { id: 'cn-5a-u1-2', name: '2 落花生', desc: '生字词与分角色朗读；借物喻人的写法，理解“人要做有用的人”' },
              { id: 'cn-5a-u1-3', name: '3* 珍珠鸟', desc: '略读课文：生字词、作者与珍珠鸟的情感变化，体会“信赖”' },
              { id: 'cn-5a-u1-4', name: '口语交际·习作：制定班级公约 / 我的心爱之物', desc: '讨论并制定规则；按顺序写心爱之物的样子、来历和故事' },
              { id: 'cn-5a-u1-5', name: '语文园地一', desc: '词句段运用中的对比写法、日积月累的古诗名句' }
            ]
          },
          {
            id: 'cn-5a-u2',
            name: '第二单元（阅读策略）',
            kps: [
              { id: 'cn-5a-u2-1', name: '4 冀中的地道战', desc: '生字词；地道式样与作用，按“总—分”结构提取信息' },
              { id: 'cn-5a-u2-2', name: '5 将相和', desc: '完璧归赵、渑池之会、负荆请罪三个故事与人物特点' },
              { id: 'cn-5a-u2-3', name: '6 什么比猎豹的速度更快', desc: '列数字、作比较等说明方法；练习提高阅读速度' },
              { id: 'cn-5a-u2-4', name: '7 “诺曼底号”遇难记', desc: '人物语言与环境描写，哈尔威船长的品质' },
              { id: 'cn-5a-u2-5', name: '阅读策略：提高阅读速度', desc: '集中注意力、连词成句地读、抓关键词句快速把握信息' },
              { id: 'cn-5a-u2-6', name: '习作·“漫画”老师 / 语文园地', desc: '用夸张的事例突出人物特点；语文园地词句运用' }
            ]
          },
          {
            id: 'cn-5a-u3',
            name: '第三单元',
            kps: [
              { id: 'cn-5a-u3-1', name: '8 猎人海力布', desc: '情节梳理与海力布的品质；练习创造性复述' },
              { id: 'cn-5a-u3-2', name: '9 牛郎织女（一）', desc: '故事情节与人物形象，根据情节想象补白' },
              { id: 'cn-5a-u3-3', name: '10* 牛郎织女（二）', desc: '略读课文：故事结局与民间故事的特点' },
              { id: 'cn-5a-u3-4', name: '口语交际·讲民间故事', desc: '讲清故事情节，加入动作、神态和想象' },
              { id: 'cn-5a-u3-5', name: '习作·故事新编 / 语文园地', desc: '改编民间故事；语文园地词句运用与快乐读书吧《从前有座山》' }
            ]
          },
          {
            id: 'cn-5a-u4',
            name: '第四单元',
            kps: [
              { id: 'cn-5a-u4-1', name: '11 古诗三首（示儿·题临安邸·己亥杂诗）', desc: '默写、诗句意思与表达的爱国情感' },
              { id: 'cn-5a-u4-2', name: '12 少年中国说（节选）', desc: '重点文言词句、排比句式与象征手法' },
              { id: 'cn-5a-u4-3', name: '13 圆明园的毁灭', desc: '重点句段、对比写法与表达的情感' },
              { id: 'cn-5a-u4-4', name: '14* 梅兰芳蓄须明志', desc: '略读课文：主要事件与人物品质' },
              { id: 'cn-5a-u4-5', name: '习作·二十年后的家乡 / 语文园地', desc: '列提纲写想象作文；语文园地词句运用' }
            ]
          },
          {
            id: 'cn-5a-u5',
            name: '第五单元（习作单元）',
            kps: [
              { id: 'cn-5a-u5-1', name: '15 太阳', desc: '列数字、作比较、打比方、举例子等说明方法及其作用' },
              { id: 'cn-5a-u5-2', name: '16 金字塔', desc: '非连续性文本阅读，提取关键信息' },
              { id: 'cn-5a-u5-3', name: '例文：鲸 / 风向袋的制作', desc: '学习例文的说明顺序和说明方法' },
              { id: 'cn-5a-u5-4', name: '习作·介绍一种事物', desc: '抓住事物特点，按一定顺序、用说明方法写作' }
            ]
          },
          {
            id: 'cn-5a-u6',
            name: '第六单元',
            kps: [
              { id: 'cn-5a-u6-1', name: '17 慈母情深', desc: '场景与细节描写，反复出现的词句及其表达效果' },
              { id: 'cn-5a-u6-2', name: '18 父爱之舟', desc: '以小见大的写法，细节中的父爱' },
              { id: 'cn-5a-u6-3', name: '19* 航天员写给孩子的信', desc: '略读课文：书信体特点与重点句理解' },
              { id: 'cn-5a-u6-4', name: '口语交际·父母之爱 / 习作·我想对您说', desc: '结合事例表达观点；用书信形式写心里话' },
              { id: 'cn-5a-u6-5', name: '语文园地六', desc: '词句段运用与日积月累' }
            ]
          },
          {
            id: 'cn-5a-u7',
            name: '第七单元',
            kps: [
              { id: 'cn-5a-u7-1', name: '20 古诗三首（山居秋暝·枫桥夜泊·早春呈水部张十八员外）', desc: '默写、意象与情感，体会动静结合' },
              { id: 'cn-5a-u7-2', name: '21* 第一场雪', desc: '略读课文：动静结合与借景抒情的写法' },
              { id: 'cn-5a-u7-3', name: '22 白鹭', desc: '散文诗的语言特点，排比、比喻的表达效果' },
              { id: 'cn-5a-u7-4', name: '习作·我最喜爱的季节 / 语文园地', desc: '按顺序写景、写出季节特点；语文园地词句运用' }
            ]
          },
          {
            id: 'cn-5a-u8',
            name: '第八单元',
            kps: [
              { id: 'cn-5a-u8-1', name: '23 古人谈读书', desc: '文言词句的意思与翻译，读书方法和态度' },
              { id: 'cn-5a-u8-2', name: '24 忆读书', desc: '梳理读书经历，提炼读书方法与观点' },
              { id: 'cn-5a-u8-3', name: '25* 走遍天下书为侣', desc: '略读课文：比喻论证与作者观点' },
              { id: 'cn-5a-u8-4', name: '习作·推荐一本书 / 语文园地', desc: '写清推荐理由；语文园地词句运用与日积月累' }
            ]
          }
        ]
      },
      {
        id: 'cn-g5b',
        name: '五年级下册',
        short: '五下',
        units: [
          {
            id: 'cn-5b-u1',
            name: '第一单元 · 童年往事',
            kps: [
              { id: 'cn-5b-u1-1', name: '古诗三首', desc: '《四时田园杂兴》《稚子弄冰》《村晚》的默写、诗意与儿童形象' },
              { id: 'cn-5b-u1-2', name: '体会课文思想感情', desc: '《祖父的园子》《月是故乡明》中蕴含的情感与表达方法' }
            ]
          },
          {
            id: 'cn-5b-u2',
            name: '第二单元 · 古典名著',
            kps: [
              { id: 'cn-5b-u2-1', name: '名著阅读与人物形象', desc: '《草船借箭》《景阳冈》的情节、人物性格与名著常识' },
              { id: 'cn-5b-u2-2', name: '古代白话文词句', desc: '古典名著中古今异义词、特殊句式的理解' }
            ]
          },
          {
            id: 'cn-5b-u3',
            name: '第三单元 · 汉字王国',
            kps: [
              { id: 'cn-5b-u3-1', name: '形近字与错别字', desc: '形近字、同音字辨析，常见错别字的改正' },
              { id: 'cn-5b-u3-2', name: '汉字文化与字谜', desc: '汉字的演变、造字法（象形、指事、会意、形声）与字谜' }
            ]
          },
          {
            id: 'cn-5b-u4',
            name: '第四单元 · 家国情怀',
            kps: [
              { id: 'cn-5b-u4-1', name: '古诗三首', desc: '《从军行》《秋夜将晓出篱门迎凉有感》《闻官军收河南河北》的默写与情感' },
              { id: 'cn-5b-u4-2', name: '人物描写与情感', desc: '《青山处处埋忠骨》《军神》中的描写方法及人物品质' }
            ]
          },
          {
            id: 'cn-5b-u5',
            name: '第五单元 · 人物描写',
            kps: [
              { id: 'cn-5b-u5-1', name: '人物描写方法', desc: '外貌、动作、语言、心理描写的作用与辨析' },
              { id: 'cn-5b-u5-2', name: '正面与侧面描写', desc: '正面描写与侧面烘托的结合及表达效果' }
            ]
          },
          {
            id: 'cn-5b-u6',
            name: '第六单元 · 思维的火花',
            kps: [
              { id: 'cn-5b-u6-1', name: '文言文理解', desc: '《自相矛盾》重点词句翻译与寓意' },
              { id: 'cn-5b-u6-2', name: '逻辑与推理', desc: '《田忌赛马》《跳水》中的思维过程与解决问题的方法' }
            ]
          },
          {
            id: 'cn-5b-u7',
            name: '第七单元 · 异域风情',
            kps: [
              { id: 'cn-5b-u7-1', name: '动静结合描写', desc: '《威尼斯的小艇》《牧场之国》中的静态、动态描写' },
              { id: 'cn-5b-u7-2', name: '说明与描写结合', desc: '《金字塔》中说明性文字与描写性文字的区分与作用' }
            ]
          },
          {
            id: 'cn-5b-u8',
            name: '第八单元 · 风趣与幽默',
            kps: [
              { id: 'cn-5b-u8-1', name: '文言文《杨氏之子》', desc: '重点文言词句意思、人物应答的巧妙之处' },
              { id: 'cn-5b-u8-2', name: '语言的风趣表达', desc: '《手指》《童年的发现》中幽默风趣的语言特点' }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'english',
    name: '英语',
    textbook: '上海教育出版社（沪教牛津版·深圳）',
    semesters: [
      {
        id: 'en-g5a',
        name: '五年级上册',
        short: '五上',
        units: [
          {
            id: 'en-5a-u1',
            name: 'Unit 1 · What do we do at the weekend?',
            kps: [
              { id: 'en-5a-u1-1', name: '核心词汇：周末活动', desc: 'go jogging、go fishing、do chores、watch TV、play with friends、have a picnic' },
              { id: 'en-5a-u1-2', name: '语法：be going to', desc: 'I am / He is / She is / We are going to...，描述周末计划' },
              { id: 'en-5a-u1-3', name: '语音：c、g 的发音', desc: '字母 c、g 在不同单词中的发音与辨音' },
              { id: 'en-5a-u1-4', name: '阅读与表达：Weekend plans', desc: 'Reading: Weekend plans / A busy Sunday；听说：不同人的周末计划；写作：我的周末计划邮件' }
            ]
          },
          {
            id: 'en-5a-u2',
            name: 'Unit 2 · How do we stay healthy?',
            kps: [
              { id: 'en-5a-u2-1', name: '核心词汇：健康习惯', desc: 'do exercise、eat healthy food、drink a lot of water、get enough sleep' },
              { id: 'en-5a-u2-2', name: '语法：be going to 的疑问句', desc: 'What are you going to do? What is he/she going to do? 及答语' },
              { id: 'en-5a-u2-3', name: '语音：th 的发音', desc: '字母组合 th 的两种发音与辨音' },
              { id: 'en-5a-u2-4', name: '阅读与表达：Healthy or not?', desc: 'Reading: Healthy or not? / Jim and Matt；听说：儿童健康小贴士；写作：我的生活习惯' }
            ]
          },
          {
            id: 'en-5a-u3',
            name: 'Unit 3 · What do you know about different countries?',
            kps: [
              { id: 'en-5a-u3-1', name: '核心词汇：国家与方位', desc: 'China、France、UK、north、south、east、west' },
              { id: 'en-5a-u3-2', name: '语法：方位表达', desc: 'China is in the east of Asia. 以及国家位置的描述' },
              { id: 'en-5a-u3-3', name: '语音：s 的发音', desc: '字母 s 的发音规则与辨音' },
              { id: 'en-5a-u3-4', name: '阅读与表达：Countries around the world', desc: 'Reading: Countries around the world / Life in different countries；写作：介绍一个国家' }
            ]
          },
          {
            id: 'en-5a-u4',
            name: "Unit 4 · What's interesting about holidays?",
            kps: [
              { id: 'en-5a-u4-1', name: '核心词汇：假期与景物', desc: 'mountain、cave、waterfall、hotel' },
              { id: 'en-5a-u4-2', name: '语法：will 将来时', desc: 'How will you...? Where will you...? What will you...? I will...' },
              { id: 'en-5a-u4-3', name: '语音：sh、ch 的发音', desc: '字母组合 sh、ch 的发音与辨音' },
              { id: 'en-5a-u4-4', name: '阅读与表达：A holiday plan', desc: 'Reading: A holiday plan / Holidays up high；听说：三亚假期计划；写作：我的假期计划' }
            ]
          },
          {
            id: 'en-5a-u5',
            name: 'Unit 5 · What are living things?',
            kps: [
              { id: 'en-5a-u5-1', name: '核心词汇：生物的特征', desc: 'get sunlight、get food and water、grow、change、move' },
              { id: 'en-5a-u5-2', name: '语法：and / or / but', desc: '用 and、or、but 连接句子和词语' },
              { id: 'en-5a-u5-3', name: '语音：w、wh 的发音', desc: '字母 w 与 wh 组合的发音与辨音' },
              { id: 'en-5a-u5-4', name: '阅读与表达：Living and non-living things', desc: 'Reading: Living and non-living things / Living to non-living；写作：介绍一种生物或非生物' }
            ]
          },
          {
            id: 'en-5a-u6',
            name: 'Unit 6 · Why should we take care of the Earth?',
            kps: [
              { id: 'en-5a-u6-1', name: '核心词汇：环境与环保', desc: 'smoke、dirty、rubbish、recycle、reduce' },
              { id: 'en-5a-u6-2', name: '语法：should / shouldn’t', desc: '用 should、shouldn’t 提出建议' },
              { id: 'en-5a-u6-3', name: '语音：ng、nk 的发音', desc: '字母组合 ng、nk 的发音与辨音' },
              { id: 'en-5a-u6-4', name: '阅读与表达：Natural resources', desc: 'Reading: Natural resources / A juice carton’s journey；听说：刘欣一家如何保护河流；写作：如何保护地球' }
            ]
          },
          {
            id: 'en-5a-u7',
            name: 'Unit 7 · How do we celebrate festivals?',
            kps: [
              { id: 'en-5a-u7-1', name: '核心词汇：节日', desc: 'Spring Festival、Lantern Festival、Dragon Boat Festival、Mid-Autumn Festival' },
              { id: 'en-5a-u7-2', name: '语法：将来时间表达', desc: 'in one hour、next month 等时间词与将来时的搭配' },
              { id: 'en-5a-u7-3', name: '语音：句子重音', desc: 'sentence stress：句子中重读词的判断' },
              { id: 'en-5a-u7-4', name: '阅读与表达：Important festivals', desc: 'Reading: Important festivals / New Year’s Day around the world；写作：我的节日计划' }
            ]
          },
          {
            id: 'en-5a-u8',
            name: 'Unit 8 · How does music make us feel?',
            kps: [
              { id: 'en-5a-u8-1', name: '核心词汇：音乐与情绪', desc: 'fast、slow、excited、unhappy' },
              { id: 'en-5a-u8-2', name: '语法复习', desc: 'Unit 1—7 重点语法综合运用（Grammar Review）' },
              { id: 'en-5a-u8-3', name: '语音：失去爆破', desc: 'loss of plosion 的读音规则' },
              { id: 'en-5a-u8-4', name: '阅读与表达：How music makes us feel', desc: 'Reading: How music makes us feel；听说：张亮最喜欢的音乐；写作：旅途中的音乐' }
            ]
          }
        ]
      },
      {
        id: 'en-g5b',
        name: '五年级下册',
        short: '五下',
        units: [
          {
            id: 'en-5b-u1',
            name: '一般过去时',
            kps: [
              { id: 'en-5b-u1-1', name: '动词过去式', desc: '规则动词加 ed 的变化，常见不规则动词过去式' },
              { id: 'en-5b-u1-2', name: '过去时句型', desc: '一般过去时的肯定句、否定句、疑问句及时间状语' }
            ]
          },
          {
            id: 'en-5b-u2',
            name: '一般将来时',
            kps: [
              { id: 'en-5b-u2-1', name: 'be going to', desc: 'be going to 表示计划的用法与句子结构' },
              { id: 'en-5b-u2-2', name: 'will 的用法', desc: 'will 表示将来意愿与预测，will 与 be going to 的区别' }
            ]
          },
          {
            id: 'en-5b-u3',
            name: '形容词比较级',
            kps: [
              { id: 'en-5b-u3-1', name: '比较级构成', desc: '形容词比较级的规则与不规则变化（taller、better 等）' },
              { id: 'en-5b-u3-2', name: '比较句型', desc: 'A is + 比较级 + than B、as ... as 等比较句型' }
            ]
          },
          {
            id: 'en-5b-u4',
            name: '名词与量词',
            kps: [
              { id: 'en-5b-u4-1', name: '可数与不可数名词', desc: '可数名词复数变化，不可数名词的识别与量词搭配' },
              { id: 'en-5b-u4-2', name: '量词与数量表达', desc: 'a piece of、a bottle of、a lot of、some/any 的用法' }
            ]
          },
          {
            id: 'en-5b-u5',
            name: '祈使句与建议',
            kps: [
              { id: 'en-5b-u5-1', name: '祈使句', desc: '祈使句的肯定与否定形式，Let\'s 句型' },
              { id: 'en-5b-u5-2', name: '提出建议', desc: 'should、had better、Why not ...? 等提建议的表达' }
            ]
          },
          {
            id: 'en-5b-u6',
            name: '阅读理解',
            kps: [
              { id: 'en-5b-u6-1', name: '短文理解与判断', desc: '根据短文判断正误、回答问题和推断词义' },
              { id: 'en-5b-u6-2', name: '信息匹配', desc: '把句子或问题与对应图片、段落、答语匹配' }
            ]
          },
          {
            id: 'en-5b-u7',
            name: '书面表达',
            kps: [
              { id: 'en-5b-u7-1', name: '连词与句子连接', desc: 'and、but、because、so 等连词的使用，组成通顺句子' },
              { id: 'en-5b-u7-2', name: '看图写话基础', desc: '根据提示词或图片写出 3-5 句正确、连贯的英文句子' }
            ]
          }
        ]
      }
    ]
  },

  {
    id: 'science',
    name: '科学',
    textbook: '教育科学出版社（教科版）',
    semesters: [
      {
        id: 'sc-g5a',
        name: '五年级上册',
        short: '五上',
        units: [
          {
            id: 'sc-5a-u1',
            name: '第一单元 微小世界',
            kps: [
              { id: 'sc-5a-u1-1', name: '1 研究放大镜', desc: '放大镜由镜片、镜框、镜柄构成，镜片是凸透镜，透明、中间厚、边缘薄；凸度越大放大倍数越大，与镜片大小无关；水滴、装水圆瓶也有放大作用' },
              { id: 'sc-5a-u1-2', name: '2 怎样放得更大', desc: '两个凸透镜组合成早期光学显微镜，上方镜片相当于目镜、下方相当于物镜；组合放大倍数＝两块凸透镜放大倍数的乘积' },
              { id: 'sc-5a-u1-3', name: '3 用简易显微镜观察', desc: '手持式简易显微镜由目镜、物镜、LED 灯、调焦环和电池盒构成；放大倍数＝目镜×物镜；看到的是倒像，移动物体的方向与视野中物体运动方向相反' },
              { id: 'sc-5a-u1-4', name: '4 用光学显微镜观察', desc: '光学显微镜由目镜、物镜、载物台、调节旋钮、反光镜构成；步骤为安放→对光→装片→调焦→观察；放大倍数＝目镜×物镜（如 10×20＝200 倍）；倍数越大视野越小，视野暗时调反光镜' },
              { id: 'sc-5a-u1-5', name: '5 观察细胞', desc: '罗伯特·胡克最早发现细胞；除病毒外绝大多数生物由细胞构成，细胞是生物体结构和功能的基本单位；洋葱表皮细胞呈长方形，有细胞壁、细胞膜、细胞质、细胞核、液泡；动物细胞没有细胞壁' },
              { id: 'sc-5a-u1-6', name: '6 观察水中的微小生物', desc: '玻片标本由载玻片和盖玻片组成；水中微小生物有水蚤、草履虫、变形虫、鼓藻、硅藻等；微生物包括细菌、病毒、真菌和微型藻类；列文虎克首次在显微镜下发现微生物；观察工具从肉眼、放大镜、光学显微镜发展到电子显微镜' },
              { id: 'sc-5a-u1-7', name: '7 微生物与人类', desc: '酵母菌用于发酵酿酒，乳酸菌制酸奶和泡菜，霉菌制腐乳；微生物会引起霉变，干燥低温可防霉；细菌和病毒会引发伤寒、鼠疫、霍乱等传染病；病毒比细菌小且没有细胞结构，必须寄生在活细胞内；人类利用微生物制成疫苗' }
            ]
          },
          {
            id: 'sc-5a-u2',
            name: '第二单元 工具与技术',
            kps: [
              { id: 'sc-5a-u2-1', name: '1 各种各样的工具', desc: '工具是生产劳动中使用的器具，合适的工具让工作更轻松便利；技术是解决问题的方法与原理，技术进步推动工具发展；工具按用途分为书写、运输、通信、测量、机械、交通等；构造简单的机械叫简单机械' },
              { id: 'sc-5a-u2-2', name: '2 独轮车省力的秘密', desc: '杠杆有支点、用力点、阻力点；独轮车相当于杠杆，支点在轮子中心、阻力点在车身重心；用力点到支点的距离大于阻力点到支点的距离时省力，反之费力' },
              { id: 'sc-5a-u2-3', name: '3 制作独轮车', desc: '独轮车模型由车身、扶手、轮子组成，要能承受一定重物并平稳运行；设计图要标注各部分的用料和尺寸；从时间成本、牢固程度、承重能力、滚动流畅等方面评价并改进' },
              { id: 'sc-5a-u2-4', name: '4 巧妙斜面', desc: '斜面省力，坡度越小越省力但移动的距离越长；螺丝钉的螺纹是斜面的变形，螺纹越密旋进越省力；大桥引桥、无障碍坡道、盘山公路都是斜面的应用' },
              { id: 'sc-5a-u2-5', name: '5 妙用滑轮', desc: '滑轮是边缘有凹槽、可绕中心轴转动的轮子；定滑轮能改变用力方向但不省力；动滑轮能省力但不能改变用力方向；滑轮组既省力又能改变用力方向' },
              { id: 'sc-5a-u2-6', name: '6 给小车安装方向盘', desc: '轮轴由较大的轮和较小的轴固定在一起转动；在轮上用力带动轮轴较省力，轮越大越省力；方向盘、水龙头、门把手、扳手都是轮轴' },
              { id: 'sc-5a-u2-7', name: '7 社会发展与工具和技术', desc: '工具是生产劳动时使用的器具，技术是解决问题的方法及原理；技术和工具都可以改进，并能依据技术发明工具；制作独轮车用到杠杆、轮子、组装等技术；印刷术经历雕版、活字、激光印刷等阶段' }
            ]
          },
          {
            id: 'sc-5a-u3',
            name: '第三单元 运动和力',
            kps: [
              { id: 'sc-5a-u3-1', name: '1 拆解我的小车模型', desc: '小车一般由车架、电池、车轮、电动机等构成；车架支撑车身、车轮实现移动、电池储电驱动电动机；小车动力有电力、弹力、反冲力、惯性等；组装方式有卡扣、螺丝固定、铆接、黏合' },
              { id: 'sc-5a-u3-2', name: '2 用重物驱动小车', desc: '重力是地球对物体的吸引力，方向竖直向下，质量越大重力越大；用垫圈的重力作拉力，垫圈越多拉力越大；力能使静止的物体运动，力越大运动越快' },
              { id: 'sc-5a-u3-3', name: '3 用弹力驱动小车', desc: '被拉长的橡皮筋具有能量，释放后能产生动力；物体受力形变后要恢复原状的力叫弹力；橡皮筋缠绕圈数越多弹力越大，小车行驶得越快越远' },
              { id: 'sc-5a-u3-4', name: '4 测量力的大小', desc: '弹簧测力计用来测量力的大小，依据“受力越大，弹簧伸长越长”；由提环、弹簧、指针、刻度板、挂钩构成；力的单位是牛顿（N），1 牛约相当于 100 克物体所受重力；使用前指针归零，读数时视线与指针相平' },
              { id: 'sc-5a-u3-5', name: '5 摩擦力的比较', desc: '摩擦力是两个物体接触面发生摩擦时阻碍运动的力；其他条件相同时滑动摩擦力远大于滚动摩擦力；接触面越粗糙、压力越大，摩擦力越大；轮胎和刹车橡皮增大摩擦，轴承和链条减小摩擦' },
              { id: 'sc-5a-u3-6', name: '6 制作“月球车”', desc: '工程任务步骤：明确任务→制订方案→实施方案→测试与改进→展示与交流；要从多个角度画出设计图并标注主要尺寸；组装顺序为做车架、安装轮子和小电动机、固定太阳能电池、连接电路' },
              { id: 'sc-5a-u3-7', name: '7 评价“月球车”', desc: '从与设计方案的一致性、自重、价格、载重、通过性以及运动性能、任务完成度等方面评价；宽轮胎增大摩擦防打滑；降低重心并加宽轮距更平稳；流线型车身可减小空气阻力' }
            ]
          },
          {
            id: 'sc-5a-u4',
            name: '第四单元 地球表面的变化',
            kps: [
              { id: 'sc-5a-u4-1', name: '1 地球的表面', desc: '地球约 71% 的面积被海洋覆盖；地形分为高原、山地、盆地、丘陵、平原五种，高原海拔 1000 米以上、山地 500 米以上、丘陵 200—500 米；地震、火山、河流、风、雨水和海浪都会使地形地貌发生变化' },
              { id: 'sc-5a-u4-2', name: '2 火山喷发对地表的作用', desc: '地球内部可分为地壳、地幔、地核；地幔中岩浆的涌动引发火山喷发；火山喷发由地球内部运动引起，使地表在瞬间发生剧烈变化，会烧毁森林房屋、引发滑坡；火山灰能提高土壤肥力，火山地热是清洁能源' },
              { id: 'sc-5a-u4-3', name: '3 地震对地表的作用', desc: '地壳不停运动，岩层相互挤压或拉伸会弯曲变形甚至断裂；地震由地球内部运动引起，使地表瞬间剧变，造成房屋坍塌、地面裂缝、山崩滑坡；避震应尽快前往空旷地带或躲在坚固桌下' },
              { id: 'sc-5a-u4-4', name: '4 地球表面的岩石', desc: '地球表面被坚硬的岩石圈包裹；从颜色、颗粒粗细、坚硬程度、纹理、光泽等方面描述岩石；岩石由矿物组成，主要有石英、长石、云母；常见岩石有花岗岩、砂岩、大理岩，石灰岩可烧制水泥、被侵蚀可形成溶洞' },
              { id: 'sc-5a-u4-5', name: '5 岩石的类型与变化', desc: '岩石分为岩浆岩、沉积岩、变质岩；岩浆冷却结晶形成岩浆岩，沉积物经成岩作用形成沉积岩，温度压力改变形成变质岩；化石几乎都在沉积岩中；岩石在阳光、风、水和温度变化下逐渐变成沙子和土壤' },
              { id: 'sc-5a-u4-6', name: '6 水对地表的作用', desc: '地表径流主要来自大气降水；流水、风力、波浪等外力破坏岩石及其风化物的过程叫侵蚀，被搬运的物质堆积下来叫沉积；长江全长约 6300 千米，注入东海；植树造林、修建梯田和堤坝可减少水土流失' },
              { id: 'sc-5a-u4-7', name: '7 风对地表的作用', desc: '风通过侵蚀和沉积塑造地表形态；干旱地区风力侵蚀形成雅丹地貌；近地面含沙量大，岩石下部被磨蚀得更严重，形成上大下小的风蚀蘑菇；细沙尘土被搬走形成沙漠，原地留下砾石形成戈壁' }
            ]
          }
        ]
      }
    ]
  }
];

export function listSubjects() {
  return SUBJECTS.map((s) => ({ id: s.id, name: s.name, textbook: s.textbook, semesters: s.semesters }));
}

export function findSubject(subjectId) {
  return SUBJECTS.find((s) => s.id === subjectId) || null;
}

export function findKp(kpId) {
  for (const subject of SUBJECTS) {
    for (const semester of subject.semesters) {
      for (const unit of semester.units) {
        const kp = unit.kps.find((k) => k.id === kpId);
        if (kp) return { subject, semester, unit, kp };
      }
    }
  }
  return null;
}
