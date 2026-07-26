"use strict";

// 文法クイズ専用の出題データ。既存の単語データとは分離して管理します。
const grammarQuestions = [
  // 第1課
  {
    id: "g1-01",
    lesson: 1,
    point: 1,
    kind: "sentence",
    chinese: "我的手机在桌子上。",
    japanese: "私の携帯電話は机の上にあります。"
  },
  {
    id: "g1-02",
    lesson: 1,
    point: 1,
    kind: "sentence",
    chinese: "老师不在教室里。",
    japanese: "先生は教室にいません。"
  },
  {
    id: "g1-03",
    lesson: 1,
    point: 1,
    kind: "sentence",
    chinese: "餐厅在哪儿？",
    japanese: "レストランはどこにありますか。"
  },
  {
    id: "g1-04",
    lesson: 1,
    point: 1,
    kind: "sentence",
    chinese: "明天你在家吗？",
    japanese: "明日、あなたは家にいますか。"
  },
  {
    id: "g1-05",
    lesson: 1,
    point: 2,
    kind: "sentence",
    chinese: "你怎么不吃？",
    japanese: "あなたはどうして食べないのですか。"
  },
  {
    id: "g1-06",
    lesson: 1,
    point: 2,
    kind: "sentence",
    chinese: "她怎么来了？",
    japanese: "彼女はどうして来たのですか。"
  },
  {
    id: "g1-07",
    lesson: 1,
    point: 2,
    kind: "sentence",
    chinese: "去地铁站怎么走？",
    japanese: "地下鉄の駅へはどう行けばいいですか。"
  },
  {
    id: "g1-08",
    lesson: 1,
    point: 2,
    kind: "sentence",
    chinese: "你的名字怎么念？",
    japanese: "あなたの名前はどう読みますか。"
  },
  {
    id: "g1-09",
    lesson: 1,
    point: 3,
    kind: "sentence",
    chinese: "今天我要写报告。",
    japanese: "今日、私はレポートを書くつもりです。"
  },
  {
    id: "g1-10",
    lesson: 1,
    point: 3,
    kind: "sentence",
    chinese: "我要好好儿练习听力。",
    japanese: "私はしっかりリスニングを練習するつもりです。"
  },
  {
    id: "g1-11",
    lesson: 1,
    point: 3,
    kind: "sentence",
    chinese: "在中国，开学典礼不用穿西装。",
    japanese: "中国では、入学式にスーツを着る必要はありません。"
  },

  // 第2課
  {
    id: "g2-01",
    lesson: 2,
    point: 1,
    kind: "sentence",
    chinese: "如果有时间的话，我们一起去吃饭，怎么样？",
    japanese: "もし時間があるなら、私たちと一緒にご飯を食べに行くのはどうですか。"
  },
  {
    id: "g2-02",
    lesson: 2,
    point: 1,
    kind: "sentence",
    chinese: "如果你喜欢，就送给你吧。",
    japanese: "もしあなたが気に入ったなら、あなたにあげましょう。"
  },
  {
    id: "g2-03",
    lesson: 2,
    point: 1,
    kind: "sentence",
    chinese: "你想去逛街的话，星期天我陪你去。",
    japanese: "買い物に行きたいなら、日曜日に私が一緒に行きます。"
  },
  {
    id: "g2-04",
    lesson: 2,
    point: 2,
    kind: "sentence",
    chinese: "我想请你吃晚饭。",
    japanese: "私はあなたを夕食に招待したいです。"
  },
  {
    id: "g2-05",
    lesson: 2,
    point: 2,
    kind: "sentence",
    chinese: "我请你看日本电影。",
    japanese: "私はあなたを誘って日本映画を見ます。"
  },
  {
    id: "g2-06",
    lesson: 2,
    point: 2,
    kind: "sentence",
    chinese: "我们请老师讲一讲日本的生活习惯。",
    japanese: "私たちは先生に、日本の生活習慣について少し話してもらいます。"
  },
  {
    id: "g2-07",
    lesson: 2,
    point: 2,
    kind: "sentence",
    chinese: "公司派他去中国出差了。",
    japanese: "会社は彼を中国へ出張させました。"
  },
  {
    id: "g2-08",
    lesson: 2,
    point: 3,
    kind: "sentence",
    chinese: "你喝咖啡还是红茶？",
    japanese: "コーヒーを飲みますか、それとも紅茶を飲みますか。"
  },
  {
    id: "g2-09",
    lesson: 2,
    point: 3,
    kind: "sentence",
    chinese: "汉语难还是英语难？",
    japanese: "中国語が難しいですか、それとも英語が難しいですか。"
  },
  {
    id: "g2-10",
    lesson: 2,
    point: 3,
    kind: "sentence",
    chinese: "你想看棒球比赛还是足球比赛？",
    japanese: "野球の試合を見たいですか、それともサッカーの試合を見たいですか。"
  },

  // 第3課
  {
    id: "g3-01",
    lesson: 3,
    point: 1,
    kind: "sentence",
    chinese: "对不起，我来晚了。",
    japanese: "すみません、遅れました。"
  },
  {
    id: "g3-02",
    lesson: 3,
    point: 1,
    kind: "sentence",
    chinese: "作业已经做完了。",
    japanese: "宿題はもうやり終えました。"
  },
  {
    id: "g3-03",
    lesson: 3,
    point: 1,
    kind: "sentence",
    chinese: "课文看懂了吗？",
    japanese: "本文を読んで理解できましたか。"
  },
  {
    id: "g3-04",
    lesson: 3,
    point: 1,
    kind: "sentence",
    chinese: "手机还没找到。",
    japanese: "携帯電話はまだ見つかっていません。"
  },
  {
    id: "g3-05",
    lesson: 3,
    point: 2,
    kind: "sentence",
    chinese: "老师刚来。",
    japanese: "先生は来たばかりです。"
  },
  {
    id: "g3-06",
    lesson: 3,
    point: 2,
    kind: "sentence",
    chinese: "他们刚到学校。",
    japanese: "彼らは学校に着いたばかりです。"
  },
  {
    id: "g3-07",
    lesson: 3,
    point: 2,
    kind: "sentence",
    chinese: "爸爸刚下班。",
    japanese: "父は仕事が終わったばかりです。"
  },
  {
    id: "g3-08",
    lesson: 3,
    point: 2,
    kind: "sentence",
    chinese: "我刚吃完晚饭。",
    japanese: "私は夕食を食べ終えたばかりです。"
  },
  {
    id: "g3-09",
    lesson: 3,
    point: 3,
    kind: "sentence",
    chinese: "请进来吧。",
    japanese: "どうぞ入ってきてください。"
  },
  {
    id: "g3-10",
    lesson: 3,
    point: 3,
    kind: "sentence",
    chinese: "我们出去吧。",
    japanese: "外へ出ましょう。"
  },
  {
    id: "g3-11",
    lesson: 3,
    point: 3,
    kind: "sentence",
    chinese: "你带雨伞来了吗？",
    japanese: "あなたは傘を持ってきましたか。"
  },
  {
    id: "g3-12",
    lesson: 3,
    point: 3,
    kind: "sentence",
    chinese: "老师还没出来。",
    japanese: "先生はまだ出てきていません。"
  },

  // 第4課
  {
    id: "g4-01",
    lesson: 4,
    point: 1,
    kind: "sentence",
    chinese: "你喜欢什么就点什么吧。",
    japanese: "好きなものを注文してください。"
  },
  {
    id: "g4-02",
    lesson: 4,
    point: 1,
    kind: "sentence",
    chinese: "想喝什么就喝什么吧。",
    japanese: "飲みたいものを飲んでください。"
  },
  {
    id: "g4-03",
    lesson: 4,
    point: 1,
    kind: "sentence",
    chinese: "想去哪儿就去哪儿。",
    japanese: "行きたいところへ行けばいいです。"
  },
  {
    id: "g4-04",
    lesson: 4,
    point: 1,
    kind: "sentence",
    chinese: "哪个便宜买哪个。",
    japanese: "安いほうを買います。"
  },
  {
    id: "g4-05",
    lesson: 4,
    point: 1,
    kind: "sentence",
    chinese: "有多少要多少。",
    japanese: "あるだけ欲しいです。"
  },
  {
    id: "g4-06",
    lesson: 4,
    point: 2,
    kind: "phrase",
    chinese: "一个苹果",
    japanese: "リンゴ1個"
  },
  {
    id: "g4-07",
    lesson: 4,
    point: 2,
    kind: "phrase",
    chinese: "三瓶水",
    japanese: "水3本"
  },
  {
    id: "g4-08",
    lesson: 4,
    point: 2,
    kind: "phrase",
    chinese: "一本辞典",
    japanese: "辞書1冊"
  },
  {
    id: "g4-09",
    lesson: 4,
    point: 2,
    kind: "phrase",
    chinese: "两张票",
    japanese: "チケット2枚"
  },
  {
    id: "g4-10",
    lesson: 4,
    point: 2,
    kind: "phrase",
    chinese: "三件毛衣",
    japanese: "セーター3着"
  },
  {
    id: "g4-11",
    lesson: 4,
    point: 2,
    kind: "phrase",
    chinese: "四双鞋",
    japanese: "靴4足"
  },
  {
    id: "g4-12",
    lesson: 4,
    point: 2,
    kind: "phrase",
    chinese: "五条领带",
    japanese: "ネクタイ5本"
  },
  {
    id: "g4-13",
    lesson: 4,
    point: 2,
    kind: "sentence",
    chinese: "昨天我吃了两个苹果。",
    japanese: "昨日、私はリンゴを2個食べました。"
  },
  {
    id: "g4-14",
    lesson: 4,
    point: 2,
    kind: "sentence",
    chinese: "你买了几张票？",
    japanese: "あなたはチケットを何枚買いましたか。"
  },
  {
    id: "g4-15",
    lesson: 4,
    point: 3,
    kind: "sentence",
    chinese: "要一杯咖啡。",
    japanese: "コーヒーを1杯ください。"
  },
  {
    id: "g4-16",
    lesson: 4,
    point: 3,
    kind: "sentence",
    chinese: "要一碗拉面和一份儿饺子。",
    japanese: "ラーメンを1杯と餃子を1人前ください。"
  },

  // 第5課
  {
    id: "g5-01",
    lesson: 5,
    point: 1,
    kind: "sentence",
    chinese: "我每天起得很早。",
    japanese: "私は毎日とても早く起きます。"
  },
  {
    id: "g5-02",
    lesson: 5,
    point: 1,
    kind: "sentence",
    chinese: "她每天睡得很晚。",
    japanese: "彼女は毎日とても遅く寝ます。"
  },
  {
    id: "g5-03",
    lesson: 5,
    point: 1,
    kind: "sentence",
    chinese: "她说日语说得很流利。",
    japanese: "彼女は日本語をとても流暢に話します。"
  },
  {
    id: "g5-04",
    lesson: 5,
    point: 1,
    kind: "sentence",
    chinese: "他汉语说得怎么样？",
    japanese: "彼の中国語の話し方はどうですか。"
  },
  {
    id: "g5-05",
    lesson: 5,
    point: 2,
    kind: "sentence",
    chinese: "他是去年三月毕业的。",
    japanese: "彼は去年の3月に卒業したのです。"
  },
  {
    id: "g5-06",
    lesson: 5,
    point: 2,
    kind: "sentence",
    chinese: "你的包儿是在哪儿买的？",
    japanese: "あなたのかばんはどこで買ったのですか。"
  },
  {
    id: "g5-07",
    lesson: 5,
    point: 2,
    kind: "sentence",
    chinese: "你是跟谁学的汉语？",
    japanese: "あなたは誰に中国語を習ったのですか。"
  },
  {
    id: "g5-08",
    lesson: 5,
    point: 2,
    kind: "sentence",
    chinese: "我不是坐新干线来的，是坐飞机来的。",
    japanese: "私は新幹線で来たのではなく、飛行機で来たのです。"
  },
  {
    id: "g5-09",
    lesson: 5,
    point: 3,
    kind: "sentence",
    chinese: "铃木在教室里写作业。",
    japanese: "鈴木さんは教室で宿題をしています。"
  },
  {
    id: "g5-10",
    lesson: 5,
    point: 3,
    kind: "sentence",
    chinese: "我爸爸在IT公司工作。",
    japanese: "私の父はIT会社で働いています。"
  },
  {
    id: "g5-11",
    lesson: 5,
    point: 3,
    kind: "sentence",
    chinese: "他每天在家吃早饭。",
    japanese: "彼は毎日、家で朝ご飯を食べます。"
  },

  // 第6課
  {
    id: "g6-01",
    lesson: 6,
    point: 1,
    kind: "sentence",
    chinese: "快要放假了。",
    japanese: "もうすぐ休みになります。"
  },
  {
    id: "g6-02",
    lesson: 6,
    point: 1,
    kind: "sentence",
    chinese: "铃木快要过生日了。",
    japanese: "鈴木さんはもうすぐ誕生日を迎えます。"
  },
  {
    id: "g6-03",
    lesson: 6,
    point: 1,
    kind: "sentence",
    chinese: "飞机快要起飞了。",
    japanese: "飛行機はもうすぐ離陸します。"
  },
  {
    id: "g6-04",
    lesson: 6,
    point: 1,
    kind: "sentence",
    chinese: "比赛马上就要开始了。",
    japanese: "試合はまもなく始まります。"
  },
  {
    id: "g6-05",
    lesson: 6,
    point: 2,
    kind: "sentence",
    chinese: "日语比汉语难。",
    japanese: "日本語は中国語より難しいです。"
  },
  {
    id: "g6-06",
    lesson: 6,
    point: 2,
    kind: "sentence",
    chinese: "汉语没有日语难。",
    japanese: "中国語は日本語ほど難しくありません。"
  },
  {
    id: "g6-07",
    lesson: 6,
    point: 2,
    kind: "sentence",
    chinese: "我比弟弟大两岁。",
    japanese: "私は弟より2歳年上です。"
  },
  {
    id: "g6-08",
    lesson: 6,
    point: 2,
    kind: "sentence",
    chinese: "北海道比东京凉快多了。",
    japanese: "北海道は東京よりずっと涼しいです。"
  },
  {
    id: "g6-09",
    lesson: 6,
    point: 3,
    kind: "sentence",
    chinese: "我想去中国学习半年。",
    japanese: "私は中国へ行って半年間勉強したいです。"
  },
  {
    id: "g6-10",
    lesson: 6,
    point: 3,
    kind: "sentence",
    chinese: "我每天睡七个小时。",
    japanese: "私は毎日7時間寝ます。"
  },
  {
    id: "g6-11",
    lesson: 6,
    point: 3,
    kind: "sentence",
    chinese: "你打算去几天？",
    japanese: "あなたは何日行くつもりですか。"
  },
  {
    id: "g6-12",
    lesson: 6,
    point: 3,
    kind: "sentence",
    chinese: "从你家到学校要多长时间？",
    japanese: "あなたの家から学校まで、どのくらい時間がかかりますか。"
  },
  {
    id: "g6-13",
    lesson: 6,
    point: 3,
    kind: "sentence",
    chinese: "要一个多小时。",
    japanese: "1時間余りかかります。"
  }
];
