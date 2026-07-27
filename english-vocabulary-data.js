"use strict";

const englishVocabularyChapters = [
  {
    chapter: 1,
    title: "Chapter1",
    words: [
      { word: "diagnose", meaning: "診断する、症状の原因となる病気を特定する" },
      { word: "inaccurate", meaning: "不正確な、誤った" },
      { word: "address", meaning: "問題に取り組む、対処する" },
      { word: "institute", meaning: "機関、組織" },
      { word: "permission", meaning: "許可" },
      { word: "oversight", meaning: "見落とし、不注意によるミス" },
      { word: "implementation", meaning: "実施、実行、導入" }
    ],
    phrases: [
      {
        phrase: "be designed to do",
        meaning: "～するように設計されている、～することを目的としている"
      },
      {
        phrase: "help 人 (to) do",
        meaning: "人が～するのを助ける"
      },
      {
        phrase: "plan to do",
        meaning: "～する予定である、～するつもりである"
      }
    ]
  },
  {
    chapter: 2,
    title: "Chapter2",
    words: [
      { word: "sculpture", meaning: "彫刻、彫刻作品" },
      { word: "curiosity", meaning: "好奇心、知りたいという気持ち" },
      { word: "diameter", meaning: "直径" },
      { word: "outline", meaning: "輪郭、外形線" },
      { word: "attach", meaning: "取り付ける、くっつける" },
      { word: "surface", meaning: "表面" },
      { word: "exhibition", meaning: "展示会、展覧会" }
    ],
    phrases: [
      {
        phrase: "look like",
        meaning: "～のように見える、～に似ている"
      },
      {
        phrase: "to date",
        meaning: "現在までに、これまでに"
      },
      {
        phrase: "so that",
        meaning: "～するように、～するために"
      }
    ]
  },
  {
    chapter: 3,
    title: "Chapter3",
    words: [
      { word: "candidate", meaning: "応募者、候補者" },
      { word: "fluidity", meaning: "流動性、変わりやすさ" },
      { word: "indicate", meaning: "示す、明らかにする" },
      { word: "previously", meaning: "以前に、それ以前に" },
      { word: "diverse", meaning: "多様な、さまざまな" },
      { word: "wage", meaning: "賃金、給料" },
      { word: "persist", meaning: "困難があっても続ける、やり続ける" }
    ],
    phrases: [
      {
        phrase: "move into",
        meaning: "～へ移る、～という新しい段階に入る"
      },
      {
        phrase: "be expected to do",
        meaning: "～すると予想されている、～することが期待されている"
      },
      {
        phrase: "focus on",
        meaning: "～に集中する、～を重視する"
      }
    ]
  },
  {
    chapter: 4,
    title: "Chapter4",
    words: [
      { word: "heir", meaning: "相続人、後継者" },
      { word: "manipulate", meaning: "巧みに操作する、扱う" },
      { word: "infinite", meaning: "無限の、限りない" },
      { word: "cultivate", meaning: "育てる、養う、能力などを伸ばす" },
      { word: "ritual", meaning: "儀式の、儀礼的な" },
      { word: "utensil", meaning: "用具、器具" },
      { word: "genuine", meaning: "本物の、真正の、心からの" }
    ],
    phrases: [
      {
        phrase: "depend on",
        meaning: "～によって決まる、～に依存する"
      },
      {
        phrase: "work for",
        meaning: "～に勤める、～のために働く"
      },
      {
        phrase: "be intimidated by",
        meaning: "～に怖がらされる、～におじけづく"
      }
    ]
  },
  {
    chapter: 5,
    title: "Chapter5",
    words: [
      { word: "landmark", meaning: "目印、ランドマーク" },
      { word: "trail", meaning: "小道、山道、自然歩道" },
      { word: "ascent", meaning: "登ること、上昇" },
      { word: "range", meaning: "山脈、山地" },
      { word: "traverse", meaning: "横断する、踏破する" },
      { word: "summit", meaning: "山頂、頂上" },
      { word: "proceed", meaning: "進む、前進する、続行する" }
    ],
    phrases: [
      {
        phrase: "make rest stops",
        meaning: "途中で休憩する、休憩を取る"
      },
      {
        phrase: "set off",
        meaning: "出発する、旅立つ"
      },
      {
        phrase: "engage in",
        meaning: "～に参加する、～に従事する"
      }
    ]
  },
  {
    chapter: 6,
    title: "Chapter6",
    words: [
      { word: "dive", meaning: "深掘り、詳しい調査" },
      { word: "toll", meaning: "悪影響、損害、犠牲" },
      { word: "irreplaceable", meaning: "かけがえのない、代えのきかない" },
      { word: "landfill", meaning: "ごみ埋立地、埋立処分場" },
      { word: "swap", meaning: "交換、物々交換" },
      { word: "garment", meaning: "衣服、衣類" },
      { word: "ultimately", meaning: "最終的に、結局" }
    ],
    phrases: [
      {
        phrase: "consist of",
        meaning: "～から成る、～で構成されている"
      },
      {
        phrase: "throw away",
        meaning: "～を捨てる"
      },
      {
        phrase: "embark on",
        meaning: "～に着手する、～を始める"
      }
    ]
  },
  {
    chapter: 7,
    title: "Chapter7",
    words: [
      { word: "retiree", meaning: "退職者、引退した人" },
      { word: "priest", meaning: "司祭、聖職者" },
      { word: "pilgrimage", meaning: "巡礼、聖地への旅" },
      { word: "calligraphy", meaning: "書道、毛筆書き" },
      { word: "initially", meaning: "初めは、当初" },
      { word: "aspire", meaning: "熱望する、志す" },
      { word: "pandemic", meaning: "世界的な感染症の大流行、パンデミック" }
    ],
    phrases: [
      {
        phrase: "find it easy to do",
        meaning: "～するのは簡単だと思う、容易に～できる"
      },
      {
        phrase: "make people happy",
        meaning: "人々を幸せにする、喜ばせる"
      },
      {
        phrase: "express gratitude",
        meaning: "感謝を表す、感謝の気持ちを伝える"
      }
    ]
  }
];
