window.EMPLOYEE_DASHBOARD_DATA = {
  "schema_version": 1,
  "generated_at": "2026-07-25T02:25:31.169Z",
  "operations": {
    "schema_version": 1,
    "updated_at": "2026-07-25",
    "timezone": "Asia/Tokyo",
    "coverage_mode": "4交代の定時実行。常時連続処理ではなく、各勤務の間は次回実行を待機する。",
    "shifts": [
      {
        "id": "night-watch",
        "name": "夜間監視",
        "time": "00:30",
        "window_start": "00:00",
        "window_end": "06:29",
        "automation_id": "automation",
        "roles": [
          "QA担当（品質保証担当）",
          "安全・ブランド監査責任者"
        ],
        "mission": "重大な不具合、リンク、教材QA、期限切れを点検し、朝担当へ引き継ぐ。",
        "status": "active"
      },
      {
        "id": "morning-growth",
        "name": "朝の成長分析",
        "time": "06:30",
        "window_start": "06:30",
        "window_end": "12:29",
        "automation_id": "automation-2",
        "roles": [
          "分析担当",
          "検索露出改善担当",
          "SEO担当"
        ],
        "mission": "検索データと前回値を比べ、その日に変える点を一つだけ決める。",
        "status": "active"
      },
      {
        "id": "day-improvement",
        "name": "昼の改善勤務",
        "time": "12:30",
        "window_start": "12:30",
        "window_end": "20:29",
        "automation_id": "automation-3",
        "roles": [
          "教材品質責任者",
          "UX担当",
          "発信戦略責任者"
        ],
        "mission": "朝の判断を受け、教材、導線、検索露出、発信準備から一つを改善する。",
        "status": "active"
      },
      {
        "id": "evening-publishing",
        "name": "夜の発信準備",
        "time": "20:30",
        "window_start": "20:30",
        "window_end": "23:59",
        "automation_id": "note-substack",
        "roles": [
          "note編集・投稿担当",
          "Substack編集・投稿担当",
          "編集長"
        ],
        "mission": "noteとSubstackを別原稿で準備し、90点以上だけを社長へ引き渡す。",
        "status": "active"
      }
    ],
    "guardrails": [
      "外部サービスへの公開、投稿、送信、プロフィール変更は社長が最後に行う",
      "広告費、課金、フォーム送信、Search Console送信は自動実行しない",
      "未確認の数字、成果、利用者の声を事実として記録しない",
      "大きな変更後7日間は、同じ主要要素を再変更しない",
      "作業終了時に活動ログと次担当への引き継ぎを残す",
      "実績証拠がない社員をL4または育成済みと表示しない"
    ]
  },
  "automations": [
    {
      "id": "automation",
      "name": "けいさんランド夜間監視",
      "status": "ACTIVE",
      "rrule": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=0;BYMINUTE=30",
      "updated_at": "2026-07-25T02:13:56.465Z"
    },
    {
      "id": "automation-2",
      "name": "けいさんランド朝の成長分析",
      "status": "ACTIVE",
      "rrule": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=6;BYMINUTE=30",
      "updated_at": "2026-07-25T02:14:13.691Z"
    },
    {
      "id": "automation-3",
      "name": "けいさんランド昼の改善勤務",
      "status": "ACTIVE",
      "rrule": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=12;BYMINUTE=30",
      "updated_at": "2026-07-25T02:14:25.266Z"
    },
    {
      "id": "note-substack",
      "name": "note・Substack毎日下書き",
      "status": "ACTIVE",
      "rrule": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR,SA,SU;BYHOUR=20;BYMINUTE=30",
      "updated_at": "2026-07-25T02:14:49.786Z"
    }
  ],
  "employees": [
    {
      "role": "発信戦略責任者",
      "level": "L2",
      "team": "発信・編集",
      "evidence": "成長OS、日別カレンダー、媒体別役割を整備",
      "missing": "公開結果から次テーマを選んだ記録",
      "promotion_condition": "公開済み1本の24時間後・7日後から次テーマを一つ決める"
    },
    {
      "role": "X投稿・コミュニティ担当",
      "level": "L3",
      "team": "発信・編集",
      "evidence": "280文字、リンク、画像、代替テキストを発信QAで検査し、社長用投稿パッケージを整備",
      "missing": "直近原稿の公開URLと反応",
      "promotion_condition": "社長が投稿した1本を確認し、反応から次の冒頭を一つ改善する"
    },
    {
      "role": "Substack編集・投稿担当",
      "level": "L3",
      "team": "発信・編集",
      "evidence": "#12の本番下書き、スマホ確認、社長引き渡し、公開URLと2リンクの照合を完走",
      "missing": "#12の24時間後・7日後結果",
      "promotion_condition": "公開結果から次稿へ一つ反映する"
    },
    {
      "role": "note編集・投稿担当",
      "level": "L3",
      "team": "発信・編集",
      "evidence": "保存版原稿を本番下書きへ設定し、社長公開後に公開URL、8見出し、公的資料、教材リンクを照合",
      "missing": "24時間後・7日後結果と見出し画像の影響",
      "promotion_condition": "公開結果から次の保存版へ一つ反映する"
    },
    {
      "role": "安全・ブランド監査責任者",
      "level": "L3",
      "team": "安全・品質",
      "evidence": "保証表現、個人情報、許可外URL、未承認、禁止経路を含む模擬投稿を自律公開ゲートで拒否",
      "missing": "実投稿前後での安全監査記録",
      "promotion_condition": "Green投稿を1件監査し、公開後も承認内容と一致した証拠を残す"
    },
    {
      "role": "AI公開承認責任者",
      "level": "L3",
      "team": "安全・品質",
      "evidence": "4工程承認、content_hash、投稿上限、時刻、台帳を自動検査し、社長用投稿ボックス4本を合格",
      "missing": "社長投稿後の公開照合",
      "promotion_condition": "Green投稿1件を社長へ引き渡し、公開URLとハッシュ照合まで完走する"
    },
    {
      "role": "発信進行・公開管理担当",
      "level": "L2",
      "team": "発信・編集",
      "evidence": "`verify`と`reschedule`に加え、4交代勤務、活動ログ、ローカルダッシュボードを整備",
      "missing": "定時勤務が実行され、失敗も含めて正しく表示された証拠",
      "promotion_condition": "4勤務のうち1件を実行から引き継ぎまで完走し、表示を照合する"
    },
    {
      "role": "編集長",
      "level": "L3",
      "team": "発信・編集",
      "evidence": "100点評価、初心者・スマホ・人の声の改善ループ",
      "missing": "公開後結果を使った再編集の再現",
      "promotion_condition": "同一媒体の次稿で、前回結果から一つ改善して再評価する"
    },
    {
      "role": "分析担当",
      "level": "L3",
      "team": "検索成長",
      "evidence": "7月25日にデータ最終日、7日・28日、クエリ、ページを分けて最新値を記録",
      "missing": "発信またはSEO改善後の7日比較",
      "promotion_condition": "7月29日に同条件で比較し、成功・失敗・未判定を分ける"
    },
    {
      "role": "検索露出改善担当",
      "level": "L3",
      "team": "検索成長",
      "evidence": "検索成長プレイブック、検索機会スコア、ページ・検索語対応表を作り、表示前を主な詰まりと判定",
      "missing": "選んだ一手の7日後結果",
      "promotion_condition": "7月29日に表示、順位、CTRを比較し、維持・修正・撤回を判断する"
    },
    {
      "role": "SEO担当",
      "level": "L3",
      "team": "検索成長",
      "evidence": "27ページの技術QAに加え、重点クエリ群を1ページへ固定し、検索結果の約束と実在機能を照合",
      "missing": "表示回数が増えた要因の再現",
      "promotion_condition": "重点ページを連続変更せず、7日比較から次の一要素を判断する"
    },
    {
      "role": "教材品質責任者",
      "level": "L3",
      "team": "教材・利用者",
      "evidence": "教材完成度180/180、計算17,000問、文章題各10,000問を確認",
      "missing": "実際の利用場面からの改善結果",
      "promotion_condition": "利用者の困りごとか検索語を一つ教材点検へ戻し、品質を維持する"
    },
    {
      "role": "教材研究・信頼担当",
      "level": "L3",
      "team": "教材・利用者",
      "evidence": "公的資料、学年範囲、教材根拠を文書とQAへ反映",
      "missing": "第三者または利用者からの信頼結果",
      "promotion_condition": "根拠を使った説明が紹介・利用・質問のどれかにつながった記録を残す"
    },
    {
      "role": "QA担当（品質保証担当）",
      "level": "L4",
      "team": "安全・品質",
      "evidence": "URL形式、日付不一致、画像条件、教材問題を実際に検出し、自動QAへ再発防止を追加",
      "missing": "継続監視",
      "promotion_condition": "新しい不具合を見つけた場合も、原因と再発防止を同じ日に残す"
    },
    {
      "role": "教育広報・紹介担当",
      "level": "L3",
      "team": "広報・紹介",
      "evidence": "候補条件を調査し、送信不可を除外、個別案内文をQA済みにした",
      "missing": "人間承認後の送信・紹介・流入",
      "promotion_condition": "承認された場合だけ1件を送り、返信・紹介・外部リンクを分けて記録する"
    },
    {
      "role": "利用者リサーチ・導入支援担当",
      "level": "L2",
      "team": "教材・利用者",
      "evidence": "個人情報を集めない感想導線と記録形式を整備",
      "missing": "実際の利用者の声",
      "promotion_condition": "1件の事実を許可範囲内で教材改善候補へ戻す"
    }
  ],
  "activities": [
    {
      "id": "activity-20260725-shift-setup",
      "shift_id": "day-improvement",
      "started_at": "2026-07-25T11:10:00+09:00",
      "completed_at": "2026-07-25T11:20:00+09:00",
      "status": "completed",
      "roles": [
        "発信進行・公開管理担当",
        "AI公開承認責任者",
        "QA担当（品質保証担当）"
      ],
      "title": "AI社員の4交代勤務を設定",
      "summary": "夜間監視、朝の成長分析、昼の改善、夜の発信準備を毎日の自動勤務として設定した。",
      "qa": "各勤務に外部公開禁止、推測禁止、活動ログ、引き継ぎを設定",
      "files": [
        "AI_EMPLOYEE_OPERATIONS.json",
        "AI_EMPLOYEE_ACTIVITY_LOG.json"
      ],
      "handoff": "各自動勤務の初回結果を活動ログへ残し、失敗時は停止理由を表示する。"
    },
    {
      "id": "activity-20260725-search-training",
      "shift_id": "morning-growth",
      "started_at": "2026-07-25T10:35:00+09:00",
      "completed_at": "2026-07-25T11:09:00+09:00",
      "status": "completed",
      "roles": [
        "分析担当",
        "検索露出改善担当",
        "SEO担当",
        "QA担当（品質保証担当）"
      ],
      "title": "検索成長AI社員をL3運用へ強化",
      "summary": "Search Consoleの7日・28日を比較し、表示回数不足を主な詰まりと判断。クエリ群、検索機会スコア、ページ対応表、7日後判定を標準化した。",
      "qa": "27ページ、教材37,000問、発信原稿、AI社員制度の全検査に合格",
      "files": [
        "SEARCH_GROWTH_EMPLOYEE_PLAYBOOK.md",
        "SEARCH_OPPORTUNITY_MAP_2026-07-25.md",
        "DAILY_GROWTH_REPORT_2026-07-25.md"
      ],
      "handoff": "2026年7月29日に同条件で検索露出を比較し、L4昇格可否を判断する。"
    }
  ],
  "search": {
    "final_date": "2026年7月22日",
    "periods": [
      {
        "label": "直近7日",
        "clicks": "1",
        "impressions": "6",
        "ctr": "16.7%",
        "position": "8.0"
      },
      {
        "label": "直近28日",
        "clicks": "4",
        "impressions": "41",
        "ctr": "9.8%",
        "position": "12.0"
      }
    ],
    "bottleneck": "検索表示前",
    "source_file": "DAILY_GROWTH_REPORT_2026-07-25.md"
  },
  "publishing": {
    "ready": 3,
    "published": 2,
    "green": 5
  },
  "summary": {
    "employee_count": 16,
    "quality_assured_count": 13,
    "trained_count": 1,
    "active_automations": 4
  }
};
