// 深圳小学五年级课程知识点：数学（北师大版）、语文（统编版）、英语（沪教牛津版）
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
            name: '小数除法',
            kps: [
              { id: '5a-u1-1', name: '小数除以整数', desc: '小数除以整数的竖式计算，商的小数点与被除数的小数点对齐，除不尽时在余数后补 0 继续除' },
              { id: '5a-u1-2', name: '除数是小数的除法', desc: '利用商不变性质，把被除数与除数同时扩大相同倍数，转化为除数是整数的除法' },
              { id: '5a-u1-3', name: '商的近似值与循环小数', desc: '用四舍五入法保留指定位数（如保留两位小数）；循环小数的意义与简写记法' },
              { id: '5a-u1-4', name: '小数四则混合运算', desc: '小数四则混合运算的运算顺序，以及运用运算律进行简便计算' }
            ]
          },
          {
            id: '5a-u2',
            name: '轴对称和平移',
            kps: [
              { id: '5a-u2-1', name: '轴对称再认识', desc: '识别轴对称图形、找对称轴、补全轴对称图形的另一半' },
              { id: '5a-u2-2', name: '图形的平移', desc: '判断图形平移的方向与格数，按指定方向平移图形' }
            ]
          },
          {
            id: '5a-u3',
            name: '倍数与因数',
            kps: [
              { id: '5a-u3-1', name: '倍数与因数', desc: '倍数与因数的意义，找一个数的倍数和因数，因数配对成对寻找' },
              { id: '5a-u3-2', name: '2、3、5的倍数特征', desc: '2、5 的倍数看个位；3 的倍数看各位数字之和是否被 3 整除；奇偶数判断' },
              { id: '5a-u3-3', name: '质数与合数', desc: '质数、合数、1 的分类与判断，20 以内的质数' },
              { id: '5a-u3-4', name: '数的奇偶性', desc: '奇偶数在加减运算中的变化规律，用奇偶性解决实际问题' }
            ]
          },
          {
            id: '5a-u4',
            name: '多边形的面积',
            kps: [
              { id: '5a-u4-1', name: '平行四边形的面积', desc: '平行四边形面积＝底×高（S=ah），注意底与高的对应关系' },
              { id: '5a-u4-2', name: '三角形的面积', desc: '三角形面积＝底×高÷2（S=ah÷2），等底等高三角形面积相等' },
              { id: '5a-u4-3', name: '梯形的面积', desc: '梯形面积＝（上底＋下底）×高÷2（S=(a+b)h÷2）' }
            ]
          },
          {
            id: '5a-u5',
            name: '分数的意义',
            kps: [
              { id: '5a-u5-1', name: '分数的再认识', desc: '分数的意义、真分数与假分数、带分数与假分数的互化' },
              { id: '5a-u5-2', name: '分数与除法', desc: '分数与除法的关系：a÷b＝a/b（b≠0），求一个数是另一个数的几分之几' },
              { id: '5a-u5-3', name: '分数基本性质与约分', desc: '分子分母同时乘或除以相同的数（0 除外）大小不变；约分成最简分数' },
              { id: '5a-u5-4', name: '最大公因数与最小公倍数', desc: '用列举法或短除法求两个数的最大公因数和最小公倍数' },
              { id: '5a-u5-5', name: '通分与分数大小比较', desc: '通分后比较分数大小，分子分母都不同的分数比较方法' }
            ]
          },
          {
            id: '5a-u6',
            name: '组合图形的面积',
            kps: [
              { id: '5a-u6-1', name: '组合图形的面积', desc: '用分割法、添补法计算由基本图形拼成的组合图形面积' },
              { id: '5a-u6-2', name: '公顷与平方千米', desc: '1 公顷＝10000 平方米，1 平方千米＝100 公顷，面积单位换算' }
            ]
          },
          {
            id: '5a-u7',
            name: '可能性',
            kps: [{ id: '5a-u7-1', name: '可能性大小', desc: '用分数表示可能性大小，判断游戏规则是否公平' }]
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
            name: '第一单元 · 万物有灵',
            kps: [
              { id: 'cn-5a-u1-1', name: '本单元字音字形', desc: '《白鹭》《落花生》《桂花雨》中的生字读音、易错字形、多音字辨析' },
              { id: 'cn-5a-u1-2', name: '借物抒情的表达', desc: '体会作者借助具体事物表达情感的方法，理解关键句的含义' }
            ]
          },
          {
            id: 'cn-5a-u2',
            name: '第二单元 · 提高阅读速度',
            kps: [
              { id: 'cn-5a-u2-1', name: '课文内容与中心', desc: '《搭石》《将相和》《冀中的地道战》主要内容和人物品质的概括' },
              { id: 'cn-5a-u2-2', name: '阅读方法运用', desc: '集中注意力、连词成句地读，抓住关键词句快速把握信息' }
            ]
          },
          {
            id: 'cn-5a-u3',
            name: '第三单元 · 民间故事',
            kps: [
              { id: 'cn-5a-u3-1', name: '民间故事情节与人物', desc: '《猎人海力布》《牛郎织女》的情节梳理与人物形象分析' },
              { id: 'cn-5a-u3-2', name: '成语与俗语积累', desc: '本单元涉及的成语、俗语含义及在句子中的正确使用' }
            ]
          },
          {
            id: 'cn-5a-u4',
            name: '第四单元 · 家国情怀',
            kps: [
              { id: 'cn-5a-u4-1', name: '古诗三首默写与理解', desc: '《示儿》《题临安邸》《己亥杂诗》的默写、诗句意思与表达的情感' },
              { id: 'cn-5a-u4-2', name: '课文内容理解', desc: '《少年中国说》《圆明园的毁灭》《小岛》中的重点句段与情感' }
            ]
          },
          {
            id: 'cn-5a-u5',
            name: '第五单元 · 说明文',
            kps: [
              { id: 'cn-5a-u5-1', name: '说明方法辨析', desc: '列数字、作比较、打比方、举例子、分类别等说明方法及其作用' },
              { id: 'cn-5a-u5-2', name: '说明文语言特点', desc: '《太阳》《松鼠》中语言准确、生动的表达，词语能否删换的判断' }
            ]
          },
          {
            id: 'cn-5a-u6',
            name: '第六单元 · 父母之爱',
            kps: [
              { id: 'cn-5a-u6-1', name: '场景与细节描写', desc: '《慈母情深》《父爱之舟》中的场景、细节描写及其表达效果' },
              { id: 'cn-5a-u6-2', name: '体会作者情感', desc: '结合具体语句体会父母之爱，概括文章表达的情感' }
            ]
          },
          {
            id: 'cn-5a-u7',
            name: '第七单元 · 四时景物',
            kps: [
              { id: 'cn-5a-u7-1', name: '古诗词三首', desc: '《山居秋暝》《枫桥夜泊》《长相思》的默写、意象与情感' },
              { id: 'cn-5a-u7-2', name: '静态与动态描写', desc: '《四季之美》《鸟的天堂》中的动静结合写法及作用' }
            ]
          },
          {
            id: 'cn-5a-u8',
            name: '第八单元 · 读书明智',
            kps: [
              { id: 'cn-5a-u8-1', name: '文言文词句理解', desc: '《古人谈读书》中重点文言词句的意思与翻译' },
              { id: 'cn-5a-u8-2', name: '读书方法与观点', desc: '《忆读书》《我的“长生果”》中的读书方法、观点提炼' }
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
            name: '词汇与拼写',
            kps: [
              { id: 'en-5a-u1-1', name: '核心词汇拼写', desc: '五年级上册核心单词的拼写与词义，名词单复数形式' },
              { id: 'en-5a-u1-2', name: '字母组合与发音', desc: '常见字母组合（sh、ch、th、ee、oa 等）的发音规则与辨音' }
            ]
          },
          {
            id: 'en-5a-u2',
            name: '一般现在时',
            kps: [
              { id: 'en-5a-u2-1', name: '第三人称单数', desc: '一般现在时中动词第三人称单数形式的变化与用法' },
              { id: 'en-5a-u2-2', name: '频率副词与时间', desc: 'always、usually、often、sometimes、never 的位置与用法' }
            ]
          },
          {
            id: 'en-5a-u3',
            name: '现在进行时',
            kps: [
              { id: 'en-5a-u3-1', name: 'be + 动词ing', desc: '现在进行时的结构、动词 ing 形式变化与常用时间状语' },
              { id: 'en-5a-u3-2', name: '现在进行时句型转换', desc: '肯定句、否定句、一般疑问句及答语的转换' }
            ]
          },
          {
            id: 'en-5a-u4',
            name: '情态动词',
            kps: [{ id: 'en-5a-u4-1', name: 'can / may / must / should', desc: '情态动词表示能力、许可、义务、建议的用法与否定形式' }]
          },
          {
            id: 'en-5a-u5',
            name: '介词与方位',
            kps: [
              { id: 'en-5a-u5-1', name: '方位介词', desc: 'in、on、under、behind、between、next to 等方位介词辨析' },
              { id: 'en-5a-u5-2', name: '时间介词', desc: 'at、in、on 在时间表达中的用法区别' }
            ]
          },
          {
            id: 'en-5a-u6',
            name: '疑问句',
            kps: [
              { id: 'en-5a-u6-1', name: '特殊疑问词', desc: 'what、where、when、who、whose、how 的用法与句子结构' },
              { id: 'en-5a-u6-2', name: '一般疑问句', desc: 'be 动词与助动词开头的一般疑问句及简略答语' }
            ]
          },
          {
            id: 'en-5a-u7',
            name: '阅读理解',
            kps: [
              { id: 'en-5a-u7-1', name: '短文信息提取', desc: '读短文抓取人物、时间、地点、事件等关键信息' },
              { id: 'en-5a-u7-2', name: '完形填空基础', desc: '根据上下文和语法提示选择正确的词填空' }
            ]
          },
          {
            id: 'en-5a-u8',
            name: '情景交际',
            kps: [{ id: 'en-5a-u8-1', name: '日常对话与礼貌用语', desc: '问候、介绍、请求、道歉、感谢等情景的恰当表达' }]
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
